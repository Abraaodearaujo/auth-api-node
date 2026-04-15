const ApiError = require('../errors/ApiError');

function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(ApiError.unauthorized('Insufficient permissions.'));
    }

    next();
  };
}

module.exports = { requireRole };