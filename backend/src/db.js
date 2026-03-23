const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:               "localhost",
  port:               3307,
  user:               "root",
  password:           "elias123",
  database:           "dashboard_db",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL conectado");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Error conectando a MySQL:", err.message);
  });

module.exports = pool;