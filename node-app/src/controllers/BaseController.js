export default class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      data
    };
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} error - Error details
   */
  sendError(res, message = 'Internal Server Error', statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      error: error ? error.message : null
    };
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.stack = error.stack;
    }
    
    return res.status(statusCode).json(response);
  }

  /**
   * Handle async route errors automatically
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function with error handling
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {string|Array} errors - Validation error(s)
   */
  sendValidationError(res, errors) {
    const message = Array.isArray(errors) ? errors.join(', ') : errors;
    return this.sendError(res, `Validation Error: ${message}`, 400);
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} message - Not found message
   */
  sendNotFound(res, message = 'Resource not found') {
    return this.sendError(res, message, 404);
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Unauthorized message
   */
  sendUnauthorized(res, message = 'Unauthorized') {
    return this.sendError(res, message, 401);
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Forbidden message
   */
  sendForbidden(res, message = 'Forbidden') {
    return this.sendError(res, message, 403);
  }

  /**
   * Send created response
   * @param {Object} res - Express response object
   * @param {*} data - Created data
   * @param {string} message - Created message
   */
  sendCreated(res, data = null, message = 'Resource created successfully') {
    return this.sendSuccess(res, data, message, 201);
  }
}
