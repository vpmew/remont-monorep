function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month =
    now.getMonth() + 1 < 10
      ? "0".concat(now.getMonth() + 1)
      : now.getMonth() + 1;
  const date = now.getDate() < 10 ? "0".concat(now.getDate()) : now.getDate();
  const hours =
    now.getHours() < 10 ? "0".concat(now.getHours()) : now.getHours();
  const minutes =
    now.getMinutes() < 10 ? "0".concat(now.getMinutes()) : now.getMinutes();
  const seconds =
    now.getSeconds() < 10 ? "0".concat(now.getSeconds()) : now.getSeconds();
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

module.exports = getDateString;
