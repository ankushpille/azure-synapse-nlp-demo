/**
 * Azure Synapse configuration file
 * Gets configuration from centralized config module
 * Contains all Synapse connection and Azure AD authentication settings
 */

const { config } = require("./");

// Export Synapse-specific configuration from centralized config
module.exports = config.synapse;
