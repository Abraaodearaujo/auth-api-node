const rateLimit = require('express-rate-limit');
const {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MAX,
} = require('../config/env');
const ApiError = require('../errors/ApiError');

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests();
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  },
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const error = ApiError.tooManyRequests();
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  },
});

module.exports = { globalLimiter, authLimiter };
