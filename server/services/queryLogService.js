/**
 * Query Log Service
 * Handles query logging operations with JSON file storage
 * Designed for easy migration to database storage in the future
 */

const path = require("path");
const fileStorage = require("../utils/fileStorage");
const logger = require("../utils/logger");

// File path for query logs
const QUERY_LOGS_PATH = path.join(__dirname, "../data/queryLogs.json");

/**
 * Creates a new query log entry
 * @param {Object} logData - Log data to store
 * @param {string} logData.question - Natural language question
 * @param {string} logData.generatedSql - Generated SQL query
 * @param {string} logData.status - Status of the query (success/failure)
 * @param {number} logData.responseTimeMs - Response time in milliseconds
 * @param {number} logData.rowCount - Number of rows returned
 * @param {string} logData.errorMessage - Error message if query failed
 * @returns {Object} Created log entry
 */
function createQueryLog(logData) {
  const logEntry = {
    id: fileStorage.generateId(),
    question: logData.question,
    generatedSql: logData.generatedSql,
    status: logData.status,
    responseTimeMs: logData.responseTimeMs,
    rowCount: logData.rowCount || 0,
    errorMessage: logData.errorMessage || null,
    timestamp: fileStorage.getTimestamp(),
  };

  try {
    const existingLogs = fileStorage.readJsonFile(QUERY_LOGS_PATH);
    existingLogs.push(logEntry);
    fileStorage.writeJsonFile(QUERY_LOGS_PATH, existingLogs);
    logger.debug("Query log saved successfully");
    return logEntry;
  } catch (error) {
    logger.error("Failed to save query log", error);
    throw new Error("Failed to save query log");
  }
}

/**
 * Gets query history with optional limit
 * @param {number} limit - Maximum number of records to return (default: 10)
 * @returns {Array} Query history sorted by timestamp (latest first)
 */
function getQueryHistory(limit = 10) {
  try {
    const logs = fileStorage.readJsonFile(QUERY_LOGS_PATH);
    // Sort by timestamp (latest first)
    const sortedLogs = logs.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
    // Apply limit
    return sortedLogs.slice(0, limit);
  } catch (error) {
    logger.error("Failed to retrieve query history", error);
    throw new Error("Failed to retrieve query history");
  }
}

/**
 * Gets all query logs
 * @returns {Array} All query logs
 */
function getAllQueryLogs() {
  try {
    return fileStorage.readJsonFile(QUERY_LOGS_PATH);
  } catch (error) {
    logger.error("Failed to retrieve all query logs", error);
    throw new Error("Failed to retrieve query logs");
  }
}

module.exports = {
  createQueryLog,
  getQueryHistory,
  getAllQueryLogs,
};
