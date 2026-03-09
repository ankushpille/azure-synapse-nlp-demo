/**
 * Application Insights Configuration
 * Initializes Azure Application Insights for telemetry, logging, and performance monitoring
 * Uses centralized configuration management
 */

const appInsights = require("applicationinsights");
const { config } = require("./");
const logger = require("../utils/logger");

/**
 * Initialize Application Insights
 * @returns {appInsights.TelemetryClient} Telemetry client instance
 */
function initializeAppInsights() {
  const connectionString = config.appInsights.connectionString;

  if (!connectionString || config.logging.enableAppInsights === false) {
    logger.warning("Application Insights is disabled");
    return null;
  }

  try {
    // Initialize Application Insights
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectPerformance(true)
      .start();

    logger.info("Application Insights initialized successfully");

    // Get telemetry client for custom events
    const telemetryClient = appInsights.defaultClient;
    return telemetryClient;
  } catch (error) {
    logger.error("Failed to initialize Application Insights", error);
    return null;
  }
}

// Initialize and export telemetry client
const telemetryClient = initializeAppInsights();

module.exports = {
  telemetryClient,
  initializeAppInsights,
};
