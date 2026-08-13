const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'taskapp',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000, // release idle connections after 60s
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds keep-alive heartbeat to prevent TiDB connection drop
  connectTimeout: 30000, // 30 seconds connection timeout
});

// Utility to test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('⚡ Connected successfully to TiDB Cloud Database');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ TiDB Database Connection Failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
};
