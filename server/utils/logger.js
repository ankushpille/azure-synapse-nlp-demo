/**
 * Centralized Logger
 * Handles logging operations with support for telemetry and Application Insights
 * Standardizes logging levels and formats across the application
 */

const { config } = require("../config");
const { telemetryClient } = require("../config/appInsights");

/**
 * Log levels with severity mapping
 */
const LOG_LEVELS = {
  INFO: { value: 0, name: "INFO", severity: "Information" },
  WARN: { value: 1, name: "WARN", severity: "Warning" },
  ERROR: { value: 2, name: "ERROR", severity: "Error" },
  DEBUG: { value: 3, name: "DEBUG", severity: "Verbose" },
};

/**
 * Get current log level from configuration
 */
const getCurrentLogLevel = () => {
  const configLevel = (config.logging.level || "info").toUpperCase();
  return LOG_LEVELS[configLevel] || LOG_LEVELS.INFO;
};

/**
 * Check if a log level is enabled
 */
const isLevelEnabled = (level) => {
  return level.value <= getCurrentLogLevel().value;
};

/**
 * Format log message with timestamp and level
 */
const formatLogMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.name}] ${message}`;
};

/**
 * Logs a message at the specified level
 */
const logMessage = (level, message, data = null, error = null) => {
  // Check if level is enabled
  if (!isLevelEnabled(level)) {
    return;
  }

  // Console logging
  if (config.logging.enableConsoleLogging) {
    const formattedMessage = formatLogMessage(level, message);

    if (level.name === "ERROR") {
      console.error(formattedMessage);
    } else if (level.name === "WARN") {
      console.warn(formattedMessage);
    } else if (level.name === "DEBUG") {
      console.debug(formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    if (data) {
      console.log("  Data:", JSON.stringify(data));
    }

    if (error) {
      console.error("  Error:", error);
    }
  }

  // Application Insights telemetry
  if (config.logging.enableAppInsights && telemetryClient) {
    if (level.name === "ERROR") {
      telemetryClient.trackException({
        exception: error || new Error(message),
        properties: data,
      });
    } else {
      telemetryClient.trackTrace({
        message,
        severity: level.severity,
        properties: data,
      });
    }
  }
};

/**
 * Logs an info message
 * @param {string} message - Message to log
 * @param {Object} data - Optional additional data
 */
function info(message, data = null) {
  logMessage(LOG_LEVELS.INFO, message, data);
}

/**
 * Logs a warning message
 * @param {string} message - Message to log
 * @param {Object} data - Optional additional data
 */
function warning(message, data = null) {
  logMessage(LOG_LEVELS.WARN, message, data);
}

/**
 * Logs an error message
 * @param {string} message - Message to log
 * @param {Error} err - Optional error object
 */
function error(message, err = null) {
  logMessage(LOG_LEVELS.ERROR, message, null, err);
}

/**
 * Logs a debug message
 * @param {string} message - Message to log
 * @param {Object} data - Optional additional data
 */
function debug(message, data = null) {
  logMessage(LOG_LEVELS.DEBUG, message, data);
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
  if (config.logging.enableAppInsights && telemetryClient) {
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
