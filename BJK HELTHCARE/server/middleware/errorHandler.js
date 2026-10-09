/**
 * Centralized Enterprise Error Handler Middleware
 * Formats Mongoose, Authentication, Validation, and Database Errors consistently
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for server diagnostic tracing (masking sensitive tokens)
  console.error(`[Digital Brain Error | Request ${req.id || 'N/A'}]:`, err.stack || err.message);

  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'SERVER_ERROR';
  let message = err.message || 'Internal Enterprise Server Error';

  // 1. Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_RESOURCE_ID';
    message = `Resource not found with ID format [${err.value}]`;
  }

  // 2. Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `A record with ${field} '${val}' already exists. Duplicate entries are prevented.`;
  }

  // 3. Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(val => val.message).join('. ');
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token provided.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Your session token has expired. Please log in again.';
  }

  // 5. MongoDB Connection Timeout
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database cluster is currently unreachable. Please try again shortly.';
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    requestId: req.id || null,
    module: 'BJK Healthcare Digital Brain',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
