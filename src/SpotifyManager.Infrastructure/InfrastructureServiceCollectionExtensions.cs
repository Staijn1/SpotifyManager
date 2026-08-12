using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SpotifyManager.Application.Connections;
using SpotifyManager.Application.Forks;
using SpotifyManager.Infrastructure.Connections;
using SpotifyManager.Infrastructure.Persistence;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddSpotifyManagerInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SpotifyManager")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:SpotifyManager must be configured.");

        services.TryAddSingleton(TimeProvider.System);
        services.AddDbContext<SpotifyManagerDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(SpotifyManagerDbContext).Assembly.FullName);
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "spotify_manager");
            }));
        services.AddDataProtection()
            .SetApplicationName("SpotifyManager")
            .PersistKeysToDbContext<SpotifyManagerDbContext>();
        services.AddScoped<IProviderConnectionStore, EfProviderConnectionStore>();
        services.AddScoped<IProviderTokenProvider, DatabaseProviderTokenProvider>();
        services.AddScoped<IForkStore, EfForkStore>();
        return services;
    }
}
