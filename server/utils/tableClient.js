/**
 * Azure Table Storage Utility
 * Creates and manages TableClient instances for Azure Table Storage
 * Uses centralized configuration management
 */

const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");
const { config } = require("../config");
const logger = require("./logger");

/**
 * Create TableClient for QueryLogs
 * @returns {TableClient} QueryLogs TableClient instance
 */
function getQueryLogsTableClient() {
  const connectionString = config.tableStorage.connectionString;
  const tableName = config.tableStorage.queryLogsTableName;

  try {
    const tableClient = TableClient.fromConnectionString(
      connectionString,
      tableName,
    );
    logger.debug(`QueryLogs TableClient created for table: ${tableName}`);
    return tableClient;
  } catch (error) {
    logger.error("Failed to create QueryLogs TableClient", error);
    throw new Error("Failed to create QueryLogs TableClient");
  }
}

/**
 * Create TableClient for FeedbackLogs
 * @returns {TableClient} FeedbackLogs TableClient instance
 */
function getFeedbackLogsTableClient() {
  const connectionString = config.tableStorage.connectionString;
  const tableName = config.tableStorage.feedbackLogsTableName;

  try {
    const tableClient = TableClient.fromConnectionString(
      connectionString,
      tableName,
    );
    logger.debug(`FeedbackLogs TableClient created for table: ${tableName}`);
    return tableClient;
  } catch (error) {
    logger.error("Failed to create FeedbackLogs TableClient", error);
    throw new Error("Failed to create FeedbackLogs TableClient");
  }
}

module.exports = {
  getQueryLogsTableClient,
  getFeedbackLogsTableClient,
};
