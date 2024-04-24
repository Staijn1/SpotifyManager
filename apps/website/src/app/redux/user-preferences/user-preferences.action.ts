import { IUserPreferencesResponse } from '@spotify-manager/core';
import { SpotifyManagerAction } from '../SpotifyManagerAction';


export enum UserPreferencesAction {
  RECEIVE_USER_PREFERENCES = 'RECEIVE_USER_PREFERENCES',
}

export class ReceiveUserPreferences implements SpotifyManagerAction<IUserPreferencesResponse> {
  readonly type = UserPreferencesAction.RECEIVE_USER_PREFERENCES;

  constructor(public payload: IUserPreferencesResponse) {
  }
}
