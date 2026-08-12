using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Provider.Abstractions;

public interface IPlaylistForkStrategy
{
    MusicProvider Provider { get; }

    Task<ProviderForkResult> ForkAsync(
        ProviderForkRequest request,
        CancellationToken cancellationToken);
}

public interface IPlaylistChangeDetectionStrategy
{
    MusicProvider Provider { get; }

    Task<bool> HasChangedAsync(
        ProviderConnectionId connectionId,
        ExternalPlaylistId playlistId,
        string? knownExternalVersion,
        CancellationToken cancellationToken);

    PlaylistChangeSet DetectChanges(
        ProviderPlaylistSnapshot previous,
        ProviderPlaylistSnapshot current);
}

public interface IApplyPlaylistChangesStrategy
{
    MusicProvider Provider { get; }

    Task<ProviderApplyChangesResult> ApplyAsync(
        ProviderApplyChangesRequest request,
        CancellationToken cancellationToken);
}
