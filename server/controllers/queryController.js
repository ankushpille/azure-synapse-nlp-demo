/**
 * Query Controller
 * Handles request validation, orchestrates service calls, and returns responses
 */

const nlpService = require("../services/nlpService");
const synapseService = require("../services/synapseService");
const queryLogService = require("../services/queryLogService");
const logger = require("../utils/logger");

/**
 * Handle NLP query request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleQueryRequest(req, res) {
  const startTime = Date.now();

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

    // Calculate response time
    const responseTimeMs = Date.now() - startTime;

    // Log successful query
    queryLogService.createQueryLog({
      question,
      generatedSql,
      status: "success",
      responseTimeMs,
      rowCount: results.length,
    });

    // Return successful response
    const response = {
      question,
      generatedSql,
      rows: results,
    };

    res.json(response);
  } catch (error) {
    // Calculate response time for error case
    const responseTimeMs = Date.now() - startTime;

    // Log failed query
    if (req.body.question) {
      try {
        queryLogService.createQueryLog({
          question: req.body.question,
          generatedSql: null,
          status: "failure",
          responseTimeMs,
          rowCount: 0,
          errorMessage: error.message,
        });
      } catch (logError) {
        logger.error("Failed to log query failure", logError);
      }
    }

    logger.logApiError(req.body.question, error);

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
