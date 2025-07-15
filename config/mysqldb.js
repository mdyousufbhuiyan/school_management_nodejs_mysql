const mysql = require("mysql");
const config = require("./config.json");

var connection = mysql.createConnection({
  host: config.host,
  user: config.user_name,
  password: config.password,
  database: config.db_name,
  port: config.db_port,
  connectionLimit: 10,  // Maximum number of connections in the pool
  waitForConnections: true,  // If pool is full, wait for a connection to become available
  queueLimit: 0,
  dateStrings: true
});

connection.connect(function (err) {
  if (err) {
    console.log(`error: ${err}`);
  } else console.log(`success: ${connection.state}`);
});

module.exports = connection;
