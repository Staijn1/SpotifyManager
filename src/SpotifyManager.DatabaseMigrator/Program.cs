using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SpotifyManager.Infrastructure;
using SpotifyManager.Infrastructure.Persistence;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSpotifyManagerInfrastructure(builder.Configuration);

using var host = builder.Build();
await using var scope = host.Services.CreateAsyncScope();
var logger = scope.ServiceProvider
    .GetRequiredService<ILoggerFactory>()
    .CreateLogger("SpotifyManager.DatabaseMigrator");
var dbContext = scope.ServiceProvider.GetRequiredService<SpotifyManagerDbContext>();

logger.LogInformation("Applying Spotify Manager database migrations");
await dbContext.Database.MigrateAsync();
logger.LogInformation("Database migrations completed");
