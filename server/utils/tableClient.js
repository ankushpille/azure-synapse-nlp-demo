/**
 * Azure Table Storage Utility
 * Creates and manages TableClient instances for Azure Table Storage
 */

const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");
const logger = require("./logger");

/**
 * Create TableClient for QueryLogs
 * @returns {TableClient} QueryLogs TableClient instance
 */
function getQueryLogsTableClient() {
  const connectionString = process.env.AZURE_TABLES_CONNECTION_STRING;
  const tableName = process.env.QUERY_LOGS_TABLE_NAME || "QueryLogs";

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
  const connectionString = process.env.AZURE_TABLES_CONNECTION_STRING;
  const tableName = process.env.FEEDBACK_LOGS_TABLE_NAME || "FeedbackLogs";

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
