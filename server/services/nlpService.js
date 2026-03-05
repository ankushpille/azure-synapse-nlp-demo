/**
 * NLP Service
 * Handles natural language to SQL conversion using rule-based mappings
 */

const sqlGenerator = require("../utils/sqlGenerator");
const logger = require("../utils/logger");

/**
 * Rule-based NLP to SQL converter
 *
 * Rules are defined in priority order. The first matching rule will be applied.
 */

/**
 * Rules configuration
 * Each rule has a:
 * - matcher: function that returns boolean indicating if question matches the rule
 * - queryType: string identifier for SQL generator
 * - description: human-readable description of the rule
 */
const RULES = [
  {
    matcher: (q) => q.includes("total") && q.includes("sales"),
    queryType: "total-sales",
    description: "Query for total sales",
  },
  {
    matcher: (q) => q.includes("sales") && q.includes("region"),
    queryType: "sales-by-region",
    description: "Query for sales by region",
  },
  {
    matcher: (q) =>
      q.includes("top") && (q.includes("product") || q.includes("sales")),
    queryType: "top-products",
    description: "Query for top 5 product sales",
  },
  {
    matcher: (q) => q.includes("india"),
    queryType: "india-sales",
    description: "Query for India sales",
  },
];

/**
 * Convert natural language question to SQL query
 * @param {string} question - The natural language question to convert
 * @returns {string} SQL query
 */
function questionToSql(question) {
  if (!question || typeof question !== "string") {
    throw new Error("Invalid question: must be a non-empty string");
  }

  // Normalize question for matching
  const normalizedQuestion = question.toLowerCase().trim();
  logger.logGeneratedSql(`Normalized question: ${normalizedQuestion}`);

  // Find matching rule
  for (const rule of RULES) {
    if (rule.matcher(normalizedQuestion)) {
      logger.debug(`Rule matched: ${rule.description}`);
      return sqlGenerator.getQueryByType(rule.queryType);
    }
  }

  // If no rules match, use default query
  logger.debug("No rules matched, using default query");
  return sqlGenerator.getDefaultQuery();
}

/**
 * Add a new rule (for extensibility)
 * @param {Object} rule - The new rule to add
 */
function addRule(rule) {
  if (!rule.matcher || typeof rule.matcher !== "function") {
    throw new Error("Rule must have a matcher function");
  }

  if (!rule.queryType || typeof rule.queryType !== "string") {
    throw new Error("Rule must have a queryType string");
  }

  RULES.push({
    matcher: rule.matcher,
    queryType: rule.queryType,
    description: rule.description || "Custom rule",
  });

  logger.info("New NLP rule added", {
    queryType: rule.queryType,
    description: rule.description,
  });
}

/**
 * Get all rules (for debugging purposes)
 */
function getRules() {
  return RULES.map((rule) => ({
    queryType: rule.queryType,
    description: rule.description,
  }));
}

module.exports = {
  questionToSql,
  addRule,
  getRules,
};
