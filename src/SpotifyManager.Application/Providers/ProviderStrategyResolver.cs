using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Application.Providers;

public interface IProviderStrategyResolver
{
    IMusicProviderAdapter GetAdapter(MusicProvider provider);

    IPlaylistForkStrategy GetForkStrategy(MusicProvider provider);

    IPlaylistChangeDetectionStrategy GetChangeDetectionStrategy(MusicProvider provider);
}

public sealed class ProviderStrategyResolver(
    IEnumerable<IMusicProviderAdapter> adapters,
    IEnumerable<IPlaylistForkStrategy> forkStrategies,
    IEnumerable<IPlaylistChangeDetectionStrategy> changeDetectionStrategies) : IProviderStrategyResolver
{
    private readonly IReadOnlyDictionary<MusicProvider, IMusicProviderAdapter> _adapters =
        adapters.ToDictionary(adapter => adapter.Provider);

    private readonly IReadOnlyDictionary<MusicProvider, IPlaylistForkStrategy> _forkStrategies =
        forkStrategies.ToDictionary(strategy => strategy.Provider);

    private readonly IReadOnlyDictionary<MusicProvider, IPlaylistChangeDetectionStrategy> _changeDetectionStrategies =
        changeDetectionStrategies.ToDictionary(strategy => strategy.Provider);

    public IMusicProviderAdapter GetAdapter(MusicProvider provider) =>
        _adapters.TryGetValue(provider, out var adapter)
            ? adapter
            : throw new NotSupportedException($"No music-provider adapter is registered for {provider}.");

    public IPlaylistForkStrategy GetForkStrategy(MusicProvider provider) =>
        _forkStrategies.TryGetValue(provider, out var strategy)
            ? strategy
            : throw new NotSupportedException($"No playlist-fork strategy is registered for {provider}.");

    public IPlaylistChangeDetectionStrategy GetChangeDetectionStrategy(MusicProvider provider) =>
        _changeDetectionStrategies.TryGetValue(provider, out var strategy)
            ? strategy
            : throw new NotSupportedException($"No change-detection strategy is registered for {provider}.");
}
