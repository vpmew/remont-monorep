import { SET_MY_ORDERS, LOGOUT } from "../actions";

const initialState = null;

export function myOrdersReducer(state = initialState, action) {
  switch (action.type) {
    case SET_MY_ORDERS:
      if (Array.isArray(action.orders)) {
        return [...action.orders];
      } else {
        return null;
      }
    case LOGOUT:
      return null;
    default:
      return state;
  }
}
