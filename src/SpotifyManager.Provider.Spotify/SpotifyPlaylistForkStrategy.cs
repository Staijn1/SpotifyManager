using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

internal sealed class SpotifyPlaylistForkStrategy(SpotifyApiClient apiClient) : IPlaylistForkStrategy
{
    public MusicProvider Provider => MusicProvider.Spotify;

    public async Task<ProviderForkResult> ForkAsync(
        ProviderForkRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Source.PlaylistId.Provider != MusicProvider.Spotify)
        {
            throw new ArgumentException("The Spotify strategy only accepts Spotify playlists.", nameof(request));
        }

        var created = await apiClient.CreatePlaylistAsync(
            request.ConnectionId,
            request.Name,
            request.Description,
            cancellationToken);
        var writableItems = request.Source.Items
            .Where(item => item.Availability == ProviderItemAvailability.Available && item.ProviderUri is not null)
            .ToArray();
        var skipped = request.Source.Items
            .Except(writableItems)
            .Select(item => item.OccurrenceKey)
            .ToArray();
        var snapshotId = await apiClient.AddPlaylistItemsAsync(
            request.ConnectionId,
            created.Id,
            writableItems.Select(item => item.ProviderUri!).ToArray(),
            cancellationToken);

        return new ProviderForkResult(
            new ExternalPlaylistId(MusicProvider.Spotify, created.Id),
            snapshotId ?? created.SnapshotId,
            writableItems.Length,
            skipped);
    }
}
