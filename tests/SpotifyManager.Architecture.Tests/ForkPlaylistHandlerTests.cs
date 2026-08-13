using SpotifyManager.Application.Forks;
using SpotifyManager.Application.Providers;
using SpotifyManager.Domain.Forks;
using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Architecture.Tests;

public sealed class ForkPlaylistHandlerTests
{
    [Fact]
    public async Task HandleAsync_creates_a_remix_and_records_the_baseline()
    {
        var store = new FakeForkStore();
        var provider = new FakeProvider();
        var handler = new ForkPlaylistHandler(store, provider, new FixedTimeProvider());

        var result = await handler.HandleAsync(
            new ForkPlaylistCommand(
                Guid.NewGuid(),
                ProviderConnectionId.New(),
                new ExternalPlaylistId(MusicProvider.Spotify, "source"),
                "request-1"),
            CancellationToken.None);

        Assert.Equal("Remix - Source playlist", result.Name);
        Assert.Equal("Active", result.Status);
        Assert.Equal("fork", result.ExternalPlaylistId?.Value);
        Assert.False(result.WasExisting);
        Assert.NotNull(store.SavedFork);
        Assert.NotNull(store.SavedFork.BaselineSnapshotId);
        Assert.Equal(1, provider.ForkCalls);
    }

    [Fact]
    public async Task HandleAsync_returns_an_existing_fork_without_calling_the_provider()
    {
        var userId = Guid.NewGuid();
        var existing = ForkedPlaylist.CreatePending(
            userId,
            Guid.NewGuid(),
            new ExternalPlaylistId(MusicProvider.Spotify, "source"),
            "Source playlist",
            "request-1",
            DateTimeOffset.Parse("2026-08-13T10:00:00Z"));
        var store = new FakeForkStore(existing);
        var provider = new FakeProvider();
        var handler = new ForkPlaylistHandler(store, provider, new FixedTimeProvider());

        var result = await handler.HandleAsync(
            new ForkPlaylistCommand(
                userId,
                ProviderConnectionId.New(),
                new ExternalPlaylistId(MusicProvider.Spotify, "source"),
                "request-1"),
            CancellationToken.None);

        Assert.True(result.WasExisting);
        Assert.Equal(existing.Id, result.ForkId);
        Assert.Equal(0, provider.ForkCalls);
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => DateTimeOffset.Parse("2026-08-13T10:00:00Z");
    }

    private sealed class FakeProvider :
        IProviderStrategyResolver,
        IMusicProviderAdapter,
        IPlaylistForkStrategy
    {
        public int ForkCalls { get; private set; }

        public MusicProvider Provider => MusicProvider.Spotify;

        public IMusicProviderAdapter GetAdapter(MusicProvider provider) => this;

        public IPlaylistForkStrategy GetForkStrategy(MusicProvider provider) => this;

        public Task<ProviderCapabilities> GetCapabilitiesAsync(
            ProviderConnectionId connectionId,
            CancellationToken cancellationToken) =>
            Task.FromResult(new ProviderCapabilities(
                Provider,
                CanReadPlaylistItems: true,
                CanCreatePlaylists: true,
                CanAddPlaylistItems: true,
                CanRemovePlaylistItems: true,
                CanReorderPlaylistItems: true,
                SupportsExternalVersions: true,
                SupportsWebhooks: false));

        public Task<IReadOnlyList<ProviderPlaylistSummary>> GetUserPlaylistsAsync(
            ProviderConnectionId connectionId,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ProviderPlaylistSummary>>([]);

        public Task<ProviderPlaylistSnapshot> GetPlaylistSnapshotAsync(
            ProviderConnectionId connectionId,
            ExternalPlaylistId playlistId,
            CancellationToken cancellationToken) =>
            Task.FromResult(new ProviderPlaylistSnapshot(
                playlistId,
                "Source playlist",
                "version-1",
                [
                    new ProviderPlaylistItem(
                        0,
                        "track#1",
                        new ExternalTrackRef(Provider, "track"),
                        "Track",
                        ["Artist"],
                        ProviderItemAvailability.Available,
                        "spotify:track:track"),
                ],
                DateTimeOffset.Parse("2026-08-13T10:00:00Z")));

        public Task<ProviderForkResult> ForkAsync(
            ProviderForkRequest request,
            CancellationToken cancellationToken)
        {
            ForkCalls++;
            return Task.FromResult(new ProviderForkResult(
                new ExternalPlaylistId(Provider, "fork"),
                "version-2",
                AddedItemCount: 1,
                SkippedOccurrenceKeys: []));
        }
    }

    private sealed class FakeForkStore(ForkedPlaylist? existing = null) : IForkStore
    {
        public ForkedPlaylist? SavedFork { get; private set; }

        public Task<ForkedPlaylist?> FindByIdempotencyKeyAsync(
            Guid userId,
            string idempotencyKey,
            CancellationToken cancellationToken) =>
            Task.FromResult(existing);

        public Task<IReadOnlyList<ForkListItem>> ListAsync(
            Guid userId,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ForkListItem>>([]);

        public Task<SourceSnapshotReference> SaveSourceSnapshotAsync(
            ProviderConnectionId connectionId,
            ProviderPlaylistSnapshot snapshot,
            CancellationToken cancellationToken) =>
            Task.FromResult(new SourceSnapshotReference(Guid.NewGuid(), Guid.NewGuid()));

        public Task AddAsync(ForkedPlaylist fork, CancellationToken cancellationToken)
        {
            SavedFork = fork;
            return Task.CompletedTask;
        }

        public Task UpdateAsync(ForkedPlaylist fork, CancellationToken cancellationToken)
        {
            SavedFork = fork;
            return Task.CompletedTask;
        }
    }
}
