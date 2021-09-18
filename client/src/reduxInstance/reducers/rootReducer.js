import { combineReducers } from "redux";

import { userReducer } from "./userReducer";
import { mainReducer } from "./mainReducer";
import { myOrdersReducer } from "./myOrdersReducer";

const rootReducer = combineReducers({
  user: userReducer,
  main: mainReducer,
  myOrders: myOrdersReducer,
});

export default rootReducer;
