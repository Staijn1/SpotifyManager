import { UserStateAction } from './user-state.action';

const initialState = {
  isLoggedIn: false,
  user: null
};

export const userStateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case UserStateAction.SET_LOGGED_IN: {
      return { ...state, isLoggedIn: true };
    }
    case UserStateAction.SET_LOGGED_OUT: {
      return { ...state, isLoggedIn: false };
    }
    case UserStateAction.SET_USER: {
      return { ...state, user: action.payload };
    }
    default:
      return state;
  }
};
