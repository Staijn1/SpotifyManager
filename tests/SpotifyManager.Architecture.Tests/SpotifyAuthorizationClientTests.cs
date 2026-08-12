using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;
using SpotifyManager.Provider.Spotify;

namespace SpotifyManager.Architecture.Tests;

public sealed class SpotifyAuthorizationClientTests
{
    [Fact]
    public void Authorization_uri_uses_state_pkce_and_required_playlist_scopes()
    {
        using var services = CreateServices(new Dictionary<string, string?>
        {
            ["Spotify:ClientId"] = "client-id",
            ["Spotify:ClientSecret"] = "client-secret",
            ["Spotify:RedirectUri"] = "https://example.test/api/v1/auth/spotify/callback",
        });
        var client = services.GetRequiredService<ISpotifyAuthorizationClient>();

        var uri = client.CreateAuthorizationUri("state-value", "challenge-value");
        var query = QueryHelpers.ParseQuery(uri.Query);

        Assert.Equal("https", uri.Scheme);
        Assert.Equal("accounts.spotify.com", uri.Host);
        Assert.Equal("state-value", query["state"]);
        Assert.Equal("S256", query["code_challenge_method"]);
        Assert.Equal("challenge-value", query["code_challenge"]);
        Assert.Contains("playlist-read-private", query["scope"].ToString(), StringComparison.Ordinal);
        Assert.Contains("playlist-modify-private", query["scope"].ToString(), StringComparison.Ordinal);
        Assert.Contains("playlist-modify-public", query["scope"].ToString(), StringComparison.Ordinal);
    }

    [Fact]
    public void Provider_registration_exposes_spotify_refresh_strategy()
    {
        using var services = CreateServices(new Dictionary<string, string?>
        {
            ["Spotify:ClientId"] = "client-id",
            ["Spotify:ClientSecret"] = "client-secret",
            ["Spotify:RedirectUri"] = "https://example.test/callback",
        });

        using var scope = services.CreateScope();
        var strategy = scope.ServiceProvider.GetRequiredService<IProviderTokenRefreshStrategy>();

        Assert.Equal(MusicProvider.Spotify, strategy.Provider);
    }

    private static ServiceProvider CreateServices(IReadOnlyDictionary<string, string?> settings)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
        var services = new ServiceCollection();
        services.AddSingleton(TimeProvider.System);
        services.AddSpotifyProvider(configuration);
        return services.BuildServiceProvider(validateScopes: true);
    }
}
