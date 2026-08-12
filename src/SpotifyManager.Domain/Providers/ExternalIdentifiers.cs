namespace SpotifyManager.Domain.Providers;

public readonly record struct ProviderConnectionId
{
    public ProviderConnectionId(Guid value)
    {
        if (value == Guid.Empty)
        {
            throw new ArgumentException("A provider connection ID cannot be empty.", nameof(value));
        }

        Value = value;
    }

    public Guid Value { get; }

    public static ProviderConnectionId New() => new(Guid.NewGuid());
}

public readonly record struct ExternalPlaylistId
{
    public ExternalPlaylistId(MusicProvider provider, string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("An external playlist ID is required.", nameof(value));
        }

        Provider = provider;
        Value = value.Trim();
    }

    public MusicProvider Provider { get; }

    public string Value { get; }

    public override string ToString() => $"{Provider}:{Value}";
}

public readonly record struct ExternalTrackRef
{
    public ExternalTrackRef(MusicProvider provider, string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("An external track reference is required.", nameof(value));
        }

        Provider = provider;
        Value = value.Trim();
    }

    public MusicProvider Provider { get; }

    public string Value { get; }

    public override string ToString() => $"{Provider}:{Value}";
}
