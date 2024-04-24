import { CurrentUsersProfileResponse, IUserPreferences } from '@spotify-manager/core';

export type SpotifyManagerUserState = {
  isLoggedIn: boolean;
  user: CurrentUsersProfileResponse | null;
  userPreferences: IUserPreferences | null;
};
