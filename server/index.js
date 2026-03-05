// server\index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const { ClientSecretCredential } = require("@azure/identity");

const app = express();
app.use(cors());
app.use(express.json());

// ───────────────────────────────────────────────
// Azure AD Credential (App Registration)
// ───────────────────────────────────────────────
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

// ───────────────────────────────────────────────
// Helper: get a Synapse connection pool via AAD
// ───────────────────────────────────────────────
async function getSynapsePool() {
  // Acquire an Azure AD token scoped for Azure SQL / Synapse
  const tokenResponse = await credential.getToken(
    "https://database.windows.net/.default"
  );

  const config = {
    server: process.env.SYNAPSE_SERVER,
    database: process.env.SYNAPSE_DATABASE,
    authentication: {
      type: "azure-active-directory-access-token",
      options: {
        token: tokenResponse.token,
      },
    },
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  };

  return sql.connect(config);
}

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
    return res
      .status(400)
      .json({ error: "Please provide a valid 'question' field." });
  }

  const generatedSql = questionToSql(question);

  // Debug logging
  console.log("Question:", question);
  console.log("Generated SQL:", generatedSql);

  let pool;
  try {
    pool = await getSynapsePool();
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
      try {
        await pool.close();
      } catch (_) {
        /* ignore */
      }
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
