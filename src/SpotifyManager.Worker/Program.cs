using SpotifyManager.Application.Changes;
using SpotifyManager.Application.Providers;
using SpotifyManager.Infrastructure;
using SpotifyManager.Provider.Spotify;
using SpotifyManager.Worker;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IProviderStrategyResolver, ProviderStrategyResolver>();
builder.Services.AddScoped<RefreshForkChangesHandler>();
builder.Services.AddSpotifyManagerInfrastructure(builder.Configuration);
builder.Services.AddSpotifyProvider(builder.Configuration);
builder.Services.AddHostedService<ScheduledWorkWorker>();

var host = builder.Build();
await host.RunAsync();
