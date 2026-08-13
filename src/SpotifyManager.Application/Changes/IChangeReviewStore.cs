using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Application.Changes;

public sealed record ChangeDetectionContext(
    Guid ForkId,
    Guid UserId,
    Guid SourcePlaylistId,
    Guid PreviousSnapshotId,
    ProviderConnectionId ConnectionId,
    ExternalPlaylistId ExternalPlaylistId,
    ProviderPlaylistSnapshot PreviousSnapshot);

public sealed record ChangeProposal(
    Guid Id,
    PlaylistChangeType Type,
    string OccurrenceKey,
    string Title,
    IReadOnlyList<string> Artists,
    string Availability,
    int? FromPosition,
    int? ToPosition,
    string ReviewStatus,
    DateTimeOffset CreatedAt);

public interface IChangeReviewStore
{
    Task<ChangeDetectionContext?> GetDetectionContextAsync(
        Guid forkId,
        Guid? expectedUserId,
        CancellationToken cancellationToken);

    Task<int> SaveDetectionAsync(
        ChangeDetectionContext context,
        ProviderPlaylistSnapshot current,
        PlaylistChangeSet changeSet,
        CancellationToken cancellationToken);

    Task MarkCheckedAsync(
        Guid sourcePlaylistId,
        DateTimeOffset checkedAt,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ChangeProposal>?> ListProposalsAsync(
        Guid forkId,
        Guid userId,
        CancellationToken cancellationToken);
}
