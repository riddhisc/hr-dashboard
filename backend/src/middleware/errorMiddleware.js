// Handle 404 errors - called when no other middleware/route has responded
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central error handler - handles all errors passed to next()
const errorHandler = (err, req, res, next) => {
  // If status code is 200, it means the error was thrown but status code wasn't set
  // In this case, set it to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Set the status code
  res.status(statusCode);
  
  // Send error response
  res.json({
    message: err.message,
    // Only include stack trace in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler }; 