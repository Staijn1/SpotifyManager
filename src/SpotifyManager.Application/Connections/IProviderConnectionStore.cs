using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Application.Connections;

public sealed record PendingProviderAuthorization(
    Guid Id,
    MusicProvider Provider,
    string StateHash,
    string CodeVerifier,
    string ReturnPath,
    DateTimeOffset ExpiresAt,
    DateTimeOffset CreatedAt);

public sealed record ProviderAuthorizationCompletion(
    MusicProvider Provider,
    string ExternalUserId,
    string? Email,
    bool EmailVerified,
    string DisplayName,
    IReadOnlyCollection<string> Scopes,
    string AccessToken,
    string? RefreshToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RawMetadataJson,
    DateTimeOffset CompletedAt);

public sealed record ConnectedProvider(
    ProviderConnectionId Id,
    MusicProvider Provider,
    string Status,
    string DisplayName,
    IReadOnlyCollection<string> Scopes,
    DateTimeOffset UpdatedAt);

public sealed record AuthenticatedSession(
    Guid UserId,
    string DisplayName,
    string Email,
    ConnectedProvider? ProviderConnection);

public interface IProviderConnectionStore
{
    Task SaveAuthorizationRequestAsync(
        PendingProviderAuthorization request,
        CancellationToken cancellationToken);

    Task<PendingProviderAuthorization?> ConsumeAuthorizationRequestAsync(
        MusicProvider provider,
        string stateHash,
        DateTimeOffset now,
        CancellationToken cancellationToken);

    Task<AuthenticatedSession> CompleteAuthorizationAsync(
        ProviderAuthorizationCompletion completion,
        CancellationToken cancellationToken);

    Task CreateSessionAsync(
        Guid userId,
        string tokenHash,
        DateTimeOffset expiresAt,
        DateTimeOffset now,
        CancellationToken cancellationToken);

    Task<AuthenticatedSession?> FindSessionAsync(
        string tokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken);

    Task RevokeSessionAsync(
        string tokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken);

    Task DisconnectAsync(
        Guid userId,
        MusicProvider provider,
        DateTimeOffset now,
        CancellationToken cancellationToken);
}
