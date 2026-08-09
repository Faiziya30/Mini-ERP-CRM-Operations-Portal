const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const path = require('path');
const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
// Support multiple origins (comma-separated in env) and reflect allowed origins
const allowedOrigins = (env.frontendOrigin || '').split(',').map((s) => s.trim()).filter(Boolean);
// Allow frontend origin dynamically in development to avoid CORS preflight mismatches
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin like curl/postman
    if (!origin) return callback(null, true);
    if (env.nodeEnv === 'development') return callback(null, true);
    // production: only allow configured origin
    if (origin === env.frontendOrigin) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
