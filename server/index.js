/**
 * Azure Synapse NLP Demo Backend
 * Main server entry point
 *
 * Architecture overview:
 * - Routes: Define API endpoints
 * - Controllers: Handle request validation and orchestration
 * - Services: Business logic (NLP, Synapse interaction, data access)
 * - Utils: Reusable utilities (logging, SQL generation, file storage)
 * - Middleware: Error handling, authentication, etc.
 * - Config: Configuration management
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Initialize Application Insights first
require("./config/appInsights");

const logger = require("./utils/logger");
const queryRoutes = require("./routes/queryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/query", queryRoutes); // POST /query
app.use("/feedback", feedbackRoutes); // POST /feedback
app.use("/analytics", analyticsRoutes); // GET /analytics, GET /analytics/query-history
app.use("/health", queryRoutes); // GET /health
app.use("/", queryRoutes); // GET /

// Error handling middleware (must be registered after routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  logger.info(`✅ Server is running on http://localhost:${PORT}`);
});
