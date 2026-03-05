/**
 * Query Controller
 * Handles request validation, orchestrates service calls, and returns responses
 */

const nlpService = require("../services/nlpService");
const synapseService = require("../services/synapseService");
const logger = require("../utils/logger");

/**
 * Handle NLP query request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleQueryRequest(req, res) {
  try {
    // Validate request body
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: 'Please provide a valid "question" field.',
        details: "Question must be a non-empty string",
      });
    }

    logger.logRequest(question);

    // Convert natural language to SQL
    const generatedSql = nlpService.questionToSql(question);
    logger.logGeneratedSql(generatedSql);

    // Execute SQL query against Synapse
    const results = await synapseService.executeQuery(generatedSql);

    // Return successful response
    const response = {
      question,
      generatedSql,
      rows: results,
    };

    res.json(response);
  } catch (error) {
    // Forward error to error handling middleware
    return res.status(500).json({
      error: "Failed to process query",
      details: error.message,
    });
  }
}

/**
 * Health check endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function handleHealthCheck(req, res) {
  res.json({ status: "ok" });
}

/**
 * Root endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function handleRootRequest(req, res) {
  res.json({ status: "Server is running" });
}

module.exports = {
  handleQueryRequest,
  handleHealthCheck,
  handleRootRequest,
};
