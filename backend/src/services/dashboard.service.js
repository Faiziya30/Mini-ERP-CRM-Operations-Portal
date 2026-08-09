const { Op } = require('sequelize');
const { sequelize, Customer, Product, SalesChallan, StockMovement } = require('../models');

const quoteColumn = (name) => {
  if (sequelize.getDialect() === 'postgres') return `"${name}"`;
  if (sequelize.getDialect() === 'mysql') return `\`${name}\``;
  return name;
};

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

  // Chart 1: Stock Movement Trend (Last 30 Days daily IN vs OUT)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const movements = await StockMovement.findAll({
    where: {
      createdAt: { [Op.gte]: thirtyDaysAgo }
    },
    order: [['createdAt', 'ASC']]
  });

  // Group movements by date (YYYY-MM-DD)
  const trendMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const displayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    trendMap.set(dateStr, { date: displayLabel, fullDate: dateStr, IN: 0, OUT: 0 });
  }

  movements.forEach((m) => {
    const dateStr = new Date(m.createdAt).toISOString().split('T')[0];
    if (trendMap.has(dateStr)) {
      const entry = trendMap.get(dateStr);
      if (m.movementType === 'IN') {
        entry.IN += Number(m.quantityChanged) || 0;
      } else {
        entry.OUT += Number(m.quantityChanged) || 0;
      }
    }
  });

  const stockMovementTrend = Array.from(trendMap.values());

  // Chart 2: Weekly Challans by Status (Last 6 Weeks)
  const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
  const allChallans = await SalesChallan.findAll({
    where: {
      createdAt: { [Op.gte]: sixWeeksAgo }
    }
  });

  const weeklyMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
    const weekLabel = `Wk ${6 - i}`;
    weeklyMap.set(i, { week: weekLabel, Draft: 0, Confirmed: 0, Cancelled: 0 });
  }

  allChallans.forEach((c) => {
    const ageDays = Math.floor((now.getTime() - new Date(c.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    const weekIdx = Math.floor(ageDays / 7);
    if (weekIdx >= 0 && weekIdx < 6) {
      const key = 5 - weekIdx;
      if (weeklyMap.has(key)) {
        const entry = weeklyMap.get(key);
        if (c.status === 'Draft') entry.Draft += 1;
        else if (c.status === 'Confirmed') entry.Confirmed += 1;
        else if (c.status === 'Cancelled') entry.Cancelled += 1;
      }
    }
  });

  const challansByStatusWeekly = Array.from(weeklyMap.values());

  // Chart 3: Low Stock Products List (Top 6 ranked by low stock ratio)
  const lowStockProductsList = await Product.findAll({
    order: [
      [sequelize.literal(`${quoteColumn('currentStock')} - ${quoteColumn('minStockAlert')}`), 'ASC']
    ],
    limit: 6
  });

  return {
    totalCustomers,
    lowStockProducts,
    draftChallans,
    confirmedThisMonth,
    recentChallans,
    stockMovementTrend,
    challansByStatusWeekly,
    lowStockProductsList: lowStockProductsList.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      isBelowAlert: p.currentStock <= p.minStockAlert
    }))
  };
};

module.exports = {
  getStats
};
