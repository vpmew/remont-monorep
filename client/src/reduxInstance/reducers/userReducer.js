import { SET_USER, LOGOUT } from "../actions";

const initialState = {
  userId: null,
  userName: null,
  email: null,
  phone: null,
  credentials: "guest",
  avatar: null,
  regDate: null,
  network: null,
};

export function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, ...action.userData };
    case LOGOUT:
      const cleared = { ...state };
      for (let key in cleared) {
        if (key === "credentials") {
          cleared[key] = "guest";
        } else {
          cleared[key] = null;
        }
      }
      return { ...state, ...cleared };
    default:
      return state;
  }
}
