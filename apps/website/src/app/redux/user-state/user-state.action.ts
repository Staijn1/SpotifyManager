import { CurrentUsersProfileResponse } from "@spotify-manager/core";
import { Action } from '@ngrx/store';

export enum UserStateAction {
  SET_LOGGED_IN = 'SET_LOGGED_IN',
  SET_LOGGED_OUT = 'SET_LOGGED_OUT',
  SET_USER = 'SET_USER',
}

export class SetLoggedIn implements Action {
  readonly type = UserStateAction.SET_LOGGED_IN;
}

export class SetLoggedOut implements Action {
  readonly type = UserStateAction.SET_LOGGED_OUT;
}

export class SetUser implements Action {
  readonly type = UserStateAction.SET_USER;
  public payload: CurrentUsersProfileResponse;

  constructor(payload: CurrentUsersProfileResponse) {
    this.payload = payload;
  }
}
