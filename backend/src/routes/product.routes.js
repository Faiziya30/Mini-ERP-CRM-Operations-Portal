const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const validateRequest = require('../middlewares/validate');
const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  listProductsValidator,
  adjustStockValidator
} = require('../validators/product.validator');

const { uploadProductImage } = require('../middlewares/upload');

const router = express.Router();

router.use(authenticate);

router.post(
  '/upload-image',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  uploadProductImage.single('image'),
  productController.uploadImage
);

router.post(
  '/',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  createProductValidator,
  validateRequest,
  productController.createProduct
);

router.get(
  '/',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  listProductsValidator,
  validateRequest,
  productController.listProducts
);

router.get(
  '/:id',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  productIdValidator,
  validateRequest,
  productController.getProductById
);

router.put(
  '/:id',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  updateProductValidator,
  validateRequest,
  productController.updateProduct
);

router.get(
  '/:id/stock-log',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  productIdValidator,
  validateRequest,
  productController.getStockLog
);

router.post(
  '/:id/stock',
  authorize('admin', 'warehouse', 'sales', 'accounts'),
  adjustStockValidator,
  validateRequest,
  productController.adjustStock
);

module.exports = router;
