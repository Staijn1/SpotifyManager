using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SpotifyManager.Provider.Abstractions;

namespace SpotifyManager.Api;

internal sealed class ProviderExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<ProviderExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not MusicProviderException providerException)
        {
            return false;
        }

        var statusCode = providerException.Kind switch
        {
            ProviderFailureKind.Unauthorized => StatusCodes.Status401Unauthorized,
            ProviderFailureKind.Forbidden => StatusCodes.Status403Forbidden,
            ProviderFailureKind.NotFound => StatusCodes.Status404NotFound,
            ProviderFailureKind.RateLimited => StatusCodes.Status429TooManyRequests,
            ProviderFailureKind.Conflict => StatusCodes.Status409Conflict,
            ProviderFailureKind.Unavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status502BadGateway,
        };

        logger.LogWarning(
            providerException,
            "Music provider {Provider} failed with category {FailureKind}",
            providerException.Provider,
            providerException.Kind);

        httpContext.Response.StatusCode = statusCode;
        if (providerException.RetryAfter is { } retryAfter)
        {
            httpContext.Response.Headers.RetryAfter = Math.Ceiling(retryAfter.TotalSeconds).ToString();
        }

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = "Music provider request failed",
                Detail = providerException.Message,
                Extensions =
                {
                    ["provider"] = providerException.Provider.ToString(),
                    ["failureKind"] = providerException.Kind.ToString(),
                },
            },
            Exception = exception,
        });
    }
}
