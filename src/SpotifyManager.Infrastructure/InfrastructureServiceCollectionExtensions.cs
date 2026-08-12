using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpotifyManager.Application.Forks;
using SpotifyManager.Infrastructure.Persistence;

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

        services.AddDbContext<SpotifyManagerDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(SpotifyManagerDbContext).Assembly.FullName);
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "spotify_manager");
            }));
        services.AddScoped<IForkStore, EfForkStore>();
        return services;
    }
}
