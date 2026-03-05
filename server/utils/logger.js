/**
 * Centralized logging utility
 * Provides consistent logging across the application
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
  INFO: "INFO",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

/**
 * Get current timestamp in ISO format
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Log message with timestamp and level
 */
function log(level, message, data = null) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

/**
 * Info level log
 */
function info(message, data = null) {
  log(LOG_LEVELS.INFO, message, data);
}

/**
 * Error level log
 */
function error(message, error = null) {
  log(LOG_LEVELS.ERROR, message, error);
}

/**
 * Debug level log
 */
function debug(message, data = null) {
  log(LOG_LEVELS.DEBUG, message, data);
}

/**
 * Log incoming request details
 */
function logRequest(question) {
  info("Incoming request received", { question });
}

/**
 * Log generated SQL query
 */
function logGeneratedSql(sql) {
  debug("Generated SQL query", { sql });
}

/**
 * Log query execution result
 */
function logQueryResult(rowCount) {
  info("Query execution completed", { rowCount });
}

/**
 * Log error
 */
function logError(context, error) {
  error(`Error in ${context}`, {
    message: error.message,
    stack: error.stack,
  });
}

module.exports = {
  info,
  error,
  debug,
  logRequest,
  logGeneratedSql,
  logQueryResult,
  logError,
};
