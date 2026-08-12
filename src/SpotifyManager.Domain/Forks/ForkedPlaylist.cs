using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Domain.Forks;

public enum ForkedPlaylistStatus
{
    Pending = 1,
    Active = 2,
    Failed = 3,
    Disconnected = 4,
}

public sealed class ForkedPlaylist
{
    private ForkedPlaylist(
        Guid id,
        Guid userId,
        Guid sourcePlaylistId,
        ExternalPlaylistId sourceExternalPlaylistId,
        string name,
        string idempotencyKey,
        DateTimeOffset createdAt)
    {
        Id = id;
        UserId = userId;
        SourcePlaylistId = sourcePlaylistId;
        SourceExternalPlaylistId = sourceExternalPlaylistId;
        Name = name;
        IdempotencyKey = idempotencyKey;
        Status = ForkedPlaylistStatus.Pending;
        CreatedAt = createdAt;
        UpdatedAt = createdAt;
    }

    public Guid Id { get; }

    public Guid UserId { get; }

    public Guid SourcePlaylistId { get; }

    public ExternalPlaylistId SourceExternalPlaylistId { get; }

    public ExternalPlaylistId? ExternalPlaylistId { get; private set; }

    public Guid? BaselineSnapshotId { get; private set; }

    public string Name { get; }

    public string IdempotencyKey { get; }

    public ForkedPlaylistStatus Status { get; private set; }

    public string? FailureReason { get; private set; }

    public DateTimeOffset CreatedAt { get; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public static ForkedPlaylist CreatePending(
        Guid userId,
        Guid sourcePlaylistId,
        ExternalPlaylistId sourceExternalPlaylistId,
        string sourcePlaylistName,
        string idempotencyKey,
        DateTimeOffset now)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("A user ID is required.", nameof(userId));
        }

        if (sourcePlaylistId == Guid.Empty)
        {
            throw new ArgumentException("A source playlist ID is required.", nameof(sourcePlaylistId));
        }

        if (string.IsNullOrWhiteSpace(sourcePlaylistName))
        {
            throw new ArgumentException("A source playlist name is required.", nameof(sourcePlaylistName));
        }

        if (string.IsNullOrWhiteSpace(idempotencyKey))
        {
            throw new ArgumentException("An idempotency key is required.", nameof(idempotencyKey));
        }

        return new ForkedPlaylist(
            Guid.NewGuid(),
            userId,
            sourcePlaylistId,
            sourceExternalPlaylistId,
            $"Remix - {sourcePlaylistName.Trim()}",
            idempotencyKey.Trim(),
            now);
    }

    public static ForkedPlaylist Restore(
        Guid id,
        Guid userId,
        Guid sourcePlaylistId,
        ExternalPlaylistId sourceExternalPlaylistId,
        string name,
        string idempotencyKey,
        ForkedPlaylistStatus status,
        ExternalPlaylistId? externalPlaylistId,
        Guid? baselineSnapshotId,
        string? failureReason,
        DateTimeOffset createdAt,
        DateTimeOffset updatedAt)
    {
        var fork = new ForkedPlaylist(
            id,
            userId,
            sourcePlaylistId,
            sourceExternalPlaylistId,
            name,
            idempotencyKey,
            createdAt)
        {
            Status = status,
            ExternalPlaylistId = externalPlaylistId,
            BaselineSnapshotId = baselineSnapshotId,
            FailureReason = failureReason,
            UpdatedAt = updatedAt,
        };

        return fork;
    }

    public void MarkActive(
        ExternalPlaylistId externalPlaylistId,
        Guid baselineSnapshotId,
        DateTimeOffset now)
    {
        if (Status != ForkedPlaylistStatus.Pending)
        {
            throw new InvalidOperationException("Only a pending fork can be activated.");
        }

        if (externalPlaylistId.Provider != SourceExternalPlaylistId.Provider)
        {
            throw new InvalidOperationException("The source and fork must use the same provider.");
        }

        if (baselineSnapshotId == Guid.Empty)
        {
            throw new ArgumentException("A baseline snapshot ID is required.", nameof(baselineSnapshotId));
        }

        ExternalPlaylistId = externalPlaylistId;
        BaselineSnapshotId = baselineSnapshotId;
        Status = ForkedPlaylistStatus.Active;
        FailureReason = null;
        UpdatedAt = now;
    }

    public void MarkFailed(string reason, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new ArgumentException("A failure reason is required.", nameof(reason));
        }

        if (Status == ForkedPlaylistStatus.Active)
        {
            throw new InvalidOperationException("An active fork cannot be marked as a creation failure.");
        }

        Status = ForkedPlaylistStatus.Failed;
        FailureReason = reason.Trim();
        UpdatedAt = now;
    }
}
