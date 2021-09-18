import { useState, useRef, useEffect, forwardRef } from "react";
import { useDispatch } from "react-redux";
import {
  Paper,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Avatar,
  makeStyles,
} from "@material-ui/core";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

import { setUser } from "reduxInstance/actions";
import { edit } from "api/user";
import {
  isEmailTemplateValid,
  isPasswordTemplateValid,
  isPhoneTemplateValid,
  isUserNameTemplateValid,
} from "utils/regexpValidation";
import { isAdmin } from "utils/credentials";
import { CloseButton, DeleteButton } from "components/ui/buttons";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    display: "flex",
    flexFlow: "column",
    width: "360px",
    minHeight: "250px",
    left: "calc(50% - 180px)",
    top: "15%",
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
  imgInput: {
    display: "none",
  },
  avatarBlock: {
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    marginBottom: "30px",
    position: "relative",
  },
  avatar: {
    width: theme.spacing(20),
    height: theme.spacing(20),
    marginBottom: "15px",
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
}));

function EditProfile({ network, currentAvatar, credentials, close }) {
  const classes = useStyles();
  const fileInput = useRef(null);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [avatar, setAvatar] = useState(null);

  const avatarPreview =
    typeof avatar === "object" && avatar !== null
      ? URL.createObjectURL(avatar)
      : currentAvatar;

  const [values, setValues] = useState({
    userName: "",
    email: "",
    phone: "",
    password: "",
  });
  const setValue =
    (field) =>
    ({ target: { value } }) =>
      setValues({ ...values, [field]: value });
  const clearValues = () => {
    setValues({ userName: "", email: "", phone: "", password: "" });
    setAvatar(null);
  };

  const [info, setInfo] = useState({ type: null, text: null });
  const clearInfo = () => {
    setInfo({ type: null, text: null });
  };

  function areThereChanges() {
    const { userName, email, phone, password } = values;
    return userName || email || phone || password || avatar;
  }

  function validateForm() {
    const { userName, email, phone, password } = values;
    if (userName && !isUserNameTemplateValid(userName)) {
      setInfo({
        type: "error",
        text: 'Имя должно начинаться с буквы. Допускается присутствие цифр, а также символов "_", "-" и пробела.',
      });
      return false;
    }
    if (email && !isEmailTemplateValid(email)) {
      setInfo({ type: "error", text: "Недопустимый формат email." });
      return false;
    }
    if (phone && !isPhoneTemplateValid(phone)) {
      setInfo({
        type: "error",
        text: "Недопустимый формат телефонного номера.",
      });
      return false;
    }
    if (password && password.length < 8) {
      setInfo({
        type: "error",
        text: "Длина пароля должна составлять минимум 8 символов.",
      });
      return false;
    }
    if (password && !isPasswordTemplateValid(password)) {
      setInfo({
        type: "error",
        text: "Для пароля используются цифры и буквы английского алфавита.",
      });
      return false;
    }
    return true;
  }

  function handleResponse(status, userData) {
    let type, text;
    if (status === 200) {
      clearValues();
      type = "success";
      text = "Изменения сохранены.";
      dispatch(setUser(userData));
    }
    if (status === 401) {
      type = "error";
      text = "Ошибка доступа.";
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

  async function submit(event) {
    event.preventDefault();
    if (validateForm()) {
      clearInfo();
      setLoading(true);

      const { userName, email, phone, password } = values;
      const formData = new FormData();
      if (avatar) formData.append("avatar", avatar);
      if (userName) formData.append("userName", userName);
      if (email) formData.append("email", email);
      if (phone) formData.append("phone", phone);
      if (!network && password) formData.append("password", password);

      const { status, data } = await edit(formData);
      setLoading(false);
      handleResponse(status, data);
    }
  }

  useEffect(clearInfo, [values]);

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6" className={classes.header}>
        Редактирование профиля
        <CloseButton onClick={close} />
      </Typography>
      <form className={classes.form} autoComplete="on" onSubmit={submit}>
        {isAdmin(credentials) && (
          <>
            <input
              name="avatar"
              accept="image/*"
              className={classes.imgInput}
              id="button-file"
              type="file"
              ref={fileInput}
              onChange={(event) => setAvatar(event.target.files[0])}
            />
            <div className={classes.avatarBlock}>
              <Avatar
                src={avatarPreview}
                alt="Аватар"
                className={classes.avatar}
              />
              {avatar && <DeleteButton onClick={() => setAvatar(null)} />}
              <label htmlFor="button-file">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<PhotoCamera />}
                >
                  Загрузить
                </Button>
              </label>
            </div>
          </>
        )}
        <TextField
          name="name"
          label="Новое имя"
          value={values.userName}
          className={classes.input}
          size="small"
          variant="outlined"
          onChange={setValue("userName")}
        />
        <TextField
          name="email"
          label="Новый e-mail"
          value={values.email}
          className={classes.input}
          size="small"
          variant="outlined"
          onChange={setValue("email")}
        />
        <TextField
          name="phone"
          label="Новый телефон"
          value={values.phone}
          className={classes.input}
          size="small"
          variant="outlined"
          onChange={setValue("phone")}
        />
        {!network && (
          <TextField
            name="password"
            label="Новый пароль"
            value={values.password}
            className={classes.input}
            size="small"
            variant="outlined"
            onChange={setValue("password")}
          />
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
          type="submit"
          className={classes.input}
          variant="contained"
          color="primary"
          disabled={!areThereChanges() || loading}
        >
          Сохранить
        </Button>
        {areThereChanges() && (
          <Button
            className={classes.input}
            variant="outlined"
            color="default"
            onClick={close}
          >
            Отмена
          </Button>
        )}
      </form>
    </Paper>
  );
}

export default forwardRef((props, ref) => <EditProfile {...props} ref={ref} />);
