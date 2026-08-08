const express = require('express');
const authRoutes = require('./auth.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: {
      uptime: process.uptime()
    }
  });
});

router.use('/auth', authRoutes);

module.exports = router;
