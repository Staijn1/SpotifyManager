namespace SpotifyManager.Domain.Playlists;

public enum PlaylistChangeType
{
    Added = 1,
    Removed = 2,
    Reordered = 3,
    Unavailable = 4,
    Local = 5,
    Skipped = 6,
}

public sealed record PlaylistChange(
    PlaylistChangeType Type,
    string OccurrenceKey,
    ProviderPlaylistItem Item,
    int? FromPosition,
    int? ToPosition);

public sealed record PlaylistChangeSet(
    string? FromExternalVersion,
    string? ToExternalVersion,
    IReadOnlyList<PlaylistChange> Changes)
{
    public bool HasMaterialChanges => Changes.Count > 0;
}
