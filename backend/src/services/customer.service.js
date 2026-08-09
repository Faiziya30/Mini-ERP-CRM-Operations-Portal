const { Op } = require('sequelize');
const { Customer, CustomerFollowUp, User } = require('../models');
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

const toDateOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const createCustomer = async (payload, userId) => {
  const customer = await Customer.create({
    name: payload.name,
    mobile: payload.mobile,
    email: payload.email || null,
    businessName: payload.businessName,
    gstNumber: payload.gstNumber || null,
    customerType: payload.customerType,
    address: payload.address,
    status: payload.status || 'Lead',
    followUpDate: toDateOrNull(payload.followUpDate),
    notes: payload.notes || null,
    createdBy: userId,
    isDeleted: false
  });

  return customer;
};

const listCustomers = async ({ page, limit, search, status, customerType }) => {
  const { offset, page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const where = {
    isDeleted: false
  };

  if (status) {
    where.status = status;
  }

  if (customerType) {
    where.customerType = customerType;
  }

  if (search) {
    const likeOp = getLikeOp();
    where[Op.or] = [
      { name: { [likeOp]: `%${search}%` } },
      { mobile: { [likeOp]: `%${search}%` } },
      { businessName: { [likeOp]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Customer.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
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

const getCustomerById = async (id) => {
  const customer = await Customer.findOne({
    where: { id, isDeleted: false },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role']
      },
      {
        model: CustomerFollowUp,
        as: 'followUps',
        include: [
          {
            model: User,
            as: 'createdByUser',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      }
    ],
    order: [[{ model: CustomerFollowUp, as: 'followUps' }, 'createdAt', 'DESC']]
  });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

const updateCustomer = async (id, payload) => {
  const customer = await Customer.findOne({ where: { id, isDeleted: false } });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = { ...payload };

  if (Object.prototype.hasOwnProperty.call(updateData, 'followUpDate')) {
    updateData.followUpDate = toDateOrNull(updateData.followUpDate);
  }

  await customer.update(updateData);
  return customer;
};

const addFollowUp = async (customerId, payload, userId) => {
  const customer = await Customer.findOne({ where: { id: customerId, isDeleted: false } });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const followUp = await CustomerFollowUp.create({
    customerId,
    note: payload.note,
    followUpDate: new Date(payload.followUpDate),
    createdBy: userId
  });

  await customer.update({ followUpDate: new Date(payload.followUpDate) });

  return followUp;
};

const softDeleteCustomer = async (id) => {
  const customer = await Customer.findOne({ where: { id, isDeleted: false } });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  await customer.update({ isDeleted: true, status: 'Inactive' });

  return customer;
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
  softDeleteCustomer
};
