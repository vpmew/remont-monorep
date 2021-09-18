import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Modal,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  makeStyles,
} from "@material-ui/core";
import { Refresh, Add } from "@material-ui/icons";

import Header from "components/header";
import OrderForm from "components/orderForm";
import Table from "components/ui/table";
import { HomeButton } from "components/ui/buttons";
import { convertOrderStatus } from "utils/converters";
import { getOrders, createOrder, updateOrder } from "api/orders";
import { getFastOrders } from "api/fastOrders";

const useStyles = makeStyles({
  gridContainer: {
    marginTop: "20px",
    marginBottom: "40px",
  },
  section: {
    display: "flex",
    flexFlow: "column",
    justifyItems: "flex-start",
    maxHeight: "calc(100vh - 136px)",
  },
  sectionHeader: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "20px 30px",
  },
  sectionText: {
    marginRight: "auto",
  },
  info: {
    position: "absolute",
    minHeight: "30px",
    bottom: "-5px",
    right: "20px",
    "&.success": {
      color: "green",
    },
    "&.error": {
      color: "red",
    },
  },
  progress: {
    position: "absolute",
    bottom: "0px",
    left: "0",
    right: "0",
  },
  addButton: {
    marginRight: "20px",
  },
});

function getOrderFormData(order) {
  const getMonthName = (month) => {
    switch (month) {
      case 0:
        return "Января";
      case 1:
        return "Февраля";
      case 2:
        return "Марта";
      case 3:
        return "Апреля";
      case 4:
        return "Мая";
      case 5:
        return "Июня";
      case 6:
        return "Июля";
      case 7:
        return "Августа";
      case 8:
        return "Сентября";
      case 9:
        return "Октября";
      case 10:
        return "Ноября";
      case 11:
        return "Декабря";
      default:
        return "";
    }
  };
  const { text, status, price, userId } = order.view;
  const { id, time } = order.logic;
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = getMonthName(month);
  const day = date.getDate() < 10 ? "0".concat(date.getDate()) : date.getDate();
  const hh =
    date.getHours() < 10 ? "0".concat(date.getHours()) : date.getHours();
  const mm =
    date.getMinutes() < 10 ? "0".concat(date.getMinutes()) : date.getMinutes();
  const ss =
    date.getSeconds() < 10 ? "0".concat(date.getSeconds()) : date.getSeconds();
  const dateStr = `${day} ${monthName} ${year}, ${hh}:${mm}:${ss}`;
  return [
    {
      label: "Текст",
      value: text,
      name: "orderText",
      editable: true,
      required: true,
    },
    {
      label: "Статус",
      value: status,
      name: "orderStatus",
      editable: true,
      required: true,
    },
    {
      label: "Цена, ₽",
      value: price,
      name: "price",
      editable: true,
      required: false,
      placeholder: "—",
    },
    {
      label: "ID пользователя",
      value: userId,
      name: "userId",
      editable: true,
      required: true,
    },
    { label: "Дата", value: dateStr, name: "date", editable: false },
    { label: "ID заказа", value: id, name: "id", editable: false },
  ];
}
function getFastOrderFormData(order) {
  const getMonthName = (month) => {
    switch (month) {
      case 0:
        return "Января";
      case 1:
        return "Февраля";
      case 2:
        return "Марта";
      case 3:
        return "Апреля";
      case 4:
        return "Мая";
      case 5:
        return "Июня";
      case 6:
        return "Июля";
      case 7:
        return "Августа";
      case 8:
        return "Сентября";
      case 9:
        return "Октября";
      case 10:
        return "Ноября";
      case 11:
        return "Декабря";
      default:
        return "";
    }
  };
  const { userName, text, contact } = order.view;
  const { id, time } = order.logic;
  let dateStr = "—";
  if (time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = getMonthName(month);
    const day =
      date.getDate() < 10 ? "0".concat(date.getDate()) : date.getDate();
    const hh =
      date.getHours() < 10 ? "0".concat(date.getHours()) : date.getHours();
    const mm =
      date.getMinutes() < 10
        ? "0".concat(date.getMinutes())
        : date.getMinutes();
    const ss =
      date.getSeconds() < 10
        ? "0".concat(date.getSeconds())
        : date.getSeconds();
    dateStr = `${day} ${monthName} ${year}, ${hh}:${mm}:${ss}`;
  }
  return [
    { label: "Имя", value: userName, name: "userName" },
    { label: "Текст", value: text, name: "orderText" },
    { label: "Контакты", value: contact, name: "contact" },
    { label: "Дата", value: dateStr, name: "orderDate" },
    { label: "ID заказа", value: id, name: "id" },
  ];
}
function getAddFormData() {
  return [
    {
      label: "Текст заказа",
      value: "",
      name: "orderText",
      editable: true,
      required: true,
    },
    {
      label: "ID пользователя",
      value: "",
      name: "userId",
      editable: true,
      required: false,
    },
    {
      label: "Статус",
      value: "В очереди",
      name: "orderStatus",
      editable: true,
      required: true,
    },
    {
      label: "Цена, ₽",
      value: "",
      name: "price",
      editable: true,
      required: false,
    },
  ];
}

function CRM() {
  const classes = useStyles();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersInfo, setOrdersInfo] = useState({ type: null, text: null });
  function clearOrdersInfo() {
    setOrdersInfo({ type: null, text: null });
  }
  const ordersHead = [
    { id: "userId", label: "ID пользователя", style: { width: "15%" } },
    { id: "text", label: "Текст заказа", style: { width: "35%" } },
    { id: "date", label: "Дата заказа", style: { width: "20%" } },
    { id: "status", label: "Статус", style: { width: "15%" } },
    { id: "price", label: "Цена, ₽", style: { width: "15%" } },
  ];
  const ordersRows = orders.map((item) => {
    const { orderText, orderDate, orderStatus, price, id, userId } = item;
    const orderDateLocaleString = new Date(orderDate).toLocaleString();
    const view = {
      userId,
      text: orderText,
      date: orderDateLocaleString,
      status: convertOrderStatus(orderStatus),
      price,
    };
    const logic = {
      time: orderDate ? new Date(orderDate).getTime() : 0,
      id,
    };
    return {
      view,
      logic,
    };
  });

  const [fastOrders, setFastOrders] = useState([]);
  const [fastOrdersLoading, setFastOrdersLoading] = useState(false);
  const [fastOrdersInfo, setFastOrdersInfo] = useState({
    type: null,
    text: null,
  });
  function clearFastOrdersInfo() {
    setFastOrdersInfo({ type: null, text: null });
  }
  const fastOrdersHead = [
    { id: "userName", label: "Имя" },
    { id: "text", label: "Текст заказа" },
    { id: "contact", label: "Контакты" },
    { id: "date", label: "Дата заказа" },
  ];
  const fastOrdersRows = fastOrders.map((item) => {
    const { orderText, orderDate, userName, contact, id } = item;
    const orderDateLocaleString = orderDate
      ? new Date(orderDate).toLocaleString()
      : "—";
    const view = {
      userName,
      text: orderText,
      contact,
      date: orderDateLocaleString,
    };
    const logic = {
      time: orderDate ? new Date(orderDate).getTime() : 0,
      id,
    };
    return {
      view,
      logic,
    };
  });

  const [form, setForm] = useState({ mode: null, fields: null });

  const loadOrders = useCallback(async function () {
    try {
      setOrdersLoading(true);
      clearOrdersInfo();

      const { status, data } = await getOrders();

      if (status === 200) {
        setOrders(data);
      } else {
        setOrdersInfo({
          type: "error",
          text: "Не удалось загрузить данные о заказах.",
        });
      }
    } catch (error) {
      console.log(error);
    }
    setOrdersLoading(false);
  }, []);

  const loadFastOrders = useCallback(async function () {
    try {
      setFastOrdersLoading(true);
      clearFastOrdersInfo();

      const { status, data } = await getFastOrders();

      if (status === 200) {
        setFastOrders(data);
      } else {
        setFastOrdersInfo({
          type: "error",
          text: "Не удалось загрузить данные о заявках.",
        });
      }
    } catch (error) {
      console.log(error);
    }
    setFastOrdersLoading(false);
  }, []);

  function comparator(a, b, orderBy) {
    if (orderBy === "date") {
      return b.logic.time < a.logic.time
        ? -1
        : b.logic.time > a.logic.time
        ? 1
        : 0;
    }
    return b.view[orderBy] < a.view[orderBy]
      ? -1
      : b.view[orderBy] > a.view[orderBy]
      ? 1
      : 0;
  }

  useEffect(() => {
    (async function () {
      await loadOrders();
      await loadFastOrders();
    })();
  }, [loadOrders, loadFastOrders]);

  return (
    <>
      <Header />
      <Container>
        <Grid
          container
          spacing={3}
          direction="row"
          justify="center"
          alignItems="stretch"
          className={classes.gridContainer}
        >
          <Grid item xs={12} md={6} className={classes.gridItem}>
            <Paper className={classes.section}>
              <Typography variant="h5" className={classes.sectionHeader}>
                <span className={classes.sectionText}>Заказы</span>
                <Tooltip
                  arrow
                  title="Добавить заказ"
                  disableHoverListener={ordersLoading}
                >
                  <IconButton
                    aria-label="add-order"
                    onClick={() =>
                      setForm({
                        mode: "add",
                        fields: getAddFormData(),
                      })
                    }
                    disabled={ordersLoading}
                    className={classes.addButton}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  arrow
                  title="Обновить список"
                  disableHoverListener={ordersLoading}
                >
                  <IconButton
                    aria-label="update"
                    onClick={loadOrders}
                    disabled={ordersLoading}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                {ordersInfo.type && (
                  <Typography
                    variant="body2"
                    className={`${classes.info} ${ordersInfo.type || ""}`}
                  >
                    {ordersInfo.text}
                  </Typography>
                )}
                {ordersLoading && (
                  <LinearProgress className={classes.progress} />
                )}
              </Typography>
              <Table
                rows={ordersRows}
                head={ordersHead}
                initialOrderBy="date"
                descendingComparator={comparator}
                onRowClick={(order) =>
                  setForm({
                    mode: "edit",
                    fields: getOrderFormData(order),
                  })
                }
                containerStyles={{}}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} className={classes.gridItem}>
            <Paper className={classes.section}>
              <Typography variant="h5" className={classes.sectionHeader}>
                <span className={classes.sectionText}>Заявки</span>
                <Tooltip
                  arrow
                  title="Обновить список"
                  disableHoverListener={fastOrdersLoading}
                >
                  <IconButton
                    aria-label="update"
                    onClick={loadFastOrders}
                    disabled={fastOrdersLoading}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                {fastOrdersInfo.type && (
                  <Typography
                    variant="body2"
                    className={`${classes.info} ${fastOrdersInfo.type || ""}`}
                  >
                    {fastOrdersInfo.text}
                  </Typography>
                )}
                {fastOrdersLoading && (
                  <LinearProgress className={classes.progress} />
                )}
              </Typography>
              <Table
                rows={fastOrdersRows}
                head={fastOrdersHead}
                initialOrderBy="date"
                descendingComparator={comparator}
                onRowClick={(order) =>
                  setForm({
                    mode: "view",
                    fields: getFastOrderFormData(order),
                  })
                }
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <HomeButton />
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!form.mode}
        onClose={() => setForm({ mode: null, viewData: null })}
      >
        <OrderForm
          mode={form.mode}
          fields={form.fields}
          submitMethod={
            form.mode === "add"
              ? createOrder
              : form.mode === "edit"
              ? updateOrder
              : null
          }
          updateMethod={loadOrders}
          close={() => setForm({ mode: null, fields: null })}
        />
      </Modal>
    </>
  );
}

export default CRM;
