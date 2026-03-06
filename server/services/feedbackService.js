/**
 * Feedback Service
 * Handles feedback operations with JSON file storage
 * Designed for easy migration to database storage in the future
 */

const path = require("path");
const fileStorage = require("../utils/fileStorage");
const logger = require("../utils/logger");

// File path for feedback logs
const FEEDBACK_LOGS_PATH = path.join(__dirname, "../data/feedbackLogs.json");

/**
 * Saves a new feedback entry
 * @param {Object} feedbackData - Feedback data to store
 * @param {string} feedbackData.question - Natural language question
 * @param {string} feedbackData.generatedSql - Generated SQL query
 * @param {string} feedbackData.feedback - Feedback type (helpful/not_helpful)
 * @param {string} feedbackData.comment - Optional comment
 * @returns {Object} Created feedback entry
 */
function saveFeedback(feedbackData) {
  const feedbackEntry = {
    id: fileStorage.generateId(),
    question: feedbackData.question,
    generatedSql: feedbackData.generatedSql,
    feedback: feedbackData.feedback,
    comment: feedbackData.comment || null,
    timestamp: fileStorage.getTimestamp(),
  };

  try {
    const existingFeedback = fileStorage.readJsonFile(FEEDBACK_LOGS_PATH);
    existingFeedback.push(feedbackEntry);
    fileStorage.writeJsonFile(FEEDBACK_LOGS_PATH, existingFeedback);
    logger.debug("Feedback saved successfully");
    return feedbackEntry;
  } catch (error) {
    logger.error("Failed to save feedback", error);
    throw new Error("Failed to save feedback");
  }
}

/**
 * Gets all feedback entries
 * @returns {Array} All feedback entries
 */
function getAllFeedback() {
  try {
    return fileStorage.readJsonFile(FEEDBACK_LOGS_PATH);
  } catch (error) {
    logger.error("Failed to retrieve feedback", error);
    throw new Error("Failed to retrieve feedback");
  }
}

/**
 * Gets feedback statistics
 * @returns {Object} Feedback statistics
 */
function getFeedbackStats() {
  try {
    const feedback = getAllFeedback();
    const totalFeedback = feedback.length;
    const helpfulFeedbackCount = feedback.filter(
      (item) => item.feedback === "helpful",
    ).length;
    const notHelpfulFeedbackCount = feedback.filter(
      (item) => item.feedback === "not_helpful",
    ).length;

    return {
      totalFeedback,
      helpfulFeedbackCount,
      notHelpfulFeedbackCount,
    };
  } catch (error) {
    logger.error("Failed to calculate feedback statistics", error);
    throw new Error("Failed to calculate feedback statistics");
  }
}

module.exports = {
  saveFeedback,
  getAllFeedback,
  getFeedbackStats,
};
