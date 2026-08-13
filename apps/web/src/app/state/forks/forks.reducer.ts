import { createReducer, on } from '@ngrx/store';
import { ForkSummary } from '../../core/fork-api';
import { ForkActions } from './forks.actions';

export interface ForksState {
  readonly items: ReadonlyArray<ForkSummary>;
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: ForksState = {
  items: [],
  loading: false,
  error: null,
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
);
