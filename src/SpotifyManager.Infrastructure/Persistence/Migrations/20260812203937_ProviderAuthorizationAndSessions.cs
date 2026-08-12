using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SpotifyManager.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProviderAuthorizationAndSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "app_sessions",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TokenHash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    RevokedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_app_sessions_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "spotify_manager",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "data_protection_keys",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FriendlyName = table.Column<string>(type: "text", nullable: true),
                    Xml = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_data_protection_keys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "provider_authorization_requests",
                schema: "spotify_manager",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    StateHash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProtectedCodeVerifier = table.Column<string>(type: "text", nullable: false),
                    ReturnPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_provider_authorization_requests", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_app_sessions_TokenHash",
                schema: "spotify_manager",
                table: "app_sessions",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_app_sessions_UserId_ExpiresAt",
                schema: "spotify_manager",
                table: "app_sessions",
                columns: new[] { "UserId", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_provider_authorization_requests_ExpiresAt",
                schema: "spotify_manager",
                table: "provider_authorization_requests",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_provider_authorization_requests_StateHash",
                schema: "spotify_manager",
                table: "provider_authorization_requests",
                column: "StateHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "app_sessions",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "data_protection_keys",
                schema: "spotify_manager");

            migrationBuilder.DropTable(
                name: "provider_authorization_requests",
                schema: "spotify_manager");
        }
    }
}
