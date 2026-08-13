using Microsoft.EntityFrameworkCore;
using SpotifyManager.Application.Changes;
using SpotifyManager.Infrastructure.Persistence;

namespace SpotifyManager.Worker;

public sealed class ScheduledWorkWorker(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<ScheduledWorkWorker> logger) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan LeaseDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan SourcePollInterval = TimeSpan.FromMinutes(15);
    private const int BatchSize = 10;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Spotify Manager background worker started");
        using var timer = new PeriodicTimer(PollInterval, timeProvider);

        do
        {
            try
            {
                await ProcessDueWorkAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogError(exception, "Unable to process scheduled work");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task ProcessDueWorkAsync(CancellationToken cancellationToken)
    {
        for (var index = 0; index < BatchSize; index++)
        {
            if (!await ProcessNextAsync(cancellationToken))
            {
                break;
            }
        }
    }

    private async Task<bool> ProcessNextAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SpotifyManagerDbContext>();
        var now = timeProvider.GetUtcNow();
        var candidate = await dbContext.ScheduledWork
            .AsNoTracking()
            .Where(work =>
                work.WorkType == "SourcePlaylistPoll" &&
                (work.Status == "Pending" && work.DueAt <= now) ||
                work.WorkType == "SourcePlaylistPoll" &&
                work.Status == "Running" && work.LeaseExpiresAt <= now)
            .OrderBy(work => work.DueAt)
            .Select(work => new { work.Id, work.TargetId })
            .FirstOrDefaultAsync(cancellationToken);
        if (candidate is null)
        {
            return false;
        }

        var claimed = await dbContext.ScheduledWork
            .Where(work =>
                work.Id == candidate.Id &&
                ((work.Status == "Pending" && work.DueAt <= now) ||
                 (work.Status == "Running" && work.LeaseExpiresAt <= now)))
            .ExecuteUpdateAsync(
                updates => updates
                    .SetProperty(work => work.Status, "Running")
                    .SetProperty(work => work.LeaseOwner, Environment.MachineName)
                    .SetProperty(work => work.LeaseExpiresAt, now.Add(LeaseDuration))
                    .SetProperty(work => work.UpdatedAt, now),
                cancellationToken);
        if (claimed == 0)
        {
            return true;
        }

        try
        {
            var handler = scope.ServiceProvider.GetRequiredService<RefreshForkChangesHandler>();
            var result = await handler.HandleAsync(
                new RefreshForkChangesCommand(candidate.TargetId),
                cancellationToken);
            if (result is null)
            {
                await CompleteAsync(dbContext, candidate.Id, now, cancellationToken);
                return true;
            }

            await dbContext.ScheduledWork
                .Where(work => work.Id == candidate.Id)
                .ExecuteUpdateAsync(
                    updates => updates
                        .SetProperty(work => work.Status, "Pending")
                        .SetProperty(work => work.DueAt, now.Add(SourcePollInterval))
                        .SetProperty(work => work.AttemptCount, 0)
                        .SetProperty(work => work.LeaseOwner, (string?)null)
                        .SetProperty(work => work.LeaseExpiresAt, (DateTimeOffset?)null)
                        .SetProperty(work => work.LastError, (string?)null)
                        .SetProperty(work => work.UpdatedAt, now),
                    cancellationToken);
            logger.LogInformation(
                "Checked fork {ForkId}; source changed: {SourceChanged}; proposals: {ProposalCount}",
                result.ForkId,
                result.SourceChanged,
                result.ProposedChangeCount);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            var work = await dbContext.ScheduledWork.SingleAsync(
                item => item.Id == candidate.Id,
                cancellationToken);
            work.AttemptCount++;
            work.Status = "Pending";
            work.DueAt = now.Add(Backoff(work.AttemptCount));
            work.LeaseOwner = null;
            work.LeaseExpiresAt = null;
            work.LastError = exception.Message.Length <= 2000
                ? exception.Message
                : exception.Message[..2000];
            work.UpdatedAt = now;
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogWarning(
                exception,
                "Scheduled work {WorkId} failed; retry {AttemptCount} is due at {DueAt}",
                work.Id,
                work.AttemptCount,
                work.DueAt);
        }

        return true;
    }

    private static Task CompleteAsync(
        SpotifyManagerDbContext dbContext,
        Guid workId,
        DateTimeOffset now,
        CancellationToken cancellationToken) =>
        dbContext.ScheduledWork
            .Where(work => work.Id == workId)
            .ExecuteUpdateAsync(
                updates => updates
                    .SetProperty(work => work.Status, "Completed")
                    .SetProperty(work => work.LeaseOwner, (string?)null)
                    .SetProperty(work => work.LeaseExpiresAt, (DateTimeOffset?)null)
                    .SetProperty(work => work.UpdatedAt, now),
                cancellationToken);

    private static TimeSpan Backoff(int attemptCount) =>
        TimeSpan.FromMinutes(Math.Min(60, Math.Pow(2, Math.Min(attemptCount - 1, 6))));
}
