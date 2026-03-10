/**
 * Azure Synapse service
 * Handles Azure AD authentication, connection pooling, and SQL query execution
 */

const sql = require("mssql");
const { ClientSecretCredential } = require("@azure/identity");
const config = require("../config/synapseConfig");
const logger = require("../utils/logger");

// Azure AD credential instance
let credential;

/**
 * Initialize Azure AD credential
 */
function initializeCredential() {
  if (!credential) {
    credential = new ClientSecretCredential(
      config.azureTenantId,
      config.azureClientId,
      config.azureClientSecret,
    );
  }
  return credential;
}

/**
 * Get Azure AD token for Synapse authentication
 */
async function getAccessToken() {
  const cred = initializeCredential();
  try {
    const tokenResponse = await cred.getToken(config.tokenScope);
    return tokenResponse.token;
  } catch (error) {
    logger.logError("Azure AD token acquisition", error);
    throw new Error("Failed to acquire Azure AD access token");
  }
}

/**
 * Create a Synapse connection pool using Azure AD authentication
 */
async function getSynapsePool() {
  try {
    const accessToken = await getAccessToken();

    const connectionConfig = {
      server: config.server,
      database: config.database,
      authentication: {
        type: "azure-active-directory-access-token",
        options: {
          token: accessToken,
        },
      },
      options: config.sqlOptions,
    };

    const pool = await sql.connect(connectionConfig);
    logger.info("Successfully connected to Azure Synapse");
    return pool;
  } catch (error) {
    logger.logError("Synapse connection", error);
    throw new Error("Failed to connect to Azure Synapse");
  }
}

/**
 * Execute a SQL query against Azure Synapse
 * @param {string} sqlQuery - The SQL query to execute
 */
async function executeQuery(sqlQuery) {
  let pool;
  try {
    // Temporary debug logging (as requested)
    console.log("Synapse Server:", process.env.SYNAPSE_SERVER);
    console.log("Synapse Database:", process.env.SYNAPSE_DATABASE);
    console.log("Executing SQL:", sqlQuery);

    // Debug: Log connection details
    logger.debug(`Executing query against Synapse server: ${config.server}`);
    logger.debug(`Executing query against database: ${config.database}`);
    logger.debug(`Executing SQL query: ${sqlQuery}`);

    pool = await getSynapsePool();
    const result = await pool.request().query(sqlQuery);
    logger.logQueryResult(result.recordset.length);
    return result.recordset;
  } catch (error) {
    // Temporary debug logging (as requested)
    console.log("Synapse Server:", process.env.SYNAPSE_SERVER);
    console.log("Synapse Database:", process.env.SYNAPSE_DATABASE);
    console.log("Executing SQL:", sqlQuery);
    console.log("Synapse Error:", error);

    // Debug: Log detailed error information
    logger.debug(`Synapse server used: ${config.server}`);
    logger.debug(`Database used: ${config.database}`);
    logger.debug(`SQL query executed: ${sqlQuery}`);
    logger.logError("Query execution", error);
    throw new Error(
      `Failed to execute query against Azure Synapse: ${error.message}`,
    );
  } finally {
    if (pool) {
      try {
        await pool.close();
        logger.debug("Synapse connection pool closed");
      } catch (closeError) {
        // Ignore errors when closing pool
        logger.debug("Error closing Synapse connection pool", closeError);
      }
    }
  }
}

module.exports = {
  executeQuery,
};
