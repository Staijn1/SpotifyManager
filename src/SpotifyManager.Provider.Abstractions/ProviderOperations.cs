using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Provider.Abstractions;

public sealed record ProviderForkRequest(
    ProviderConnectionId ConnectionId,
    ProviderPlaylistSnapshot Source,
    string Name,
    string? Description);

public sealed record ProviderForkResult(
    ExternalPlaylistId PlaylistId,
    string? ExternalVersion,
    int AddedItemCount,
    IReadOnlyList<string> SkippedOccurrenceKeys);

public sealed record ProviderApplyChangesRequest(
    ProviderConnectionId ConnectionId,
    ExternalPlaylistId ForkPlaylistId,
    string? ExpectedExternalVersion,
    IReadOnlyList<PlaylistChange> Changes);

public sealed record ProviderApplyChangesResult(
    string? ExternalVersion,
    int AppliedChangeCount,
    IReadOnlyList<string> SkippedOccurrenceKeys);
