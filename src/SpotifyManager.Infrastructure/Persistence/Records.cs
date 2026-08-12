using SpotifyManager.Domain.Forks;
using SpotifyManager.Domain.Playlists;
using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Infrastructure.Persistence;

public sealed class ProviderAuthorizationRequestRecord
{
    public Guid Id { get; set; }
    public MusicProvider Provider { get; set; }
    public string StateHash { get; set; } = string.Empty;
    public string ProtectedCodeVerifier { get; set; } = string.Empty;
    public string ReturnPath { get; set; } = "/";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AppSessionRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastSeenAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public UserRecord User { get; set; } = null!;
}

public sealed class UserRecord
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string TimeZone { get; set; } = "UTC";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class ProviderConnectionRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public MusicProvider Provider { get; set; }
    public string ExternalUserId { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public string[] Scopes { get; set; } = [];
    public string? EncryptedAccessToken { get; set; }
    public string? EncryptedRefreshToken { get; set; }
    public DateTimeOffset? AccessTokenExpiresAt { get; set; }
    public string RawMetadataJson { get; set; } = "{}";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public UserRecord User { get; set; } = null!;
}

public sealed class SourcePlaylistRecord
{
    public Guid Id { get; set; }
    public Guid ProviderConnectionId { get; set; }
    public MusicProvider Provider { get; set; }
    public string ExternalPlaylistId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ExternalOwnerId { get; set; }
    public string? ExternalVersion { get; set; }
    public string AccessStatus { get; set; } = "Available";
    public DateTimeOffset? LastCheckedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ProviderConnectionRecord ProviderConnection { get; set; } = null!;
}

public sealed class ForkedPlaylistRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid SourcePlaylistId { get; set; }
    public MusicProvider Provider { get; set; }
    public string? ExternalPlaylistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IdempotencyKey { get; set; } = string.Empty;
    public Guid? BaselineSnapshotId { get; set; }
    public ForkedPlaylistStatus Status { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public UserRecord User { get; set; } = null!;
    public SourcePlaylistRecord SourcePlaylist { get; set; } = null!;
}

public sealed class PlaylistSnapshotRecord
{
    public Guid Id { get; set; }
    public Guid SourcePlaylistId { get; set; }
    public string? ExternalVersion { get; set; }
    public string ContentHash { get; set; } = string.Empty;
    public string RawMetadataJson { get; set; } = "{}";
    public DateTimeOffset CapturedAt { get; set; }
    public SourcePlaylistRecord SourcePlaylist { get; set; } = null!;
    public List<PlaylistSnapshotItemRecord> Items { get; set; } = [];
}

public sealed class PlaylistSnapshotItemRecord
{
    public Guid Id { get; set; }
    public Guid SnapshotId { get; set; }
    public int Position { get; set; }
    public string OccurrenceKey { get; set; } = string.Empty;
    public string? ExternalTrackId { get; set; }
    public string? ProviderUri { get; set; }
    public string Title { get; set; } = string.Empty;
    public string[] Artists { get; set; } = [];
    public string? Isrc { get; set; }
    public int? DurationMilliseconds { get; set; }
    public ProviderItemAvailability Availability { get; set; }
    public string RawMetadataJson { get; set; } = "{}";
    public PlaylistSnapshotRecord Snapshot { get; set; } = null!;
}

public sealed class PlaylistChangeRecord
{
    public Guid Id { get; set; }
    public Guid SourcePlaylistId { get; set; }
    public Guid FromSnapshotId { get; set; }
    public Guid ToSnapshotId { get; set; }
    public PlaylistChangeType Type { get; set; }
    public string OccurrenceKey { get; set; } = string.Empty;
    public int? FromPosition { get; set; }
    public int? ToPosition { get; set; }
    public string ReviewStatus { get; set; } = "Proposed";
    public string DetailsJson { get; set; } = "{}";
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class NotificationSubscriptionRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ForkedPlaylistId { get; set; }
    public bool Enabled { get; set; }
    public string IntervalKind { get; set; } = "Weekly";
    public string IntervalConfigurationJson { get; set; } = "{}";
    public string TimeZone { get; set; } = "UTC";
    public DateTimeOffset NextDueAt { get; set; }
    public DateTimeOffset? LastEvaluatedAt { get; set; }
    public DateTimeOffset? LastSentAt { get; set; }
    public Guid? LastEvaluatedChangeId { get; set; }
}

public sealed class EmailDigestLogRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public Guid[] IncludedChangeIds { get; set; } = [];
    public DateTimeOffset DueAt { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public string? Error { get; set; }
}

public sealed class UserTrackPreferenceRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public MusicProvider Provider { get; set; }
    public string ExternalTrackId { get; set; } = string.Empty;
    public string Preference { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class ScheduledWorkRecord
{
    public Guid Id { get; set; }
    public string WorkType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public DateTimeOffset DueAt { get; set; }
    public string Status { get; set; } = "Pending";
    public int AttemptCount { get; set; }
    public DateTimeOffset? LeaseExpiresAt { get; set; }
    public string? LeaseOwner { get; set; }
    public string? LastError { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
