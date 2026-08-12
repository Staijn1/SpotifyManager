using SpotifyManager.Application.Providers;
using SpotifyManager.Domain.Forks;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Application.Forks;

public sealed class ForkPlaylistHandler(
    IForkStore store,
    IProviderStrategyResolver providerResolver,
    TimeProvider timeProvider)
{
    public async Task<ForkPlaylistResult> HandleAsync(
        ForkPlaylistCommand command,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        if (command.UserId == Guid.Empty)
        {
            throw new ArgumentException("A user ID is required.", nameof(command));
        }

        if (string.IsNullOrWhiteSpace(command.IdempotencyKey))
        {
            throw new ArgumentException("An idempotency key is required.", nameof(command));
        }

        var existing = await store.FindByIdempotencyKeyAsync(
            command.UserId,
            command.IdempotencyKey,
            cancellationToken);

        if (existing is not null)
        {
            return ToResult(existing, true);
        }

        var adapter = providerResolver.GetAdapter(command.SourcePlaylistId.Provider);
        var capabilities = await adapter.GetCapabilitiesAsync(command.ConnectionId, cancellationToken);

        if (!capabilities.CanReadPlaylistItems ||
            !capabilities.CanCreatePlaylists ||
            !capabilities.CanAddPlaylistItems)
        {
            throw new MusicProviderException(
                command.SourcePlaylistId.Provider,
                ProviderFailureKind.Forbidden,
                "The connected provider does not permit playlist forking for this account.");
        }

        var snapshot = await adapter.GetPlaylistSnapshotAsync(
            command.ConnectionId,
            command.SourcePlaylistId,
            cancellationToken);
        var snapshotReference = await store.SaveSourceSnapshotAsync(
            command.ConnectionId,
            snapshot,
            cancellationToken);

        var now = timeProvider.GetUtcNow();
        var fork = ForkedPlaylist.CreatePending(
            command.UserId,
            snapshotReference.SourcePlaylistId,
            command.SourcePlaylistId,
            snapshot.Name,
            command.IdempotencyKey,
            now);
        await store.AddAsync(fork, cancellationToken);

        try
        {
            var strategy = providerResolver.GetForkStrategy(command.SourcePlaylistId.Provider);
            var providerResult = await strategy.ForkAsync(
                new ProviderForkRequest(
                    command.ConnectionId,
                    snapshot,
                    fork.Name,
                    "Created by Spotify Manager. The source relationship is stored by the application."),
                cancellationToken);

            fork.MarkActive(providerResult.PlaylistId, snapshotReference.SnapshotId, timeProvider.GetUtcNow());
            await store.UpdateAsync(fork, cancellationToken);
            return ToResult(fork, false);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            fork.MarkFailed(exception.Message, timeProvider.GetUtcNow());
            await store.UpdateAsync(fork, cancellationToken);
            throw;
        }
    }

    private static ForkPlaylistResult ToResult(ForkedPlaylist fork, bool wasExisting) =>
        new(
            fork.Id,
            fork.ExternalPlaylistId,
            fork.Name,
            fork.Status.ToString(),
            wasExisting);
}
