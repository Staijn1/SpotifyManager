import { CurrentUsersProfileResponse, IUserPreferences } from '@spotify-manager/core';

export type SpotifyManagerUserState = {
  isLoggedIn: boolean;
  // Null means we don't know, undefined means not loaded yet
  user: CurrentUsersProfileResponse | null | undefined;
  // Null means we don't know, undefined means not loaded yet
  userPreferences: IUserPreferences | null | undefined;
};
