import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import fingerprint from "@fingerprintjs/fingerprintjs";

import { setInfo } from "reduxInstance/actions";
import { createFastOrder } from "api/fastOrders";

const fpPromise = fingerprint.load();

const useStyles = makeStyles((theme) => ({
  inputCell: {
    marginBottom: "15px",
    "&:last-child": {
      marginBottom: 0,
      marginTop: "10px",
    },
  },
  textInput: {
    width: "100%",
    maxWidth: "320px",
  },
  textArea: {
    width: "100%",
    maxWidth: "400px",
  },
  caption: {
    display: "block",
    color: "#aaa",
    marginTop: "5px",
  },
  button: {
    position: "relative",
  },
  progress: {
    position: "absolute",
    right: "-45px",
    top: "3px",
  },
}));

function Form() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [values, setValues] = useState({
    userName: "",
    orderText: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);
  const clearForm = () =>
    setValues({ userName: "", orderText: "", contact: "" });

  function isFormFilled() {
    return values.userName && values.orderText && values.contact;
  }

  function handleResult(status) {
    let type = "error",
      text = "Неизвестная ошибка.";
    if (status === 201) {
      clearForm();
      type = "success";
      text = "Заявка отправлена.";
    }
    if (status === 400) {
      text = "Ошибка: не удалось получить ip или fingerprint.";
    }
    if (status === 409) {
      text = "Вы не можете создать больше 3-х заявок.";
    }
    if (status === 500) {
      text = "Серверная ошибка.";
    }
    if (status === 503) {
      text = "Сервер не отвечает.";
    }
    dispatch(setInfo({ type, text }));
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <TextField
        size="small"
        label="Имя"
        variant="outlined"
        className={`${classes.textArea} ${classes.inputCell}`}
        value={values.userName}
        onChange={(e) => setValues({ ...values, userName: e.target.value })}
      />
      <TextField
        size="small"
        multiline
        label="Опишите свою проблему"
        variant="outlined"
        rows={3}
        className={`${classes.textArea} ${classes.inputCell}`}
        value={values.orderText}
        onChange={(e) => setValues({ ...values, orderText: e.target.value })}
      />
      <div className={classes.inputCell}>
        <TextField
          size="small"
          label="Как нам связаться с Вами?"
          variant="outlined"
          multiline
          rows={2}
          className={classes.textArea}
          value={values.contact}
          onChange={(e) => setValues({ ...values, contact: e.target.value })}
        />
        <Typography variant="caption" className={classes.caption}>
          Просто напишите любой удобный способ связи ;)
          <br />
          Если это логин в месенжере, не забудьте уточнить в каком.
        </Typography>
      </div>
      <Button
        className={classes.button}
        type="submit"
        variant="contained"
        color="primary"
        disabled={!isFormFilled() || loading}
        onClick={async () => {
          if (isFormFilled()) {
            setLoading(true);
            const fp = await fpPromise;
            const { visitorId: fingerprint } = await fp.get();
            const { status } = await createFastOrder(values, fingerprint);
            setLoading(false);
            handleResult(status);
          }
        }}
      >
        Готово
        {loading && <CircularProgress size={30} className={classes.progress} />}
      </Button>
    </form>
  );
}

export default Form;
