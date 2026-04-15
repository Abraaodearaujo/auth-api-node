const ApiError = require('../errors/ApiError');

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return next(ApiError.badRequest('Invalid request body.', { errors }));
  }

  req.body = result.data;
  next();
};

module.exports = validate;