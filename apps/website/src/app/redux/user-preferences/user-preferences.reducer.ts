import { EmailNotificationFrequency, IUserPreferencesResponse } from '@spotify-manager/core';
import { UserPreferencesAction } from './user-preferences.action';

const initialState: IUserPreferencesResponse = { originalPlaylistChangeNotificationFrequency: EmailNotificationFrequency.DAILY };

export const userPreferencesReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case UserPreferencesAction.RECEIVE_USER_PREFERENCES: {
      return action.payload;
    }
    default:
      return state;
  }
};
