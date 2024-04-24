import { UserStateAction } from './user-state.action';
import { SpotifyManagerUserState } from '../../types/SpotifyManagerUserState';

const initialState: SpotifyManagerUserState = {
  isLoggedIn: false,
  user: null,
  userPreferences: null,
};

export const userStateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case UserStateAction.UPDATE_LOGIN_STATUS: {
      return { ...state, isLoggedIn: action.payload };
    }
    case UserStateAction.SET_USER: {
      return { ...state, user: action.payload };
    }
    case UserStateAction.RECEIVE_USER_PREFERENCES: {
      return { ...state, userPreferences: action.payload };
    }
    default:
      return state;
  }
};
