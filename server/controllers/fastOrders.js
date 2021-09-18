const uuid = require("uuid/v4");

const mysqlConnection = require("mysql/connection");
const {
  createFastOrder,
  getFastOrders,
  checkFpAndIp,
} = require("mysql/queries");
const getDateString = require("utils/getDateString");
const {
  ConflictError,
  BadRequestError,
  errorHandler,
} = require("utils/errors");

module.exports.getFastOrders = async function (req, res) {
  try {
    const { credentials } = req.user;
    if (credentials < 10) throw new ConflictError();
    const [orders] = await mysqlConnection.query(getFastOrders());
    res.status(200).json(orders);
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports.createFastOrder = async function (req, res) {
  try {
    const id = uuid();
    const orderDate = getDateString();
    const { values, fingerprint } = req.body;
    const { ip } = req;
    if (!ip || !fingerprint) throw new BadRequestError();
    const order = { id, orderDate, ...values, fingerprint, ip };
    const [result] = await mysqlConnection.query(checkFpAndIp(fingerprint, ip));
    if (result.length >= 3) throw new ConflictError();
    await mysqlConnection.query(createFastOrder(order));
    res.sendStatus(201);
  } catch (error) {
    errorHandler(error, res);
  }
};
