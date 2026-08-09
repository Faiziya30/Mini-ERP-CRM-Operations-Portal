const dotenv = require('dotenv');

dotenv.config();

// When DATABASE_URL is provided (e.g. Render managed Postgres) the individual
// DB_* keys are not required.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const requiredKeys = ['DB_NAME', 'DB_USER', 'DB_HOST', 'DB_PASSWORD', 'JWT_SECRET'];
  requiredKeys.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`[env] Missing environment variable: ${key}`);
    }
  });
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiry: process.env.JWT_EXPIRY || '1d',
  databaseUrl,
  db: {
    name: process.env.DB_NAME || 'mini_erp_crm',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: process.env.DB_STORAGE || './database.sqlite'
  }
};

