/**
 * Analytics Service
 * Provides analytics and metrics calculation using JSON file storage
 * Designed for easy migration to database storage in the future
 */

const queryLogService = require("./queryLogService");
const feedbackService = require("./feedbackService");
const logger = require("../utils/logger");

/**
 * Gets comprehensive analytics summary
 * @returns {Object} Analytics metrics
 */
function getAnalytics() {
  try {
    const queryLogs = queryLogService.getAllQueryLogs();
    const feedbackStats = feedbackService.getFeedbackStats();

    // Calculate query metrics
    const totalQueries = queryLogs.length;
    const successfulQueries = queryLogs.filter(
      (log) => log.status === "success",
    ).length;
    const failedQueries = queryLogs.filter(
      (log) => log.status === "failure",
    ).length;

    const averageResponseTimeMs =
      totalQueries > 0
        ? Math.round(
            queryLogs.reduce((sum, log) => sum + (log.responseTimeMs || 0), 0) /
              totalQueries,
          )
        : 0;

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      averageResponseTimeMs,
      ...feedbackStats,
    };
  } catch (error) {
    logger.error("Failed to calculate analytics", error);
    throw new Error("Failed to calculate analytics");
  }
}

/**
 * Gets query performance metrics
 * @returns {Object} Performance metrics
 */
function getPerformanceMetrics() {
  try {
    const queryLogs = queryLogService.getAllQueryLogs();

    const performance = {
      totalQueries: queryLogs.length,
      successfulQueries: queryLogs.filter((log) => log.status === "success")
        .length,
      failedQueries: queryLogs.filter((log) => log.status === "failure").length,
      averageResponseTimeMs: 0,
      minResponseTimeMs: null,
      maxResponseTimeMs: null,
    };

    if (performance.totalQueries > 0) {
      const responseTimes = queryLogs
        .filter((log) => log.responseTimeMs)
        .map((log) => log.responseTimeMs);

      performance.averageResponseTimeMs = Math.round(
        responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length,
      );
      performance.minResponseTimeMs = Math.min(...responseTimes);
      performance.maxResponseTimeMs = Math.max(...responseTimes);
    }

    return performance;
  } catch (error) {
    logger.error("Failed to calculate performance metrics", error);
    throw new Error("Failed to calculate performance metrics");
  }
}

/**
 * Gets feedback distribution metrics
 * @returns {Object} Feedback distribution
 */
function getFeedbackDistribution() {
  try {
    return feedbackService.getFeedbackStats();
  } catch (error) {
    logger.error("Failed to calculate feedback distribution", error);
    throw new Error("Failed to calculate feedback distribution");
  }
}

module.exports = {
  getAnalytics,
  getPerformanceMetrics,
  getFeedbackDistribution,
};
