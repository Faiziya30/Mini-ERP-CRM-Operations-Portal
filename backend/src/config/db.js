const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

let sequelize;

const commonOptions = {
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
};

if (env.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.db.storage,
    logging: false
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, commonOptions);
}

// Try authenticating immediately and log result (non-blocking)
sequelize.authenticate()
  .then(() => logger.info(`Database connection (${env.db.dialect}) established.`))
  .catch((err) => logger.error('Database connection failed:', err));

module.exports = sequelize;
