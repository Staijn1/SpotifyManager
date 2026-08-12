using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Provider.Abstractions;

public sealed record ProviderCapabilities(
    MusicProvider Provider,
    bool CanReadPlaylistItems,
    bool CanCreatePlaylists,
    bool CanAddPlaylistItems,
    bool CanRemovePlaylistItems,
    bool CanReorderPlaylistItems,
    bool SupportsExternalVersions,
    bool SupportsWebhooks);
