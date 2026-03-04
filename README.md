<!-- README.md -->

The requirement is to build an end-to-end application using free Azure services, where:
• Data/files are stored in Azure (similar to S3).
• Azure Synapse is used for managing/querying structured data.
• An NLP layer allows users to enter natural language queries.
• A simple UI is built to input queries and display results.
The complete flow should work from UI → NLP processing → Synapse query → result display.

# ---

# Azure Synapse NLP Demo

End-to-end full-stack application:  
**React UI → Rule-based NLP → Azure Synapse Serverless SQL → Results Table**

## Architecture

```
┌─────────────┐        POST /query         ┌───────────────────┐        T-SQL         ┌────────────────────┐
│  React UI   │  ──────────────────────▶   │  Express Server   │  ─────────────────▶  │  Azure Synapse     │
│  (Vite)     │  ◀──────────────────────   │  (Node.js)        │  ◀─────────────────  │  Serverless SQL    │
└─────────────┘      JSON response         └───────────────────┘     result rows      └────────────────────┘
```

## Quick Start

### 1. Backend

#### ONE TIME

```bash
0setupserver.bat
```

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

# ---

Azure resources in table format:

| Resource Name           | Resource Type     | What It Is                                | What It’s Used For                                                                                |
| ----------------------- | ----------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **nlpdatastorage123**   | Storage Account   | A general-purpose Azure storage container | Stores files, datasets, logs, blobs, or tables for your NLP project                               |
| **nlp-synapse-ws123**   | Synapse Workspace | Azure analytics workspace                 | Used for big data processing, SQL queries, Spark jobs, data pipelines (likely for NLP processing) |
| **nlp-project-rg**      | Resource Group    | Logical container for resources           | Organizes and manages all related Azure resources together                                        |
| **nlpprojstorage12345** | Storage Account   | Another storage account                   | Likely used separately for Synapse workspace storage, staging, or data lake                       |

- 🗂 **Resource Group (nlp-project-rg)**
  A folder that contains everything for your NLP project.

- 💾 **Storage Accounts (2 of them)**
  These hold:
  - Raw datasets
  - Processed outputs
  - Logs
  - Possibly Synapse data lake storage

- 📊 **Synapse Workspace**
  This is the analytics engine where you:
  - Run SQL queries
  - Use Spark for NLP processing
  - Build pipelines
  - Process large datasets

---

# ⚠️ Important (Cost Warning)

The **Synapse workspace** can generate costs even in free accounts if:

- SQL pools are running
- Spark pools are active

# ---
