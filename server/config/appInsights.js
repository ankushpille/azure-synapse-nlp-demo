/**
 * Application Insights Configuration
 * Initializes Azure Application Insights for telemetry, logging, and performance monitoring
 */

const appInsights = require("applicationinsights");

/**
 * Initialize Application Insights
 * @returns {appInsights.TelemetryClient} Telemetry client instance
 */
function initializeAppInsights() {
  const connectionString = process.env.APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn(
      "Application Insights connection string not found. Telemetry will be disabled.",
    );
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

    console.info("Application Insights initialized successfully");

    // Get telemetry client for custom events
    const telemetryClient = appInsights.defaultClient;
    return telemetryClient;
  } catch (error) {
    console.error("Failed to initialize Application Insights", error);
    return null;
  }
}

// Initialize and export telemetry client
const telemetryClient = initializeAppInsights();

module.exports = {
  telemetryClient,
  initializeAppInsights,
};
