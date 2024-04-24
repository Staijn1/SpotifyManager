import { UserStateAction } from './user-state.action';

const initialState = {
  isLoggedIn: false,
  user: null
};

export const userStateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case UserStateAction.UPDATE_LOGIN_STATUS: {
      return { ...state, isLoggedIn: action.payload };
    }
    case UserStateAction.SET_USER: {
      return { ...state, user: action.payload };
    }
    default:
      return state;
  }
};
