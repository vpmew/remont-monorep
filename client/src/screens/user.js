import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Modal,
  Grid,
  Avatar,
  Button,
  makeStyles,
} from "@material-ui/core";

import Header from "components/header";
import MyOrders from "components/myOrders";
import EditProfile from "components/editProfile";
import { HomeButton } from "components/ui/buttons";
import { isAdmin } from "utils/credentials";
import { logout } from "api/auth";
import { logout as clientLogout, setInfo } from "reduxInstance/actions";

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    marginTop: "20px",
  },
  column: {
    display: "flex",
    flexWrap: "wrap",
    padding: "20px 30px 40px",
  },
  avatar: {
    width: theme.spacing(9),
    height: theme.spacing(9),
  },
  nameBlock: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    width: "65%",
    marginLeft: "20px",
  },
  userName: {
    maxWidth: "80%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  adminSign: {
    marginLeft: "5px",
    padding: "0px 5px",
    backgroundColor: "#5adc5a",
    borderRadius: "5px",
    transform: "translateY(-10px)",
  },
  regDate: {
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  infoItem: {
    width: "100%",
    marginTop: "15px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  label: {
    fontWeight: "bold",
  },
  controls: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: "20px",

    "& > *": { marginLeft: "20px" },
  },
}));

function User() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const userData = useSelector((state) => state.user);
  const {
    userId,
    userName,
    avatar,
    credentials,
    email,
    phone,
    regDate,
    network,
  } = userData;

  const [editProfile, toggleEditProfile] = useState(false);

  return (
    <>
      <Header />
      <Container>
        <Grid
          container
          alignItems="flex-start"
          spacing={3}
          className={classes.gridContainer}
        >
          <Grid item xs={12} sm={8} md={5}>
            <Paper className={classes.column}>
              <Avatar src={avatar} alt={userName} className={classes.avatar} />
              <Typography variant="h6" className={classes.nameBlock}>
                <Typography variant="h6" className={classes.userName}>
                  {userName}
                </Typography>
                {isAdmin(credentials) && (
                  <Typography variant="body1" className={classes.adminSign}>
                    admin
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  className={classes.regDate}
                >{`Дата регистрации: ${regDate}`}</Typography>
              </Typography>
              <Typography variant="body1" className={classes.infoItem}>
                <span className={classes.label}>Почта: </span>
                {email || "не указана."}
              </Typography>
              <Typography variant="body1" className={classes.infoItem}>
                <span className={classes.label}>Телефон: </span>
                {phone || "не указан."}
              </Typography>
              <div className={classes.controls}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleEditProfile(true)}
                >
                  Редактировать
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    logout(network ? userId : email);
                    dispatch(clientLogout());
                    if (location.pathname !== "/") history.push("/");
                    dispatch(
                      setInfo({
                        type: "success",
                        text: "Успешно вышли из системы.",
                      })
                    );
                  }}
                >
                  Выйти
                </Button>
              </div>
              <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={editProfile}
                onClose={() => toggleEditProfile(false)}
              >
                <EditProfile
                  network={network}
                  currentAvatar={avatar}
                  credentials={credentials}
                  close={() => toggleEditProfile(false)}
                />
              </Modal>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper>
              <MyOrders />
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <HomeButton />
    </>
  );
}

export default User;
