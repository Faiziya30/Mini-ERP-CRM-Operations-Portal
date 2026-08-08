const { body, param, query } = require('express-validator');

const challanItemRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one challan item is required'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Each item must have a valid productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be greater than 0')
];

const createChallanValidator = [
  body('customerId').isInt({ min: 1 }).withMessage('customerId is required'),
  ...challanItemRules
];

const updateChallanValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid challan id'),
  body('customerId').isInt({ min: 1 }).withMessage('customerId is required'),
  ...challanItemRules
];

const challanIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid challan id')
];

const listChallansValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(['Draft', 'Confirmed', 'Cancelled']).withMessage('Invalid status filter'),
  query('customerId').optional().isInt({ min: 1 }).withMessage('customerId must be valid'),
  query('startDate').optional().isISO8601().withMessage('startDate must be valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be valid date')
];

module.exports = {
  createChallanValidator,
  updateChallanValidator,
  challanIdValidator,
  listChallansValidator
};
