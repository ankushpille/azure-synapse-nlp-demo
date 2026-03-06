/**
 * Analytics Service
 * Handles analytics operations with Azure Table Storage
 * Designed for easy migration to database storage in the future
 */

const queryLogService = require("./queryLogService");
const feedbackService = require("./feedbackService");
const logger = require("../utils/logger");

/**
 * Gets overall analytics summary from Azure Table Storage
 * @returns {Object} Analytics summary
 */
async function getAnalyticsSummary() {
  try {
    // Get all query logs and feedback
    const queryLogs = await queryLogService.getAllQueryLogs();
    const feedback = await feedbackService.getAllFeedback();

    // Calculate query statistics
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
            queryLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) /
              totalQueries,
          )
        : 0;

    // Calculate feedback statistics
    const totalFeedback = feedback.length;
    const helpfulFeedbackCount = feedback.filter(
      (item) => item.feedback === "helpful",
    ).length;
    const notHelpfulFeedbackCount = feedback.filter(
      (item) => item.feedback === "not_helpful",
    ).length;

    logger.debug("Analytics summary calculated successfully");

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      averageResponseTimeMs,
      totalFeedback,
      helpfulFeedbackCount,
      notHelpfulFeedbackCount,
    };
  } catch (error) {
    logger.error("Failed to calculate analytics summary", error);
    throw new Error("Failed to calculate analytics summary");
  }
}

/**
 * Gets detailed analytics by time period
 * @param {string} period - Time period (day/week/month)
 * @returns {Object} Detailed analytics by time period
 */
async function getAnalyticsByPeriod(period = "week") {
  try {
    const queryLogs = await queryLogService.getAllQueryLogs();
    const feedback = await feedbackService.getAllFeedback();

    const now = new Date();
    let startTime;

    // Calculate time range based on period
    if (period === "day") {
      startTime = new Date(now.setDate(now.getDate() - 1));
    } else if (period === "week") {
      startTime = new Date(now.setDate(now.getDate() - 7));
    } else if (period === "month") {
      startTime = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Filter logs by time range
    const filteredQueryLogs = queryLogs.filter(
      (log) => new Date(log.timestamp) >= startTime,
    );

    const filteredFeedback = feedback.filter(
      (item) => new Date(item.timestamp) >= startTime,
    );

    // Calculate statistics for the period
    const totalQueries = filteredQueryLogs.length;
    const successfulQueries = filteredQueryLogs.filter(
      (log) => log.status === "success",
    ).length;
    const failedQueries = filteredQueryLogs.filter(
      (log) => log.status === "failure",
    ).length;

    const averageResponseTimeMs =
      totalQueries > 0
        ? Math.round(
            filteredQueryLogs.reduce(
              (sum, log) => sum + log.responseTimeMs,
              0,
            ) / totalQueries,
          )
        : 0;

    const totalFeedback = filteredFeedback.length;
    const helpfulFeedbackCount = filteredFeedback.filter(
      (item) => item.feedback === "helpful",
    ).length;
    const notHelpfulFeedbackCount = filteredFeedback.filter(
      (item) => item.feedback === "not_helpful",
    ).length;

    logger.debug(`Analytics for ${period} period calculated successfully`);

    return {
      period,
      totalQueries,
      successfulQueries,
      failedQueries,
      averageResponseTimeMs,
      totalFeedback,
      helpfulFeedbackCount,
      notHelpfulFeedbackCount,
    };
  } catch (error) {
    logger.error("Failed to calculate period analytics", error);
    throw new Error("Failed to calculate period analytics");
  }
}

module.exports = {
  getAnalyticsSummary,
  getAnalyticsByPeriod,
};
