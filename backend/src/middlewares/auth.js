const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const { sendError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 'Unauthorized: token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return sendError(res, 'Unauthorized: invalid user', 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (error) {
    return sendError(res, 'Unauthorized: invalid or expired token', 401);
  }
};

module.exports = {
  authenticate
};
