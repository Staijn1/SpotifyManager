using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SpotifyManager.Application.Forks;
using SpotifyManager.Domain.Forks;
using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Infrastructure.Persistence;

internal sealed class EfForkStore(SpotifyManagerDbContext dbContext) : IForkStore
{
    public async Task<ForkedPlaylist?> FindByIdempotencyKeyAsync(
        Guid userId,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        var record = await dbContext.ForkedPlaylists
            .AsNoTracking()
            .Include(fork => fork.SourcePlaylist)
            .SingleOrDefaultAsync(
                fork => fork.UserId == userId && fork.IdempotencyKey == idempotencyKey,
                cancellationToken);
        return record is null ? null : ToDomain(record);
    }

    public async Task<IReadOnlyList<ForkListItem>> ListAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var records = await dbContext.ForkedPlaylists
            .AsNoTracking()
            .Where(fork => fork.UserId == userId)
            .OrderByDescending(fork => fork.UpdatedAt)
            .Select(fork => new
            {
                fork.Id,
                fork.Provider,
                SourceExternalPlaylistId = fork.SourcePlaylist.ExternalPlaylistId,
                fork.ExternalPlaylistId,
                SourceName = fork.SourcePlaylist.Name,
                fork.Name,
                fork.Status,
                fork.FailureReason,
                fork.CreatedAt,
                fork.UpdatedAt,
            })
            .ToArrayAsync(cancellationToken);

        return records.Select(fork => new ForkListItem(
                fork.Id,
                new ExternalPlaylistId(fork.Provider, fork.SourceExternalPlaylistId),
                fork.ExternalPlaylistId is null
                    ? null
                    : new ExternalPlaylistId(fork.Provider, fork.ExternalPlaylistId),
                fork.SourceName,
                fork.Name,
                fork.Status,
                fork.FailureReason,
                fork.CreatedAt,
                fork.UpdatedAt))
            .ToArray();
    }

    public async Task<SourceSnapshotReference> SaveSourceSnapshotAsync(
        ProviderConnectionId connectionId,
        ProviderPlaylistSnapshot snapshot,
        CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var source = await dbContext.SourcePlaylists.SingleOrDefaultAsync(
            candidate =>
                candidate.ProviderConnectionId == connectionId.Value &&
                candidate.Provider == snapshot.PlaylistId.Provider &&
                candidate.ExternalPlaylistId == snapshot.PlaylistId.Value,
            cancellationToken);
        var now = snapshot.CapturedAt;

        if (source is null)
        {
            source = new SourcePlaylistRecord
            {
                Id = Guid.NewGuid(),
                ProviderConnectionId = connectionId.Value,
                Provider = snapshot.PlaylistId.Provider,
                ExternalPlaylistId = snapshot.PlaylistId.Value,
                Name = snapshot.Name,
                ExternalVersion = snapshot.ExternalVersion,
                LastCheckedAt = now,
                CreatedAt = now,
                UpdatedAt = now,
            };
            dbContext.SourcePlaylists.Add(source);
        }
        else
        {
            source.Name = snapshot.Name;
            source.ExternalVersion = snapshot.ExternalVersion;
            source.AccessStatus = "Available";
            source.LastCheckedAt = now;
            source.UpdatedAt = now;
        }

        var contentHash = ComputeContentHash(snapshot.Items);
        var existingSnapshot = await dbContext.PlaylistSnapshots
            .AsNoTracking()
            .SingleOrDefaultAsync(
                candidate => candidate.SourcePlaylistId == source.Id && candidate.ContentHash == contentHash,
                cancellationToken);

        if (existingSnapshot is not null)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new SourceSnapshotReference(source.Id, existingSnapshot.Id);
        }

        var snapshotRecord = new PlaylistSnapshotRecord
        {
            Id = Guid.NewGuid(),
            SourcePlaylistId = source.Id,
            ExternalVersion = snapshot.ExternalVersion,
            ContentHash = contentHash,
            CapturedAt = snapshot.CapturedAt,
            Items = snapshot.Items.Select(item => new PlaylistSnapshotItemRecord
            {
                Id = Guid.NewGuid(),
                Position = item.Position,
                OccurrenceKey = item.OccurrenceKey,
                ExternalTrackId = item.Track?.Value,
                ProviderUri = item.ProviderUri,
                Title = item.Title,
                Artists = item.Artists.ToArray(),
                Availability = item.Availability,
            }).ToList(),
        };
        dbContext.PlaylistSnapshots.Add(snapshotRecord);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new SourceSnapshotReference(source.Id, snapshotRecord.Id);
    }

    public async Task AddAsync(ForkedPlaylist fork, CancellationToken cancellationToken)
    {
        dbContext.ForkedPlaylists.Add(ToRecord(fork));
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ForkedPlaylist fork, CancellationToken cancellationToken)
    {
        var record = await dbContext.ForkedPlaylists.SingleAsync(
            candidate => candidate.Id == fork.Id,
            cancellationToken);
        record.ExternalPlaylistId = fork.ExternalPlaylistId?.Value;
        record.BaselineSnapshotId = fork.BaselineSnapshotId;
        record.Status = fork.Status;
        record.FailureReason = fork.FailureReason;
        record.UpdatedAt = fork.UpdatedAt;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static ForkedPlaylistRecord ToRecord(ForkedPlaylist fork) => new()
    {
        Id = fork.Id,
        UserId = fork.UserId,
        SourcePlaylistId = fork.SourcePlaylistId,
        Provider = fork.SourceExternalPlaylistId.Provider,
        ExternalPlaylistId = fork.ExternalPlaylistId?.Value,
        Name = fork.Name,
        IdempotencyKey = fork.IdempotencyKey,
        BaselineSnapshotId = fork.BaselineSnapshotId,
        Status = fork.Status,
        FailureReason = fork.FailureReason,
        CreatedAt = fork.CreatedAt,
        UpdatedAt = fork.UpdatedAt,
    };

    private static ForkedPlaylist ToDomain(ForkedPlaylistRecord record) =>
        ForkedPlaylist.Restore(
            record.Id,
            record.UserId,
            record.SourcePlaylistId,
            new ExternalPlaylistId(record.Provider, record.SourcePlaylist.ExternalPlaylistId),
            record.Name,
            record.IdempotencyKey,
            record.Status,
            record.ExternalPlaylistId is null
                ? null
                : new ExternalPlaylistId(record.Provider, record.ExternalPlaylistId),
            record.BaselineSnapshotId,
            record.FailureReason,
            record.CreatedAt,
            record.UpdatedAt);

    private static string ComputeContentHash(IReadOnlyList<ProviderPlaylistItem> items)
    {
        var canonical = string.Join(
            '\n',
            items.OrderBy(item => item.Position).Select(item =>
                $"{item.Position}|{item.OccurrenceKey}|{item.Track?.Value}|{item.Availability}|{item.ProviderUri}"));
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(canonical));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
