using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SpotifyManager.Application.Changes;
using SpotifyManager.Domain.Forks;
using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Infrastructure.Persistence;

internal sealed class EfChangeReviewStore(SpotifyManagerDbContext dbContext) : IChangeReviewStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<ChangeDetectionContext?> GetDetectionContextAsync(
        Guid forkId,
        Guid? expectedUserId,
        CancellationToken cancellationToken)
    {
        var fork = await dbContext.ForkedPlaylists
            .AsNoTracking()
            .Where(candidate =>
                candidate.Id == forkId &&
                candidate.Status == ForkedPlaylistStatus.Active &&
                (!expectedUserId.HasValue || candidate.UserId == expectedUserId.Value))
            .Select(candidate => new
            {
                candidate.Id,
                candidate.UserId,
                candidate.SourcePlaylistId,
                ConnectionId = candidate.SourcePlaylist.ProviderConnectionId,
                candidate.Provider,
                ExternalPlaylistId = candidate.SourcePlaylist.ExternalPlaylistId,
            })
            .SingleOrDefaultAsync(cancellationToken);
        if (fork is null)
        {
            return null;
        }

        var snapshot = await dbContext.PlaylistSnapshots
            .AsNoTracking()
            .Include(candidate => candidate.SourcePlaylist)
            .Include(candidate => candidate.Items)
            .Where(candidate => candidate.SourcePlaylistId == fork.SourcePlaylistId)
            .OrderByDescending(candidate => candidate.CapturedAt)
            .ThenByDescending(candidate => candidate.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (snapshot is null)
        {
            return null;
        }

        var externalPlaylistId = new ExternalPlaylistId(fork.Provider, fork.ExternalPlaylistId);
        return new ChangeDetectionContext(
            fork.Id,
            fork.UserId,
            fork.SourcePlaylistId,
            snapshot.Id,
            new ProviderConnectionId(fork.ConnectionId),
            externalPlaylistId,
            ToSnapshot(snapshot, externalPlaylistId));
    }

    public async Task<int> SaveDetectionAsync(
        ChangeDetectionContext context,
        ProviderPlaylistSnapshot current,
        PlaylistChangeSet changeSet,
        CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var source = await dbContext.SourcePlaylists.SingleAsync(
            candidate => candidate.Id == context.SourcePlaylistId,
            cancellationToken);
        source.Name = current.Name;
        source.ExternalVersion = current.ExternalVersion;
        source.AccessStatus = "Available";
        source.LastCheckedAt = current.CapturedAt;
        source.UpdatedAt = current.CapturedAt;

        var contentHash = ComputeContentHash(current.Items);
        var existingSnapshotId = await dbContext.PlaylistSnapshots
            .Where(candidate =>
                candidate.SourcePlaylistId == context.SourcePlaylistId &&
                candidate.ContentHash == contentHash)
            .Select(candidate => (Guid?)candidate.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (existingSnapshotId is not null)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return 0;
        }

        var snapshotId = Guid.NewGuid();
        dbContext.PlaylistSnapshots.Add(new PlaylistSnapshotRecord
        {
            Id = snapshotId,
            SourcePlaylistId = context.SourcePlaylistId,
            ExternalVersion = current.ExternalVersion,
            ContentHash = contentHash,
            CapturedAt = current.CapturedAt,
            Items = current.Items.Select(item => new PlaylistSnapshotItemRecord
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
        });

        foreach (var change in changeSet.Changes)
        {
            dbContext.PlaylistChanges.Add(new PlaylistChangeRecord
            {
                Id = Guid.NewGuid(),
                SourcePlaylistId = context.SourcePlaylistId,
                FromSnapshotId = context.PreviousSnapshotId,
                ToSnapshotId = snapshotId,
                Type = change.Type,
                OccurrenceKey = change.OccurrenceKey,
                FromPosition = change.FromPosition,
                ToPosition = change.ToPosition,
                ReviewStatus = "Proposed",
                DetailsJson = JsonSerializer.Serialize(
                    new ChangeDetails(
                        change.Item.Title,
                        change.Item.Artists,
                        change.Item.Availability.ToString().ToLowerInvariant()),
                    JsonOptions),
                CreatedAt = current.CapturedAt,
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return changeSet.Changes.Count;
    }

    public async Task MarkCheckedAsync(
        Guid sourcePlaylistId,
        DateTimeOffset checkedAt,
        CancellationToken cancellationToken)
    {
        await dbContext.SourcePlaylists
            .Where(source => source.Id == sourcePlaylistId)
            .ExecuteUpdateAsync(
                updates => updates
                    .SetProperty(source => source.LastCheckedAt, checkedAt)
                    .SetProperty(source => source.UpdatedAt, checkedAt),
                cancellationToken);
    }

    public async Task<IReadOnlyList<ChangeProposal>?> ListProposalsAsync(
        Guid forkId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sourcePlaylistId = await dbContext.ForkedPlaylists
            .AsNoTracking()
            .Where(fork => fork.Id == forkId && fork.UserId == userId)
            .Select(fork => (Guid?)fork.SourcePlaylistId)
            .SingleOrDefaultAsync(cancellationToken);
        if (sourcePlaylistId is null)
        {
            return null;
        }

        var changes = await dbContext.PlaylistChanges
            .AsNoTracking()
            .Where(change => change.SourcePlaylistId == sourcePlaylistId.Value)
            .OrderByDescending(change => change.CreatedAt)
            .ThenBy(change => change.ToPosition ?? change.FromPosition)
            .ToArrayAsync(cancellationToken);
        return changes.Select(change =>
            {
                var details = JsonSerializer.Deserialize<ChangeDetails>(change.DetailsJson, JsonOptions)
                    ?? new ChangeDetails("Unknown item", [], "unknown");
                return new ChangeProposal(
                    change.Id,
                    change.Type,
                    change.OccurrenceKey,
                    details.Title,
                    details.Artists,
                    details.Availability,
                    change.FromPosition,
                    change.ToPosition,
                    change.ReviewStatus,
                    change.CreatedAt);
            })
            .ToArray();
    }

    private static ProviderPlaylistSnapshot ToSnapshot(
        PlaylistSnapshotRecord snapshot,
        ExternalPlaylistId playlistId) =>
        new(
            playlistId,
            snapshot.SourcePlaylist.Name,
            snapshot.ExternalVersion,
            snapshot.Items.OrderBy(item => item.Position).Select(item => new ProviderPlaylistItem(
                item.Position,
                item.OccurrenceKey,
                item.ExternalTrackId is null
                    ? null
                    : new ExternalTrackRef(playlistId.Provider, item.ExternalTrackId),
                item.Title,
                item.Artists,
                item.Availability,
                item.ProviderUri)).ToArray(),
            snapshot.CapturedAt);

    private static string ComputeContentHash(IReadOnlyList<ProviderPlaylistItem> items)
    {
        var canonical = string.Join(
            '\n',
            items.OrderBy(item => item.Position).Select(item =>
                $"{item.Position}|{item.OccurrenceKey}|{item.Track?.Value}|{item.Availability}|{item.ProviderUri}"));
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();
    }

    private sealed record ChangeDetails(
        string Title,
        IReadOnlyList<string> Artists,
        string Availability);
}
