using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

public static class SpotifyServiceCollectionExtensions
{
    public static IServiceCollection AddSpotifyProvider(this IServiceCollection services)
    {
        services.AddHttpClient<SpotifyApiClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.spotify.com/v1/");
            client.DefaultRequestHeaders.UserAgent.ParseAdd("SpotifyManager/2.0");
        });

        services.TryAddSingleton(TimeProvider.System);
        services.TryAddScoped<IProviderTokenProvider, MissingProviderTokenProvider>();
        services.AddScoped<IMusicProviderAdapter, SpotifyMusicProviderAdapter>();
        services.AddScoped<IPlaylistForkStrategy, SpotifyPlaylistForkStrategy>();
        services.AddScoped<IPlaylistChangeDetectionStrategy, SpotifySnapshotChangeDetectionStrategy>();
        return services;
    }
}

internal sealed class MissingProviderTokenProvider : IProviderTokenProvider
{
    public Task<string> GetAccessTokenAsync(
        Domain.Providers.ProviderConnectionId connectionId,
        Domain.Providers.MusicProvider provider,
        CancellationToken cancellationToken) =>
        throw new InvalidOperationException(
            "Provider token storage is not configured. Complete a provider connection before using Spotify endpoints.");
}
