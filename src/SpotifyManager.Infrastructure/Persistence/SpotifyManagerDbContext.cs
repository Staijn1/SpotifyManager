using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;

namespace SpotifyManager.Infrastructure.Persistence;

public sealed class SpotifyManagerDbContext(DbContextOptions<SpotifyManagerDbContext> options)
    : DbContext(options), IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();
    public DbSet<ProviderAuthorizationRequestRecord> ProviderAuthorizationRequests => Set<ProviderAuthorizationRequestRecord>();
    public DbSet<AppSessionRecord> AppSessions => Set<AppSessionRecord>();
    public DbSet<UserRecord> Users => Set<UserRecord>();
    public DbSet<ProviderConnectionRecord> ProviderConnections => Set<ProviderConnectionRecord>();
    public DbSet<SourcePlaylistRecord> SourcePlaylists => Set<SourcePlaylistRecord>();
    public DbSet<ForkedPlaylistRecord> ForkedPlaylists => Set<ForkedPlaylistRecord>();
    public DbSet<PlaylistSnapshotRecord> PlaylistSnapshots => Set<PlaylistSnapshotRecord>();
    public DbSet<PlaylistSnapshotItemRecord> PlaylistSnapshotItems => Set<PlaylistSnapshotItemRecord>();
    public DbSet<PlaylistChangeRecord> PlaylistChanges => Set<PlaylistChangeRecord>();
    public DbSet<NotificationSubscriptionRecord> NotificationSubscriptions => Set<NotificationSubscriptionRecord>();
    public DbSet<EmailDigestLogRecord> EmailDigestLogs => Set<EmailDigestLogRecord>();
    public DbSet<UserTrackPreferenceRecord> UserTrackPreferences => Set<UserTrackPreferenceRecord>();
    public DbSet<ScheduledWorkRecord> ScheduledWork => Set<ScheduledWorkRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("spotify_manager");
        ConfigureIdentity(modelBuilder);
        ConfigureUsers(modelBuilder);
        ConfigureProviderConnections(modelBuilder);
        ConfigurePlaylists(modelBuilder);
        ConfigureChangesAndNotifications(modelBuilder);
        ConfigureScheduledWork(modelBuilder);
    }

    private static void ConfigureIdentity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DataProtectionKey>().ToTable("data_protection_keys");

        var requests = modelBuilder.Entity<ProviderAuthorizationRequestRecord>();
        requests.ToTable("provider_authorization_requests");
        requests.HasKey(request => request.Id);
        requests.Property(request => request.Provider).HasConversion<string>().HasMaxLength(40);
        requests.Property(request => request.StateHash).HasMaxLength(100);
        requests.Property(request => request.ReturnPath).HasMaxLength(500);
        requests.HasIndex(request => request.StateHash).IsUnique();
        requests.HasIndex(request => request.ExpiresAt);

        var sessions = modelBuilder.Entity<AppSessionRecord>();
        sessions.ToTable("app_sessions");
        sessions.HasKey(session => session.Id);
        sessions.Property(session => session.TokenHash).HasMaxLength(100);
        sessions.HasIndex(session => session.TokenHash).IsUnique();
        sessions.HasIndex(session => new { session.UserId, session.ExpiresAt });
        sessions.HasOne(session => session.User)
            .WithMany()
            .HasForeignKey(session => session.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureUsers(ModelBuilder modelBuilder)
    {
        var users = modelBuilder.Entity<UserRecord>();
        users.ToTable("users");
        users.HasKey(user => user.Id);
        users.Property(user => user.Email).HasMaxLength(320);
        users.Property(user => user.DisplayName).HasMaxLength(200);
        users.Property(user => user.TimeZone).HasMaxLength(100);
        users.HasIndex(user => user.Email).IsUnique();

        var preferences = modelBuilder.Entity<UserTrackPreferenceRecord>();
        preferences.ToTable("user_track_preferences");
        preferences.HasKey(preference => preference.Id);
        preferences.Property(preference => preference.Provider).HasConversion<string>().HasMaxLength(40);
        preferences.Property(preference => preference.ExternalTrackId).HasMaxLength(300);
        preferences.Property(preference => preference.Preference).HasMaxLength(40);
        preferences.HasIndex(preference => new
        {
            preference.UserId,
            preference.Provider,
            preference.ExternalTrackId,
        }).IsUnique();
    }

    private static void ConfigureProviderConnections(ModelBuilder modelBuilder)
    {
        var connections = modelBuilder.Entity<ProviderConnectionRecord>();
        connections.ToTable("provider_connections");
        connections.HasKey(connection => connection.Id);
        connections.Property(connection => connection.Provider).HasConversion<string>().HasMaxLength(40);
        connections.Property(connection => connection.ExternalUserId).HasMaxLength(300);
        connections.Property(connection => connection.Status).HasMaxLength(40);
        connections.Property(connection => connection.RawMetadataJson).HasColumnType("jsonb");
        connections.HasIndex(connection => new
        {
            connection.UserId,
            connection.Provider,
            connection.ExternalUserId,
        }).IsUnique();
        connections.HasOne(connection => connection.User)
            .WithMany()
            .HasForeignKey(connection => connection.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigurePlaylists(ModelBuilder modelBuilder)
    {
        var sources = modelBuilder.Entity<SourcePlaylistRecord>();
        sources.ToTable("source_playlists");
        sources.HasKey(source => source.Id);
        sources.Property(source => source.Provider).HasConversion<string>().HasMaxLength(40);
        sources.Property(source => source.ExternalPlaylistId).HasMaxLength(300);
        sources.Property(source => source.Name).HasMaxLength(500);
        sources.Property(source => source.AccessStatus).HasMaxLength(40);
        sources.HasIndex(source => new
        {
            source.ProviderConnectionId,
            source.Provider,
            source.ExternalPlaylistId,
        }).IsUnique();
        sources.HasOne(source => source.ProviderConnection)
            .WithMany()
            .HasForeignKey(source => source.ProviderConnectionId)
            .OnDelete(DeleteBehavior.Cascade);

        var forks = modelBuilder.Entity<ForkedPlaylistRecord>();
        forks.ToTable("forked_playlists");
        forks.HasKey(fork => fork.Id);
        forks.Property(fork => fork.Provider).HasConversion<string>().HasMaxLength(40);
        forks.Property(fork => fork.Name).HasMaxLength(500);
        forks.Property(fork => fork.IdempotencyKey).HasMaxLength(200);
        forks.Property(fork => fork.Status).HasConversion<string>().HasMaxLength(40);
        forks.HasIndex(fork => new { fork.UserId, fork.IdempotencyKey }).IsUnique();
        forks.HasIndex(fork => new { fork.Provider, fork.ExternalPlaylistId }).IsUnique();
        forks.HasOne(fork => fork.User).WithMany().HasForeignKey(fork => fork.UserId).OnDelete(DeleteBehavior.Cascade);
        forks.HasOne(fork => fork.SourcePlaylist).WithMany().HasForeignKey(fork => fork.SourcePlaylistId).OnDelete(DeleteBehavior.Restrict);
        forks.HasOne<PlaylistSnapshotRecord>()
            .WithMany()
            .HasForeignKey(fork => fork.BaselineSnapshotId)
            .OnDelete(DeleteBehavior.Restrict);

        var snapshots = modelBuilder.Entity<PlaylistSnapshotRecord>();
        snapshots.ToTable("playlist_snapshots");
        snapshots.HasKey(snapshot => snapshot.Id);
        snapshots.Property(snapshot => snapshot.ContentHash).HasMaxLength(64);
        snapshots.Property(snapshot => snapshot.RawMetadataJson).HasColumnType("jsonb");
        snapshots.HasIndex(snapshot => new { snapshot.SourcePlaylistId, snapshot.ExternalVersion });
        snapshots.HasIndex(snapshot => new { snapshot.SourcePlaylistId, snapshot.ContentHash });
        snapshots.HasOne(snapshot => snapshot.SourcePlaylist)
            .WithMany()
            .HasForeignKey(snapshot => snapshot.SourcePlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        var items = modelBuilder.Entity<PlaylistSnapshotItemRecord>();
        items.ToTable("playlist_snapshot_items");
        items.HasKey(item => item.Id);
        items.Property(item => item.OccurrenceKey).HasMaxLength(500);
        items.Property(item => item.ExternalTrackId).HasMaxLength(300);
        items.Property(item => item.ProviderUri).HasMaxLength(500);
        items.Property(item => item.Title).HasMaxLength(500);
        items.Property(item => item.Availability).HasConversion<string>().HasMaxLength(40);
        items.Property(item => item.RawMetadataJson).HasColumnType("jsonb");
        items.HasIndex(item => new { item.SnapshotId, item.Position }).IsUnique();
        items.HasIndex(item => new { item.SnapshotId, item.OccurrenceKey }).IsUnique();
        items.HasOne(item => item.Snapshot)
            .WithMany(snapshot => snapshot.Items)
            .HasForeignKey(item => item.SnapshotId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureChangesAndNotifications(ModelBuilder modelBuilder)
    {
        var changes = modelBuilder.Entity<PlaylistChangeRecord>();
        changes.ToTable("playlist_changes");
        changes.HasKey(change => change.Id);
        changes.Property(change => change.Type).HasConversion<string>().HasMaxLength(40);
        changes.Property(change => change.ReviewStatus).HasMaxLength(40);
        changes.Property(change => change.DetailsJson).HasColumnType("jsonb");
        changes.HasIndex(change => new { change.SourcePlaylistId, change.CreatedAt });
        changes.HasOne<SourcePlaylistRecord>()
            .WithMany()
            .HasForeignKey(change => change.SourcePlaylistId)
            .OnDelete(DeleteBehavior.Cascade);
        changes.HasOne<PlaylistSnapshotRecord>()
            .WithMany()
            .HasForeignKey(change => change.FromSnapshotId)
            .OnDelete(DeleteBehavior.Restrict);
        changes.HasOne<PlaylistSnapshotRecord>()
            .WithMany()
            .HasForeignKey(change => change.ToSnapshotId)
            .OnDelete(DeleteBehavior.Restrict);

        var subscriptions = modelBuilder.Entity<NotificationSubscriptionRecord>();
        subscriptions.ToTable("notification_subscriptions");
        subscriptions.HasKey(subscription => subscription.Id);
        subscriptions.Property(subscription => subscription.IntervalKind).HasMaxLength(40);
        subscriptions.Property(subscription => subscription.IntervalConfigurationJson).HasColumnType("jsonb");
        subscriptions.Property(subscription => subscription.TimeZone).HasMaxLength(100);
        subscriptions.HasIndex(subscription => subscription.ForkedPlaylistId).IsUnique();
        subscriptions.HasIndex(subscription => new { subscription.Enabled, subscription.NextDueAt });
        subscriptions.HasOne<UserRecord>()
            .WithMany()
            .HasForeignKey(subscription => subscription.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        subscriptions.HasOne<ForkedPlaylistRecord>()
            .WithMany()
            .HasForeignKey(subscription => subscription.ForkedPlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        var logs = modelBuilder.Entity<EmailDigestLogRecord>();
        logs.ToTable("email_digest_logs");
        logs.HasKey(log => log.Id);
        logs.Property(log => log.IdempotencyKey).HasMaxLength(200);
        logs.Property(log => log.Status).HasMaxLength(40);
        logs.HasIndex(log => log.IdempotencyKey).IsUnique();
        logs.HasIndex(log => new { log.UserId, log.DueAt });
        logs.HasOne<UserRecord>()
            .WithMany()
            .HasForeignKey(log => log.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureScheduledWork(ModelBuilder modelBuilder)
    {
        var work = modelBuilder.Entity<ScheduledWorkRecord>();
        work.ToTable("scheduled_work");
        work.HasKey(item => item.Id);
        work.Property(item => item.WorkType).HasMaxLength(80);
        work.Property(item => item.Status).HasMaxLength(40);
        work.Property(item => item.LeaseOwner).HasMaxLength(200);
        work.HasIndex(item => new { item.Status, item.DueAt });
        work.HasIndex(item => new { item.WorkType, item.TargetId, item.Status });
    }
}
