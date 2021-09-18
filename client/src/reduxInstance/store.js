import { createStore } from "redux";
import { devToolsEnhancer } from "redux-devtools-extension";
import rootReducer from "./reducers/rootReducer";
import persistStorage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const persistConfig = {
  key: "root",
  storage: persistStorage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, devToolsEnhancer());
// const notPersisted = createStore(rootReducer, devToolsEnhancer());

export default store;
