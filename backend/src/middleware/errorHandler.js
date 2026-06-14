const env = require('../config/env');

/**
 * Catches requests to undefined routes and returns a 404 JSON response.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
};

/**
 * Global error handler middleware.
 * Logs the error and returns a sanitized JSON response.
 * In production, the stack trace is omitted.
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  if (env.nodeEnv !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
    ...(env.nodeEnv !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
