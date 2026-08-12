import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  readonly status: 'idle' | 'loading' | 'authenticated' | 'anonymous' | 'error';
  readonly userId: string | null;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly error: string | null;
}

const initialState: AuthState = {
  status: 'idle',
  userId: null,
  displayName: null,
  email: null,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loadSession, (state) => ({ ...state, status: 'loading' as const, error: null })),
  on(AuthActions.sessionLoaded, (state, action) => ({
    ...state,
    status: 'authenticated' as const,
    userId: action.userId,
    displayName: action.displayName,
    email: action.email,
    error: null,
  })),
  on(AuthActions.sessionMissing, () => ({ ...initialState, status: 'anonymous' as const })),
  on(AuthActions.sessionFailed, (state, action) => ({
    ...state,
    status: 'error' as const,
    error: action.message,
  })),
);
