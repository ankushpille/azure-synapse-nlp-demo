/**
 * Feedback API Routes
 * Handles feedback-related endpoints
 */

const express = require("express");
const feedbackController = require("../controllers/feedbackController");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * @route POST /
 * @description Submit feedback for a query
 * @access Public
 */
router.post("/", async (req, res) => {
  logger.debug("Feedback route handler");
  await feedbackController.handleFeedbackRequest(req, res);
});

module.exports = router;
