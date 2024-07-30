const errorMiddleware = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong";
  
    // Differentiate between development and production environments
    const isDevelopment = process.env.NODE_ENV === 'development';
  
    // Response format
    const response = {
      success: false,
      message: err.message,
    };
  
    // Include stack trace in development mode
    if (isDevelopment) {
      response.stack = err.stack;
    }
  
    // Send error response
    res.status(err.statusCode).json(response);
  };
  
  export default errorMiddleware;
  