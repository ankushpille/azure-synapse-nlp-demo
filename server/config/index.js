/**
 * Centralized Configuration Management
 * Loads and validates all environment variables
 * Ensures consistent configuration across the application
 */

require("dotenv").config();

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS = [
  // Server Configuration
  "PORT",

  // Azure Synapse Configuration
  "SYNAPSE_SERVER",
  "SYNAPSE_DATABASE",
  "AZURE_TENANT_ID",
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",

  // Azure Table Storage Configuration
  "AZURE_TABLES_CONNECTION_STRING",

  // Application Insights Configuration
  "APPINSIGHTS_CONNECTION_STRING",
];

/**
 * Validate required environment variables
 * Throws an error if any required variables are missing
 */
function validateEnvVariables() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  // Validate port number
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid number between 1 and 65535");
  }

  return true;
}

/**
 * Application Configuration Object
 * Centralized access to all config values
 */
const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT),
    environment: process.env.NODE_ENV || "development",
  },

  // Azure Synapse Configuration
  synapse: {
    server: process.env.SYNAPSE_SERVER,
    database: process.env.SYNAPSE_DATABASE,
    azureTenantId: process.env.AZURE_TENANT_ID,
    azureClientId: process.env.AZURE_CLIENT_ID,
    azureClientSecret: process.env.AZURE_CLIENT_SECRET,
    tokenScope: "https://database.windows.net/.default",
    sqlOptions: {
      encrypt: true,
      trustServerCertificate: false,
    },
  },

  // Azure Table Storage Configuration
  tableStorage: {
    connectionString: process.env.AZURE_TABLES_CONNECTION_STRING,
    queryLogsTableName: process.env.QUERY_LOGS_TABLE_NAME || "QueryLogs",
    feedbackLogsTableName:
      process.env.FEEDBACK_LOGS_TABLE_NAME || "FeedbackLogs",
  },

  // Application Insights Configuration
  appInsights: {
    connectionString: process.env.APPINSIGHTS_CONNECTION_STRING,
  },

  // Logging Configuration
  logging: {
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "development" ? "debug" : "info"),
    enableConsoleLogging: process.env.ENABLE_CONSOLE_LOGGING !== "false",
    enableAppInsights: process.env.ENABLE_APPINSIGHTS !== "false",
  },
};

/**
 * Initialize Configuration
 * Loads and validates all environment variables
 */
function initializeConfig() {
  try {
    validateEnvVariables();
    console.log("✅ Configuration initialized successfully");
    return config;
  } catch (error) {
    console.error("❌ Configuration initialization failed:", error.message);
    throw error;
  }
}

module.exports = {
  initializeConfig,
  config, // Export raw config for immediate access (after initialization)
};
