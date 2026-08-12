using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Domain.Playlists;

public enum ProviderItemAvailability
{
    Available = 1,
    Unavailable = 2,
    Local = 3,
    Skipped = 4,
}

public sealed record ProviderPlaylistItem
{
    public ProviderPlaylistItem(
        int position,
        string occurrenceKey,
        ExternalTrackRef? track,
        string title,
        IReadOnlyList<string> artists,
        ProviderItemAvailability availability,
        string? providerUri = null)
    {
        if (position < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(position));
        }

        if (string.IsNullOrWhiteSpace(occurrenceKey))
        {
            throw new ArgumentException("An occurrence key is required.", nameof(occurrenceKey));
        }

        Position = position;
        OccurrenceKey = occurrenceKey;
        Track = track;
        Title = title?.Trim() ?? string.Empty;
        Artists = artists ?? [];
        Availability = availability;
        ProviderUri = providerUri;
    }

    public int Position { get; }

    public string OccurrenceKey { get; }

    public ExternalTrackRef? Track { get; }

    public string Title { get; }

    public IReadOnlyList<string> Artists { get; }

    public ProviderItemAvailability Availability { get; }

    public string? ProviderUri { get; }
}

public sealed record ProviderPlaylistSnapshot
{
    public ProviderPlaylistSnapshot(
        ExternalPlaylistId playlistId,
        string name,
        string? externalVersion,
        IReadOnlyList<ProviderPlaylistItem> items,
        DateTimeOffset capturedAt)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("A playlist name is required.", nameof(name));
        }

        PlaylistId = playlistId;
        Name = name.Trim();
        ExternalVersion = externalVersion;
        Items = (items ?? [])
            .OrderBy(item => item.Position)
            .ToArray();
        CapturedAt = capturedAt;

        if (Items.Select(item => item.OccurrenceKey).Distinct(StringComparer.Ordinal).Count() != Items.Count)
        {
            throw new ArgumentException("Occurrence keys must be unique within a snapshot.", nameof(items));
        }
    }

    public ExternalPlaylistId PlaylistId { get; }

    public string Name { get; }

    public string? ExternalVersion { get; }

    public IReadOnlyList<ProviderPlaylistItem> Items { get; }

    public DateTimeOffset CapturedAt { get; }
}
