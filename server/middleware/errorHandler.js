/**
 * Error handling middleware
 * Provides centralized error handling across all routes
 */

const logger = require("../utils/logger");

/**
 * Error handler middleware
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(error, req, res, next) {
  // Log error with context
  logger.logError("HTTP request", error);

  // Default error status and message
  let statusCode = 500;
  let message = "Internal server error";
  let details = error.message;

  // Handle specific error types
  if (error.message.includes("Azure AD") || error.message.includes("Synapse")) {
    statusCode = 503; // Service Unavailable
    message = "Failed to connect to Azure Synapse";
  } else if (error.message.includes("Invalid question")) {
    statusCode = 400; // Bad Request
    message = "Invalid question format";
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    details: details,
  });
}

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res) {
  logger.info("404 Not Found", {
    method: req.method,
    url: req.originalUrl,
  });

  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
