const ApiError = require('../errors/ApiError');
const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const response = {
    message: err.message || 'Internal server error.',
  };

  if (err instanceof ApiError) {
    response.code = err.code;
    if (err.details) response.details = err.details;
  }

  if (status >= 500) {
    logger.error(err.message, {
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
      details: err.details,
    });
  } else {
    logger.warn(err.message, {
      path: req.originalUrl,
      method: req.method,
      details: err.details,
    });
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
