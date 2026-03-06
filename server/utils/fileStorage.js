/**
 * File storage utility for JSON data persistence
 * Provides safe and reusable methods for reading/writing JSON files
 * Designed to be easily replaceable with database storage in the future
 */

const fs = require("fs");
const path = require("path");
const logger = require("./logger");

/**
 * Safely reads JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @returns {Array} Parsed JSON data or empty array if file not found or invalid
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logger.debug(`File not found, creating new file: ${filePath}`);
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }

    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Failed to read JSON file: ${filePath}`, error);
    return [];
  }
}

/**
 * Safely writes JSON data to a file
 * @param {string} filePath - Path to the JSON file
 * @param {Array} data - Data to write to the file
 * @returns {boolean} True if write succeeded, false otherwise
 */
function writeJsonFile(filePath, data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    logger.error(`Failed to write JSON file: ${filePath}`, error);
    return false;
  }
}

/**
 * Generates a unique ID for records
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Gets current timestamp in ISO format
 * @returns {string} Current timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  generateId,
  getTimestamp,
};
