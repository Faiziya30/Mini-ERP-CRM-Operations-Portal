const { Op } = require('sequelize');
const { sequelize, Customer, Product, SalesChallan } = require('../models');

const getStats = async () => {
  const totalCustomers = await Customer.count({
    where: { isDeleted: false }
  });

  const lowStockProducts = await Product.count({
    where: sequelize.where(
      sequelize.col('currentStock'),
      '<=',
      sequelize.col('minStockAlert')
    )
  });

  const draftChallans = await SalesChallan.count({
    where: { status: 'Draft' }
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const confirmedThisMonth = await SalesChallan.count({
    where: {
      status: 'Confirmed',
      createdAt: { [Op.gte]: startOfMonth }
    }
  });

  const recentChallans = await SalesChallan.findAll({
    include: [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'businessName']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  return {
    totalCustomers,
    lowStockProducts,
    draftChallans,
    confirmedThisMonth,
    recentChallans
  };
};

module.exports = {
  getStats
};
