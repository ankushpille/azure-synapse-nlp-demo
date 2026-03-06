/**
 * Feedback Controller
 * Handles feedback request validation, orchestrates service calls, and returns responses
 */

const feedbackService = require("../services/feedbackService");
const logger = require("../utils/logger");

/**
 * Handles feedback submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleFeedback(req, res) {
  try {
    // Validate request body
    const { question, generatedSql, feedback, comment } = req.body;

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

    if (comment && typeof comment !== "string") {
      return res.status(400).json({
        error: 'Please provide a valid "comment" field.',
        details: "Comment must be a string",
      });
    }

    // Save feedback
    const feedbackData = {
      question: question.trim(),
      generatedSql: generatedSql.trim(),
      feedback,
      comment: comment ? comment.trim() : null,
    };

    const savedFeedback = feedbackService.saveFeedback(feedbackData);
    logger.logFeedback(
      feedbackData.question,
      feedbackData.feedback,
      feedbackData.comment,
    );

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: savedFeedback,
    });
  } catch (error) {
    logger.error("Failed to submit feedback", error);
    return res.status(500).json({
      error: "Failed to submit feedback",
      details: error.message,
    });
  }
}

module.exports = {
  handleFeedback,
};
