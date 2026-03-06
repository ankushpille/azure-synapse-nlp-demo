/**
 * Feedback Controller
 * Handles feedback request validation and orchestrates service calls
 */

const feedbackService = require("../services/feedbackService");
const logger = require("../utils/logger");
const { telemetryClient } = require("../config/appInsights");

/**
 * Handle feedback request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleFeedbackRequest(req, res) {
  try {
    // Validate request body
    const { question, generatedSql, feedback, comment } = req.body;

    // Validate required fields
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: 'Please provide a valid "question" field.',
        details: "Question must be a non-empty string",
      });
    }

    if (
      !generatedSql ||
      typeof generatedSql !== "string" ||
      !generatedSql.trim()
    ) {
      return res.status(400).json({
        error: 'Please provide a valid "generatedSql" field.',
        details: "Generated SQL must be a non-empty string",
      });
    }

    if (!feedback || !["helpful", "not_helpful"].includes(feedback)) {
      return res.status(400).json({
        error: 'Please provide a valid "feedback" field.',
        details: 'Feedback must be either "helpful" or "not_helpful"',
      });
    }

    // Validate optional comment
    if (comment && typeof comment !== "string") {
      return res.status(400).json({
        error: 'Please provide a valid "comment" field.',
        details: "Comment must be a string",
      });
    }

    logger.debug("Processing feedback request", {
      question: question.substring(0, 100),
      feedback,
    });

    // Save feedback
    const feedbackEntry = await feedbackService.saveFeedback({
      question,
      generatedSql,
      feedback,
      comment: comment?.trim() || null,
    });

    // Send telemetry to Application Insights
    telemetryClient?.trackEvent({
      name: "FeedbackSubmitted",
      properties: {
        question: question.substring(0, 100),
        feedback,
        hasComment: !!comment,
      },
    });

    logger.debug("Feedback saved successfully");

    res.json({
      success: true,
      message: "Feedback received successfully",
    });
  } catch (error) {
    logger.error("Failed to process feedback", error);

    telemetryClient?.trackException({
      exception: error,
      properties: {
        question: req.body.question?.substring(0, 100),
        feedback: req.body.feedback,
      },
    });

    res.status(500).json({
      error: "Failed to process feedback",
      details: error.message,
    });
  }
}

module.exports = {
  handleFeedbackRequest,
};
