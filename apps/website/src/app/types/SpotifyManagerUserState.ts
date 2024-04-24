import { CurrentUsersProfileResponse } from '@spotify-manager/core';

export type SpotifyManagerUserState = {
  isLoggedIn: boolean;
  user: CurrentUsersProfileResponse | null;
};
