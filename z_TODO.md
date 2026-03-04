# Project Review

After checking against the README requirements, the project is **mostly correct** with a few issues:

## Issues Found

1. **Missing root `.gitignore`** — listed in project structure but not provided
2. **Missing `server/.gitignore`** — listed in project structure but not provided
3. **Batch files use `call cd`** — works but `cd /d` is safer (handles drive changes)
4. **SQL inconsistency** — README docs show `dbo.sales_data` but code uses `nlp_poc.dbo.sales_data` (redundant since DB is already in connection config; not a bug but inconsistent)

Everything else (React app, Express server, NLP logic, CSS, Vite config) is correct and complete.

---

## Fixed / Complete Files

### `0setupserver.bat`

```bat
@REM 0setupserver.bat
cd /d "%~dp0server"
REM fill in Synapse credentials
copy .env.example .env
echo .env created — please edit it with your Synapse credentials.
pause
```




### `server/.gitignore`

```gitignore

```

### `server/.env.example`

```
PORT=3001
SYNAPSE_SERVER=your-synapse-server.sql.azuresynapse.net
SYNAPSE_DATABASE=nlp_poc
SYNAPSE_USER=
SYNAPSE_PASSWORD=
```

### `server/package.json`

```json

```

### `server/index.js`

```js
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
    return "SELECT SUM(amount) AS total_sales FROM dbo.sales_data;";
  }

  if (q.includes("sales") && q.includes("region")) {
    return "SELECT region, SUM(amount) AS total_sales FROM dbo.sales_data GROUP BY region ORDER BY total_sales DESC;";
  }

  if (q.includes("top") && (q.includes("product") || q.includes("sales"))) {
    return "SELECT TOP 5 product_name, SUM(amount) AS total_sales FROM dbo.sales_data GROUP BY product_name ORDER BY total_sales DESC;";
  }

  if (q.includes("india")) {
    return "SELECT * FROM dbo.sales_data WHERE region='India';";
  }

  // default
  return "SELECT TOP 10 * FROM dbo.sales_data;";
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
```

### `server/README.md`

````md
# Azure Synapse NLP Demo – Server

Backend API that converts natural-language questions into SQL queries and executes them against Azure Synapse Analytics (serverless SQL pool).

## Prerequisites

- Node.js ≥ 18
- An Azure Synapse workspace with the `dbo.sales_data` view in the `nlp_poc` database

## Setup

```bash
cd server
copy .env.example .env   # then fill in your Synapse credentials
npm install
```
````

## Run

```bash
npm run dev     # development (auto-restart on changes)
npm start       # production
```

The server listens on **http://localhost:3001** by default.

## API

### `POST /query`

| Field      | Type   | Description               |
| ---------- | ------ | ------------------------- |
| `question` | string | Natural-language question |

**Request**

```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"question": "total sales"}'
```

**Response**

```json
{
  "question": "total sales",
  "generatedSql": "SELECT SUM(amount) AS total_sales FROM dbo.sales_data;",
  "rows": [{ "total_sales": 123456.78 }]
}
```

### `GET /health`

Returns `{ "status": "ok" }` – useful for monitoring.

````

### `client/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Azure Synapse NLP Demo – ask natural-language questions and get SQL-powered answers."
    />
    <title>Azure Synapse NLP Demo</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
````

### `client/package.json`

```json
{
  "name": "azure-synapse-nlp-client",
  "description": "React frontend for Azure Synapse NLP Demo",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.1.0"
  }
}
```

### `client/vite.config.js`

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### `client/README.md`

````md
# Azure Synapse NLP Demo – Client

React frontend that lets you type natural-language questions and see SQL-powered results from Azure Synapse.

## Prerequisites

- Node.js ≥ 18
- The backend server running at `http://localhost:3001`

## Setup & Run

```bash
cd client
npm install
npm run dev
```
````

The dev server starts at **http://localhost:5173** (default Vite port).

## Features

- Type a question or click a suggestion chip
- See the generated SQL query
- View results in a dynamic table
- Loading spinner and error handling

````

### `client/src/main.jsx`
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
````

### `client/src/App.jsx`

```jsx
import { useState } from "react";

const API_URL = "http://localhost:3001/query";

const SUGGESTIONS = [
  "What are the total sales?",
  "Show sales by region",
  "Top products by sales",
  "Sales in India",
  "Show me all data",
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (q) => {
    const text = (q || question).trim();
    if (!text) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onSuggestion = (s) => {
    setQuestion(s);
    handleSubmit(s);
  };

  const columns = result?.rows?.length ? Object.keys(result.rows[0]) : [];

  return (
    <div className="app-wrapper">
      {/* ── Header ────────────────────────────── */}
      <header className="hero-header">
        <h1>Azure Synapse NLP Demo</h1>
        <p>
          Ask a question in plain English — get SQL-powered answers from your
          data
        </p>
        <div className="badge-row">
          <span className="badge">
            <span className="dot" />
            Synapse Connected
          </span>
          <span className="badge">Rule-based NLP</span>
          <span className="badge">Serverless SQL</span>
        </div>
      </header>

      {/* ── Main ──────────────────────────────── */}
      <main className="main-content">
        {/* Query Card */}
        <div className="query-card">
          <label htmlFor="nlp-input">Ask your question</label>
          <div className="input-row">
            <input
              id="nlp-input"
              type="text"
              placeholder='e.g. "What are the total sales?"'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />
            <button
              className="btn-submit"
              onClick={() => handleSubmit()}
              disabled={loading || !question.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Querying…
                </>
              ) : (
                "Run Query ▸"
              )}
            </button>
          </div>
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">
            <strong>Error: </strong>
            {error}
          </div>
        )}

        {/* Generated SQL */}
        {result?.generatedSql && (
          <div className="sql-section">
            <div className="section-title">⚡ Generated SQL</div>
            <div className="sql-block">
              <code>{result.generatedSql}</code>
            </div>
          </div>
        )}

        {/* Results Table */}
        {result?.rows && (
          <div className="results-section">
            <div className="results-header">
              <div className="section-title">📊 Query Results</div>
              <span className="row-count">
                {result.rows.length} row{result.rows.length !== 1 ? "s" : ""}
              </span>
            </div>

            {result.rows.length === 0 ? (
              <div className="no-rows">No rows returned.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i}>
                        {columns.map((col) => (
                          <td key={col}>
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer className="app-footer">
        Azure Synapse NLP Demo &middot; Rule-based NLP → Serverless SQL
      </footer>
    </div>
  );
}
```

### `client/src/index.css`

```css
/* ── Reset & Base ─────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d2e;
  --bg-card: #1e2235;
  --bg-input: #252a3a;
  --border: #2e3450;
  --border-focus: #6366f1;
  --text-primary: #e8eaf0;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --accent: #6366f1;
  --accent-light: #818cf8;
  --accent-glow: rgba(99, 102, 241, 0.25);
  --success: #10b981;
  --error: #ef4444;
  --error-bg: rgba(239, 68, 68, 0.1);
  --gradient-start: #6366f1;
  --gradient-end: #a855f7;
  --radius: 12px;
  --radius-sm: 8px;
  --font:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font);
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── Layout ───────────────────────────────────── */
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hero-header {
  position: relative;
  padding: 48px 24px 32px;
  text-align: center;
  background: linear-gradient(135deg, #111427 0%, #1a1040 50%, #111427 100%);
  overflow: hidden;
}

.hero-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 60% 50% at 50% 0%,
    var(--accent-glow) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-header h1 {
  position: relative;
  font-weight: 800;
  font-size: 2rem;
  background: linear-gradient(
    135deg,
    var(--gradient-start),
    var(--gradient-end)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.hero-header p {
  position: relative;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.badge-row {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.main-content {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* ── Query Card ───────────────────────────────── */
.query-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}

.query-card label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.input-row input {
  flex: 1;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-family: var(--font);
  color: var(--text-primary);
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-row input::placeholder {
  color: var(--text-muted);
}

.input-row input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--font);
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--gradient-start),
    var(--gradient-end)
  );
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.1s;
  white-space: nowrap;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Suggestions ──────────────────────────────── */
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.suggestions button {
  padding: 6px 14px;
  font-size: 0.78rem;
  font-family: var(--font);
  color: var(--accent-light);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 999px;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.suggestions button:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
}

/* ── SQL Display ──────────────────────────────── */
.sql-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 28px;
  animation: fadeSlide 0.35s ease;
}

.sql-section .section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-light);
  margin-bottom: 10px;
}

.sql-block {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  overflow-x: auto;
}

.sql-block code {
  font-family: "Fira Code", "Cascadia Code", "JetBrains Mono", monospace;
  font-size: 0.85rem;
  color: var(--accent-light);
  white-space: pre-wrap;
  word-break: break-word;
}

/* ── Results Table ────────────────────────────── */
.results-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 28px;
  animation: fadeSlide 0.35s ease;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.results-header .section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--success);
}

.row-count {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: var(--bg-input);
  padding: 3px 10px;
  border-radius: 999px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.table-wrapper table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.table-wrapper th {
  position: sticky;
  top: 0;
  background: var(--bg-input);
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.table-wrapper td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  white-space: nowrap;
}

.table-wrapper tr:last-child td {
  border-bottom: none;
}

.table-wrapper tr:hover td {
  background: rgba(99, 102, 241, 0.04);
}

.no-rows {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ── Error ────────────────────────────────────── */
.error-box {
  background: var(--error-bg);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 28px;
  color: #fca5a5;
  font-size: 0.9rem;
  animation: fadeSlide 0.35s ease;
}

.error-box strong {
  color: var(--error);
}

/* ── Footer ───────────────────────────────────── */
.app-footer {
  text-align: center;
  padding: 20px;
  font-size: 0.75rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
}

/* ── Animations ───────────────────────────────── */
@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 640px) {
  .hero-header h1 {
    font-size: 1.5rem;
  }

  .input-row {
    flex-direction: column;
  }

  .btn-submit {
    justify-content: center;
  }

  .main-content {
    padding: 20px 16px 48px;
  }

  .query-card,
  .sql-section,
  .results-section {
    padding: 18px;
  }
}
```

### `README.md` (root)

```md
# Azure Synapse NLP Demo

End-to-end full-stack application:  
**React UI → Rule-based NLP → Azure Synapse Serverless SQL → Results Table**

## Architecture
```

┌─────────────┐ POST /query ┌───────────────────┐ T-SQL ┌────────────────────┐
│ React UI │ ──────────────────────▶ │ Express Server │ ─────────────────▶ │ Azure Synapse │
│ (Vite) │ ◀────────────────────── │ (Node.js) │ ◀───────────────── │ Serverless SQL │
└─────────────┘ JSON response └───────────────────┘ result rows └────────────────────┘

````

## Quick Start

### 1. Backend

#### ONE TIME

```bash
0setupserver.bat
````

#### EVERY TIME

```bash
1runserver.bat
```

### 2. Frontend

```bash
2runclient.bat
```

Open **http://localhost:5173** in your browser.

## Project Structure

```
azure-synapse-nlp-demo/
├── server/
│   ├── index.js          # Express API + NLP → SQL logic
│   ├── .env.example      # Environment template
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── index.css     # Styling
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## NLP Rules

| Question contains           | Generated SQL                                                    |
| --------------------------- | ---------------------------------------------------------------- |
| "total" + "sales"           | `SELECT SUM(amount) AS total_sales FROM dbo.sales_data;`         |
| "sales" + "region"          | `SELECT region, SUM(amount) … GROUP BY region ORDER BY …`        |
| "top" + ("product"/"sales") | `SELECT TOP 5 product_name, SUM(amount) … GROUP BY … ORDER BY …` |
| "india"                     | `SELECT * FROM dbo.sales_data WHERE region='India';`             |
| _(default)_                 | `SELECT TOP 10 * FROM dbo.sales_data;`                           |

## Tech Stack

- **Frontend**: React 19, Vite 6
- **Backend**: Node.js, Express 4, mssql
- **Database**: Azure Synapse Analytics (serverless SQL pool)

```

---

## Summary of Changes

| File | Change |
|---|---|
| `.gitignore` (root) | **Added** — was missing |
| `server/.gitignore` | **Added** — was missing |
| `0setupserver.bat` | **Fixed** — `cd /d "%~dp0server"` for reliable pathing, added `pause` |
| `1runserver.bat` | **Fixed** — `cd /d "%~dp0server"` for reliable pathing |
| `2runclient.bat` | **Fixed** — `cd /d "%~dp0client"` for reliable pathing |
| `server/index.js` | **Fixed** — SQL queries changed from `nlp_poc.dbo.sales_data` → `dbo.sales_data` (database already set in connection config, matches README docs) |
| All other files | **No changes needed** — verified correct |
```
