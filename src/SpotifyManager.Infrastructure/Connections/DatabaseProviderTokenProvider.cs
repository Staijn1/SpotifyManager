using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Infrastructure.Persistence;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Infrastructure.Connections;

internal sealed class DatabaseProviderTokenProvider(
    SpotifyManagerDbContext dbContext,
    IDataProtectionProvider dataProtectionProvider,
    IEnumerable<IProviderTokenRefreshStrategy> refreshStrategies,
    TimeProvider timeProvider) : IProviderTokenProvider
{
    private readonly IDataProtector secretProtector = dataProtectionProvider.CreateProtector(
        "SpotifyManager.ProviderConnectionSecrets.v1");

    public async Task<string> GetAccessTokenAsync(
        ProviderConnectionId connectionId,
        MusicProvider provider,
        CancellationToken cancellationToken)
    {
        var connection = await dbContext.ProviderConnections.SingleOrDefaultAsync(
            record => record.Id == connectionId.Value && record.Provider == provider,
            cancellationToken);
        if (connection is null || connection.Status != "Active" ||
            string.IsNullOrWhiteSpace(connection.EncryptedAccessToken))
        {
            throw Unauthorized(provider, "The provider connection is not active.");
        }

        var now = timeProvider.GetUtcNow();
        if (connection.AccessTokenExpiresAt > now.AddMinutes(1))
        {
            return secretProtector.Unprotect(connection.EncryptedAccessToken);
        }

        if (string.IsNullOrWhiteSpace(connection.EncryptedRefreshToken))
        {
            connection.Status = "Expired";
            await dbContext.SaveChangesAsync(cancellationToken);
            throw Unauthorized(provider, "The provider connection must be authorized again.");
        }

        var refreshStrategy = refreshStrategies.SingleOrDefault(strategy => strategy.Provider == provider)
            ?? throw new InvalidOperationException($"No token refresh strategy is registered for {provider}.");
        var refreshToken = secretProtector.Unprotect(connection.EncryptedRefreshToken);
        var refreshed = await refreshStrategy.RefreshAsync(refreshToken, cancellationToken);

        connection.EncryptedAccessToken = secretProtector.Protect(refreshed.AccessToken);
        if (!string.IsNullOrWhiteSpace(refreshed.RefreshToken))
        {
            connection.EncryptedRefreshToken = secretProtector.Protect(refreshed.RefreshToken);
        }
        connection.AccessTokenExpiresAt = refreshed.ExpiresAt;
        if (refreshed.Scopes is not null)
        {
            connection.Scopes = [.. refreshed.Scopes];
        }
        connection.UpdatedAt = now;
        await dbContext.SaveChangesAsync(cancellationToken);
        return refreshed.AccessToken;
    }

    private static MusicProviderException Unauthorized(MusicProvider provider, string message) =>
        new(provider, ProviderFailureKind.Unauthorized, message);
}
