const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Single TiDB Cloud MySQL Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'taskapp',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

module.exports = {
  pool,
  mysqlPool: pool,
};

