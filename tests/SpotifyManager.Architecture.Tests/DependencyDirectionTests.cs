using SpotifyManager.Application.Forks;
using SpotifyManager.Domain.Providers;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Architecture.Tests;

public sealed class DependencyDirectionTests
{
    [Fact]
    public void Domain_has_no_dependency_on_other_solution_projects()
    {
        var references = typeof(MusicProvider).Assembly.GetReferencedAssemblies();

        Assert.DoesNotContain(references, reference => reference.Name?.StartsWith("SpotifyManager.", StringComparison.Ordinal) == true);
    }

    [Fact]
    public void Application_does_not_depend_on_infrastructure_or_a_concrete_provider()
    {
        var references = typeof(ForkPlaylistHandler).Assembly.GetReferencedAssemblies();

        Assert.DoesNotContain(references, reference => reference.Name == "SpotifyManager.Infrastructure");
        Assert.DoesNotContain(references, reference => reference.Name == "SpotifyManager.Provider.Spotify");
    }

    [Fact]
    public void Provider_abstractions_do_not_depend_on_a_concrete_provider()
    {
        var references = typeof(IMusicProviderAdapter).Assembly.GetReferencedAssemblies();

        Assert.DoesNotContain(references, reference => reference.Name == "SpotifyManager.Provider.Spotify");
    }
}
