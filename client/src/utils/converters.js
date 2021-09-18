function convertOrderStatus(status, reverse = false) {
  if (reverse) {
    let code;
    switch (status) {
      case "В очереди":
        code = 1;
        break;
      case "Выполняем":
        code = 10;
        break;
      case "Готово":
        code = 11;
        break;
      case "Оплачен":
        code = 100;
        break;
      case "Отменён":
        code = 111;
        break;
      default:
        code = 0;
        break;
    }
    return code;
  }
  let string;
  switch (status) {
    case 1:
      string = "В очереди";
      break;
    case 10:
      string = "Выполняем";
      break;
    case 11:
      string = "Готово";
      break;
    case 100:
      string = "Оплачен";
      break;
    case 111:
      string = "Отменён";
      break;
    default:
      string = "Неизвестно";
      break;
  }
  return string;
}

function convertUserCredentials(value) {
  let string;
  switch (value) {
    case 1:
      string = "user";
      break;
    case 11:
      string = "admin";
      break;
    default:
      string = "guest";
      break;
  }
  return string;
}

export { convertOrderStatus, convertUserCredentials };
