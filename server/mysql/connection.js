const mysql = require("mysql2");

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

const config = {
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
};

const mysqlConnection = mysql.createConnection({ ...config }).promise();

module.exports = mysqlConnection;
