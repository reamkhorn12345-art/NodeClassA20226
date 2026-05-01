import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();
// connect to database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  authPlugins: {
    mysql_native_password: () => () => {}
  }
});

const promisePool = pool.promise();

// DB test function (safe way)
const testConnection = async () => {
  try {
    const conn = await promisePool.getConnection();
    console.log('✅ Database connected');
    conn.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testConnection();

export default promisePool;