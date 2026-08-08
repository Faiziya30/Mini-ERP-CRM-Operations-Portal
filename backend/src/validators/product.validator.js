const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unitPrice').isFloat({ gt: 0 }).withMessage('unitPrice must be greater than 0'),
  body('currentStock').optional().isInt({ min: 0 }).withMessage('currentStock must be >= 0'),
  body('minStockAlert').optional().isInt({ min: 0 }).withMessage('minStockAlert must be >= 0'),
  body('warehouseLocation').optional({ checkFalsy: true }).isString().withMessage('warehouseLocation must be text'),
  body('imageUrl').optional({ checkFalsy: true }).isString().withMessage('imageUrl must be text')
];

const updateProductValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product id'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('unitPrice').optional().isFloat({ gt: 0 }).withMessage('unitPrice must be greater than 0'),
  body('currentStock').optional().isInt({ min: 0 }).withMessage('currentStock must be >= 0'),
  body('minStockAlert').optional().isInt({ min: 0 }).withMessage('minStockAlert must be >= 0'),
  body('warehouseLocation').optional({ checkFalsy: true }).isString().withMessage('warehouseLocation must be text'),
  body('imageUrl').optional({ checkFalsy: true }).isString().withMessage('imageUrl must be text')
];


const productIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product id')
];

const listProductsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('lowStock')
    .optional()
    .isIn(['true', 'false', '1', '0'])
    .withMessage('lowStock must be true/false or 1/0')
];

const adjustStockValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product id'),
  body('movementType').isIn(['IN', 'OUT']).withMessage('movementType must be IN or OUT'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('reason').trim().notEmpty().withMessage('reason is required')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  listProductsValidator,
  adjustStockValidator
};
