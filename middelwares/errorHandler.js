export default function errorHandler(err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    status: 'error',
    message: err.message,
    errors: err.errors,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
}
