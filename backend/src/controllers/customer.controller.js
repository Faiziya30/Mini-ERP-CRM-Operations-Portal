const customerService = require('../services/customer.service');
const { sendSuccess } = require('../utils/apiResponse');

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body, req.user.id);
    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

const listCustomers = async (req, res, next) => {
  try {
    const result = await customerService.listCustomers(req.query);
    return sendSuccess(res, result.rows, 'Customers fetched successfully', 200, result.meta);
  } catch (error) {
    return next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(Number(req.params.id));
    return sendSuccess(res, customer, 'Customer fetched successfully');
  } catch (error) {
    return next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
    return sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    return next(error);
  }
};

const addFollowUp = async (req, res, next) => {
  try {
    const followUp = await customerService.addFollowUp(Number(req.params.id), req.body, req.user.id);
    return sendSuccess(res, followUp, 'Follow-up added successfully', 201);
  } catch (error) {
    return next(error);
  }
};

const softDeleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.softDeleteCustomer(Number(req.params.id));
    return sendSuccess(res, customer, 'Customer deleted successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
  softDeleteCustomer
};
