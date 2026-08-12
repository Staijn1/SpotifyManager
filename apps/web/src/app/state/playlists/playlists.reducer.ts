import { createReducer, on } from '@ngrx/store';
import { PlaylistSummary } from '../../core/playlist-api';
import { PlaylistActions } from './playlists.actions';

export interface PlaylistsState {
  readonly items: ReadonlyArray<PlaylistSummary>;
  readonly query: string;
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: PlaylistsState = {
  items: [],
  query: '',
  loading: false,
  error: null,
};

export const playlistsReducer = createReducer(
  initialState,
  on(PlaylistActions.load, (state, action) => ({
    ...state,
    query: action.query,
    loading: true,
    error: null,
  })),
  on(PlaylistActions.loaded, (state, action) => ({
    ...state,
    items: action.items,
    query: action.query,
    loading: false,
    error: null,
  })),
  on(PlaylistActions.failed, (state, action) => ({
    ...state,
    loading: false,
    error: action.message,
  })),
);
