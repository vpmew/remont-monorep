const getGreeting = () => {
  const dayTime = new Date().getHours();
  if (dayTime >= 18) {
    return "Добрый вечер.";
  } else if (dayTime >= 12) {
    return "Добрый день.";
  } else if (dayTime >= 6) {
    return "Доброе утро.";
  } else {
    return "Здравствуйте.";
  }
};

export default getGreeting;
