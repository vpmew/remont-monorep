import { Route } from "react-router-dom";
import MockPage from "screens/mockPage";

function SafeRoute({ component: Component, credentials, path, ...rest }) {
  return (
    <Route
      path={path}
      {...rest}
      render={(props) => {
        return credentials ? <Component {...props} /> : <MockPage />;
      }}
    />
  );
}

export default SafeRoute;
