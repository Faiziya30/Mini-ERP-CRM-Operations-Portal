const express = require('express');
const challanController = require('../controllers/challan.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const validateRequest = require('../middlewares/validate');
const {
  createChallanValidator,
  updateChallanValidator,
  challanIdValidator,
  listChallansValidator
} = require('../validators/challan.validator');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'sales'),
  createChallanValidator,
  validateRequest,
  challanController.createChallan
);

router.put(
  '/:id',
  authorize('admin', 'sales'),
  updateChallanValidator,
  validateRequest,
  challanController.updateChallan
);

router.post(
  '/:id/confirm',
  authorize('admin', 'sales', 'warehouse'),
  challanIdValidator,
  validateRequest,
  challanController.confirmChallan
);

router.post(
  '/:id/cancel',
  authorize('admin', 'sales'),
  challanIdValidator,
  validateRequest,
  challanController.cancelChallan
);

router.get(
  '/',
  authorize('admin', 'sales', 'warehouse', 'accounts'),
  listChallansValidator,
  validateRequest,
  challanController.listChallans
);

router.get(
  '/:id',
  authorize('admin', 'sales', 'warehouse', 'accounts'),
  challanIdValidator,
  validateRequest,
  challanController.getChallanById
);

router.get(
  '/:id/pdf',
  authorize('admin', 'sales', 'warehouse', 'accounts'),
  challanIdValidator,
  validateRequest,
  challanController.generatePdf
);


module.exports = router;
