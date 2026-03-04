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

| Question contains       | Generated SQL                                                         |
|--------------------------|-----------------------------------------------------------------------|
| "total" + "sales"        | `SELECT SUM(amount) AS total_sales FROM dbo.sales_data;`              |
| "sales" + "region"       | `SELECT region, SUM(amount) … GROUP BY region ORDER BY …`             |
| "top" + ("product"/"sales") | `SELECT TOP 5 product_name, SUM(amount) … GROUP BY … ORDER BY …`  |
| "india"                  | `SELECT * FROM dbo.sales_data WHERE region='India';`                  |
| *(default)*              | `SELECT TOP 10 * FROM dbo.sales_data;`                                |

## Tech Stack

- **Frontend**: React 19, Vite 6
- **Backend**: Node.js, Express 4, mssql
- **Database**: Azure Synapse Analytics (serverless SQL pool)
