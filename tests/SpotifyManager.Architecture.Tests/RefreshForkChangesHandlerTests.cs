using SpotifyManager.Application.Changes;
using SpotifyManager.Application.Providers;
using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Architecture.Tests;

public sealed class RefreshForkChangesHandlerTests
{
    [Fact]
    public async Task HandleAsync_skips_the_full_snapshot_when_the_version_is_unchanged()
    {
        var store = new FakeChangeStore();
        var provider = new FakeProvider(hasChanged: false);
        var handler = new RefreshForkChangesHandler(store, provider, TimeProvider.System);

        var result = await handler.HandleAsync(
            new RefreshForkChangesCommand(store.Context.ForkId, store.Context.UserId),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.SourceChanged);
        Assert.True(store.WasMarkedChecked);
        Assert.Equal(0, provider.SnapshotCalls);
    }

    [Fact]
    public async Task HandleAsync_persists_proposals_when_the_source_changed()
    {
        var store = new FakeChangeStore();
        var provider = new FakeProvider(hasChanged: true);
        var handler = new RefreshForkChangesHandler(store, provider, TimeProvider.System);

        var result = await handler.HandleAsync(
            new RefreshForkChangesCommand(store.Context.ForkId, store.Context.UserId),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.SourceChanged);
        Assert.Equal(1, result.ProposedChangeCount);
        Assert.Equal(1, provider.SnapshotCalls);
        Assert.NotNull(store.SavedChangeSet);
        Assert.Equal(PlaylistChangeType.Added, Assert.Single(store.SavedChangeSet.Changes).Type);
    }

    private sealed class FakeProvider(bool hasChanged) :
        IProviderStrategyResolver,
        IMusicProviderAdapter,
        IPlaylistChangeDetectionStrategy
    {
        public int SnapshotCalls { get; private set; }
        public MusicProvider Provider => MusicProvider.Spotify;

        public IMusicProviderAdapter GetAdapter(MusicProvider provider) => this;
        public IPlaylistChangeDetectionStrategy GetChangeDetectionStrategy(MusicProvider provider) => this;
        public IPlaylistForkStrategy GetForkStrategy(MusicProvider provider) => throw new NotSupportedException();

        public Task<bool> HasChangedAsync(
            ProviderConnectionId connectionId,
            ExternalPlaylistId playlistId,
            string? knownExternalVersion,
            CancellationToken cancellationToken) => Task.FromResult(hasChanged);

        public PlaylistChangeSet DetectChanges(
            ProviderPlaylistSnapshot previous,
            ProviderPlaylistSnapshot current) => PlaylistChangeDetector.Detect(previous, current);

        public Task<ProviderPlaylistSnapshot> GetPlaylistSnapshotAsync(
            ProviderConnectionId connectionId,
            ExternalPlaylistId playlistId,
            CancellationToken cancellationToken)
        {
            SnapshotCalls++;
            return Task.FromResult(Snapshot(
                "v2",
                Item(0, "a#1", "a"),
                Item(1, "b#1", "b")));
        }

        public Task<ProviderCapabilities> GetCapabilitiesAsync(
            ProviderConnectionId connectionId,
            CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task<IReadOnlyList<ProviderPlaylistSummary>> GetUserPlaylistsAsync(
            ProviderConnectionId connectionId,
            CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private sealed class FakeChangeStore : IChangeReviewStore
    {
        public ChangeDetectionContext Context { get; } = new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            ProviderConnectionId.New(),
            new ExternalPlaylistId(MusicProvider.Spotify, "playlist"),
            Snapshot("v1", Item(0, "a#1", "a")));

        public bool WasMarkedChecked { get; private set; }
        public PlaylistChangeSet? SavedChangeSet { get; private set; }

        public Task<ChangeDetectionContext?> GetDetectionContextAsync(
            Guid forkId,
            Guid? expectedUserId,
            CancellationToken cancellationToken) => Task.FromResult<ChangeDetectionContext?>(Context);

        public Task<int> SaveDetectionAsync(
            ChangeDetectionContext context,
            ProviderPlaylistSnapshot current,
            PlaylistChangeSet changeSet,
            CancellationToken cancellationToken)
        {
            SavedChangeSet = changeSet;
            return Task.FromResult(changeSet.Changes.Count);
        }

        public Task MarkCheckedAsync(
            Guid sourcePlaylistId,
            DateTimeOffset checkedAt,
            CancellationToken cancellationToken)
        {
            WasMarkedChecked = true;
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<ChangeProposal>?> ListProposalsAsync(
            Guid forkId,
            Guid userId,
            CancellationToken cancellationToken) => throw new NotSupportedException();
    }

    private static ProviderPlaylistSnapshot Snapshot(
        string version,
        params ProviderPlaylistItem[] items) =>
        new(
            new ExternalPlaylistId(MusicProvider.Spotify, "playlist"),
            "Playlist",
            version,
            items,
            DateTimeOffset.Parse("2026-08-13T10:00:00Z"));

    private static ProviderPlaylistItem Item(int position, string occurrenceKey, string trackId) =>
        new(
            position,
            occurrenceKey,
            new ExternalTrackRef(MusicProvider.Spotify, trackId),
            trackId,
            ["Artist"],
            ProviderItemAvailability.Available,
            $"spotify:track:{trackId}");
}
