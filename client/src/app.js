import {
  Route,
  Switch,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  createMuiTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@material-ui/core/styles";

import AuthForm from "components/authForm";
import SafeRoute from "components/safeRoute";
import PassResetForm from "components/passResetForm";
import Home from "screens/home";
import User from "screens/user";
import CRM from "screens/crm";
import MockPage from "screens/mockPage";
import ConfirmRecovery from "screens/confirmRecovery";
import NotificationSnackbar from "components/ui/notificationSnackbar";
import GlobalLoader from "components/ui/globalLoader";
import { isUser, isAdmin } from "utils/credentials";

let theme = createMuiTheme({
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "*::-webkit-scrollbar": {
          width: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "#eee",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "20px",
        },
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) #eee",
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

function App() {
  const { credentials } = useSelector((state) => state.user);
  const history = useHistory();
  const location = useLocation();
  const background = location.state?.background;
  if (
    (location.pathname === "/auth" || location.pathname === "/recovery") &&
    !background
  ) {
    history.push(`${location.pathname}`, {
      background: {
        hash: "",
        pathname: "/",
        search: "",
        state: undefined,
      },
    });
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch location={background || location}>
        <Route path="/" component={Home} exact />
        <Route
          path="/confirm-recovery"
          render={() =>
            isUser(credentials) ? <Redirect to="/user" /> : <ConfirmRecovery />
          }
          exact
        />
        <SafeRoute
          path="/user"
          exact
          component={User}
          credentials={isUser(credentials)}
        />
        <SafeRoute
          path="/crm"
          exact
          component={CRM}
          credentials={isAdmin(credentials)}
        />
        <Route render={() => <MockPage text="Страница не найдена" />} />
      </Switch>
      {background && (
        <>
          <Route
            path="/auth"
            render={() =>
              isUser(credentials) ? (
                <Redirect to="/user" />
              ) : (
                <Modal
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                  open={location.pathname === "/auth"}
                  onClose={() => history.push("/")}
                >
                  <AuthForm close={() => history.push("/")} />
                </Modal>
              )
            }
          />
          <Route
            path="/recovery"
            render={() =>
              isUser(credentials) ? (
                <Redirect to="/user" />
              ) : (
                <Modal
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                  open={location.pathname === "/recovery"}
                  onClose={() =>
                    history.push("/auth", {
                      background: {
                        hash: "",
                        pathname: "/",
                        search: "",
                        state: undefined,
                      },
                    })
                  }
                >
                  <PassResetForm
                    close={() =>
                      history.push("/auth", {
                        background: {
                          hash: "",
                          pathname: "/",
                          search: "",
                          state: undefined,
                        },
                      })
                    }
                  />
                </Modal>
              )
            }
          />
        </>
      )}
      <GlobalLoader />
      <NotificationSnackbar />
    </ThemeProvider>
  );
}

export default App;
