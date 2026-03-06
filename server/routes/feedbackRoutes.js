/**
 * Feedback routes configuration
 * Defines the API endpoints for feedback functionality
 */

const express = require("express");
const feedbackController = require("../controllers/feedbackController");

const router = express.Router();

/**
 * Feedback endpoint - POST /feedback
 * Handles feedback submission for queries
 */
router.post("/", feedbackController.handleFeedback);

module.exports = router;
