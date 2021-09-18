import { useState, useEffect, useRef, forwardRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Link,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";

import Tabs from "./ui/tabs";
import PasswordInput from "./ui/passwordInput";
import { CloseButton } from "./ui/buttons";
import { setUser, setInfo as setGlobalInfo } from "reduxInstance/actions";
import { login } from "api/auth";
import { create } from "api/user";
import {
  isEmailTemplateValid,
  isPasswordTemplateValid,
  isUserNameTemplateValid,
} from "utils/regexpValidation";
import { convertUserCredentials } from "utils/converters";
import { CLIENT } from "config";

const useStyles = makeStyles({
  paper: {
    position: "absolute",
    top: "30%",
    left: "calc(50% - 180px)",
    display: "flex",
    flexFlow: "column",
    width: "360px",
    minHeight: "250px",
    paddingBottom: "30px",
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

  socialContainer: {
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    padding: "20px 40px 0",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  vkAuthLink: {
    alignSelf: "center",
    marginTop: "10px",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    fontSize: "0",
    backgroundColor: "#307cb7",
    color: "#ffffff",
    border: "none",
    outline: "none",
    backgroundPosition: "calc(100% - 11px) 50%",
    backgroundSize: "30px",
    backgroundRepeat: "no-repeat",
    backgroundImage:
      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2213%22%20viewBox%3D%220%200%2020%2013%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cpath%20d%3D%22M10.6795%2012.4423C11.3452%2012.4423%2011.3452%2011.4462%2011.3452%2011.0598C11.3452%2010.3686%2012.011%209.67731%2012.6767%209.67731C13.3425%209.67731%2014.4842%2010.8628%2015.3397%2011.751C16.0055%2012.4423%2016.0055%2012.4423%2016.6712%2012.4423C17.337%2012.4423%2018.6685%2012.4423%2018.6685%2012.4423C18.6685%2012.4423%2020%2012.3897%2020%2011.0598C20%2010.6278%2019.544%209.89505%2018.0027%208.29484C16.6712%206.91237%2015.9882%207.62642%2018.0027%204.83866C19.2297%203.14098%2020.1225%201.60298%2019.9694%201.1592C19.8229%200.735476%2016.4103%200.0608288%2016.0055%200.691237C14.674%202.76495%2014.4296%203.27301%2014.0082%204.14742C13.3425%205.52989%2013.2766%206.22113%2012.6767%206.22113C12.0715%206.22113%2012.011%204.87944%2012.011%204.14742C12.011%201.86219%2012.3299%200.24608%2011.3452%200C11.3452%200%2010.0137%200%209.34795%200C8.27608%200%207.35069%200.691237%207.35069%200.691237C7.35069%200.691237%206.52449%201.36035%206.68493%201.38247C6.88333%201.41012%208.01644%201.0963%208.01644%202.07371C8.01644%202.76495%208.01644%203.45618%208.01644%203.45618C8.01644%203.45618%208.02243%206.22113%207.35069%206.22113C6.68493%206.22113%205.35343%203.45618%204.02192%201.38247C3.4993%200.568888%203.35617%200.691237%202.69041%200.691237C1.97672%200.691237%201.35957%200.720269%200.693152%200.720269C0.0273983%200.720269%20-0.0578181%201.16059%200.0273983%201.38247C1.35891%204.83866%202.31559%207.00914%204.84546%209.74367C7.16561%2012.2522%208.71548%2012.3856%2010.0137%2012.4423C10.3466%2012.4568%2010.0137%2012.4423%2010.6795%2012.4423Z%22%20fill%3D%22white%22/%3E%0A%3C/svg%3E%0A")',
    whiteSpace: "nowrap",
    "&:hover": {
      cursor: "pointer",
      textDecoration: "none",
    },
  },

  progress: {
    display: "block",
    margin: "0 auto",
  },
});

function AuthForm({ close }) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const firstInputRef = useRef(null);
  const history = useHistory();

  const [info, setInfo] = useState({ type: null, text: null });
  const [loading, setLoading] = useState(false);
  const [mode, changeMode] = useState(0); // 0 - вход, 1 - рег
  const [values, setValues] = useState({
    userName: "",
    email: "",
    password: "",
    passwordRepeat: "",
  });
  const clearValues = () => {
    setValues({ userName: "", email: "", password: "", passwordRepeat: "" });
  };
  const setValue =
    (field) =>
    ({ target: { value } }) =>
      setValues({ ...values, [field]: value });
  const clearInfo = () => {
    setInfo({ type: null, text: null });
  };

  function isFormFilled() {
    const { userName, email, password, passwordRepeat } = values;
    if (mode) {
      return !!(userName && email && password && passwordRepeat);
    } else {
      return !!(email && password);
    }
  }

  function validateForm() {
    const { userName, email, password, passwordRepeat } = values;
    if (!isEmailTemplateValid(email)) {
      setInfo({ type: "error", text: "Указан недопустимый формат email." });
      return false;
    }
    if (password.length < 8) {
      setInfo({
        type: "error",
        text: "Длина пароля должна составлять минимум 8 символов.",
      });
      return false;
    }
    if (!isPasswordTemplateValid(password)) {
      setInfo({
        type: "error",
        text: "Для пароля используются цифры и буквы английского алфавита.",
      });
      return false;
    }
    if (mode) {
      if (passwordRepeat !== password) {
        setInfo({ type: "error", text: "Указанные пароли не совпадают." });
        return false;
      }
      if (!isUserNameTemplateValid(userName)) {
        setInfo({
          type: "error",
          text: 'Имя должно начинаться с буквы. Допускается присутствие цифр, а также символов "_", "-" и пробела.',
        });
        return false;
      }
    }
    return true;
  }

  function handleResponse(status, data) {
    if (status === 200 || status === 201) clearValues();
    let type, text;
    if (status === 200) {
      type = null;
      text = null;
      const {
        userName,
        email,
        phone,
        credentials: dbCredentials,
        avatar,
        regDate: dbRegDate,
      } = data;
      const credentials = convertUserCredentials(dbCredentials);
      const regDate = new Date(dbRegDate).toLocaleString();
      dispatch(
        setUser({ userName, email, phone, credentials, regDate, avatar })
      );
      dispatch(setGlobalInfo({ type: "success", text: `Вы вошли в систему.` }));
      close();
      history.push("/user");
      return;
    }
    if (status === 201) {
      type = "success";
      text = "Аккаунт создан.";
    }
    if (status === 404) {
      type = "error";
      text = "Неверно указана почта или пароль.";
    }
    if (status === 409) {
      type = "error";
      text = "Такая почта уже используется.";
    }
    if (status === 500) {
      type = "error";
      text = "Серверная ошибка.";
    }
    if (status === 503) {
      type = "error";
      text = "Сервер не отвечает.";
    }
    if (status === null) {
      type = "error";
      text = "Неизвестная ошибка.";
    }
    setInfo({ type, text });
  }

  async function submit() {
    if (validateForm()) {
      clearInfo();
      setLoading(true);
      if (mode) {
        const { data, status } = await create(
          values.userName,
          values.email,
          values.password
        );
        handleResponse(status, data);
      } else {
        const { data, status } = await login(values.email, values.password);
        handleResponse(status, data);
      }
      setLoading(false);
    }
  }

  useEffect(clearInfo, [values]);

  return (
    <Box>
      <Paper className={classes.paper}>
        <CloseButton onClick={close} />
        <Tabs
          tabsAriaLabel="auth mode"
          tabs={[
            { label: "Войти", a11yProp: "login" },
            { label: "Регистрация", a11yProp: "signup" },
          ]}
          callback={(value) => {
            changeMode(value);
            clearValues();
            clearInfo();
            firstInputRef.current.focus();
          }}
        />
        <form
          className={classes.form}
          autoComplete="on"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextField
            autoFocus
            name="email"
            label="E-mail"
            value={values.email}
            className={classes.input}
            inputRef={firstInputRef}
            size="small"
            variant="outlined"
            onChange={setValue("email")}
          />
          <PasswordInput
            name="password"
            autoComplete="off"
            label={"Пароль"}
            value={values.password}
            labelWidth={60}
            className={classes.input}
            onChange={setValue("password")}
          />
          {!!mode && (
            <>
              <PasswordInput
                name="password-repeat"
                autoComplete="off"
                label={"Повторите пароль"}
                value={values.passwordRepeat}
                labelWidth={145}
                className={classes.input}
                onChange={setValue("passwordRepeat")}
              />
              <TextField
                name="user-name"
                size="small"
                label="Ваше имя"
                variant="outlined"
                className={classes.input}
                value={values.userName}
                onChange={setValue("userName")}
              />
            </>
          )}
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
            className={classes.input}
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isFormFilled() || loading}
            onClick={submit}
          >
            {!mode ? "Войти" : "Создать"}
          </Button>
          {!mode && (
            <Button
              className={classes.input}
              variant="outlined"
              onClick={() =>
                history.push("/recovery", {
                  background: {
                    hash: "",
                    pathname: "/",
                    search: "",
                    state: undefined,
                  },
                })
              }
            >
              Забыли пароль?
            </Button>
          )}
        </form>
        {!mode && (
          <div className={classes.socialContainer}>
            <Typography variant="body1">Войти через:</Typography>
            <Link
              href={`https://oauth.vk.com/authorize?client_id=7774323&display=popup&redirect_uri=${CLIENT}&scope=email&response_type=token&v=5.130&state=authViaVk`}
              className={classes.vkAuthLink}
            >
              vk
            </Link>
          </div>
        )}
      </Paper>
    </Box>
  );
}

export default forwardRef((props, ref) => <AuthForm {...props} ref={ref} />);
