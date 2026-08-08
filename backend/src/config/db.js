const { Sequelize } = require('sequelize');
const env = require('./env');

let sequelize;

if (env.db.dialect === 'sqlite') {
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
    logging: false
  });
}

module.exports = sequelize;
