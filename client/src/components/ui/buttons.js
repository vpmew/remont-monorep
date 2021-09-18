import { IconButton, withStyles } from "@material-ui/core";
import { Close as CloseIcon, Home } from "@material-ui/icons";
import { useHistory } from "react-router-dom";

import deleteIcon from "assets/icons/delete.svg";

const closeButtonStyles = {
  root: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    position: "absolute",
    zIndex: "1",
    top: "-15px",
    right: "-15px",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
};

const homeButtonStyles = {
  root: {
    position: "fixed",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    bottom: "2%",
    right: "2%",
    boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2)",
    "& svg": {
      width: "1.2em",
      height: "1.2em",
    },
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
};

const deleteButtonStyles = (theme) => ({
  root: {
    position: "absolute",
    top: "0",
    left: "calc(50% + 40px)",
    width: "40px",
    height: "40px",
    border: "2px solid #ffffff",
    backgroundColor: `${theme.palette.secondary.main}`,
    borderRadius: "50%",
    backgroundImage: `url(${deleteIcon})`,
    backgroundPosition: "50% 50%",
    backgroundSize: "50%",
    backgroundRepeat: "no-repeat",
    outline: "none",
    fontSize: "0",
    "&:hover": {
      cursor: "pointer",
    },
    "&:focus": {
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.5)",
    },
  },
});

const CloseButton = withStyles(closeButtonStyles)((props) => {
  const { classes, onClick } = props;
  return (
    <IconButton className={classes.root} onClick={onClick} aria-label="close">
      <CloseIcon />
    </IconButton>
  );
});

const HomeButton = withStyles(homeButtonStyles)((props) => {
  const { classes } = props;
  const history = useHistory();
  return (
    <IconButton
      className={classes.root}
      aria-label="home"
      color="primary"
      onClick={() => history.push("/")}
    >
      <Home />
    </IconButton>
  );
});

const DeleteButton = withStyles(deleteButtonStyles)((props) => {
  const { classes, onClick } = props;
  return (
    <button className={classes.root} onClick={onClick}>
      Удалить
    </button>
  );
});

export { CloseButton, HomeButton, DeleteButton };
