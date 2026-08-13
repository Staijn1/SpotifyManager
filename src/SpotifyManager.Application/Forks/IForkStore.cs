using SpotifyManager.Domain.Forks;
using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Application.Forks;

public sealed record SourceSnapshotReference(Guid SourcePlaylistId, Guid SnapshotId);

public sealed record ForkListItem(
    Guid Id,
    ExternalPlaylistId SourcePlaylistId,
    ExternalPlaylistId? ExternalPlaylistId,
    string SourceName,
    string Name,
    ForkedPlaylistStatus Status,
    int ProposedChangeCount,
    string? FailureReason,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public interface IForkStore
{
    Task<ForkedPlaylist?> FindByIdempotencyKeyAsync(
        Guid userId,
        string idempotencyKey,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ForkListItem>> ListAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<SourceSnapshotReference> SaveSourceSnapshotAsync(
        ProviderConnectionId connectionId,
        ProviderPlaylistSnapshot snapshot,
        CancellationToken cancellationToken);

    Task AddAsync(ForkedPlaylist fork, CancellationToken cancellationToken);

    Task UpdateAsync(ForkedPlaylist fork, CancellationToken cancellationToken);
}
