const challanService = require('../services/challan.service');
const { sendSuccess } = require('../utils/apiResponse');

const createChallan = async (req, res, next) => {
  try {
    const challan = await challanService.createChallan(req.body, req.user.id);
    return sendSuccess(res, challan, 'Challan draft created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

const updateChallan = async (req, res, next) => {
  try {
    const challan = await challanService.updateChallan(Number(req.params.id), req.body);
    return sendSuccess(res, challan, 'Challan updated successfully');
  } catch (error) {
    return next(error);
  }
};

const confirmChallan = async (req, res, next) => {
  try {
    const challan = await challanService.confirmChallan(Number(req.params.id), req.user.id);
    return sendSuccess(res, challan, 'Challan confirmed successfully');
  } catch (error) {
    return next(error);
  }
};

const cancelChallan = async (req, res, next) => {
  try {
    const challan = await challanService.cancelChallan(Number(req.params.id), req.user.id);
    return sendSuccess(res, challan, 'Challan cancelled successfully');
  } catch (error) {
    return next(error);
  }
};

const listChallans = async (req, res, next) => {
  try {
    const result = await challanService.listChallans(req.query);
    return sendSuccess(res, result.rows, 'Challans fetched successfully', 200, result.meta);
  } catch (error) {
    return next(error);
  }
};

const getChallanById = async (req, res, next) => {
  try {
    const challan = await challanService.getChallanById(Number(req.params.id));
    return sendSuccess(res, challan, 'Challan fetched successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
  listChallans,
  getChallanById
};
