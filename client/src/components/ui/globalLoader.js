import { useSelector } from "react-redux";
import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

function GlobalLoader() {
  const classes = useStyles();
  const loading = useSelector((state) => state.main.loading);
  return (
    <Backdrop open={loading} className={classes.backdrop}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default GlobalLoader;
