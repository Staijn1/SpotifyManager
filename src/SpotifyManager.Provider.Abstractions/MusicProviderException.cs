using SpotifyManager.Domain.Providers;

namespace SpotifyManager.Provider.Abstractions;

public enum ProviderFailureKind
{
    Unauthorized = 1,
    Forbidden = 2,
    NotFound = 3,
    RateLimited = 4,
    Conflict = 5,
    Unavailable = 6,
    InvalidResponse = 7,
}

public sealed class MusicProviderException : Exception
{
    public MusicProviderException(
        MusicProvider provider,
        ProviderFailureKind kind,
        string message,
        TimeSpan? retryAfter = null,
        Exception? innerException = null)
        : base(message, innerException)
    {
        Provider = provider;
        Kind = kind;
        RetryAfter = retryAfter;
    }

    public MusicProvider Provider { get; }

    public ProviderFailureKind Kind { get; }

    public TimeSpan? RetryAfter { get; }
}
