using SpotifyManager.Application.Changes;
using SpotifyManager.Application.Connections;

namespace SpotifyManager.Api;

internal static class ChangeReviewEndpoints
{
    public static IEndpointRouteBuilder MapChangeReviewEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/forks/{forkId:guid}/changes", GetChangesAsync);
        endpoints.MapPost("/forks/{forkId:guid}/refresh", RefreshAsync);
        return endpoints;
    }

    private static async Task<IResult> GetChangesAsync(
        HttpContext context,
        Guid forkId,
        IProviderConnectionStore connectionStore,
        IChangeReviewStore changeStore,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await SpotifyAuthorizationEndpoints.GetAuthenticatedSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        if (session is null)
        {
            return Results.Unauthorized();
        }

        var proposals = await changeStore.ListProposalsAsync(
            forkId,
            session.UserId,
            cancellationToken);
        return proposals is null
            ? Results.NotFound()
            : Results.Ok(new
            {
                items = proposals.Select(change => new
                {
                    change.Id,
                    type = change.Type.ToString().ToLowerInvariant(),
                    change.OccurrenceKey,
                    change.Title,
                    change.Artists,
                    change.Availability,
                    change.FromPosition,
                    change.ToPosition,
                    reviewStatus = change.ReviewStatus.ToLowerInvariant(),
                    change.CreatedAt,
                }),
            });
    }

    private static async Task<IResult> RefreshAsync(
        HttpContext context,
        Guid forkId,
        IProviderConnectionStore connectionStore,
        RefreshForkChangesHandler handler,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var session = await SpotifyAuthorizationEndpoints.GetAuthenticatedSessionAsync(
            context,
            connectionStore,
            timeProvider,
            cancellationToken);
        if (session?.ProviderConnection?.Status != "Active")
        {
            return Results.Unauthorized();
        }

        var result = await handler.HandleAsync(
            new RefreshForkChangesCommand(forkId, session.UserId),
            cancellationToken);
        return result is null
            ? Results.NotFound()
            : Results.Ok(new
            {
                result.ForkId,
                result.SourceChanged,
                result.ProposedChangeCount,
                result.CheckedAt,
            });
    }
}
