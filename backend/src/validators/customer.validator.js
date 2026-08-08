const { body, param, query } = require('express-validator');

const createCustomerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').trim().notEmpty().withMessage('Mobile is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('gstNumber').optional({ checkFalsy: true }).trim(),
  body('customerType')
    .isIn(['Retail', 'Wholesale', 'Distributor'])
    .withMessage('Invalid customer type'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('status').optional().isIn(['Lead', 'Active', 'Inactive']).withMessage('Invalid status'),
  body('followUpDate').optional({ checkFalsy: true }).isISO8601().withMessage('followUpDate must be a valid date'),
  body('notes').optional({ checkFalsy: true }).isString().withMessage('Notes must be text')
];

const updateCustomerValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer id'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('mobile').optional().trim().notEmpty().withMessage('Mobile cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('customerType').optional().isIn(['Retail', 'Wholesale', 'Distributor']).withMessage('Invalid customer type'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('status').optional().isIn(['Lead', 'Active', 'Inactive']).withMessage('Invalid status'),
  body('followUpDate').optional({ checkFalsy: true }).isISO8601().withMessage('followUpDate must be a valid date'),
  body('notes').optional({ checkFalsy: true }).isString().withMessage('Notes must be text')
];

const customerIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer id')
];

const addFollowUpValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer id'),
  body('note').trim().notEmpty().withMessage('Note is required'),
  body('followUpDate').isISO8601().withMessage('followUpDate is required and must be valid')
];

const listCustomersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(['Lead', 'Active', 'Inactive']).withMessage('Invalid status filter'),
  query('customerType').optional().isIn(['Retail', 'Wholesale', 'Distributor']).withMessage('Invalid customer type filter')
];

module.exports = {
  createCustomerValidator,
  updateCustomerValidator,
  customerIdValidator,
  addFollowUpValidator,
  listCustomersValidator
};
