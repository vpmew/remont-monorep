import { SET_LOADING, SET_INFO } from "../actions";

const initialState = {
  loading: false,
  info: { type: null, text: null },
};

export function mainReducer(state = initialState, action) {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.state };
    case SET_INFO:
      return { ...state, info: { ...action.info } };
    default:
      return state;
  }
}
