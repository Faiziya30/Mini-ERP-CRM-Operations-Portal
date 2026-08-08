const productService = require('../services/product.service');
const { sendSuccess } = require('../utils/apiResponse');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    return sendSuccess(res, result.rows, 'Products fetched successfully', 200, result.meta);
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(Number(req.params.id));
    return sendSuccess(res, product, 'Product fetched successfully');
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(Number(req.params.id), req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    return next(error);
  }
};

const getStockLog = async (req, res, next) => {
  try {
    const result = await productService.getStockLog(Number(req.params.id), req.query);
    return sendSuccess(res, result.rows, 'Stock movements fetched successfully', 200, result.meta);
  } catch (error) {
    return next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const result = await productService.adjustStock(Number(req.params.id), req.body, req.user.id);
    return sendSuccess(res, result, 'Stock adjusted successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  getStockLog,
  adjustStock
};
