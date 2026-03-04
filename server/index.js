// server\index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

// ───────────────────────────────────────────────
// Azure Synapse connection config
// ───────────────────────────────────────────────
const synapseConfig = {
  server: process.env.SYNAPSE_SERVER,
  database: process.env.SYNAPSE_DATABASE,
  user: process.env.SYNAPSE_USER,
  password: process.env.SYNAPSE_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

// ───────────────────────────────────────────────
// Rule-based NLP → SQL mapping
// ───────────────────────────────────────────────
function questionToSql(question) {
  const q = question.toLowerCase();

  if (q.includes("total") && q.includes("sales")) {
    return "SELECT SUM(amount) AS total_sales FROM nlp_poc.dbo.sales_data;";
  }

  if (q.includes("sales") && q.includes("region")) {
    return "SELECT region, SUM(amount) AS total_sales FROM nlp_poc.dbo.sales_data GROUP BY region ORDER BY total_sales DESC;";
  }

  if (q.includes("top") && (q.includes("product") || q.includes("sales"))) {
    return "SELECT TOP 5 product_name, SUM(amount) AS total_sales FROM nlp_poc.dbo.sales_data GROUP BY product_name ORDER BY total_sales DESC;";
  }

  if (q.includes("india")) {
    return "SELECT * FROM nlp_poc.dbo.sales_data WHERE region='India';";
  }

  // default
  return "SELECT TOP 10 * FROM nlp_poc.dbo.sales_data;";
}

// ───────────────────────────────────────────────
// POST /query
// ───────────────────────────────────────────────
app.post("/query", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Please provide a valid 'question' field." });
  }

  const generatedSql = questionToSql(question);

  let pool;
  try {
    pool = await sql.connect(synapseConfig);
    const result = await pool.request().query(generatedSql);

    res.json({
      question,
      generatedSql,
      rows: result.recordset,
    });
  } catch (err) {
    console.error("Synapse query error:", err.message);
    res.status(500).json({
      error: "Failed to execute query against Azure Synapse.",
      details: err.message,
    });
  } finally {
    if (pool) {
      try { await pool.close(); } catch (_) { /* ignore */ }
    }
  }
});

// ───────────────────────────────────────────────
// Health check
// ───────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ───────────────────────────────────────────────
// Root
// ───────────────────────────────────────────────
app.get("/", (_req, res) => res.json({ status: "Server is running" }));


// ───────────────────────────────────────────────
// Start server
// ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  Server is running on http://localhost:${PORT}`);
});
