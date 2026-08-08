const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
