const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

let sequelize;

const commonPool = {
  max: 20,
  min: 0,
  acquire: 60000,
  idle: 20000
};

if (env.databaseUrl) {
  // Production path — allow a full DATABASE_URL while respecting the configured dialect.
  sequelize = new Sequelize(env.databaseUrl, {
    dialect: env.db.dialect,
    logging: false,
    pool: commonPool,
    dialectOptions: env.db.dialect === 'postgres' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
} else if (env.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.db.storage,
    logging: false
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: env.db.dialect,
    logging: false,
    pool: commonPool
  });
}

// Try authenticating immediately and log result (non-blocking)
const dialectLabel = env.databaseUrl ? env.db.dialect : env.db.dialect;
sequelize.authenticate()
  .then(() => logger.info(`Database connection (${dialectLabel}) established.`))
  .catch((err) => logger.error('Database connection failed:', err));

module.exports = sequelize;
