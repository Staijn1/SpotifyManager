using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

public static class SpotifyServiceCollectionExtensions
{
    public static IServiceCollection AddSpotifyProvider(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<SpotifyOptions>(configuration.GetSection(SpotifyOptions.SectionName));
        services.AddHttpClient<ISpotifyAuthorizationClient, SpotifyAuthorizationClient>();
        services.AddHttpClient<SpotifyApiClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.spotify.com/v1/");
            client.DefaultRequestHeaders.UserAgent.ParseAdd("SpotifyManager/2.0");
        });

        services.AddScoped<IMusicProviderAdapter, SpotifyMusicProviderAdapter>();
        services.AddScoped<IProviderTokenRefreshStrategy>(services =>
            (SpotifyAuthorizationClient)services.GetRequiredService<ISpotifyAuthorizationClient>());
        services.AddScoped<IPlaylistForkStrategy, SpotifyPlaylistForkStrategy>();
        services.AddScoped<IPlaylistChangeDetectionStrategy, SpotifySnapshotChangeDetectionStrategy>();
        return services;
    }
}
