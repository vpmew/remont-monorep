import { useDispatch, useSelector } from "react-redux";

import MuiAlert from "@material-ui/lab/Alert";
import { Snackbar, makeStyles } from "@material-ui/core";

import { setInfo } from "reduxInstance/actions";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function NotificationSnackbar() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { type, text } = useSelector((state) => state.main.info);

  const onClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(setInfo({ type: null, text: null }));
  };

  return (
    <div className={classes.root}>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={!!type && !!text}
        autoHideDuration={5000}
        onClose={onClose}
      >
        {type && text && (
          <Alert onClose={onClose} severity={type}>
            {text}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}

export default NotificationSnackbar;
