using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Domain.Tests;

public sealed class PlaylistChangeDetectorTests
{
    [Fact]
    public void Detect_reports_an_addition_without_treating_shifted_items_as_reordered()
    {
        var previous = Snapshot("v1", Item(0, "a#1", "a"), Item(1, "b#1", "b"));
        var current = Snapshot("v2", Item(0, "x#1", "x"), Item(1, "a#1", "a"), Item(2, "b#1", "b"));

        var result = PlaylistChangeDetector.Detect(previous, current);

        var change = Assert.Single(result.Changes);
        Assert.Equal(PlaylistChangeType.Added, change.Type);
        Assert.Equal("x#1", change.OccurrenceKey);
    }

    [Fact]
    public void Detect_reports_a_removal_without_treating_remaining_items_as_reordered()
    {
        var previous = Snapshot("v1", Item(0, "a#1", "a"), Item(1, "b#1", "b"), Item(2, "c#1", "c"));
        var current = Snapshot("v2", Item(0, "b#1", "b"), Item(1, "c#1", "c"));

        var result = PlaylistChangeDetector.Detect(previous, current);

        var change = Assert.Single(result.Changes);
        Assert.Equal(PlaylistChangeType.Removed, change.Type);
        Assert.Equal("a#1", change.OccurrenceKey);
    }

    [Fact]
    public void Detect_reports_every_occurrence_whose_relative_order_changed()
    {
        var previous = Snapshot("v1", Item(0, "track#1", "track"), Item(1, "track#2", "track"), Item(2, "b#1", "b"));
        var current = Snapshot("v2", Item(0, "track#2", "track"), Item(1, "track#1", "track"), Item(2, "b#1", "b"));

        var result = PlaylistChangeDetector.Detect(previous, current);

        Assert.Equal(2, result.Changes.Count);
        Assert.All(result.Changes, change => Assert.Equal(PlaylistChangeType.Reordered, change.Type));
        Assert.Contains(result.Changes, change => change.OccurrenceKey == "track#1");
        Assert.Contains(result.Changes, change => change.OccurrenceKey == "track#2");
    }

    [Fact]
    public void Detect_reports_an_item_that_became_unavailable()
    {
        var previous = Snapshot("v1", Item(0, "a#1", "a"));
        var current = Snapshot("v2", Item(0, "a#1", null, ProviderItemAvailability.Unavailable));

        var result = PlaylistChangeDetector.Detect(previous, current);

        var change = Assert.Single(result.Changes);
        Assert.Equal(PlaylistChangeType.Unavailable, change.Type);
        Assert.Equal(0, change.FromPosition);
        Assert.Equal(0, change.ToPosition);
    }

    private static ProviderPlaylistSnapshot Snapshot(string version, params ProviderPlaylistItem[] items) =>
        new(
            new ExternalPlaylistId(MusicProvider.Spotify, "playlist"),
            "Example",
            version,
            items,
            DateTimeOffset.Parse("2026-08-12T00:00:00Z"));

    private static ProviderPlaylistItem Item(
        int position,
        string occurrenceKey,
        string? trackId,
        ProviderItemAvailability availability = ProviderItemAvailability.Available) =>
        new(
            position,
            occurrenceKey,
            trackId is null ? null : new ExternalTrackRef(MusicProvider.Spotify, trackId),
            trackId ?? "Unavailable item",
            ["Artist"],
            availability,
            trackId is null ? null : $"spotify:track:{trackId}");
}
