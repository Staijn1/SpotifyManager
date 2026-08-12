namespace SpotifyManager.Domain.Playlists;

public static class PlaylistChangeDetector
{
    public static PlaylistChangeSet Detect(
        ProviderPlaylistSnapshot previous,
        ProviderPlaylistSnapshot current)
    {
        ArgumentNullException.ThrowIfNull(previous);
        ArgumentNullException.ThrowIfNull(current);

        if (previous.PlaylistId != current.PlaylistId)
        {
            throw new ArgumentException("Snapshots must belong to the same external playlist.", nameof(current));
        }

        var previousByKey = previous.Items.ToDictionary(item => item.OccurrenceKey, StringComparer.Ordinal);
        var currentByKey = current.Items.ToDictionary(item => item.OccurrenceKey, StringComparer.Ordinal);
        var changes = new List<PlaylistChange>();

        foreach (var previousItem in previous.Items.Where(item => !currentByKey.ContainsKey(item.OccurrenceKey)))
        {
            changes.Add(new PlaylistChange(
                PlaylistChangeType.Removed,
                previousItem.OccurrenceKey,
                previousItem,
                previousItem.Position,
                null));
        }

        foreach (var currentItem in current.Items)
        {
            if (!previousByKey.TryGetValue(currentItem.OccurrenceKey, out var previousItem))
            {
                changes.Add(new PlaylistChange(
                    MapNewItemType(currentItem.Availability),
                    currentItem.OccurrenceKey,
                    currentItem,
                    null,
                    currentItem.Position));
                continue;
            }

            if (currentItem.Availability != ProviderItemAvailability.Available &&
                previousItem.Availability != currentItem.Availability)
            {
                changes.Add(new PlaylistChange(
                    MapNewItemType(currentItem.Availability),
                    currentItem.OccurrenceKey,
                    currentItem,
                    previousItem.Position,
                    currentItem.Position));
            }
        }

        AddReorderChanges(previous, current, previousByKey, currentByKey, changes);

        return new PlaylistChangeSet(
            previous.ExternalVersion,
            current.ExternalVersion,
            changes
                .OrderBy(change => change.ToPosition ?? change.FromPosition ?? int.MaxValue)
                .ThenBy(change => change.Type)
                .ToArray());
    }

    private static void AddReorderChanges(
        ProviderPlaylistSnapshot previous,
        ProviderPlaylistSnapshot current,
        IReadOnlyDictionary<string, ProviderPlaylistItem> previousByKey,
        IReadOnlyDictionary<string, ProviderPlaylistItem> currentByKey,
        ICollection<PlaylistChange> changes)
    {
        var commonAvailableKeys = previous.Items
            .Where(item =>
                item.Availability == ProviderItemAvailability.Available &&
                currentByKey.TryGetValue(item.OccurrenceKey, out var currentItem) &&
                currentItem.Availability == ProviderItemAvailability.Available)
            .Select(item => item.OccurrenceKey)
            .ToHashSet(StringComparer.Ordinal);

        var previousOrder = previous.Items
            .Where(item => commonAvailableKeys.Contains(item.OccurrenceKey))
            .Select((item, index) => (item.OccurrenceKey, Index: index))
            .ToDictionary(entry => entry.OccurrenceKey, entry => entry.Index, StringComparer.Ordinal);

        var currentOrder = current.Items
            .Where(item => commonAvailableKeys.Contains(item.OccurrenceKey))
            .Select((item, index) => (item.OccurrenceKey, Index: index))
            .ToDictionary(entry => entry.OccurrenceKey, entry => entry.Index, StringComparer.Ordinal);

        foreach (var key in commonAvailableKeys.Where(key => previousOrder[key] != currentOrder[key]))
        {
            var previousItem = previousByKey[key];
            var currentItem = currentByKey[key];
            changes.Add(new PlaylistChange(
                PlaylistChangeType.Reordered,
                key,
                currentItem,
                previousItem.Position,
                currentItem.Position));
        }
    }

    private static PlaylistChangeType MapNewItemType(ProviderItemAvailability availability) => availability switch
    {
        ProviderItemAvailability.Available => PlaylistChangeType.Added,
        ProviderItemAvailability.Unavailable => PlaylistChangeType.Unavailable,
        ProviderItemAvailability.Local => PlaylistChangeType.Local,
        ProviderItemAvailability.Skipped => PlaylistChangeType.Skipped,
        _ => throw new ArgumentOutOfRangeException(nameof(availability), availability, null),
    };
}
