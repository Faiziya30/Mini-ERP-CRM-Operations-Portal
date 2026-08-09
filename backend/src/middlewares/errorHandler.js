const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, message, statusCode, err.errors);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
