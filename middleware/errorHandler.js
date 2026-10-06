// ERROR HANDLER MIDDLEWARE
// This catches ALL errors from controllers and formats them

const errorHandler = (err, req, res, next) => {
  // Get status code (default 500 if not set)
  const statusCode = err.statusCode || 500;
  
  // Get error message
  const message = err.message || 'Internal server error';
  
  // Log error to console (for debugging)
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode: statusCode,
    message: message,
    stack: err.stack  // Shows where error happened
  });
  
  // Send formatted response to client
  return res.status(statusCode).json({
    success: false,
    message: message,
    statusCode: statusCode,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;