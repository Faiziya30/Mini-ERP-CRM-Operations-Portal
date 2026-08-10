const { Op, col, where } = require('sequelize');
const { sequelize, Product, StockMovement, User } = require('../models');
const { getLikeOp } = require('../utils/dbHelpers');

const parsePagination = (page, limit) => {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  return {
    page: parsedPage,
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit
  };
};

const isLowStockRequested = (value) => value === 'true' || value === '1';

const ensureProductExists = async (id, transaction) => {
  const product = await Product.findByPk(id, { transaction });
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

const createProduct = async (payload) => {
  const existing = await Product.findOne({ where: { sku: payload.sku } });
  if (existing) {
    const error = new Error('SKU already exists');
    error.statusCode = 409;
    throw error;
  }

  return Product.create({
    name: payload.name,
    sku: payload.sku,
    category: payload.category,
    unitPrice: payload.unitPrice,
    currentStock: payload.currentStock ?? 0,
    minStockAlert: payload.minStockAlert ?? 0,
    warehouseLocation: payload.warehouseLocation || null,
    imageUrl: payload.imageUrl || null
  });
};


const listProducts = async ({ page, limit, search, category, lowStock }) => {
  const { offset, page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const whereClause = {};

  if (search) {
    const likeOp = getLikeOp();
    whereClause[Op.or] = [
      { name: { [likeOp]: `%${search}%` } },
      { sku: { [likeOp]: `%${search}%` } },
      { category: { [likeOp]: `%${search}%` } }
    ];
  }

  if (category) {
    whereClause.category = category;
  }

  if (isLowStockRequested(lowStock)) {
    // Filter products with low stock using literal SQL for better MySQL compatibility
    const lowStockClause = sequelize.where(sequelize.literal('`currentStock` <= `minStockAlert`'));
    if (whereClause[Op.and]) {
      whereClause[Op.and].push(lowStockClause);
    } else {
      whereClause[Op.and] = [lowStockClause];
    }
  }

  const { count, rows } = await Product.findAndCountAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    offset,
    limit: safeLimit
  });

  return {
    rows,
    meta: {
      total: count,
      page: safePage,
      totalPages: Math.ceil(count / safeLimit) || 1,
      limit: safeLimit
    }
  };
};

const getProductById = async (id) => {
  const product = await ensureProductExists(id);
  return product;
};

const updateProduct = async (id, payload) => {
  const product = await ensureProductExists(id);

  if (payload.sku && payload.sku !== product.sku) {
    const existing = await Product.findOne({ where: { sku: payload.sku } });
    if (existing) {
      const error = new Error('SKU already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  await product.update(payload);
  return product;
};

const getStockLog = async (id, { page, limit }) => {
  await ensureProductExists(id);
  const { offset, page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const { count, rows } = await StockMovement.findAndCountAll({
    where: { productId: id },
    include: [
      {
        model: User,
        as: 'createdByUser',
        attributes: ['id', 'name', 'email', 'role']
      }
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit: safeLimit
  });

  return {
    rows,
    meta: {
      total: count,
      page: safePage,
      totalPages: Math.ceil(count / safeLimit) || 1,
      limit: safeLimit
    }
  };
};

const adjustStock = async (id, { movementType, quantity, reason }, userId) => {
  return sequelize.transaction(async (transaction) => {
    const product = await Product.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const qty = Number(quantity);
    let nextStock = product.currentStock;

    if (movementType === 'OUT') {
      if (product.currentStock < qty) {
        const error = new Error('Insufficient stock for adjustment');
        error.statusCode = 400;
        error.errors = [
          {
            field: 'quantity',
            message: `Available stock is ${product.currentStock}, cannot deduct ${qty}`
          }
        ];
        throw error;
      }
      nextStock -= qty;
    } else {
      nextStock += qty;
    }

    await product.update({ currentStock: nextStock }, { transaction });

    const movement = await StockMovement.create({
      productId: product.id,
      quantityChanged: qty,
      movementType,
      reason,
      createdBy: userId
    }, { transaction });

    return {
      product,
      movement
    };
  });
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  getStockLog,
  adjustStock
};
