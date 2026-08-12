# Spotify Manager

Spotify Manager creates a user-owned remix of a source playlist and tracks source changes without overwriting the user's edits.

This branch introduces the first runnable slice of the new architecture:

- .NET 10 modular backend with provider-neutral application and domain layers
- Spotify adapter behind explicit provider interfaces and strategies
- PostgreSQL persistence with an initial EF Core migration
- separate API, worker, and one-shot database migrator processes
- Angular 22 standalone web shell with PrimeNG, Tailwind CSS, and NgRx state boundaries
- a Docker Compose development stack with PostgreSQL and Mailpit

The previous Nx implementation remains in the repository while features are migrated into `src/` and `apps/web/`.

PrimeNG 22 packages are pinned for Angular 22 compatibility, but rendered PrimeNG controls require a valid PrimeUI license. The first shell therefore uses accessible native controls styled by the preserved design tokens; PrimeNG components should be enabled only after the project license is configured.

## Run the stack

Docker is the shortest path:

```powershell
docker compose up --build -d
```

Open:

- Web: http://localhost:4900
- API status: http://localhost:4901/api/v1/system/status
- API readiness: http://localhost:4901/health/ready
- Mailpit: http://localhost:8025

Stop the stack with `docker compose down`. The PostgreSQL volume is retained.

## Validate locally

The repository pins .NET in `global.json`. From a machine with .NET 10 and Node 24.18.1 or newer:

```powershell
dotnet restore SpotifyManager.slnx
dotnet build SpotifyManager.slnx --no-restore -c Release
dotnet test SpotifyManager.slnx --no-build -c Release

cd apps/web
npm ci
npm run build
npm test -- --watch=false
```

## Current boundary

The domain model, playlist-difference engine, persistence schema, process topology, and responsive application shell are implemented. Spotify OAuth, authenticated playlist browsing, applying proposals, and email digests are the next vertical slices.

The captured deployed UI reference is documented in `docs/legacy-ui-baseline/README.md`.
