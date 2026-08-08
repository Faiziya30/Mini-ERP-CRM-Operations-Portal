const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const {
  registerValidator,
  loginValidator
} = require('../validators/auth.validator');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
});

router.post('/register', authenticate, authorize('admin'), registerValidator, validateRequest, authController.register);
router.post('/login', loginLimiter, loginValidator, validateRequest, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
