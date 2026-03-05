/**
 * Query routes configuration
 * Defines the API endpoints for query functionality
 */

const express = require("express");
const queryController = require("../controllers/queryController");

const router = express.Router();

/**
 * Query endpoint - POST /query
 * Handles natural language queries and returns SQL results
 */
router.post("/", queryController.handleQueryRequest);

/**
 * Health check endpoint - GET /health
 * Returns server status
 */
router.get("/health", queryController.handleHealthCheck);

/**
 * Root endpoint - GET /
 * Returns server status
 */
router.get("/", queryController.handleRootRequest);

module.exports = router;
