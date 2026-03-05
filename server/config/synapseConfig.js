/**
 * Azure Synapse configuration file
 * Contains all Synapse connection and Azure AD authentication settings
 */

require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = [
  "SYNAPSE_SERVER",
  "SYNAPSE_DATABASE",
  "AZURE_TENANT_ID",
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

module.exports = {
  // Azure Synapse connection details
  server: process.env.SYNAPSE_SERVER,
  database: process.env.SYNAPSE_DATABASE,

  // Azure AD App Registration credentials
  azureTenantId: process.env.AZURE_TENANT_ID,
  azureClientId: process.env.AZURE_CLIENT_ID,
  azureClientSecret: process.env.AZURE_CLIENT_SECRET,

  // SQL connection options
  sqlOptions: {
    encrypt: true,
    trustServerCertificate: false,
  },

  // Token scope for Azure SQL/Synapse authentication
  tokenScope: "https://database.windows.net/.default",
};
