using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Provider.Abstractions;

public interface IMusicProviderAdapter
{
    MusicProvider Provider { get; }

    Task<ProviderCapabilities> GetCapabilitiesAsync(
        ProviderConnectionId connectionId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ProviderPlaylistSummary>> GetUserPlaylistsAsync(
        ProviderConnectionId connectionId,
        CancellationToken cancellationToken);

    Task<ProviderPlaylistSnapshot> GetPlaylistSnapshotAsync(
        ProviderConnectionId connectionId,
        ExternalPlaylistId playlistId,
        CancellationToken cancellationToken);
}

public interface IProviderTokenProvider
{
    Task<string> GetAccessTokenAsync(
        ProviderConnectionId connectionId,
        MusicProvider provider,
        CancellationToken cancellationToken);
}

public sealed record ProviderTokenRefreshResult(
    string AccessToken,
    string? RefreshToken,
    DateTimeOffset ExpiresAt,
    IReadOnlyCollection<string>? Scopes = null);

public interface IProviderTokenRefreshStrategy
{
    MusicProvider Provider { get; }

    Task<ProviderTokenRefreshResult> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken);
}
