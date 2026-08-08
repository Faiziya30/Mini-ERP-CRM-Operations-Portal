const express = require('express');
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const validateRequest = require('../middlewares/validate');
const {
  createCustomerValidator,
  updateCustomerValidator,
  customerIdValidator,
  addFollowUpValidator,
  listCustomersValidator
} = require('../validators/customer.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', createCustomerValidator, validateRequest, customerController.createCustomer);
router.get('/', listCustomersValidator, validateRequest, customerController.listCustomers);
router.get('/:id', customerIdValidator, validateRequest, customerController.getCustomerById);
router.put('/:id', updateCustomerValidator, validateRequest, customerController.updateCustomer);
router.post('/:id/followups', addFollowUpValidator, validateRequest, customerController.addFollowUp);
router.delete(
  '/:id',
  customerIdValidator,
  validateRequest,
  authorize('admin'),
  customerController.softDeleteCustomer
);

module.exports = router;
