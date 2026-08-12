using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using SpotifyManager.Application.Connections;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Spotify;

namespace SpotifyManager.Api;

internal static class SpotifyAuthorizationEndpoints
{
    private const string SessionCookieName = "spotify_manager_session";
    private static readonly TimeSpan AuthorizationLifetime = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromDays(30);

    public static IEndpointRouteBuilder MapSpotifyAuthorizationEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        var auth = endpoints.MapGroup("/auth");

        auth.MapGet("/session", GetSessionAsync);
        auth.MapGet("/spotify/start", StartSpotifyAuthorizationAsync);
        auth.MapGet("/spotify/callback", CompleteSpotifyAuthorizationAsync);
        auth.MapPost("/logout", LogoutAsync);
        endpoints.MapDelete("/provider-connections/spotify", DisconnectSpotifyAsync);
        return endpoints;
    }

    private static async Task<IResult> GetSessionAsync(
        HttpContext context,
        IProviderConnectionStore store,
        ISpotifyAuthorizationClient spotify,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var token = context.Request.Cookies[SessionCookieName];
        var session = await GetAuthenticatedSessionAsync(
            context,
            store,
            timeProvider,
            cancellationToken);
        if (session is null && token is not null)
        {
            DeleteSessionCookie(context.Response);
        }

        return Results.Ok(new
        {
            isAuthenticated = session is not null,
            spotifyConfigured = spotify.IsConfigured,
            user = session is null
                ? null
                : new
                {
                    id = session.UserId,
                    session.DisplayName,
                    session.Email,
                },
            providerConnection = session?.ProviderConnection is null
                ? null
                : new
                {
                    id = session.ProviderConnection.Id.Value,
                    provider = session.ProviderConnection.Provider.ToString(),
                    status = session.ProviderConnection.Status.ToLowerInvariant(),
                    session.ProviderConnection.DisplayName,
                    scopes = session.ProviderConnection.Scopes,
                    session.ProviderConnection.UpdatedAt,
                },
        });
    }

    internal static Task<AuthenticatedSession?> GetAuthenticatedSessionAsync(
        HttpContext context,
        IProviderConnectionStore store,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var token = context.Request.Cookies[SessionCookieName];
        return string.IsNullOrWhiteSpace(token)
            ? Task.FromResult<AuthenticatedSession?>(null)
            : store.FindSessionAsync(Hash(token), timeProvider.GetUtcNow(), cancellationToken);
    }

    private static async Task<IResult> StartSpotifyAuthorizationAsync(
        string? returnPath,
        IProviderConnectionStore store,
        ISpotifyAuthorizationClient spotify,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        if (!spotify.IsConfigured)
        {
            return Results.Problem(
                title: "Spotify connection is not configured",
                detail: "Set Spotify__ClientId, Spotify__ClientSecret, and Spotify__RedirectUri before connecting an account.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var now = timeProvider.GetUtcNow();
        var state = CreateRandomValue();
        var verifier = CreateRandomValue(64);
        var challenge = WebEncoders.Base64UrlEncode(SHA256.HashData(Encoding.ASCII.GetBytes(verifier)));
        await store.SaveAuthorizationRequestAsync(
            new PendingProviderAuthorization(
                Guid.NewGuid(),
                MusicProvider.Spotify,
                Hash(state),
                verifier,
                NormalizeReturnPath(returnPath),
                now.Add(AuthorizationLifetime),
                now),
            cancellationToken);
        return Results.Redirect(spotify.CreateAuthorizationUri(state, challenge).ToString());
    }

    private static async Task<IResult> CompleteSpotifyAuthorizationAsync(
        HttpContext context,
        string? code,
        string? state,
        string? error,
        IProviderConnectionStore store,
        ISpotifyAuthorizationClient spotify,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return Results.Problem(
                title: "Invalid Spotify callback",
                detail: "The authorization state is missing.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var now = timeProvider.GetUtcNow();
        var pending = await store.ConsumeAuthorizationRequestAsync(
            MusicProvider.Spotify,
            Hash(state),
            now,
            cancellationToken);
        if (pending is null)
        {
            return Results.Problem(
                title: "Spotify authorization expired",
                detail: "Start the connection again. Authorization links can only be used once.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (!string.IsNullOrWhiteSpace(error))
        {
            return Results.Redirect(AddResult(pending.ReturnPath, "denied"));
        }
        if (string.IsNullOrWhiteSpace(code))
        {
            return Results.Problem(
                title: "Invalid Spotify callback",
                detail: "Spotify did not return an authorization code.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var tokens = await spotify.ExchangeCodeAsync(code, pending.CodeVerifier, cancellationToken);
        var profile = await spotify.GetCurrentUserAsync(tokens.AccessToken, cancellationToken);
        var session = await store.CompleteAuthorizationAsync(
            new ProviderAuthorizationCompletion(
                MusicProvider.Spotify,
                profile.Id,
                profile.Email,
                EmailVerified: false,
                profile.DisplayName,
                tokens.Scopes,
                tokens.AccessToken,
                tokens.RefreshToken,
                tokens.ExpiresAt,
                JsonSerializer.Serialize(profile),
                now),
            cancellationToken);

        var sessionToken = CreateRandomValue(64);
        await store.CreateSessionAsync(
            session.UserId,
            Hash(sessionToken),
            now.Add(SessionLifetime),
            now,
            cancellationToken);
        AppendSessionCookie(context, sessionToken);
        return Results.Redirect(AddResult(pending.ReturnPath, "connected"));
    }

    private static async Task<IResult> LogoutAsync(
        HttpContext context,
        IProviderConnectionStore store,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var token = context.Request.Cookies[SessionCookieName];
        if (!string.IsNullOrWhiteSpace(token))
        {
            await store.RevokeSessionAsync(Hash(token), timeProvider.GetUtcNow(), cancellationToken);
        }
        DeleteSessionCookie(context.Response);
        return Results.NoContent();
    }

    private static async Task<IResult> DisconnectSpotifyAsync(
        HttpContext context,
        IProviderConnectionStore store,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var token = context.Request.Cookies[SessionCookieName];
        var now = timeProvider.GetUtcNow();
        var session = string.IsNullOrWhiteSpace(token)
            ? null
            : await store.FindSessionAsync(Hash(token), now, cancellationToken);
        if (session is null)
        {
            return Results.Unauthorized();
        }

        await store.DisconnectAsync(session.UserId, MusicProvider.Spotify, now, cancellationToken);
        return Results.NoContent();
    }

    internal static string NormalizeReturnPath(string? returnPath) =>
        string.IsNullOrWhiteSpace(returnPath) ||
        !returnPath.StartsWith("/", StringComparison.Ordinal) ||
        returnPath.StartsWith("//", StringComparison.Ordinal) ||
        returnPath.Contains("\\", StringComparison.Ordinal)
            ? "/"
            : returnPath;

    private static string CreateRandomValue(int byteCount = 32) =>
        WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(byteCount));

    private static string Hash(string value) =>
        WebEncoders.Base64UrlEncode(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    private static string AddResult(string returnPath, string result) =>
        QueryHelpers.AddQueryString(returnPath, "connection", result);

    private static void AppendSessionCookie(HttpContext context, string token) =>
        context.Response.Cookies.Append(
            SessionCookieName,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                IsEssential = true,
                Secure = context.Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Path = "/",
                MaxAge = SessionLifetime,
            });

    private static void DeleteSessionCookie(HttpResponse response) =>
        response.Cookies.Delete(SessionCookieName, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Path = "/",
        });
}
