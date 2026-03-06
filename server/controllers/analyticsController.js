/**
 * Analytics Controller
 * Handles analytics and query history request validation and orchestration
 */

const queryLogService = require("../services/queryLogService");
const analyticsService = require("../services/analyticsService");
const logger = require("../utils/logger");
const { telemetryClient } = require("../config/appInsights");

/**
 * Handle query history request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleQueryHistoryRequest(req, res) {
  try {
    // Get limit from query parameters (default: 10)
    const limit = parseInt(req.query.limit) || 10;

    // Validate limit parameter
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Please provide a valid "limit" parameter.',
        details: "Limit must be between 1 and 100",
      });
    }

    logger.debug("Retrieving query history", { limit });

    // Get query history from service
    const queryHistory = await queryLogService.getQueryHistory(limit);

    telemetryClient?.trackEvent({
      name: "QueryHistoryRetrieved",
      properties: {
        limit,
        count: queryHistory.length,
      },
    });

    res.json(queryHistory);
  } catch (error) {
    logger.error("Failed to retrieve query history", error);

    telemetryClient?.trackException({
      exception: error,
    });

    res.status(500).json({
      error: "Failed to retrieve query history",
      details: error.message,
    });
  }
}

/**
 * Handle analytics summary request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleAnalyticsRequest(req, res) {
  try {
    logger.debug("Retrieving analytics summary");

    // Get analytics from service
    const analytics = await analyticsService.getAnalyticsSummary();

    telemetryClient?.trackEvent({
      name: "AnalyticsRetrieved",
      properties: {
        totalQueries: analytics.totalQueries,
        successfulQueries: analytics.successfulQueries,
        failedQueries: analytics.failedQueries,
      },
    });

    res.json(analytics);
  } catch (error) {
    logger.error("Failed to retrieve analytics", error);

    telemetryClient?.trackException({
      exception: error,
    });

    res.status(500).json({
      error: "Failed to retrieve analytics",
      details: error.message,
    });
  }
}

/**
 * Handle analytics by period request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleAnalyticsByPeriodRequest(req, res) {
  try {
    const period = req.query.period || "week";

    // Validate period parameter
    const validPeriods = ["day", "week", "month"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: 'Please provide a valid "period" parameter.',
        details: `Period must be one of: ${validPeriods.join(", ")}`,
      });
    }

    logger.debug("Retrieving analytics by period", { period });

    // Get analytics from service
    const analytics = await analyticsService.getAnalyticsByPeriod(period);

    telemetryClient?.trackEvent({
      name: "AnalyticsByPeriodRetrieved",
      properties: {
        period,
        totalQueries: analytics.totalQueries,
      },
    });

    res.json(analytics);
  } catch (error) {
    logger.error("Failed to retrieve period analytics", error);

    telemetryClient?.trackException({
      exception: error,
    });

    res.status(500).json({
      error: "Failed to retrieve period analytics",
      details: error.message,
    });
  }
}

module.exports = {
  handleQueryHistoryRequest,
  handleAnalyticsRequest,
  handleAnalyticsByPeriodRequest,
};
