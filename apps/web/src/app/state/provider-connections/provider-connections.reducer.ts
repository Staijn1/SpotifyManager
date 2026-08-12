import { createReducer } from '@ngrx/store';

export interface ProviderConnectionSummary {
  readonly id: string;
  readonly provider: 'Spotify' | 'AppleMusic' | 'YouTubeMusic' | 'Deezer';
  readonly status: 'active' | 'expired' | 'restricted';
  readonly displayName: string;
}

export interface ProviderConnectionsState {
  readonly connections: ReadonlyArray<ProviderConnectionSummary>;
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: ProviderConnectionsState = {
  connections: [],
  loading: false,
  error: null,
};

export const providerConnectionsReducer = createReducer(initialState);
