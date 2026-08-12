using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Domain.Playlists;

public sealed record ProviderPlaylistSummary(
    ExternalPlaylistId Id,
    string Name,
    string Description,
    string OwnerDisplayName,
    int ItemCount,
    string? ImageUrl,
    string? ProviderUrl,
    string? ExternalVersion,
    bool? IsPublic,
    bool IsCollaborative);
