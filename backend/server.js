const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize, User } = require('./src/models');
const { seedData } = require('./src/utils/seed');
const logger = require('./src/utils/logger');

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const userCount = await User.count();
    if (userCount === 0) {
      logger.info('Database empty. Running initial seed data...');
      await seedData();
      logger.info('Initial seed data auto-populated.');
    }

    app.listen(env.port, () => {
      logger.info(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
