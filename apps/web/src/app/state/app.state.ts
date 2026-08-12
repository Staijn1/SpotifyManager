import { AuthState } from './auth/auth.reducer';
import { ForksState } from './forks/forks.reducer';
import { ProviderConnectionsState } from './provider-connections/provider-connections.reducer';
import { PlaylistsState } from './playlists/playlists.reducer';

export interface AppState {
  readonly auth: AuthState;
  readonly providerConnections: ProviderConnectionsState;
  readonly playlists: PlaylistsState;
  readonly forks: ForksState;
}
