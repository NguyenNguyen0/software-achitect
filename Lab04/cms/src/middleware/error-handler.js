const logger = require('../infrastructure/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = statusCode < 500;

  if (!isOperational) {
    logger.error(`[${req.method}] ${req.path} — ${err.stack}`);
  } else {
    logger.warn(`[${req.method}] ${req.path} — ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: isOperational ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
  });
}

module.exports = errorHandler;
