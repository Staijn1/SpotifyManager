using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using SpotifyManager.Application.Connections;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Infrastructure.Persistence;

namespace SpotifyManager.Infrastructure.Connections;

internal sealed class EfProviderConnectionStore(
    SpotifyManagerDbContext dbContext,
    IDataProtectionProvider dataProtectionProvider) : IProviderConnectionStore
{
    private readonly IDataProtector secretProtector = dataProtectionProvider.CreateProtector(
        "SpotifyManager.ProviderConnectionSecrets.v1");

    public async Task SaveAuthorizationRequestAsync(
        PendingProviderAuthorization request,
        CancellationToken cancellationToken)
    {
        dbContext.ProviderAuthorizationRequests.Add(new ProviderAuthorizationRequestRecord
        {
            Id = request.Id,
            Provider = request.Provider,
            StateHash = request.StateHash,
            ProtectedCodeVerifier = secretProtector.Protect(request.CodeVerifier),
            ReturnPath = request.ReturnPath,
            ExpiresAt = request.ExpiresAt,
            CreatedAt = request.CreatedAt,
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<PendingProviderAuthorization?> ConsumeAuthorizationRequestAsync(
        MusicProvider provider,
        string stateHash,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var record = await dbContext.ProviderAuthorizationRequests
            .AsNoTracking()
            .SingleOrDefaultAsync(
                request => request.Provider == provider && request.StateHash == stateHash,
                cancellationToken);

        if (record is null)
        {
            return null;
        }

        var deleted = await dbContext.ProviderAuthorizationRequests
            .Where(request => request.Id == record.Id)
            .ExecuteDeleteAsync(cancellationToken);
        if (deleted == 0 || record.ExpiresAt <= now)
        {
            return null;
        }

        return new PendingProviderAuthorization(
            record.Id,
            record.Provider,
            record.StateHash,
            secretProtector.Unprotect(record.ProtectedCodeVerifier),
            record.ReturnPath,
            record.ExpiresAt,
            record.CreatedAt);
    }

    public async Task<AuthenticatedSession> CompleteAuthorizationAsync(
        ProviderAuthorizationCompletion completion,
        CancellationToken cancellationToken)
    {
        var connection = await dbContext.ProviderConnections
            .Include(record => record.User)
            .SingleOrDefaultAsync(
                record => record.Provider == completion.Provider &&
                    record.ExternalUserId == completion.ExternalUserId,
                cancellationToken);

        if (connection is null)
        {
            var user = new UserRecord
            {
                Id = Guid.NewGuid(),
                Email = NormalizeEmail(completion.Email, completion.ExternalUserId),
                EmailVerified = completion.EmailVerified,
                DisplayName = completion.DisplayName,
                CreatedAt = completion.CompletedAt,
                UpdatedAt = completion.CompletedAt,
            };
            connection = new ProviderConnectionRecord
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
                Provider = completion.Provider,
                ExternalUserId = completion.ExternalUserId,
                CreatedAt = completion.CompletedAt,
            };
            dbContext.ProviderConnections.Add(connection);
        }
        else
        {
            connection.User.Email = NormalizeEmail(completion.Email, completion.ExternalUserId);
            connection.User.EmailVerified = completion.EmailVerified;
            connection.User.DisplayName = completion.DisplayName;
            connection.User.UpdatedAt = completion.CompletedAt;
        }

        connection.Status = "Active";
        connection.Scopes = [.. completion.Scopes];
        connection.EncryptedAccessToken = secretProtector.Protect(completion.AccessToken);
        if (!string.IsNullOrWhiteSpace(completion.RefreshToken))
        {
            connection.EncryptedRefreshToken = secretProtector.Protect(completion.RefreshToken);
        }
        connection.AccessTokenExpiresAt = completion.AccessTokenExpiresAt;
        connection.RawMetadataJson = completion.RawMetadataJson;
        connection.UpdatedAt = completion.CompletedAt;

        await dbContext.SaveChangesAsync(cancellationToken);
        return ToSession(connection.User, connection);
    }

    public async Task CreateSessionAsync(
        Guid userId,
        string tokenHash,
        DateTimeOffset expiresAt,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        dbContext.AppSessions.Add(new AppSessionRecord
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = expiresAt,
            CreatedAt = now,
            LastSeenAt = now,
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AuthenticatedSession?> FindSessionAsync(
        string tokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var session = await dbContext.AppSessions
            .Include(record => record.User)
            .SingleOrDefaultAsync(
                record => record.TokenHash == tokenHash &&
                    record.RevokedAt == null &&
                    record.ExpiresAt > now,
                cancellationToken);
        if (session is null)
        {
            return null;
        }

        session.LastSeenAt = now;
        var connection = await dbContext.ProviderConnections
            .AsNoTracking()
            .SingleOrDefaultAsync(
                record => record.UserId == session.UserId && record.Provider == MusicProvider.Spotify,
                cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToSession(session.User, connection);
    }

    public async Task RevokeSessionAsync(
        string tokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        await dbContext.AppSessions
            .Where(record => record.TokenHash == tokenHash && record.RevokedAt == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(record => record.RevokedAt, now),
                cancellationToken);
    }

    public async Task DisconnectAsync(
        Guid userId,
        MusicProvider provider,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var connection = await dbContext.ProviderConnections.SingleOrDefaultAsync(
            record => record.UserId == userId && record.Provider == provider,
            cancellationToken);
        if (connection is null)
        {
            return;
        }

        connection.Status = "Disconnected";
        connection.EncryptedAccessToken = null;
        connection.EncryptedRefreshToken = null;
        connection.AccessTokenExpiresAt = null;
        connection.UpdatedAt = now;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static AuthenticatedSession ToSession(
        UserRecord user,
        ProviderConnectionRecord? connection) =>
        new(
            user.Id,
            user.DisplayName,
            user.Email,
            connection is null
                ? null
                : new ConnectedProvider(
                    new ProviderConnectionId(connection.Id),
                    connection.Provider,
                    connection.Status,
                    user.DisplayName,
                    connection.Scopes,
                    connection.UpdatedAt));

    private static string NormalizeEmail(string? email, string externalUserId) =>
        string.IsNullOrWhiteSpace(email)
            ? $"spotify-{externalUserId}@users.invalid"
            : email.Trim().ToLowerInvariant();
}
