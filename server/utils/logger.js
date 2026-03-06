/**
 * Centralized Logger
 * Handles logging operations with support for telemetry and Application Insights
 */

const { telemetryClient } = require("../config/appInsights");

/**
 * Log levels
 */
const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

/**
 * Logs an info message
 * @param {string} message - Message to log
 * @param {Object} data - Optional additional data
 */
function info(message, data = null) {
  console.log(`[${new Date().toISOString()}] [${LOG_LEVELS.INFO}] ${message}`);
  if (data) console.log("  Data:", JSON.stringify(data));

  telemetryClient?.trackTrace({
    message,
    severity: LOG_LEVELS.INFO,
  });
}

/**
 * Logs a warning message
 * @param {string} message - Message to log
 * @param {Object} data - Optional additional data
 */
function warning(message, data = null) {
  console.warn(`[${new Date().toISOString()}] [${LOG_LEVELS.WARN}] ${message}`);
  if (data) console.warn("  Data:", JSON.stringify(data));

  telemetryClient?.trackTrace({
    message,
    severity: LOG_LEVELS.WARN,
  });
}

/**
 * Logs an error message
 * @param {string} message - Message to log
 * @param {Error} err - Optional error object
 */
function error(message, err = null) {
  console.error(
    `[${new Date().toISOString()}] [${LOG_LEVELS.ERROR}] ${message}`,
  );
  if (err) console.error("  Error:", err);

  telemetryClient?.trackException({ exception: err || new Error(message) });
}

/**
 * Logs a debug message
 * @param {string} message - Message to log
 * @param {Object} data - Optional additional data
 */
function debug(message, data = null) {
  if (process.env.NODE_ENV === "development") {
    console.debug(
      `[${new Date().toISOString()}] [${LOG_LEVELS.DEBUG}] ${message}`,
    );
    if (data) console.debug("  Data:", JSON.stringify(data));
  }

  telemetryClient?.trackTrace({
    message,
    severity: LOG_LEVELS.DEBUG,
  });
}

/**
 * Logs an incoming request
 * @param {string} question - Natural language question
 */
function logRequest(question) {
  info("Incoming query request", {
    question: question.substring(0, 100) + (question.length > 100 ? "..." : ""),
  });
}

/**
 * Logs generated SQL query
 * @param {string} generatedSql - Generated SQL query
 */
function logGeneratedSql(generatedSql) {
  debug("Generated SQL query", { generatedSql });
}

/**
 * Logs API error
 * @param {string} question - Natural language question
 * @param {Error} err - Error object
 */
function logApiError(question, err) {
  error("API Error", {
    question: question,
    error: err.message,
  });
}

/**
 * Logs an error with context
 * @param {string} context - Context information
 * @param {Error} err - Error object
 */
function logError(context, err) {
  error(`${context} error`, err);
}

/**
 * Tracks an event in Application Insights
 * @param {string} eventName - Event name
 * @param {Object} properties - Optional event properties
 */
function trackEvent(eventName, properties = null) {
  if (telemetryClient) {
    telemetryClient.trackEvent({
      name: eventName,
      properties,
    });
  }
}

/**
 * Logs query result
 * @param {number} rowCount - Number of rows returned
 */
function logQueryResult(rowCount) {
  info(`Query executed successfully. Returned ${rowCount} rows.`);
}

module.exports = {
  info,
  warning,
  error,
  debug,
  logRequest,
  logGeneratedSql,
  logApiError,
  logError,
  trackEvent,
  logQueryResult,
};
