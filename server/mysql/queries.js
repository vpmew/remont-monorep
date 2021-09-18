module.exports = {
  createUser(userName, email, hashedPass, regDate) {
    return `INSERT INTO users (userName, email, pass, credentials, regDate) VALUES ('${userName}', '${email}', '${hashedPass}', 1, '${regDate}')`;
  },
  getUserData(email, attrs) {
    attrs = !attrs ? "*" : attrs;
    return `SELECT ${attrs} FROM users WHERE email='${email}'`;
  },
  setUserData(userId, data = {}, socialNetwork) {
    let changingAttrs = "";
    let i = 0;
    let dataLength = Object.keys(data).length;
    for (let key in data) {
      ++i;
      changingAttrs += data[key] ? `${key} = '${data[key]}'` : `${key} = NULL`;
      if (i < dataLength) changingAttrs += ", ";
    }
    const table = socialNetwork ? "social_networks_users" : "users";
    const idType = socialNetwork ? "userId" : "email";
    return `UPDATE ${table} SET ${changingAttrs} WHERE ${idType} = '${userId}'`;
  },
  addRefreshToken(token, userId, dateOfCreating) {
    return `INSERT INTO refresh_tokens (token, userId, dateOfCreating) VALUES ('${token}','${userId}', '${dateOfCreating}')`;
  },
  deleteRefreshToken(token) {
    return `DELETE from refresh_tokens WHERE token='${token}'`;
  },
  getRefreshToken(token) {
    return `SELECT * FROM refresh_tokens WHERE token='${token}'`;
  },
  getSocialNetworkUserData(userId, attrs) {
    attrs = !attrs ? "*" : attrs;
    return `SELECT ${attrs} FROM social_networks_users WHERE userId='${userId}'`;
  },
  createSocialNetworkUser(user = {}) {
    const keys = Object.keys(user);
    if (keys.length < 8) throw new Error("Invalid user object");
    const values = Object.values(user);
    const valuesString = values
      .map((value) => {
        return value ? `'${value}'` : "NULL";
      })
      .join(", ");
    return `INSERT INTO social_networks_users (${keys.join(
      ", "
    )}) VALUES (${valuesString})`;
  },

  // ORDERS
  getFastOrders() {
    return "SELECT * FROM fast_orders";
  },
  checkFpAndIp(fp, ip) {
    return `SELECT * FROM fast_orders WHERE fingerprint='${fp}' AND ip='${ip}'`;
  },
  createFastOrder(order = {}) {
    const keys = Object.keys(order);
    if (keys.length < 7) throw new Error("Invalid order object");
    const values = Object.values(order)
      .map((value) => {
        return `'${value}'`;
      })
      .join(", ");
    return `INSERT INTO fast_orders (${keys.join(", ")}) VALUES (${values})`;
  },
  createOrder(order = {}) {
    const keys = Object.keys(order);
    if (keys.length < 6) throw new Error("Invalid order object");
    const values = Object.values(order)
      .map((value) => {
        return value ? `'${value}'` : "NULL";
      })
      .join(", ");
    return `INSERT INTO orders (${keys.join(", ")}) VALUES (${values})`;
  },
  updateOrder(order) {
    const { id } = order;
    if (!id) throw new Error("Order's ID not found");
    let changingAttrs = "";
    let dataLength = Object.keys(order).length;
    let i = 0;
    for (let key in order) {
      ++i;
      changingAttrs += order[key]
        ? `${key} = '${order[key]}'`
        : `${key} = NULL`;
      if (i < dataLength) changingAttrs += ", ";
    }
    return `UPDATE orders SET ${changingAttrs} WHERE id='${id}'`;
  },
  findOrder(id) {
    return `SELECT * FROM orders WHERE id='${id}'`;
  },
  deleteOrder(id) {
    return `DELETE from orders WHERE id='${id}'`;
  },
  getOrdersByUser(userId) {
    return `SELECT * FROM orders WHERE userId='${userId}'`;
  },
  getAllOrders() {
    return "SELECT * FROM orders";
  },
};
