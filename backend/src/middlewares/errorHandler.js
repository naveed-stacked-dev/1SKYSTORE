const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Validation error';
    errors = err.errors?.map((e) => ({ field: e.path, message: e.message })) || [];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error('🔥 Server Error:', err);
  }

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    data: null,
    error: process.env.NODE_ENV === 'development'
      ? { errors, stack: err.stack }
      : { errors },
  });
};

module.exports = { errorHandler };
