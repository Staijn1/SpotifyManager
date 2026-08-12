import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '../auth/auth.actions';
import { ProviderConnectionActions } from './provider-connections.actions';

export interface ProviderConnectionSummary {
  readonly id: string;
  readonly provider: 'Spotify';
  readonly status: 'active' | 'expired' | 'restricted' | 'disconnected';
  readonly displayName: string;
  readonly scopes: ReadonlyArray<string>;
  readonly updatedAt: string;
}

export interface ProviderConnectionsState {
  readonly connections: ReadonlyArray<ProviderConnectionSummary>;
  readonly spotifyConfigured: boolean | null;
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: ProviderConnectionsState = {
  connections: [],
  spotifyConfigured: null,
  loading: false,
  error: null,
};

export const providerConnectionsReducer = createReducer(
  initialState,
  on(AuthActions.loadSession, (state) => ({ ...state, loading: true, error: null })),
  on(ProviderConnectionActions.sessionStateLoaded, (state, action) => ({
    ...state,
    spotifyConfigured: action.spotifyConfigured,
    connections: action.connection ? [action.connection] : [],
    loading: false,
    error: null,
  })),
  on(ProviderConnectionActions.disconnectRequested, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProviderConnectionActions.disconnected, (state) => ({
    ...state,
    connections: state.connections.map((connection) => ({
      ...connection,
      status: 'disconnected' as const,
    })),
    loading: false,
  })),
  on(ProviderConnectionActions.disconnectFailed, (state, action) => ({
    ...state,
    loading: false,
    error: action.message,
  })),
);
