/**
 * Analytics API Routes
 * Handles analytics and query history endpoints
 */

const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * @route GET /
 * @description Get analytics summary
 * @access Public
 */
router.get("/", async (req, res) => {
  logger.debug("Analytics summary route handler");
  await analyticsController.handleAnalyticsRequest(req, res);
});

/**
 * @route GET /query-history
 * @description Get query history with optional limit
 * @access Public
 * @queryParam {number} limit - Maximum number of records to return (default: 10)
 */
router.get("/query-history", async (req, res) => {
  logger.debug("Query history route handler");
  await analyticsController.handleQueryHistoryRequest(req, res);
});

/**
 * @route GET /by-period
 * @description Get analytics by time period
 * @access Public
 * @queryParam {string} period - Time period (day/week/month) (default: week)
 */
router.get("/by-period", async (req, res) => {
  logger.debug("Analytics by period route handler");
  await analyticsController.handleAnalyticsByPeriodRequest(req, res);
});

module.exports = router;
