using SpotifyManager.Domain.Forks;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Domain.Tests;

public sealed class ForkedPlaylistTests
{
    [Fact]
    public void CreatePending_enforces_the_remix_name_and_pending_state()
    {
        var fork = ForkedPlaylist.CreatePending(
            Guid.NewGuid(),
            Guid.NewGuid(),
            new ExternalPlaylistId(MusicProvider.Spotify, "source"),
            "Road trip",
            "request-1",
            DateTimeOffset.Parse("2026-08-12T00:00:00Z"));

        Assert.Equal("Remix - Road trip", fork.Name);
        Assert.Equal(ForkedPlaylistStatus.Pending, fork.Status);
        Assert.Null(fork.ExternalPlaylistId);
    }

    [Fact]
    public void MarkActive_records_the_remote_playlist_and_baseline()
    {
        var fork = ForkedPlaylist.CreatePending(
            Guid.NewGuid(),
            Guid.NewGuid(),
            new ExternalPlaylistId(MusicProvider.Spotify, "source"),
            "Road trip",
            "request-1",
            DateTimeOffset.Parse("2026-08-12T00:00:00Z"));
        var baselineId = Guid.NewGuid();

        fork.MarkActive(
            new ExternalPlaylistId(MusicProvider.Spotify, "fork"),
            baselineId,
            DateTimeOffset.Parse("2026-08-12T00:01:00Z"));

        Assert.Equal(ForkedPlaylistStatus.Active, fork.Status);
        Assert.Equal("fork", fork.ExternalPlaylistId?.Value);
        Assert.Equal(baselineId, fork.BaselineSnapshotId);
    }
}
