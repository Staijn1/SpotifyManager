import { createReducer } from '@ngrx/store';

export interface ForkSummary {
  readonly id: string;
  readonly name: string;
  readonly sourceName: string;
  readonly status: 'pending' | 'active' | 'failed' | 'disconnected';
  readonly proposedChangeCount: number;
}

export interface ForksState {
  readonly entities: Readonly<Record<string, ForkSummary>>;
  readonly ids: ReadonlyArray<string>;
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: ForksState = {
  entities: {},
  ids: [],
  loading: false,
  error: null,
};

export const forksReducer = createReducer(initialState);
