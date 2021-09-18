import { useSelector, useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { Button, AppBar, Typography, Toolbar } from "@material-ui/core";

import UserMenu from "./userMenu";
import { logout } from "api/auth";
import { isUser } from "utils/credentials";
import { logout as clientLogout, setInfo } from "reduxInstance/actions";

const useStyles = makeStyles({
  button: {
    color: "inherit",
  },
  title: {
    flexGrow: 1,
  },
});

function Header({ withoutMenu = false }) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const { userName, avatar, credentials } = useSelector((state) => state.user);

  let headerText;
  switch (location.pathname) {
    case "/":
      headerText = "Ремонт электроники в Оренбурге";
      break;
    case "/user":
      headerText = "Личный кабинет";
      break;
    case "/crm":
      headerText = "CRM";
      break;
    default:
      headerText = "Ремонт электроники в Оренбурге";
      break;
  }

  return (
    <>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" className={classes.title}>
            {headerText}
          </Typography>
          {!withoutMenu && (
            <>
              {!isUser(credentials) ? (
                <Button
                  className={classes.button}
                  onClick={() => {
                    history.push("/auth", {
                      background: {
                        hash: "",
                        pathname: "/",
                        search: "",
                        state: undefined,
                      },
                    });
                  }}
                >
                  Войти
                </Button>
              ) : (
                <UserMenu
                  location={location.pathname}
                  history={history}
                  userName={userName}
                  avatar={avatar}
                  credentials={credentials}
                  logout={(userId) => {
                    logout(userId);
                    dispatch(clientLogout());
                    if (location.pathname !== "/") history.push("/");
                    dispatch(
                      setInfo({
                        type: "success",
                        text: "Успешно вышли из системы.",
                      })
                    );
                  }}
                />
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* add space under fixed AppBar */}
    </>
  );
}

export default Header;
