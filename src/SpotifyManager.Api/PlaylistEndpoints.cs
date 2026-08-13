using SpotifyManager.Application.Connections;
using SpotifyManager.Application.Forks;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Api;

internal static class PlaylistEndpoints
{
    public static IEndpointRouteBuilder MapPlaylistEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/playlists", GetPlaylistsAsync);
        endpoints.MapGet("/playlists/{playlistId}", GetPlaylistAsync);
        endpoints.MapPost("/playlists/{playlistId}/forks", ForkPlaylistAsync);
        endpoints.MapGet("/forks", GetForksAsync);
        return endpoints;
    }

    private sealed record CreateForkRequest(string? IdempotencyKey);

    private static async Task<IResult> GetPlaylistsAsync(
        HttpContext context,
        string? query,
        IProviderConnectionStore connectionStore,
        IEnumerable<IMusicProviderAdapter> providers,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await SpotifyAuthorizationEndpoints.GetAuthenticatedSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        var connection = session?.ProviderConnection;
        if (connection is null || connection.Status != "Active")
        {
            return Results.Unauthorized();
        }

        var adapter = providers.Single(provider => provider.Provider == MusicProvider.Spotify);
        var playlists = await adapter.GetUserPlaylistsAsync(connection.Id, cancellationToken);
        var normalizedQuery = query?.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedQuery))
        {
            playlists = playlists
                .Where(playlist =>
                    playlist.Name.Contains(normalizedQuery, StringComparison.OrdinalIgnoreCase) ||
                    playlist.OwnerDisplayName.Contains(normalizedQuery, StringComparison.OrdinalIgnoreCase))
                .ToArray();
        }

        return Results.Ok(new
        {
            items = playlists
                .OrderBy(playlist => playlist.Name, StringComparer.OrdinalIgnoreCase)
                .Select(playlist => new
                {
                    id = playlist.Id.Value,
                    provider = playlist.Id.Provider.ToString(),
                    playlist.Name,
                    playlist.Description,
                    playlist.OwnerDisplayName,
                    playlist.ItemCount,
                    playlist.ImageUrl,
                    playlist.ProviderUrl,
                    playlist.ExternalVersion,
                    playlist.IsPublic,
                    playlist.IsCollaborative,
                }),
        });
    }

    private static async Task<IResult> GetPlaylistAsync(
        HttpContext context,
        string playlistId,
        IProviderConnectionStore connectionStore,
        IEnumerable<IMusicProviderAdapter> providers,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await GetActiveSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        if (session?.ProviderConnection is null)
        {
            return Results.Unauthorized();
        }

        var externalId = new ExternalPlaylistId(MusicProvider.Spotify, playlistId);
        var adapter = providers.Single(provider => provider.Provider == MusicProvider.Spotify);
        var snapshot = await adapter.GetPlaylistSnapshotAsync(
            session.ProviderConnection.Id,
            externalId,
            cancellationToken);

        return Results.Ok(new
        {
            id = snapshot.PlaylistId.Value,
            provider = snapshot.PlaylistId.Provider.ToString(),
            snapshot.Name,
            snapshot.ExternalVersion,
            itemCount = snapshot.Items.Count,
            snapshot.CapturedAt,
            items = snapshot.Items.Select(item => new
            {
                item.Position,
                item.OccurrenceKey,
                trackId = item.Track?.Value,
                item.Title,
                item.Artists,
                availability = item.Availability.ToString().ToLowerInvariant(),
            }),
        });
    }

    private static async Task<IResult> ForkPlaylistAsync(
        HttpContext context,
        string playlistId,
        CreateForkRequest request,
        IProviderConnectionStore connectionStore,
        ForkPlaylistHandler handler,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await GetActiveSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        if (session?.ProviderConnection is null)
        {
            return Results.Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.IdempotencyKey) || request.IdempotencyKey.Length > 200)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["idempotencyKey"] = ["An idempotency key of at most 200 characters is required."],
            });
        }

        var result = await handler.HandleAsync(
            new ForkPlaylistCommand(
                session.UserId,
                session.ProviderConnection.Id,
                new ExternalPlaylistId(MusicProvider.Spotify, playlistId),
                request.IdempotencyKey),
            cancellationToken);
        var body = new
        {
            id = result.ForkId,
            externalPlaylistId = result.ExternalPlaylistId?.Value,
            providerUrl = result.ExternalPlaylistId is null
                ? null
                : $"https://open.spotify.com/playlist/{Uri.EscapeDataString(result.ExternalPlaylistId.Value.Value)}",
            result.Name,
            status = result.Status.ToLowerInvariant(),
            result.WasExisting,
        };

        return result.WasExisting
            ? Results.Ok(body)
            : Results.Created($"/api/v1/forks/{result.ForkId}", body);
    }

    private static async Task<IResult> GetForksAsync(
        HttpContext context,
        IProviderConnectionStore connectionStore,
        IForkStore forkStore,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await SpotifyAuthorizationEndpoints.GetAuthenticatedSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        if (session is null)
        {
            return Results.Unauthorized();
        }

        var forks = await forkStore.ListAsync(session.UserId, cancellationToken);
        return Results.Ok(new
        {
            items = forks.Select(fork => new
            {
                fork.Id,
                sourcePlaylistId = fork.SourcePlaylistId.Value,
                externalPlaylistId = fork.ExternalPlaylistId?.Value,
                provider = fork.SourcePlaylistId.Provider.ToString(),
                fork.SourceName,
                fork.Name,
                status = fork.Status.ToString().ToLowerInvariant(),
                fork.FailureReason,
                providerUrl = fork.ExternalPlaylistId is null
                    ? null
                    : $"https://open.spotify.com/playlist/{Uri.EscapeDataString(fork.ExternalPlaylistId.Value.Value)}",
                fork.CreatedAt,
                fork.UpdatedAt,
            }),
        });
    }

    private static async Task<AuthenticatedSession?> GetActiveSessionAsync(
        HttpContext context,
        IProviderConnectionStore connectionStore,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await SpotifyAuthorizationEndpoints.GetAuthenticatedSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        return session?.ProviderConnection?.Status == "Active" ? session : null;
    }
}
