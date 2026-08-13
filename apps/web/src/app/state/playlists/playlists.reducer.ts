import { createReducer, on } from '@ngrx/store';
import { ForkCreation, PlaylistDetails, PlaylistSummary } from '../../core/playlist-api';
import { PlaylistActions } from './playlists.actions';

export interface PlaylistsState {
  readonly items: ReadonlyArray<PlaylistSummary>;
  readonly query: string;
  readonly loading: boolean;
  readonly error: string | null;
  readonly selected: PlaylistDetails | null;
  readonly selectedLoading: boolean;
  readonly selectedError: string | null;
  readonly forking: boolean;
  readonly forkError: string | null;
  readonly createdFork: ForkCreation | null;
}

const initialState: PlaylistsState = {
  items: [],
  query: '',
  loading: false,
  error: null,
  selected: null,
  selectedLoading: false,
  selectedError: null,
  forking: false,
  forkError: null,
  createdFork: null,
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
  on(PlaylistActions.loadDetails, (state) => ({
    ...state,
    selected: null,
    selectedLoading: true,
    selectedError: null,
    forkError: null,
    createdFork: null,
  })),
  on(PlaylistActions.detailsLoaded, (state, action) => ({
    ...state,
    selected: action.details,
    selectedLoading: false,
    selectedError: null,
  })),
  on(PlaylistActions.detailsFailed, (state, action) => ({
    ...state,
    selectedLoading: false,
    selectedError: action.message,
  })),
  on(PlaylistActions.forkRequested, (state) => ({
    ...state,
    forking: true,
    forkError: null,
    createdFork: null,
  })),
  on(PlaylistActions.forkSucceeded, (state, action) => ({
    ...state,
    forking: false,
    createdFork: action.result,
  })),
  on(PlaylistActions.forkFailed, (state, action) => ({
    ...state,
    forking: false,
    forkError: action.message,
  })),
  on(PlaylistActions.clearSelected, (state) => ({
    ...state,
    selected: null,
    selectedLoading: false,
    selectedError: null,
    forking: false,
    forkError: null,
    createdFork: null,
  })),
);
