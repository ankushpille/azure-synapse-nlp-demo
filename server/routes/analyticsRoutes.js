/**
 * Analytics routes configuration
 * Defines the API endpoints for analytics functionality
 */

const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

/**
 * Analytics endpoint - GET /analytics
 * Returns analytics summary
 */
router.get("/", analyticsController.getAnalytics);

/**
 * Query history endpoint - GET /query-history
 * Returns query history with optional limit
 */
router.get("/query-history", analyticsController.getQueryHistory);

module.exports = router;
