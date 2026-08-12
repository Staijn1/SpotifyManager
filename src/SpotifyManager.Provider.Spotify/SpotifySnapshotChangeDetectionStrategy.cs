using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

internal sealed class SpotifySnapshotChangeDetectionStrategy(SpotifyApiClient apiClient)
    : IPlaylistChangeDetectionStrategy
{
    public MusicProvider Provider => MusicProvider.Spotify;

    public async Task<bool> HasChangedAsync(
        ProviderConnectionId connectionId,
        ExternalPlaylistId playlistId,
        string? knownExternalVersion,
        CancellationToken cancellationToken)
    {
        if (playlistId.Provider != MusicProvider.Spotify)
        {
            throw new ArgumentException("The Spotify strategy only accepts Spotify playlist IDs.", nameof(playlistId));
        }

        if (knownExternalVersion is null)
        {
            return true;
        }

        var current = await apiClient.GetPlaylistAsync(connectionId, playlistId.Value, cancellationToken);
        return !string.Equals(current.SnapshotId, knownExternalVersion, StringComparison.Ordinal);
    }

    public PlaylistChangeSet DetectChanges(
        ProviderPlaylistSnapshot previous,
        ProviderPlaylistSnapshot current) =>
        PlaylistChangeDetector.Detect(previous, current);
}
