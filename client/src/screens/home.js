import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Grid,
  Container,
  Paper,
  Typography,
  Divider,
  Chip,
  makeStyles,
} from "@material-ui/core";

import { setUser, setLoading, setInfo } from "reduxInstance/actions";
import { viaSocialNetwork } from "api/auth";
import Header from "components/header";
import FastOrder from "components/fastOrder";
import GoogleMap from "components/googleMap";
import getGreeting from "utils/greeting";
import { convertUserCredentials } from "utils/converters";

import bg from "assets/background.jpg";
import locationIcon from "assets/icons/location.svg";
import whatsappIcon from "assets/icons/whatsapp.svg";
import viberIcon from "assets/icons/viber.svg";
import telegramIcon from "assets/icons/telegram.svg";
import vkIcon from "assets/icons/vk.svg";
import okIcon from "assets/icons/ok.svg";
import phoneIcon from "assets/icons/phone.svg";

import { CONTACTS, COMPANY_INFO, SERVER } from "config";

const useStyles = makeStyles((theme) => ({
  imageBlock: {
    backgroundImage: `url(${bg})`,
    height: "120px",
    backgroundPositionX: "center",
    backgroundPositionY: "calc(50% - 130px)",
    position: "relative",
    display: "flex",
    [theme.breakpoints.only("sm")]: {
      height: "150px",
    },
    [theme.breakpoints.up("md")]: {
      height: "200px",
    },
  },
  imageOverlay: {
    position: "absolute",
    zIndex: "1",
    left: "0",
    right: "0",
    bottom: "0",
    top: "0",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  imageTitle: {
    width: "100%",
    position: "relative",
    zIndex: "2",
    color: "#fff",
    alignSelf: "center",
    textAlign: "center",
    fontSize: "1.5rem",
    [theme.breakpoints.only("sm")]: {
      fontSize: "2.1rem",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "3rem",
    },
  },
  container: {
    marginTop: "20px",
  },
  column: {
    display: "flex",
    flexFlow: "column",
    padding: "20px 30px 40px",
  },
  sectionHeader: {
    marginBottom: "20px",
  },
  contactsBlock: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "20px",
    [theme.breakpoints.only("sm")]: {
      maxWidth: "500px",
    },
  },
  contactItem: {
    marginBottom: "10px",
    marginRight: "10px",
    "&:hover": {
      textDecoration: "underline",
    },
    "&.with-icon": {
      paddingLeft: "20px",
      backgroundSize: "20px",
      backgroundPosition: "7px 50%",
      backgroundRepeat: "no-repeat",
      "&.whatsapp": {
        backgroundImage: `url(${whatsappIcon})`,
        backgroundSize: "22px",
      },
      "&.viber": {
        backgroundImage: `url(${viberIcon})`,
        backgroundSize: "18px",
      },
      "&.telegram": {
        backgroundImage: `url(${telegramIcon})`,
      },
      "&.vk": {
        backgroundImage: `url(${vkIcon})`,
      },
      "&.ok": {
        backgroundImage: `url(${okIcon})`,
      },
      "&.phone": {
        backgroundImage: `url(${phoneIcon})`,
        backgroundSize: "18px",
      },
    },
  },
  location: {
    paddingLeft: "35px",
    marginBottom: "25px",
    backgroundImage: `url(${locationIcon})`,
    backgroundSize: "contain",
    backgroundPositionX: "left",
    backgroundRepeat: "no-repeat",
  },
  copyrightBlock: {
    marginTop: "auto",
  },
  copyrightText: {
    marginTop: "10px",
    color: "#999",
    textAlign: "right",
  },
}));

function Home({ location, history }) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { hash } = location;

  const handleResponse = useCallback(
    function (response, network) {
      const { data, status } = response;
      let networkLocale, type, text;
      switch (network) {
        case "vk":
          networkLocale = "VK";
          break;
        default:
          networkLocale = "Неизвестная соцсеть";
          break;
      }
      if (status === 404) {
        type = "error";
        text = "Не можем использовать эту соцсеть для авторизации.";
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
      if (status === 200) {
        type = "success";
        text = `Вы вошли через ${networkLocale}`;
        const {
          userId,
          userName,
          email,
          phone,
          credentials: dbCredentials,
          avatar,
          regDate: dbRegDate,
          network,
        } = data;
        const credentials = convertUserCredentials(dbCredentials);
        const regDate = new Date(dbRegDate).toLocaleString();
        dispatch(
          setUser({
            userId,
            userName,
            email,
            phone,
            credentials,
            avatar: /^\/\//.test(avatar) ? `${SERVER}${avatar}` : avatar,
            regDate,
            network,
          })
        );
        history.push("/user");
      }
      dispatch(setInfo({ type, text }));
    },
    [dispatch, history]
  );

  const handleUrlHash = useCallback(
    async function () {
      if (!hash) return;
      if (!~hash.indexOf("authVia")) {
        console.log("Bad hash fragment");
        return;
      }
      const network = hash
        .match(/authVia.+?(&|$)/i)[0]
        .replace(/authVia/i, "")
        .replace(/&/, "")
        .toLowerCase();
      dispatch(setLoading(true));
      const response = await viaSocialNetwork(hash);
      handleResponse(response, network);
      dispatch(setLoading(false));
    },
    [hash, dispatch, handleResponse]
  );

  useEffect(() => {
    handleUrlHash();
  }, [handleUrlHash]);

  return (
    <>
      <Header />
      <Paper className={classes.imageBlock}>
        <div className={classes.imageOverlay} />
        <Typography
          variant="h3"
          color="secondary"
          className={classes.imageTitle}
        >
          {`${getGreeting()} Требуется ремонт?`}
        </Typography>
      </Paper>
      <Container>
        <Grid
          container
          spacing={3}
          direction="row"
          justify="center"
          className={classes.container}
        >
          <Grid item xs={12} sm={9} md={5}>
            <Paper className={classes.column}>
              <Typography variant="h5" className={classes.sectionHeader}>
                Свяжитесь с нами:
              </Typography>
              <div className={classes.contactsBlock}>
                {CONTACTS.map((contact) => {
                  return (
                    <Chip
                      key={contact.label}
                      color="primary"
                      clickable
                      component="a"
                      variant="outlined"
                      href={contact.href}
                      label={contact.label}
                      className={`${classes.contactItem} ${contact.css || ""}`}
                    />
                  );
                })}
              </div>
              <Typography variant="h5" className={classes.sectionHeader}>
                Или оставьте заявку:
              </Typography>
              <FastOrder />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={9} md={7}>
            <Paper className={classes.column}>
              <Typography variant="h5" className={classes.sectionHeader}>
                Приходите к нам:
              </Typography>
              <Typography variant="body1" className={classes.location}>
                Улица Чкалова, дом 4.
              </Typography>
              <GoogleMap />
              <div className={classes.copyrightBlock}>
                <Divider />
                <Typography variant="body2" className={classes.copyrightText}>
                  {COMPANY_INFO}
                </Typography>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Home;
