FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

COPY global.json Directory.Build.props Directory.Packages.props NuGet.Config ./
COPY src/SpotifyManager.Domain/SpotifyManager.Domain.csproj src/SpotifyManager.Domain/
COPY src/SpotifyManager.Provider.Abstractions/SpotifyManager.Provider.Abstractions.csproj src/SpotifyManager.Provider.Abstractions/
COPY src/SpotifyManager.Application/SpotifyManager.Application.csproj src/SpotifyManager.Application/
COPY src/SpotifyManager.Infrastructure/SpotifyManager.Infrastructure.csproj src/SpotifyManager.Infrastructure/
COPY src/SpotifyManager.Provider.Spotify/SpotifyManager.Provider.Spotify.csproj src/SpotifyManager.Provider.Spotify/
COPY src/SpotifyManager.Api/SpotifyManager.Api.csproj src/SpotifyManager.Api/
RUN dotnet restore src/SpotifyManager.Api/SpotifyManager.Api.csproj --configfile NuGet.Config

COPY src/ src/
RUN dotnet publish src/SpotifyManager.Api/SpotifyManager.Api.csproj --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app ./
USER $APP_UID
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD curl --fail http://localhost:8080/health/live || exit 1
ENTRYPOINT ["dotnet", "SpotifyManager.Api.dll"]
