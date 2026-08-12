using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

internal sealed class SpotifyMusicProviderAdapter(
    SpotifyApiClient apiClient,
    TimeProvider timeProvider) : IMusicProviderAdapter
{
    public MusicProvider Provider => MusicProvider.Spotify;

    public Task<ProviderCapabilities> GetCapabilitiesAsync(
        ProviderConnectionId connectionId,
        CancellationToken cancellationToken) =>
        Task.FromResult(new ProviderCapabilities(
            MusicProvider.Spotify,
            CanReadPlaylistItems: true,
            CanCreatePlaylists: true,
            CanAddPlaylistItems: true,
            CanRemovePlaylistItems: true,
            CanReorderPlaylistItems: true,
            SupportsExternalVersions: true,
            SupportsWebhooks: false));

    public async Task<ProviderPlaylistSnapshot> GetPlaylistSnapshotAsync(
        ProviderConnectionId connectionId,
        ExternalPlaylistId playlistId,
        CancellationToken cancellationToken)
    {
        EnsureSpotifyId(playlistId);
        var playlist = await apiClient.GetPlaylistAsync(connectionId, playlistId.Value, cancellationToken);
        var spotifyItems = await apiClient.GetAllPlaylistItemsAsync(connectionId, playlistId.Value, cancellationToken);
        var occurrenceCounts = new Dictionary<string, int>(StringComparer.Ordinal);
        var items = new List<ProviderPlaylistItem>(spotifyItems.Count);

        for (var position = 0; position < spotifyItems.Count; position++)
        {
            var spotifyItem = spotifyItems[position];
            var baseKey = spotifyItem.Item?.Id ?? spotifyItem.Item?.Uri ?? $"unavailable:{position}";
            occurrenceCounts[baseKey] = occurrenceCounts.GetValueOrDefault(baseKey) + 1;
            var occurrenceKey = $"{baseKey}#{occurrenceCounts[baseKey]}";
            var availability = spotifyItem.IsLocal
                ? ProviderItemAvailability.Local
                : spotifyItem.Item?.Id is null
                    ? ProviderItemAvailability.Unavailable
                    : ProviderItemAvailability.Available;
            ExternalTrackRef? track = spotifyItem.Item?.Id is { Length: > 0 } trackId
                ? new ExternalTrackRef(MusicProvider.Spotify, trackId)
                : null;

            items.Add(new ProviderPlaylistItem(
                position,
                occurrenceKey,
                track,
                spotifyItem.Item?.Name ?? "Unavailable item",
                spotifyItem.Item?.Artists?
                    .Select(artist => artist.Name)
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .Select(name => name!)
                    .ToArray() ?? [],
                availability,
                spotifyItem.Item?.Uri));
        }

        return new ProviderPlaylistSnapshot(
            playlistId,
            playlist.Name,
            playlist.SnapshotId,
            items,
            timeProvider.GetUtcNow());
    }

    private static void EnsureSpotifyId(ExternalPlaylistId playlistId)
    {
        if (playlistId.Provider != MusicProvider.Spotify)
        {
            throw new ArgumentException("The Spotify adapter only accepts Spotify playlist IDs.", nameof(playlistId));
        }
    }
}
