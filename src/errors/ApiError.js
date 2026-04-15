class ApiError extends Error {
  constructor(statusCode, message, code = 'error', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request.', details = null) {
    return new ApiError(400, message, 'bad_request', details);
  }

  static unauthorized(message = 'Unauthorized.') {
    return new ApiError(401, message, 'unauthorized');
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message, 'not_found');
  }

  static conflict(message = 'Conflict.') {
    return new ApiError(409, message, 'conflict');
  }

  static tooManyRequests(message = 'Too many requests, please try again later.') {
    return new ApiError(429, message, 'too_many_requests');
  }

  static internal(message = 'Internal server error.') {
    return new ApiError(500, message, 'internal_error');
  }
}

module.exports = ApiError;
