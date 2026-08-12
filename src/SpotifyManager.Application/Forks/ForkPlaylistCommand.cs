using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Application.Forks;

public sealed record ForkPlaylistCommand(
    Guid UserId,
    ProviderConnectionId ConnectionId,
    ExternalPlaylistId SourcePlaylistId,
    string IdempotencyKey);

public sealed record ForkPlaylistResult(
    Guid ForkId,
    ExternalPlaylistId? ExternalPlaylistId,
    string Name,
    string Status,
    bool WasExisting);
