using SpotifyManager.Application.Connections;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Api;

internal static class PlaylistEndpoints
{
    public static IEndpointRouteBuilder MapPlaylistEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/playlists", GetPlaylistsAsync);
        return endpoints;
    }

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
}
