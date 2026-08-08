const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    return sendSuccess(res, stats, 'Dashboard stats fetched successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStats
};
