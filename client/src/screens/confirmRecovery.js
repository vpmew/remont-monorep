import { useHistory, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import queryString from "query-string";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";

import Header from "components/header";
import { confirmRecovery } from "api/user";

const useStyles = makeStyles({
  container: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    justifyContent: "center",
    "& > *": {
      marginBottom: "20px",
    },
  },
  infoBox: {
    height: "100px",
  },
  responseType: {
    marginBottom: "10px",
    color: "#aaa",
  },
  responseText: {
    whiteSpace: "pre-wrap",
  },
  progress: {
    display: "block",
    margin: "0 auto",
  },
});

function ConfirmRecovery() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ type: null, text: null });
  const [expired, setExpired] = useState(false);

  const { token, pass } = queryString.parse(location.search);

  const request = useCallback(async () => {
    setLoading(true);
    if (!token || !pass) {
      setResult({
        type: "fail",
        text: "Проверьте, что ссылка в адресной строке указана без ошибок, как в письме.",
      });
    } else {
      const { status, message } = await confirmRecovery(token, pass);
      let messageForUser;
      switch (message) {
        case "jwt expired":
          setExpired(true);
          messageForUser = "Истёк срок действия ссылки восстановления.";
          break;
        case "invalid signature":
          messageForUser = "Ссылка недействительна или указана с ошибкой.";
          break;
        default:
          messageForUser = message;
          break;
      }
      if (status === 200) {
        setResult({
          type: "success",
          text: "Пароль изменён. Можете перейти на главную и войти на сайт.",
        });
      } else {
        setResult({
          type: "fail",
          text: `Не удалось применить изменения.\nОшибка ${status}: ${messageForUser}`,
        });
      }
    }
    setTimeout(() => setLoading(false), 1000);
  }, [pass, token]);

  useEffect(() => request(), [request]);

  return (
    <>
      <Header withoutMenu />
      <Container className={classes.container}>
        <Box className={classes.infoBox}>
          {loading ? (
            <CircularProgress size={50} className={classes.progress} />
          ) : (
            <>
              <Typography className={classes.responseType} variant="h4">
                {result.type === "success" ? "Готово!" : "Ошибка :("}
              </Typography>
              <Typography variant="body1" className={classes.responseText}>
                {result.text}
              </Typography>
            </>
          )}
        </Box>
        <>
          <Button onClick={() => history.push("/")} color="primary">
            Вернуться на главную
          </Button>
          {result.type === "fail" && token && pass && (
            <Button
              onClick={expired ? () => history.push("/recovery") : request}
              color="primary"
              disabled={loading}
            >
              {expired ? "Создать новый запрос" : "Повторить"}
            </Button>
          )}
        </>
      </Container>
    </>
  );
}

export default ConfirmRecovery;
