import { Action as NgrxAction } from '@ngrx/store';

export interface SpotifyManagerAction<T> extends NgrxAction {
  payload: T;
}
