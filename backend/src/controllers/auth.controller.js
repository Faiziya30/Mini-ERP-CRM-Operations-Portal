const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    return sendSuccess(res, user, 'User registered successfully', 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = await authService.loginUser(req.body);
    return sendSuccess(res, payload, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, user, 'Current user fetched successfully');
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await authService.listUsers();
    return sendSuccess(res, users, 'Users fetched successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  listUsers
};

