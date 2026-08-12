using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using SpotifyManager.Application.Forks;
using SpotifyManager.Application.Providers;
using SpotifyManager.Api;
using SpotifyManager.Infrastructure;
using SpotifyManager.Provider.Spotify;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ProviderExceptionHandler>();
builder.Services.AddHealthChecks()
    .AddCheck<PostgresReadinessHealthCheck>("postgres", tags: ["ready"]);
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IProviderStrategyResolver, ProviderStrategyResolver>();
builder.Services.AddScoped<ForkPlaylistHandler>();
builder.Services.AddSpotifyManagerInfrastructure(builder.Configuration);
builder.Services.AddSpotifyProvider(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("ready"),
});

var api = app.MapGroup("/api/v1");
api.MapSpotifyAuthorizationEndpoints();
api.MapPlaylistEndpoints();
api.MapGet("/system/status", () => Results.Ok(new
{
    service = "Spotify Manager API",
    architecture = "modular-monolith",
    provider = "Spotify",
    database = "PostgreSQL",
    utcNow = DateTimeOffset.UtcNow,
}));

app.Run();

public partial class Program;
