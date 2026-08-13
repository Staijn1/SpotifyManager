using SpotifyManager.Application.Providers;

namespace SpotifyManager.Application.Changes;

public sealed record RefreshForkChangesCommand(Guid ForkId, Guid? ExpectedUserId = null);

public sealed record RefreshForkChangesResult(
    Guid ForkId,
    bool SourceChanged,
    int ProposedChangeCount,
    DateTimeOffset CheckedAt);

public sealed class RefreshForkChangesHandler(
    IChangeReviewStore store,
    IProviderStrategyResolver providerResolver,
    TimeProvider timeProvider)
{
    public async Task<RefreshForkChangesResult?> HandleAsync(
        RefreshForkChangesCommand command,
        CancellationToken cancellationToken)
    {
        var context = await store.GetDetectionContextAsync(
            command.ForkId,
            command.ExpectedUserId,
            cancellationToken);
        if (context is null)
        {
            return null;
        }

        var checkedAt = timeProvider.GetUtcNow();
        var strategy = providerResolver.GetChangeDetectionStrategy(context.ExternalPlaylistId.Provider);
        var hasChanged = await strategy.HasChangedAsync(
            context.ConnectionId,
            context.ExternalPlaylistId,
            context.PreviousSnapshot.ExternalVersion,
            cancellationToken);
        if (!hasChanged)
        {
            await store.MarkCheckedAsync(context.SourcePlaylistId, checkedAt, cancellationToken);
            return new RefreshForkChangesResult(command.ForkId, false, 0, checkedAt);
        }

        var adapter = providerResolver.GetAdapter(context.ExternalPlaylistId.Provider);
        var current = await adapter.GetPlaylistSnapshotAsync(
            context.ConnectionId,
            context.ExternalPlaylistId,
            cancellationToken);
        var changeSet = strategy.DetectChanges(context.PreviousSnapshot, current);
        var proposalCount = await store.SaveDetectionAsync(
            context,
            current,
            changeSet,
            cancellationToken);
        return new RefreshForkChangesResult(
            command.ForkId,
            changeSet.HasMaterialChanges,
            proposalCount,
            checkedAt);
    }
}
