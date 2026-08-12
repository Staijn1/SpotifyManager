using Microsoft.EntityFrameworkCore;
using SpotifyManager.Infrastructure.Persistence;

namespace SpotifyManager.Worker;

public sealed class ScheduledWorkWorker(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<ScheduledWorkWorker> logger) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Spotify Manager background worker started");
        using var timer = new PeriodicTimer(PollInterval, timeProvider);

        do
        {
            try
            {
                await ReportDueWorkAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogError(exception, "Unable to inspect scheduled work");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task ReportDueWorkAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SpotifyManagerDbContext>();
        var now = timeProvider.GetUtcNow();
        var dueCount = await dbContext.ScheduledWork
            .CountAsync(work => work.Status == "Pending" && work.DueAt <= now, cancellationToken);

        logger.LogInformation("Scheduled work heartbeat: {DueCount} item(s) due", dueCount);
    }
}
