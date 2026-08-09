require('dotenv').config();
const mysql = require('mysql2/promise');
const env = process.env;

(async () => {
  const host = env.DB_HOST || 'localhost';
  const port = Number(env.DB_PORT) || 3306;
  const user = env.DB_USER || 'root';
  const password = env.DB_PASSWORD || '';
  const dbName = env.DB_NAME || 'mini_erp_crm';

  try {
    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${dbName}' is ready.`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create database:', err.message || err);
    process.exit(1);
  }
})();
