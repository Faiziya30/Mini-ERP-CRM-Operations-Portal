const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    isActive: true
  });

  return sanitizeUser(user);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiry
  });

  return {
    token,
    user: sanitizeUser(user)
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user || !user.isActive) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
