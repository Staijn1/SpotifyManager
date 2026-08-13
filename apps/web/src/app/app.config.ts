import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { authReducer } from './state/auth/auth.reducer';
import { AuthEffects } from './state/auth/auth.effects';
import { forksReducer } from './state/forks/forks.reducer';
import { ForksEffects } from './state/forks/forks.effects';
import { providerConnectionsReducer } from './state/provider-connections/provider-connections.reducer';
import { ProviderConnectionsEffects } from './state/provider-connections/provider-connections.effects';
import { PlaylistsEffects } from './state/playlists/playlists.effects';
import { playlistsReducer } from './state/playlists/playlists.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideStore({
      auth: authReducer,
      providerConnections: providerConnectionsReducer,
      playlists: playlistsReducer,
      forks: forksReducer,
    }),
    provideEffects(AuthEffects, ProviderConnectionsEffects, PlaylistsEffects, ForksEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
