using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

public sealed record SpotifyAuthorizationTokens(
    string AccessToken,
    string? RefreshToken,
    DateTimeOffset ExpiresAt,
    IReadOnlyCollection<string> Scopes);

public sealed record SpotifyUserProfile(
    string Id,
    string DisplayName,
    string? Email,
    string? Country,
    string? Product);

public interface ISpotifyAuthorizationClient
{
    bool IsConfigured { get; }

    Uri CreateAuthorizationUri(string state, string codeChallenge);

    Task<SpotifyAuthorizationTokens> ExchangeCodeAsync(
        string code,
        string codeVerifier,
        CancellationToken cancellationToken);

    Task<SpotifyUserProfile> GetCurrentUserAsync(
        string accessToken,
        CancellationToken cancellationToken);
}

internal sealed class SpotifyAuthorizationClient(
    HttpClient httpClient,
    IOptions<SpotifyOptions> options,
    TimeProvider timeProvider) : ISpotifyAuthorizationClient, IProviderTokenRefreshStrategy
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly string[] RequiredScopes =
    [
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",
        "user-read-email",
    ];
    private readonly SpotifyOptions settings = options.Value;

    public MusicProvider Provider => MusicProvider.Spotify;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(settings.ClientId) &&
        !string.IsNullOrWhiteSpace(settings.ClientSecret) &&
        Uri.TryCreate(settings.RedirectUri, UriKind.Absolute, out _);

    public Uri CreateAuthorizationUri(string state, string codeChallenge)
    {
        EnsureConfigured();
        var uri = QueryHelpers.AddQueryString(
            "https://accounts.spotify.com/authorize",
            new Dictionary<string, string?>
            {
                ["response_type"] = "code",
                ["client_id"] = settings.ClientId,
                ["redirect_uri"] = settings.RedirectUri,
                ["scope"] = string.Join(' ', RequiredScopes),
                ["state"] = state,
                ["code_challenge_method"] = "S256",
                ["code_challenge"] = codeChallenge,
                ["show_dialog"] = "true",
            });
        return new Uri(uri);
    }

    public async Task<SpotifyAuthorizationTokens> ExchangeCodeAsync(
        string code,
        string codeVerifier,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var response = await RequestTokenAsync(
            new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = settings.RedirectUri,
                ["code_verifier"] = codeVerifier,
            },
            cancellationToken);
        return ToTokens(response);
    }

    public async Task<ProviderTokenRefreshResult> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var response = await RequestTokenAsync(
            new Dictionary<string, string>
            {
                ["grant_type"] = "refresh_token",
                ["refresh_token"] = refreshToken,
            },
            cancellationToken);
        return new ProviderTokenRefreshResult(
            response.AccessToken,
            response.RefreshToken,
            timeProvider.GetUtcNow().AddSeconds(response.ExpiresIn),
            ParseScopes(response.Scope));
    }

    public async Task<SpotifyUserProfile> GetCurrentUserAsync(
        string accessToken,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "https://api.spotify.com/v1/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw await CreateExceptionAsync(response, cancellationToken);
        }

        var profile = await response.Content.ReadFromJsonAsync<SpotifyProfileResponse>(JsonOptions, cancellationToken)
            ?? throw new MusicProviderException(
                MusicProvider.Spotify,
                ProviderFailureKind.InvalidResponse,
                "Spotify returned an empty user profile.");
        return new SpotifyUserProfile(
            profile.Id,
            string.IsNullOrWhiteSpace(profile.DisplayName) ? profile.Id : profile.DisplayName,
            profile.Email,
            profile.Country,
            profile.Product);
    }

    private async Task<SpotifyTokenResponse> RequestTokenAsync(
        IReadOnlyDictionary<string, string> form,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token")
        {
            Content = new FormUrlEncodedContent(form),
        };
        var credentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{settings.ClientId}:{settings.ClientSecret}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw await CreateExceptionAsync(response, cancellationToken);
        }

        return await response.Content.ReadFromJsonAsync<SpotifyTokenResponse>(JsonOptions, cancellationToken)
            ?? throw new MusicProviderException(
                MusicProvider.Spotify,
                ProviderFailureKind.InvalidResponse,
                "Spotify returned an empty token response.");
    }

    private SpotifyAuthorizationTokens ToTokens(SpotifyTokenResponse response) =>
        new(
            response.AccessToken,
            response.RefreshToken,
            timeProvider.GetUtcNow().AddSeconds(response.ExpiresIn),
            ParseScopes(response.Scope) ?? RequiredScopes);

    private static IReadOnlyCollection<string>? ParseScopes(string? scope) =>
        string.IsNullOrWhiteSpace(scope)
            ? null
            : scope.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static async Task<MusicProviderException> CreateExceptionAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var kind = response.StatusCode switch
        {
            HttpStatusCode.Unauthorized or HttpStatusCode.BadRequest => ProviderFailureKind.Unauthorized,
            HttpStatusCode.Forbidden => ProviderFailureKind.Forbidden,
            HttpStatusCode.TooManyRequests => ProviderFailureKind.RateLimited,
            _ => ProviderFailureKind.Unavailable,
        };
        var retryAfter = response.Headers.RetryAfter?.Delta;
        return new MusicProviderException(
            MusicProvider.Spotify,
            kind,
            string.IsNullOrWhiteSpace(body) ? "Spotify authorization failed." : body,
            retryAfter);
    }

    private void EnsureConfigured()
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException(
                "Spotify ClientId, ClientSecret, and RedirectUri must be configured.");
        }
    }

    private sealed record SpotifyTokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("token_type")] string TokenType,
        [property: JsonPropertyName("expires_in")] int ExpiresIn,
        [property: JsonPropertyName("refresh_token")] string? RefreshToken,
        [property: JsonPropertyName("scope")] string? Scope);

    private sealed record SpotifyProfileResponse(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("display_name")] string? DisplayName,
        [property: JsonPropertyName("email")] string? Email,
        [property: JsonPropertyName("country")] string? Country,
        [property: JsonPropertyName("product")] string? Product);
}
