/**
 * Feedback Service
 * Handles feedback operations with Azure Table Storage
 * Designed for easy migration to database storage in the future
 */

const { v4: uuidv4 } = require("uuid");
const { getFeedbackLogsTableClient } = require("../utils/tableClient");
const logger = require("../utils/logger");

/**
 * Saves a new feedback entry in Azure Table Storage
 * @param {Object} feedbackData - Feedback data to store
 * @param {string} feedbackData.question - Natural language question
 * @param {string} feedbackData.generatedSql - Generated SQL query
 * @param {string} feedbackData.feedback - Feedback type (helpful/not_helpful)
 * @param {string} feedbackData.comment - Optional comment
 * @returns {Object} Created feedback entry
 */
async function saveFeedback(feedbackData) {
  const tableClient = getFeedbackLogsTableClient();
  const rowKey = uuidv4();
  const createdAt = new Date().toISOString();

  const feedbackEntry = {
    partitionKey: "Feedback",
    rowKey: rowKey,
    question: feedbackData.question,
    generatedSql: feedbackData.generatedSql,
    feedback: feedbackData.feedback,
    comment: feedbackData.comment || null,
    createdAt: createdAt,
  };

  try {
    await tableClient.createEntity(feedbackEntry);
    logger.debug("Feedback saved successfully to Azure Table Storage");
    return feedbackEntry;
  } catch (error) {
    logger.error("Failed to save feedback to Azure Table Storage", error);
    throw new Error("Failed to save feedback");
  }
}

/**
 * Gets all feedback entries from Azure Table Storage
 * @returns {Array} All feedback entries
 */
async function getAllFeedback() {
  const tableClient = getFeedbackLogsTableClient();

  try {
    const entities = [];
    const query = `PartitionKey eq 'Feedback'`;

    for await (const entity of tableClient.listEntities({
      queryOptions: { filter: query },
    })) {
      entities.push({
        id: entity.rowKey,
        question: entity.question,
        generatedSql: entity.generatedSql,
        feedback: entity.feedback,
        comment: entity.comment,
        timestamp: entity.createdAt,
      });
    }

    logger.debug(`Retrieved ${entities.length} feedback entries`);
    return entities;
  } catch (error) {
    logger.error("Failed to retrieve feedback from Azure Table Storage", error);
    throw new Error("Failed to retrieve feedback");
  }
}

/**
 * Gets feedback statistics from Azure Table Storage
 * @returns {Object} Feedback statistics
 */
async function getFeedbackStats() {
  try {
    const feedback = await getAllFeedback();
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
