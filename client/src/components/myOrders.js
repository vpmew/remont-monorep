import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Typography,
  IconButton,
  LinearProgress,
  Tooltip,
  Modal,
  makeStyles,
} from "@material-ui/core";
import { Refresh, Add } from "@material-ui/icons";

import { getOrdersByUser } from "api/orders";
import { setMyOrders } from "reduxInstance/actions";
import OrderForm from "./orderForm";
import Table from "./ui/table";
import { convertOrderStatus } from "utils/converters";
import { isAdmin } from "utils/credentials";

const useStyles = makeStyles((theme) => ({
  sectionHeader: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "20px 30px",
  },
  addButton: {
    marginLeft: "auto",
    marginRight: "20px",
  },
  progress: {
    bottom: "0px",
    left: "0",
    right: "0",
    position: "absolute",
  },
  info: {
    position: "absolute",
    bottom: "-5px",
    right: "20px",
    minHeight: "30px",
    "&.success": {
      color: "green",
    },
    "&.warning": {
      color: "orange",
    },
    "&.error": {
      color: "red",
    },
  },
}));

function MyOrders() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const myOrders = useSelector((state) => state.myOrders);

  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({ mode: null, fields: null });
  const [info, setInfo] = useState({ type: null, text: null });
  const clearInfo = () => {
    setInfo({ type: null, text: null });
  };

  const credentials = useMemo(() => userData.credentials, [userData]);
  const userId = useMemo(
    () => (userData.network ? userData.userId : userData.email),
    [userData]
  );
  const isLimitReached = useMemo(() => {
    if (!myOrders) return;
    const pendingOrders = myOrders.filter((order) => order.orderStatus === 1);
    return pendingOrders.length >= 3;
  }, [myOrders]);

  const tableHead = useMemo(
    () => [
      { id: "text", label: "Текст заказа", style: { width: "30%" } },
      { id: "date", label: "Дата заказа", style: { width: "35%" } },
      { id: "status", label: "Статус", style: { width: "20%" } },
      { id: "price", label: "Цена, ₽", style: { width: "10%" } },
    ],
    []
  );
  const tableRows = useMemo(() => {
    if (!myOrders) return [];
    return myOrders.map((item) => {
      const { orderText, orderDate, orderStatus, price, id } = item;
      const orderDateLocaleString = new Date(orderDate).toLocaleString();
      const view = {
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
  }, [myOrders]);
  const comparator = useCallback((a, b, orderBy) => {
    if (orderBy === "date") {
      return b.logic.time < a.logic.time ? -1 : 1;
    }
    return b.view[orderBy] < a.view[orderBy]
      ? -1
      : b.view[orderBy] > a.view[orderBy]
      ? 1
      : 0;
  }, []);
  const getOrderData = useCallback((order) => {
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
    const { text, status, price, id, time } = order;
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
    const dateStr = `${day} ${monthName} ${year}, ${hh}:${mm}:${ss}`;
    return [
      {
        label: "Текст",
        value: text,
        name: "orderText",
        editable: true,
        required: true,
      },
      { label: "Дата", value: dateStr, name: "date" },
      { label: "Статус", value: status, name: "orderStatus" },
      { label: "Цена, ₽", value: price, name: "price" },
      { label: "ID заказа", value: id, name: "id" },
    ];
  }, []);

  const handleLimit = useCallback(() => {
    if (isLimitReached) {
      setInfo({
        type: "warning",
        text: "Максимальное количество ожидающих заказов — 3.",
      });
    } else {
      setInfo({
        type: null,
        text: null,
      });
    }
  }, [isLimitReached]);

  const getOrders = useCallback(
    async function () {
      try {
        setLoading(true);
        clearInfo();
        const { data, status } = await getOrdersByUser(userId);
        if (status === 200) {
          dispatch(setMyOrders(data));
          if (!isAdmin(credentials)) handleLimit();
        } else {
          setInfo({
            type: "error",
            text: "Не удалось загрузить данные о заказах.",
          });
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    },
    [dispatch, userId, handleLimit, credentials]
  );

  useEffect(getOrders, [getOrders]);
  useEffect(() => {
    if (!isAdmin(credentials)) {
      handleLimit();
    }
  }, [credentials, handleLimit]);

  return (
    <>
      <Typography variant="h5" className={classes.sectionHeader}>
        Мои заказы
        <Tooltip arrow title="Добавить заказ" disableHoverListener={loading}>
          <IconButton
            aria-label="add-order"
            onClick={() =>
              setOrderForm({
                mode: "add",
                fields: [
                  {
                    label: "Текст заказа",
                    value: "",
                    name: "orderText",
                    editable: true,
                    required: true,
                  },
                ],
              })
            }
            disabled={isAdmin(credentials) ? false : loading || isLimitReached}
            className={classes.addButton}
          >
            <Add />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Обновить список" disableHoverListener={loading}>
          <IconButton
            aria-label="update"
            onClick={getOrders}
            disabled={loading}
            className={classes.loadButton}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
        {info.type && (
          <Typography
            variant="body2"
            className={`${classes.info} ${info.type || ""}`}
          >
            {info.text}
          </Typography>
        )}
        {loading && <LinearProgress className={classes.progress} />}
      </Typography>
      <Table
        rows={tableRows}
        head={tableHead}
        initialOrderBy="date"
        descendingComparator={comparator}
        onRowClick={(row) => {
          const order = { ...row.view, ...row.logic };
          const mode = order.status === "В очереди" ? "edit" : "view";
          setOrderForm({
            mode,
            fields: getOrderData(order),
          });
        }}
      />
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!orderForm.mode}
        onClose={() => setOrderForm({ mode: null, fields: null })}
      >
        <OrderForm
          mode={orderForm.mode}
          fields={orderForm.fields}
          updateMethod={getOrders}
          close={() => setOrderForm({ mode: null, fields: null })}
        />
      </Modal>
    </>
  );
}

export default MyOrders;
