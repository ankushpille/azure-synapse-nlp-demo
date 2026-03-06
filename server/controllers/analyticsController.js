/**
 * Analytics Controller
 * Handles analytics and query history request validation,
 * orchestrates service calls, and returns responses
 */

const analyticsService = require("../services/analyticsService");
const queryLogService = require("../services/queryLogService");
const logger = require("../utils/logger");

/**
 * Gets analytics summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAnalytics(req, res) {
  try {
    logger.logAnalyticsRequest();
    const analytics = analyticsService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    logger.error("Failed to retrieve analytics", error);
    return res.status(500).json({
      error: "Failed to retrieve analytics",
      details: error.message,
    });
  }
}

/**
 * Gets query history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getQueryHistory(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        error: 'Please provide a valid "limit" parameter.',
        details: "Limit must be a positive integer",
      });
    }

    logger.logQueryHistoryRequest(limit);
    const history = queryLogService.getQueryHistory(limit);
    res.json(history);
  } catch (error) {
    logger.error("Failed to retrieve query history", error);
    return res.status(500).json({
      error: "Failed to retrieve query history",
      details: error.message,
    });
  }
}

module.exports = {
  getAnalytics,
  getQueryHistory,
};
