class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
  
      // Ensure the name property is set to the name of the custom error
      this.name = this.constructor.name;
      this.statusCode = statusCode || 500;
  
      // Capture the stack trace for debugging
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default AppError;
  