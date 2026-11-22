const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
    return error(res, `A record with this ${fields} already exists.`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return error(res, 'Record not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  return error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.message : null);
};

const notFoundHandler = (req, res) => {
  return error(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
