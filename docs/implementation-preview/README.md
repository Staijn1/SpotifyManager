# Implementation preview

These screenshots were captured from the Docker-packaged Angular application at `http://localhost:4900` after the API, worker, migrator, PostgreSQL, and Nginx health checks passed.

- `home-desktop.png`: 1440 by 1000 desktop viewport
- `home-mobile.png`: 390 by 844 mobile viewport
- `settings-provider-setup.png`: provider connection settings with credentials intentionally absent
- `playlists-connection-gate.png`: authenticated playlist library in its safe pre-connection state

The home screenshots cover the unauthenticated shell. The settings screenshot verifies the safe pre-configuration state; a live Spotify callback requires developer credentials supplied through local environment variables.
