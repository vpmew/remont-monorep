import { useState, forwardRef, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";

import { initRecovery } from "api/user";
import { CloseButton } from "./ui/buttons";

const useStyles = makeStyles({
  paper: {
    position: "absolute",
    display: "flex",
    flexFlow: "column",
    width: "340px",
    minHeight: "250px",
    left: "calc(50% - 170px)",
    top: "40%",
    paddingBottom: "30px",
  },
  header: {
    padding: "10px 30px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    position: "relative",
  },
  form: {
    display: "flex",
    flexFlow: "column",
    padding: "20px 30px",
  },
  input: {
    width: "100%",
    marginBottom: "15px",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  info: {
    minHeight: "30px",
    marginBottom: "15px",
    "&.success": {
      color: "green",
    },
    "&.error": {
      color: "red",
    },
  },
  progress: {
    display: "block",
    margin: "0 auto",
  },
});

function PassResetForm(props) {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ type: null, text: null });
  const clearInfo = () => {
    setInfo({ type: null, text: null });
  };

  function validateForm() {
    const emailRegexp = /^[\w.-]+@([\w-]+\.)+[\w-]+$/;
    if (!emailRegexp.test(email)) {
      setInfo({ type: "error", text: "Указан недопустимый формат email." });
      return false;
    }
    return true;
  }

  function handleResponse(status) {
    const type = status === 200 ? "success" : "error";
    const text =
      status === 200
        ? "На почту отправлено письмо."
        : status === 409
        ? "Такая почта не используется."
        : status === 500
        ? "Серверная ошибка."
        : status === 503
        ? "Сервер не отвечает."
        : "Неизвестная ошибка.";
    setInfo({ type, text });
  }

  useEffect(clearInfo, [email]);

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6" className={classes.header}>
        Сброс пароля
        <CloseButton onClick={props.close} />
      </Typography>
      <form
        className={classes.form}
        autoComplete="on"
        onSubmit={(event) => event.preventDefault()}
      >
        <TextField
          autoFocus
          name="email"
          label="E-mail"
          variant="outlined"
          size="small"
          className={classes.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Typography
          variant="body1"
          className={`${classes.info} ${info.type || ""}`}
        >
          {info.text}
          {loading && (
            <CircularProgress size={30} className={classes.progress} />
          )}
        </Typography>
        <Button
          type="submit"
          className={classes.input}
          variant="contained"
          color="primary"
          disabled={!email || loading}
          onClick={async () => {
            if (validateForm()) {
              clearInfo();
              setLoading(true);
              const { status } = await initRecovery(email);
              handleResponse(status);
              setLoading(false);
            }
          }}
        >
          Сбросить
        </Button>
      </form>
    </Paper>
  );
}

export default forwardRef((props, ref) => (
  <PassResetForm {...props} ref={ref} />
));
