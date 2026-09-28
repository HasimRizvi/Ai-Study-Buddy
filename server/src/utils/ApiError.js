class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad request') {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = 'Not authorised, please log in') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'You do not have permission to perform this action') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static internal(msg = 'Something went wrong on the server') {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;
