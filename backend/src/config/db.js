const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

let sequelize;

if (env.databaseUrl) {
  // Production path — Render provides DATABASE_URL for managed PostgreSQL
  sequelize = new Sequelize(env.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 20000
    }
  });
} else if (env.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.db.storage,
    logging: false
  });
} else {
  // Local MySQL / other dialect
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: env.db.dialect,
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 20000
    }
  });
}

// Try authenticating immediately and log result (non-blocking)
const dialectLabel = env.databaseUrl ? 'postgres (DATABASE_URL)' : env.db.dialect;
sequelize.authenticate()
  .then(() => logger.info(`Database connection (${dialectLabel}) established.`))
  .catch((err) => logger.error('Database connection failed:', err));

module.exports = sequelize;
