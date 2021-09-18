import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Menu, MenuItem, Avatar, makeStyles } from "@material-ui/core";

import { isAdmin } from "utils/credentials";

const useStyles = makeStyles((theme) => ({
  button: {
    textTransform: "none",
    color: "inherit",
    padding: "6px 12px",
  },
  userIcon: {
    marginLeft: "4px",
  },
  menuItem: {
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

function UserBlock({
  userName,
  avatar,
  credentials,
  location,
  history,
  logout,
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const userData = useSelector((state) => state.user);
  const { userId, email, network } = userData;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        className={classes.button}
        startIcon={
          <Avatar src={avatar} alt={userName} className={classes.avatar} />
        }
        onClick={handleClick}
      >
        {userName}
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {location !== "/" && (
          <MenuItem
            onClick={() => {
              handleClose();
              history.push("/");
            }}
            className={classes.menuItem}
          >
            Главная
          </MenuItem>
        )}
        {location !== "/user" && (
          <MenuItem
            onClick={() => {
              handleClose();
              history.push("/user");
            }}
            className={classes.menuItem}
          >
            Профиль
          </MenuItem>
        )}
        {isAdmin(credentials) && location !== "/crm" && (
          <MenuItem
            onClick={() => {
              handleClose();
              history.push("/crm");
            }}
            className={classes.menuItem}
          >
            CRM
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleClose();
            logout(network ? userId : email);
          }}
          className={classes.menuItem}
        >
          Выйти
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserBlock;
