/**
 * Query Log Service
 * Handles query logging operations with Azure Table Storage
 * Designed for easy migration to database storage in the future
 */

const { v4: uuidv4 } = require("uuid");
const { getQueryLogsTableClient } = require("../utils/tableClient");
const logger = require("../utils/logger");

/**
 * Creates a new query log entry in Azure Table Storage
 * @param {Object} logData - Log data to store
 * @param {string} logData.question - Natural language question
 * @param {string} logData.generatedSql - Generated SQL query
 * @param {string} logData.status - Status of the query (success/failure)
 * @param {number} logData.responseTimeMs - Response time in milliseconds
 * @param {number} logData.rowCount - Number of rows returned
 * @param {string} logData.errorMessage - Error message if query failed
 * @returns {Object} Created log entry
 */
async function createQueryLog(logData) {
  const tableClient = getQueryLogsTableClient();
  const rowKey = uuidv4();
  const createdAt = new Date().toISOString();

  const logEntry = {
    partitionKey: "Query",
    rowKey: rowKey,
    question: logData.question,
    generatedSql: logData.generatedSql,
    status: logData.status,
    responseTimeMs: logData.responseTimeMs,
    rowCount: logData.rowCount || 0,
    errorMessage: logData.errorMessage || null,
    createdAt: createdAt,
  };

  try {
    await tableClient.createEntity(logEntry);
    logger.debug("Query log saved successfully to Azure Table Storage");
    return logEntry;
  } catch (error) {
    logger.error("Failed to save query log to Azure Table Storage", error);
    throw new Error("Failed to save query log");
  }
}

/**
 * Gets query history with optional limit from Azure Table Storage
 * @param {number} limit - Maximum number of records to return (default: 10)
 * @returns {Array} Query history sorted by createdAt (latest first)
 */
async function getQueryHistory(limit = 10) {
  const tableClient = getQueryLogsTableClient();

  try {
    const entities = [];
    const query = `PartitionKey eq 'Query'`;

    for await (const entity of tableClient.listEntities({
      queryOptions: {
        filter: query,
        top: limit,
      },
    })) {
      entities.push({
        id: entity.rowKey,
        question: entity.question,
        generatedSql: entity.generatedSql,
        status: entity.status,
        responseTimeMs: entity.responseTimeMs,
        rowCount: entity.rowCount,
        errorMessage: entity.errorMessage,
        timestamp: entity.createdAt,
      });
    }

    // Sort by createdAt (latest first)
    const sortedLogs = entities.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    logger.debug(`Retrieved ${sortedLogs.length} query log entries`);
    return sortedLogs;
  } catch (error) {
    logger.error(
      "Failed to retrieve query history from Azure Table Storage",
      error,
    );
    throw new Error("Failed to retrieve query history");
  }
}

/**
 * Gets all query logs from Azure Table Storage
 * @returns {Array} All query logs
 */
async function getAllQueryLogs() {
  const tableClient = getQueryLogsTableClient();

  try {
    const entities = [];
    const query = `PartitionKey eq 'Query'`;

    for await (const entity of tableClient.listEntities({
      queryOptions: { filter: query },
    })) {
      entities.push({
        id: entity.rowKey,
        question: entity.question,
        generatedSql: entity.generatedSql,
        status: entity.status,
        responseTimeMs: entity.responseTimeMs,
        rowCount: entity.rowCount,
        errorMessage: entity.errorMessage,
        timestamp: entity.createdAt,
      });
    }

    logger.debug(`Retrieved ${entities.length} query log entries`);
    return entities;
  } catch (error) {
    logger.error(
      "Failed to retrieve all query logs from Azure Table Storage",
      error,
    );
    throw new Error("Failed to retrieve query logs");
  }
}

module.exports = {
  createQueryLog,
  getQueryHistory,
  getAllQueryLogs,
};
