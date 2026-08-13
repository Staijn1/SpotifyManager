import { createReducer, on } from '@ngrx/store';
import { ChangeProposal, ForkSummary, RefreshForkResult } from '../../core/fork-api';
import { ForkActions } from './forks.actions';

export interface ForksState {
  readonly items: ReadonlyArray<ForkSummary>;
  readonly loading: boolean;
  readonly error: string | null;
  readonly selectedForkId: string | null;
  readonly changes: ReadonlyArray<ChangeProposal>;
  readonly changesLoading: boolean;
  readonly refreshing: boolean;
  readonly refreshResult: RefreshForkResult | null;
  readonly changesError: string | null;
}

const initialState: ForksState = {
  items: [],
  loading: false,
  error: null,
  selectedForkId: null,
  changes: [],
  changesLoading: false,
  refreshing: false,
  refreshResult: null,
  changesError: null,
};

export const forksReducer = createReducer(
  initialState,
  on(ForkActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(ForkActions.loaded, (state, action) => ({
    ...state,
    items: action.items,
    loading: false,
    error: null,
  })),
  on(ForkActions.failed, (state, action) => ({
    ...state,
    loading: false,
    error: action.message,
  })),
  on(ForkActions.loadChanges, (state, action) => ({
    ...state,
    selectedForkId: action.forkId,
    changes: [],
    changesLoading: true,
    changesError: null,
  })),
  on(ForkActions.changesLoaded, (state, action) => ({
    ...state,
    selectedForkId: action.forkId,
    changes: action.items,
    changesLoading: false,
    changesError: null,
  })),
  on(ForkActions.changesFailed, (state, action) => ({
    ...state,
    changesLoading: false,
    changesError: action.message,
  })),
  on(ForkActions.refresh, (state) => ({
    ...state,
    refreshing: true,
    refreshResult: null,
    changesError: null,
  })),
  on(ForkActions.refreshed, (state, action) => ({
    ...state,
    refreshing: false,
    refreshResult: action.result,
  })),
  on(ForkActions.refreshFailed, (state, action) => ({
    ...state,
    refreshing: false,
    changesError: action.message,
  })),
);
