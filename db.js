const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let retries = 5;
const delay = 3000; // 3 seconds
let hasLoggedSuccess = false;

function getDB() {
  return new Promise((resolve, reject) => {
    function tryConnection() {
      pool.getConnection((err, connection) => {
        if (err) {
          console.error(`❌ DB connection failed: ${err.message}`);
          if (retries > 0) {
            retries--;
            console.log(`🔁 Retrying in ${delay / 1000}s... (${retries} retries left)`);
            setTimeout(tryConnection, delay);
          } else {
            console.error("❌ All DB connection attempts failed.");
            reject(err);
          }
        } else {
          if (!hasLoggedSuccess) {
            console.log("✅ MySQL pool connected successfully.");
            hasLoggedSuccess = true;
          }
          connection.release(); // release test connection
          resolve(pool); // resolve with pool itself
        }
      });
    }

    tryConnection();
  });
}

module.exports = getDB;
