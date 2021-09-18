import { useState, useMemo, useCallback, forwardRef } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  makeStyles,
} from "@material-ui/core";

import { deleteOrder, createOrder, updateOrder } from "api/orders";
import { CloseButton } from "components/ui/buttons";

const useStyles = makeStyles({
  paper: {
    position: "absolute",
    display: "flex",
    flexFlow: "column",
    width: "420px",
    minHeight: "250px",
    left: "calc(50% - 210px)",
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
  info: {
    minHeight: "30px",
    marginTop: "15px",
    marginBottom: "15px",
  },
  infoText: {
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
  viewOnlyField: {
    display: "flex",
    flexFlow: "column",
    marginBottom: "20px",
    "&.text-field": {
      maxHeight: "300px",
      overflowY: "auto",
    },
    "&:last-child": {
      marginBottom: "0",
    },
  },
  viewOnlyFieldLabel: {
    fontWeight: "bold",
  },
  caption: {
    color: "#aaa",
    marginTop: "10px",
  },
  input: {
    width: "100%",
    marginBottom: "15px",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  deleteButton: {
    marginTop: "15px",
  },
});

function OrderForm({ mode, fields, updateMethod, close }) {
  const classes = useStyles();
  const requiredFields = useMemo(
    () => fields.filter((field) => field.required).map((field) => field.name),
    [fields]
  );
  const headerText = useMemo(() => {
    let text;
    switch (mode) {
      case "view":
        text = "Просмотр заказа";
        break;
      case "add":
        text = "Создание заказа";
        break;
      case "edit":
        text = "Редактирование заказа";
        break;
      default:
        text = "";
        break;
    }
    return text;
  }, [mode]);

  const [info, setInfo] = useState({ type: null, text: null });
  const [loading, setLoading] = useState(false);
  const [buffer, setBuffer] = useState(
    mode === "view"
      ? {}
      : fields.reduce(
          (prev, curr) => ({ ...prev, [curr.name]: curr.value || "" }),
          {}
        )
  );
  const [formState, setFormState] = useState(buffer);
  const clearInfo = () => {
    setInfo({ type: null, text: null });
  };
  const disableForm = useCallback(
    function () {
      setFormState({ ...formState, disabled: true });
    },
    [formState]
  );

  const doesDataCanBeSaved = useCallback(
    function () {
      let isDataChanged = false;
      let isRequiredDataProvided = false;
      for (let key in formState) {
        if (formState[key] !== buffer[key]) {
          isDataChanged = true;
          break;
        }
      }
      if (!isDataChanged) return false;
      for (let value of requiredFields) {
        if (!formState[value]) break;
        if (requiredFields.length - 1 === requiredFields.lastIndexOf(value)) {
          isRequiredDataProvided = true;
        }
      }
      return isDataChanged && isRequiredDataProvided;
    },
    [formState, buffer, requiredFields]
  );

  const handleResponse = useCallback(
    async (response) => {
      const { status, statusText } = response;
      if (status === 200 || status === 201) {
        await updateMethod();
      }
      let type = status === 200 || status === 201 ? "success" : "error";
      let text = "Неизвестная ошибка.";
      if (status === 200) {
        if (statusText === "Deleted") {
          text = "Заказ удалён.";
          disableForm();
        } else {
          setBuffer({ ...formState });
          text = "Заказ обновлён.";
        }
      }
      if (status === 201) {
        text = "Заказ создан.";
        disableForm();
      }
      if (status === 400) {
        text = "Не удалось получить заказ или id пользователя.";
      }
      if (status === 409) {
        text = "Лимит заказов достигнут.";
      }
      if (status === 500) {
        text = "Серверная ошибка.";
      }
      if (status === 503) {
        text = "Сервер не отвечает.";
      }
      setInfo({ type, text });
    },
    [disableForm, updateMethod, formState]
  );

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      clearInfo();
      setLoading(true);
      let response = {};
      if (mode === "add") {
        response = await createOrder({ ...formState });
      }
      if (mode === "edit") {
        response = await updateOrder({ ...formState });
      }
      await handleResponse(response);
      setLoading(false);
    },
    [formState, handleResponse, mode]
  );

  const onDelete = useCallback(async () => {
    clearInfo();
    setLoading(true);
    const response = await deleteOrder(formState.id);
    await handleResponse(response);
    setLoading(false);
  }, [handleResponse, formState.id]);

  return (
    <Box>
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.header}>
          {headerText}
          <CloseButton onClick={close} />
        </Typography>
        {mode === "view" ? (
          <div className={classes.form}>
            {fields.map((field) => {
              return (
                <Typography
                  key={field.name}
                  className={`${classes.viewOnlyField} ${field.name}`}
                >
                  <span className={classes.viewOnlyFieldLabel}>
                    {field.label}
                  </span>
                  {field.value || "—"}
                </Typography>
              );
            })}
          </div>
        ) : (
          <form className={classes.form} autoComplete="on" onSubmit={onSubmit}>
            {fields.map((field, i) => {
              if (
                field.name === "orderStatus" &&
                field.editable &&
                formState.orderStatus &&
                !formState.disabled
              ) {
                return (
                  <FormControl
                    key={field.name}
                    variant="outlined"
                    className={classes.input}
                    size="small"
                  >
                    <InputLabel
                      id="status-select-label"
                      style={{ backgroundColor: "#fff", padding: "0 5px" }}
                    >
                      Статус
                    </InputLabel>
                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      value={formState.orderStatus}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          [field.name]: event.target.value,
                        })
                      }
                    >
                      <MenuItem value="В очереди">В очереди</MenuItem>
                      <MenuItem value="Выполняем">Выполняем</MenuItem>
                      <MenuItem value="Готово">Готово</MenuItem>
                      <MenuItem value="Оплачен">Оплачен</MenuItem>
                      <MenuItem value="Отменён">Отменён</MenuItem>
                    </Select>
                  </FormControl>
                );
              }
              return (
                <TextField
                  key={field.name}
                  autoFocus={mode === "add" && i === 0}
                  disabled={!field.editable || formState.disabled}
                  name={field.name}
                  label={field.label}
                  value={formState[field.name]}
                  placeholder={field.placeholder || ""}
                  className={`${classes.input} ${field.name}`}
                  size="small"
                  variant={field.editable ? "outlined" : "standard"}
                  multiline={field.name === "orderText"}
                  rows={field.name === "orderText" ? 3 : null}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      [field.name]: event.target.value,
                    })
                  }
                />
              );
            })}
            <Box className={classes.info}>
              <Typography
                variant="body1"
                className={`${classes.infoText} ${info.type || ""}`}
              >
                {info.text}
              </Typography>
              {loading && (
                <CircularProgress size={30} className={classes.progress} />
              )}
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!doesDataCanBeSaved() || loading || formState.disabled}
            >
              {mode === "add" ? "Создать" : "Сохранить"}
            </Button>
            {buffer.orderStatus === "В очереди" && mode === "edit" && (
              <Button
                className={classes.deleteButton}
                type="button"
                variant="contained"
                color="secondary"
                onClick={onDelete}
                disabled={formState.disabled}
              >
                Удалить
              </Button>
            )}
          </form>
        )}
      </Paper>
    </Box>
  );
}

export default forwardRef((props, ref) => <OrderForm {...props} ref={ref} />);
