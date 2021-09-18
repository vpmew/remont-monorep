const uuid = require("uuid/v4");

const mysqlConnection = require("mysql/connection");
const {
  createOrder,
  updateOrder,
  getOrdersByUser,
  getAllOrders,
  deleteOrder,
  findOrder,
} = require("mysql/queries");
const getDateString = require("utils/getDateString");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  errorHandler,
} = require("utils/errors");

module.exports.create = async function (req, res) {
  try {
    let { orderText, orderStatus, price } = req.body.order;
    const userId = req.body.order.userId || req.user.userId;
    const { credentials } = req.user;
    if (!userId || !orderText) throw new BadRequestError();

    if (credentials < 10) {
      const [orders] = await mysqlConnection.query(getOrdersByUser(userId));
      const pendingOrders = orders.filter((order) => order.orderStatus === 1);
      if (pendingOrders.length >= 3) throw new ConflictError();
    }

    if (!orderStatus) orderStatus = 1;
    if (!price) price = null;
    const id = uuid();
    const orderDate = getDateString();
    await mysqlConnection.query(
      createOrder({ id, orderDate, orderText, price, orderStatus, userId })
    );
    res.sendStatus(201);
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports.update = async function (req, res) {
  try {
    const { userId, credentials } = req.user;
    let { order } = req.body;

    const [[dbOrder]] = await mysqlConnection.query(findOrder(order.id));
    if (!dbOrder) throw new NotFoundError();

    if (
      credentials >= 10 ||
      (userId === dbOrder.userId && dbOrder.orderStatus === 1)
    ) {
      await mysqlConnection.query(updateOrder(order));
      res.sendStatus(200);
    } else {
      throw new ConflictError();
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports.delete = async function (req, res) {
  try {
    const { userId, credentials } = req.user;
    let { orderId } = req.body;
    const [[dbOrder]] = await mysqlConnection.query(findOrder(orderId));
    if (!dbOrder) throw new NotFoundError();

    if (
      credentials >= 10 ||
      (userId === dbOrder.userId && dbOrder.orderStatus === 1)
    ) {
      await mysqlConnection.query(deleteOrder(orderId));
      res.statusMessage = "Deleted";
      res.sendStatus(200);
    } else {
      throw new ConflictError();
    }
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports.getAll = async function (req, res) {
  try {
    const { credentials } = req.user;
    if (credentials < 10) throw new ConflictError();
    const [orders] = await mysqlConnection.query(getAllOrders());
    res.status(200).json(orders);
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports.getOrdersByUser = async function (req, res) {
  try {
    const { userId: requestUserId, credentials } = req.user;
    const { userId } = req.params;

    if (credentials >= 10 || userId === requestUserId) {
      const [orders] = await mysqlConnection.query(getOrdersByUser(userId));
      res.status(200).json(orders);
    } else {
      throw new ConflictError();
    }
  } catch (error) {
    errorHandler(error, res);
  }
};
