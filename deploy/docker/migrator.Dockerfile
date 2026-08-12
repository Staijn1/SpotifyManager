FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

COPY global.json Directory.Build.props Directory.Packages.props NuGet.Config ./
COPY src/SpotifyManager.Domain/SpotifyManager.Domain.csproj src/SpotifyManager.Domain/
COPY src/SpotifyManager.Provider.Abstractions/SpotifyManager.Provider.Abstractions.csproj src/SpotifyManager.Provider.Abstractions/
COPY src/SpotifyManager.Application/SpotifyManager.Application.csproj src/SpotifyManager.Application/
COPY src/SpotifyManager.Infrastructure/SpotifyManager.Infrastructure.csproj src/SpotifyManager.Infrastructure/
COPY src/SpotifyManager.DatabaseMigrator/SpotifyManager.DatabaseMigrator.csproj src/SpotifyManager.DatabaseMigrator/
RUN dotnet restore src/SpotifyManager.DatabaseMigrator/SpotifyManager.DatabaseMigrator.csproj --configfile NuGet.Config

COPY src/ src/
RUN dotnet publish src/SpotifyManager.DatabaseMigrator/SpotifyManager.DatabaseMigrator.csproj --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install --yes --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app ./
USER $APP_UID
ENTRYPOINT ["dotnet", "SpotifyManager.DatabaseMigrator.dll"]
