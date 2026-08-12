using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotifyManager.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "spotify_manager");

            migrationBuilder.CreateTable(
                name: "scheduled_work",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    TargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    DueAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    AttemptCount = table.Column<int>(type: "integer", nullable: false),
                    LeaseExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LeaseOwner = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    LastError = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scheduled_work", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "user_track_preferences",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ExternalTrackId = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Preference = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_track_preferences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    EmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "email_digest_logs",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdempotencyKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    IncludedChangeIds = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    DueAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Error = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_digest_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_email_digest_logs_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "spotify_manager",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "provider_connections",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ExternalUserId = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Scopes = table.Column<string[]>(type: "text[]", nullable: false),
                    EncryptedAccessToken = table.Column<string>(type: "text", nullable: true),
                    EncryptedRefreshToken = table.Column<string>(type: "text", nullable: true),
                    AccessTokenExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    RawMetadataJson = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_provider_connections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_provider_connections_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "spotify_manager",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "source_playlists",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProviderConnectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ExternalPlaylistId = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ExternalOwnerId = table.Column<string>(type: "text", nullable: true),
                    ExternalVersion = table.Column<string>(type: "text", nullable: true),
                    AccessStatus = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    LastCheckedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_source_playlists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_source_playlists_provider_connections_ProviderConnectionId",
                        column: x => x.ProviderConnectionId,
                        principalSchema: "spotify_manager",
                        principalTable: "provider_connections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_snapshots",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourcePlaylistId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalVersion = table.Column<string>(type: "text", nullable: true),
                    ContentHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    RawMetadataJson = table.Column<string>(type: "jsonb", nullable: false),
                    CapturedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlist_snapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_playlist_snapshots_source_playlists_SourcePlaylistId",
                        column: x => x.SourcePlaylistId,
                        principalSchema: "spotify_manager",
                        principalTable: "source_playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "forked_playlists",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourcePlaylistId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ExternalPlaylistId = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BaselineSnapshotId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    FailureReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_forked_playlists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_forked_playlists_playlist_snapshots_BaselineSnapshotId",
                        column: x => x.BaselineSnapshotId,
                        principalSchema: "spotify_manager",
                        principalTable: "playlist_snapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_forked_playlists_source_playlists_SourcePlaylistId",
                        column: x => x.SourcePlaylistId,
                        principalSchema: "spotify_manager",
                        principalTable: "source_playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_forked_playlists_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "spotify_manager",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_changes",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourcePlaylistId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromSnapshotId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToSnapshotId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    OccurrenceKey = table.Column<string>(type: "text", nullable: false),
                    FromPosition = table.Column<int>(type: "integer", nullable: true),
                    ToPosition = table.Column<int>(type: "integer", nullable: true),
                    ReviewStatus = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    DetailsJson = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlist_changes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_playlist_changes_playlist_snapshots_FromSnapshotId",
                        column: x => x.FromSnapshotId,
                        principalSchema: "spotify_manager",
                        principalTable: "playlist_snapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_playlist_changes_playlist_snapshots_ToSnapshotId",
                        column: x => x.ToSnapshotId,
                        principalSchema: "spotify_manager",
                        principalTable: "playlist_snapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_playlist_changes_source_playlists_SourcePlaylistId",
                        column: x => x.SourcePlaylistId,
                        principalSchema: "spotify_manager",
                        principalTable: "source_playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_snapshot_items",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SnapshotId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    OccurrenceKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ExternalTrackId = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    ProviderUri = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Artists = table.Column<string[]>(type: "text[]", nullable: false),
                    Isrc = table.Column<string>(type: "text", nullable: true),
                    DurationMilliseconds = table.Column<int>(type: "integer", nullable: true),
                    Availability = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    RawMetadataJson = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_playlist_snapshot_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_playlist_snapshot_items_playlist_snapshots_SnapshotId",
                        column: x => x.SnapshotId,
                        principalSchema: "spotify_manager",
                        principalTable: "playlist_snapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notification_subscriptions",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ForkedPlaylistId = table.Column<Guid>(type: "uuid", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    IntervalKind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    IntervalConfigurationJson = table.Column<string>(type: "jsonb", nullable: false),
                    TimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NextDueAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastEvaluatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastSentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastEvaluatedChangeId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notification_subscriptions_forked_playlists_ForkedPlaylistId",
                        column: x => x.ForkedPlaylistId,
                        principalSchema: "spotify_manager",
                        principalTable: "forked_playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_notification_subscriptions_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "spotify_manager",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_email_digest_logs_IdempotencyKey",
                schema: "spotify_manager",
                table: "email_digest_logs",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_email_digest_logs_UserId_DueAt",
                schema: "spotify_manager",
                table: "email_digest_logs",
                columns: new[] { "UserId", "DueAt" });

            migrationBuilder.CreateIndex(
                name: "IX_forked_playlists_BaselineSnapshotId",
                schema: "spotify_manager",
                table: "forked_playlists",
                column: "BaselineSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_forked_playlists_Provider_ExternalPlaylistId",
                schema: "spotify_manager",
                table: "forked_playlists",
                columns: new[] { "Provider", "ExternalPlaylistId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_forked_playlists_SourcePlaylistId",
                schema: "spotify_manager",
                table: "forked_playlists",
                column: "SourcePlaylistId");

            migrationBuilder.CreateIndex(
                name: "IX_forked_playlists_UserId_IdempotencyKey",
                schema: "spotify_manager",
                table: "forked_playlists",
                columns: new[] { "UserId", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notification_subscriptions_Enabled_NextDueAt",
                schema: "spotify_manager",
                table: "notification_subscriptions",
                columns: new[] { "Enabled", "NextDueAt" });

            migrationBuilder.CreateIndex(
                name: "IX_notification_subscriptions_ForkedPlaylistId",
                schema: "spotify_manager",
                table: "notification_subscriptions",
                column: "ForkedPlaylistId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notification_subscriptions_UserId",
                schema: "spotify_manager",
                table: "notification_subscriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_changes_FromSnapshotId",
                schema: "spotify_manager",
                table: "playlist_changes",
                column: "FromSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_changes_SourcePlaylistId_CreatedAt",
                schema: "spotify_manager",
                table: "playlist_changes",
                columns: new[] { "SourcePlaylistId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_playlist_changes_ToSnapshotId",
                schema: "spotify_manager",
                table: "playlist_changes",
                column: "ToSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_snapshot_items_SnapshotId_OccurrenceKey",
                schema: "spotify_manager",
                table: "playlist_snapshot_items",
                columns: new[] { "SnapshotId", "OccurrenceKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_playlist_snapshot_items_SnapshotId_Position",
                schema: "spotify_manager",
                table: "playlist_snapshot_items",
                columns: new[] { "SnapshotId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_playlist_snapshots_SourcePlaylistId_ContentHash",
                schema: "spotify_manager",
                table: "playlist_snapshots",
                columns: new[] { "SourcePlaylistId", "ContentHash" });

            migrationBuilder.CreateIndex(
                name: "IX_playlist_snapshots_SourcePlaylistId_ExternalVersion",
                schema: "spotify_manager",
                table: "playlist_snapshots",
                columns: new[] { "SourcePlaylistId", "ExternalVersion" });

            migrationBuilder.CreateIndex(
                name: "IX_provider_connections_UserId_Provider_ExternalUserId",
                schema: "spotify_manager",
                table: "provider_connections",
                columns: new[] { "UserId", "Provider", "ExternalUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_work_Status_DueAt",
                schema: "spotify_manager",
                table: "scheduled_work",
                columns: new[] { "Status", "DueAt" });

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_work_WorkType_TargetId_Status",
                schema: "spotify_manager",
                table: "scheduled_work",
                columns: new[] { "WorkType", "TargetId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_source_playlists_ProviderConnectionId_Provider_ExternalPlay~",
                schema: "spotify_manager",
                table: "source_playlists",
                columns: new[] { "ProviderConnectionId", "Provider", "ExternalPlaylistId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_track_preferences_UserId_Provider_ExternalTrackId",
                schema: "spotify_manager",
                table: "user_track_preferences",
                columns: new[] { "UserId", "Provider", "ExternalTrackId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                schema: "spotify_manager",
                table: "users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "email_digest_logs",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "notification_subscriptions",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "playlist_changes",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "playlist_snapshot_items",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "scheduled_work",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "user_track_preferences",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "forked_playlists",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "playlist_snapshots",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "source_playlists",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "provider_connections",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "users",
                schema: "spotify_manager");
        }
    }
}
