const { sendError } = require('../utils/apiResponse');

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return sendError(res, 'Forbidden: insufficient permissions', 403);
  }

  return next();
};

module.exports = {
  authorize
};
