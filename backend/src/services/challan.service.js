const { Op } = require('sequelize');
const {
  sequelize,
  Customer,
  Product,
  SalesChallan,
  ChallanItem,
  StockMovement,
  User
} = require('../models');
const generateChallanNo = require('../utils/generateChallanNo');

const parsePagination = (page, limit) => {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  return {
    page: parsedPage,
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit
  };
};

const ensureCustomerExists = async (customerId, transaction) => {
  const customer = await Customer.findOne({
    where: { id: customerId, isDeleted: false },
    transaction
  });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

const ensureProductsExist = async (items, transaction) => {
  const productIds = [...new Set(items.map((item) => Number(item.productId)))];
  const products = await Product.findAll({
    where: { id: productIds },
    transaction
  });

  if (products.length !== productIds.length) {
    const found = new Set(products.map((product) => product.id));
    const missing = productIds.filter((id) => !found.has(id));
    const error = new Error('Some products were not found');
    error.statusCode = 400;
    error.errors = missing.map((id) => ({
      field: 'items',
      message: `Product ${id} does not exist`
    }));
    throw error;
  }

  const map = new Map(products.map((product) => [product.id, product]));
  return map;
};

const buildSnapshotItems = (items, productMap, challanId) => {
  return items.map((item) => {
    const product = productMap.get(Number(item.productId));
    return {
      challanId,
      productId: product.id,
      productNameSnapshot: product.name,
      productSkuSnapshot: product.sku,
      unitPriceSnapshot: product.unitPrice,
      quantity: Number(item.quantity)
    };
  });
};

const sumQuantity = (items) => items.reduce((acc, item) => acc + Number(item.quantity), 0);

const createChallan = async ({ customerId, items }, userId) => {
  return sequelize.transaction(async (transaction) => {
    await ensureCustomerExists(customerId, transaction);
    const productMap = await ensureProductsExist(items, transaction);

    const challanNumber = await generateChallanNo(transaction);

    const challan = await SalesChallan.create({
      challanNumber,
      customerId,
      totalQuantity: sumQuantity(items),
      status: 'Draft',
      createdBy: userId
    }, { transaction });

    const challanItems = buildSnapshotItems(items, productMap, challan.id);
    await ChallanItem.bulkCreate(challanItems, { transaction });

    return challan;
  });
};

const updateChallan = async (id, { customerId, items }) => {
  return sequelize.transaction(async (transaction) => {
    const challan = await SalesChallan.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!challan) {
      const error = new Error('Challan not found');
      error.statusCode = 404;
      throw error;
    }

    if (challan.status !== 'Draft') {
      const error = new Error('Only draft challans can be edited');
      error.statusCode = 400;
      throw error;
    }

    await ensureCustomerExists(customerId, transaction);
    const productMap = await ensureProductsExist(items, transaction);

    await challan.update({
      customerId,
      totalQuantity: sumQuantity(items)
    }, { transaction });

    await ChallanItem.destroy({ where: { challanId: challan.id }, transaction });
    const challanItems = buildSnapshotItems(items, productMap, challan.id);
    await ChallanItem.bulkCreate(challanItems, { transaction });

    return challan;
  });
};

const confirmChallan = async (id, userId) => {
  return sequelize.transaction(async (transaction) => {
    const challan = await SalesChallan.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!challan) {
      const error = new Error('Challan not found');
      error.statusCode = 404;
      throw error;
    }

    if (challan.status !== 'Draft') {
      const error = new Error('Only draft challans can be confirmed');
      error.statusCode = 400;
      throw error;
    }

    const items = await ChallanItem.findAll({
      where: { challanId: challan.id },
      transaction
    });

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await Product.findAll({
      where: { id: productIds },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    const stockErrors = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        stockErrors.push({
          productId: item.productId,
          productSku: item.productSkuSnapshot,
          productName: item.productNameSnapshot,
          requested: item.quantity,
          available: 0,
          message: 'Product no longer exists'
        });
        continue;
      }

      if (product.currentStock < item.quantity) {
        stockErrors.push({
          productId: product.id,
          productSku: product.sku,
          productName: product.name,
          requested: item.quantity,
          available: product.currentStock,
          message: `Insufficient stock for ${product.name}`
        });
      }
    }

    if (stockErrors.length) {
      const error = new Error('Insufficient stock for one or more items');
      error.statusCode = 400;
      error.errors = stockErrors;
      throw error;
    }

    for (const item of items) {
      const product = productMap.get(item.productId);
      await product.update({ currentStock: product.currentStock - item.quantity }, { transaction });

      await StockMovement.create({
        productId: product.id,
        quantityChanged: item.quantity,
        movementType: 'OUT',
        reason: `Sales Challan #${challan.challanNumber}`,
        createdBy: userId
      }, { transaction });
    }

    await challan.update({ status: 'Confirmed' }, { transaction });

    return challan;
  });
};

const cancelChallan = async (id, userId) => {
  return sequelize.transaction(async (transaction) => {
    const challan = await SalesChallan.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!challan) {
      const error = new Error('Challan not found');
      error.statusCode = 404;
      throw error;
    }

    if (challan.status === 'Cancelled') {
      const error = new Error('Challan is already cancelled');
      error.statusCode = 400;
      throw error;
    }

    if (challan.status === 'Confirmed') {
      const items = await ChallanItem.findAll({
        where: { challanId: challan.id },
        transaction
      });

      const productIds = [...new Set(items.map((item) => item.productId))];
      const products = await Product.findAll({
        where: { id: productIds },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      const productMap = new Map(products.map((product) => [product.id, product]));

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          continue;
        }

        await product.update({ currentStock: product.currentStock + item.quantity }, { transaction });

        await StockMovement.create({
          productId: product.id,
          quantityChanged: item.quantity,
          movementType: 'IN',
          reason: `Challan Cancelled #${challan.challanNumber}`,
          createdBy: userId
        }, { transaction });
      }
    }

    await challan.update({ status: 'Cancelled' }, { transaction });
    return challan;
  });
};

const listChallans = async ({ page, limit, status, customerId, startDate, endDate }) => {
  const { offset, page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (customerId) {
    whereClause.customerId = Number(customerId);
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt[Op.lte] = end;
    }
  }

  const { count, rows } = await SalesChallan.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'mobile', 'businessName']
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

const getChallanById = async (id) => {
  const challan = await SalesChallan.findByPk(id, {
    include: [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'mobile', 'businessName', 'address']
      },
      {
        model: User,
        as: 'createdByUser',
        attributes: ['id', 'name', 'email', 'role']
      },
      {
        model: ChallanItem,
        as: 'items'
      }
    ],
    order: [[{ model: ChallanItem, as: 'items' }, 'createdAt', 'ASC']]
  });

  if (!challan) {
    const error = new Error('Challan not found');
    error.statusCode = 404;
    throw error;
  }

  return challan;
};

module.exports = {
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
  listChallans,
  getChallanById
};
