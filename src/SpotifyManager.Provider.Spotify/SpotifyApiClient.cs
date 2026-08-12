using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Provider.Spotify;

internal sealed class SpotifyApiClient(
    HttpClient httpClient,
    IProviderTokenProvider tokenProvider)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<SpotifyPlaylistDto> GetPlaylistAsync(
        ProviderConnectionId connectionId,
        string playlistId,
        CancellationToken cancellationToken)
    {
        using var request = await CreateRequestAsync(
            connectionId,
            HttpMethod.Get,
            $"playlists/{Uri.EscapeDataString(playlistId)}",
            cancellationToken);
        return await SendAsync<SpotifyPlaylistDto>(request, cancellationToken);
    }

    public async Task<IReadOnlyList<SpotifyPlaylistItemDto>> GetAllPlaylistItemsAsync(
        ProviderConnectionId connectionId,
        string playlistId,
        CancellationToken cancellationToken)
    {
        var items = new List<SpotifyPlaylistItemDto>();
        string? next = $"playlists/{Uri.EscapeDataString(playlistId)}/items?limit=50&offset=0";

        while (next is not null)
        {
            using var request = await CreateRequestAsync(connectionId, HttpMethod.Get, next, cancellationToken);
            var page = await SendAsync<SpotifyPlaylistItemsPageDto>(request, cancellationToken);
            items.AddRange(page.Items);
            next = page.Next;
        }

        return items;
    }

    public async Task<SpotifyCreatedPlaylistDto> CreatePlaylistAsync(
        ProviderConnectionId connectionId,
        string name,
        string? description,
        CancellationToken cancellationToken)
    {
        using var request = await CreateRequestAsync(
            connectionId,
            HttpMethod.Post,
            "me/playlists",
            cancellationToken);
        request.Content = JsonContent.Create(new
        {
            name,
            description,
            @public = false,
        });
        return await SendAsync<SpotifyCreatedPlaylistDto>(request, cancellationToken);
    }

    public async Task<string?> AddPlaylistItemsAsync(
        ProviderConnectionId connectionId,
        string playlistId,
        IReadOnlyList<string> uris,
        CancellationToken cancellationToken)
    {
        string? snapshotId = null;

        foreach (var chunk in uris.Chunk(100))
        {
            using var request = await CreateRequestAsync(
                connectionId,
                HttpMethod.Post,
                $"playlists/{Uri.EscapeDataString(playlistId)}/items",
                cancellationToken);
            request.Content = JsonContent.Create(new { uris = chunk });
            var result = await SendAsync<SpotifySnapshotResponseDto>(request, cancellationToken);
            snapshotId = result.SnapshotId;
        }

        return snapshotId;
    }

    private async Task<HttpRequestMessage> CreateRequestAsync(
        ProviderConnectionId connectionId,
        HttpMethod method,
        string requestUri,
        CancellationToken cancellationToken)
    {
        var token = await tokenProvider.GetAccessTokenAsync(
            connectionId,
            MusicProvider.Spotify,
            cancellationToken);
        var request = new HttpRequestMessage(method, requestUri);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return request;
    }

    private async Task<T> SendAsync<T>(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw await CreateExceptionAsync(response, cancellationToken);
        }

        var result = await response.Content.ReadFromJsonAsync<T>(JsonOptions, cancellationToken);
        return result ?? throw new MusicProviderException(
            MusicProvider.Spotify,
            ProviderFailureKind.InvalidResponse,
            "Spotify returned an empty response.");
    }

    private static async Task<MusicProviderException> CreateExceptionAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var kind = response.StatusCode switch
        {
            HttpStatusCode.Unauthorized => ProviderFailureKind.Unauthorized,
            HttpStatusCode.Forbidden => ProviderFailureKind.Forbidden,
            HttpStatusCode.NotFound => ProviderFailureKind.NotFound,
            HttpStatusCode.TooManyRequests => ProviderFailureKind.RateLimited,
            HttpStatusCode.Conflict => ProviderFailureKind.Conflict,
            >= HttpStatusCode.InternalServerError => ProviderFailureKind.Unavailable,
            _ => ProviderFailureKind.InvalidResponse,
        };
        var retryAfter = response.Headers.RetryAfter?.Delta;
        var message = TryReadErrorMessage(body) ?? $"Spotify request failed with status {(int)response.StatusCode}.";
        return new MusicProviderException(MusicProvider.Spotify, kind, message, retryAfter);
    }

    private static string? TryReadErrorMessage(string body)
    {
        if (string.IsNullOrWhiteSpace(body))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(body);
            var root = document.RootElement;
            if (root.TryGetProperty("error", out var error))
            {
                if (error.ValueKind == JsonValueKind.Object && error.TryGetProperty("message", out var message))
                {
                    return message.GetString();
                }

                return error.GetString();
            }
        }
        catch (JsonException)
        {
            // Return a stable message rather than leaking an arbitrary upstream body.
        }

        return null;
    }
}

internal sealed record SpotifyPlaylistDto(
    string Id,
    string Name,
    [property: JsonPropertyName("snapshot_id")] string? SnapshotId);

internal sealed record SpotifyPlaylistItemsPageDto(
    IReadOnlyList<SpotifyPlaylistItemDto> Items,
    string? Next);

internal sealed record SpotifyPlaylistItemDto(
    [property: JsonPropertyName("is_local")] bool IsLocal,
    SpotifyTrackDto? Item);

internal sealed record SpotifyTrackDto(
    string? Id,
    string? Uri,
    string? Name,
    IReadOnlyList<SpotifyArtistDto>? Artists);

internal sealed record SpotifyArtistDto(string? Name);

internal sealed record SpotifyCreatedPlaylistDto(
    string Id,
    [property: JsonPropertyName("snapshot_id")] string? SnapshotId);

internal sealed record SpotifySnapshotResponseDto(
    [property: JsonPropertyName("snapshot_id")] string? SnapshotId);
