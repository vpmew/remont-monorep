import { useHistory } from "react-router-dom";
import { Container, Typography, Button, makeStyles } from "@material-ui/core";

import Header from "components/header";

const useStyles = makeStyles({
  container: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#aaa",
    textAlign: "center",
  },
  homeLink: {
    marginTop: "20px",
  },
});

function MockPage({ text = "У вас нет доступа к этой странице" }) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <>
      <Header withoutMenu />
      <Container className={classes.container}>
        <Typography className={classes.text} variant="h2">
          {text}
        </Typography>
        <Button
          className={classes.homeLink}
          onClick={() => history.push("/")}
          color="primary"
        >
          Вернуться на главную
        </Button>
      </Container>
    </>
  );
}

export default MockPage;
