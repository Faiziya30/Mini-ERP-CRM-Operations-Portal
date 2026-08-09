const { Op } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Returns the appropriate LIKE operator for the current database dialect.
 * PostgreSQL LIKE is case-sensitive, so we use ILIKE for case-insensitive search.
 * MySQL LIKE is already case-insensitive by default.
 */
const getLikeOp = () => {
  const dialect = sequelize.getDialect();
  return dialect === 'postgres' ? Op.iLike : Op.like;
};

module.exports = { getLikeOp };
