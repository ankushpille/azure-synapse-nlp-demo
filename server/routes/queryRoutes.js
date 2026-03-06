/**
 * Query API Routes
 * Handles query-related endpoints
 */

const express = require("express");
const queryController = require("../controllers/queryController");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * @route GET /health
 * @description Health check endpoint
 * @access Public
 */
router.get("/health", queryController.handleHealthCheck);

/**
 * @route GET /
 * @description Root endpoint
 * @access Public
 */
router.get("/", queryController.handleRootRequest);

/**
 * @route POST /
 * @description Process natural language query and return results
 * @access Public
 */
router.post("/", async (req, res) => {
  logger.debug("Query route handler");
  await queryController.handleQueryRequest(req, res);
});

module.exports = router;
