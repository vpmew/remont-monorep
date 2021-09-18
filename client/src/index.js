import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import App from "./app";
import GlobalLoader from "components/ui/globalLoader";
import store from "reduxInstance/store";

const persistor = persistStore(store);

ReactDOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={<GlobalLoader />} persistor={persistor}>
        <Router>
          <App />
        </Router>
      </PersistGate>
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
