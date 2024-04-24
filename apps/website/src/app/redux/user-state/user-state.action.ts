import { CurrentUsersProfileResponse } from '@spotify-manager/core';
import { SpotifyManagerAction } from '../SpotifyManagerAction';

export enum UserStateAction {
  UPDATE_LOGIN_STATUS = 'UPDATE_LOGIN_STATUS',
  SET_USER = 'SET_USER',
}

export class UpdateUserLoginStatus implements SpotifyManagerAction<boolean> {
  readonly type = UserStateAction.UPDATE_LOGIN_STATUS;
  public payload: boolean;

  constructor(payload: boolean) {
    this.payload = payload;
  }
}

export class SetCurrentLoggedInUser implements SpotifyManagerAction<CurrentUsersProfileResponse> {
  readonly type = UserStateAction.SET_USER;
  public payload: CurrentUsersProfileResponse;

  constructor(payload: CurrentUsersProfileResponse) {
    this.payload = payload;
  }
}
