<!-- server\README.md -->

# Azure Synapse NLP Demo – Server

Backend API that converts natural-language questions into SQL queries and executes them against Azure Synapse Analytics (serverless SQL pool).

## Prerequisites

- Node.js ≥ 18
- An Azure Synapse workspace with the `dbo.sales_data` view in the `nlp_poc` database

## Setup

```bash
cd server
cp .env.example .env   # then fill in your Synapse credentials
npm install
```

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

### Example questions

| Question                  | Generated SQL                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| What are the total sales? | `SELECT SUM(amount) AS total_sales FROM dbo.sales_data;`                                                                     |
| Show sales by region      | `SELECT region, SUM(amount) AS total_sales FROM dbo.sales_data GROUP BY region ORDER BY total_sales DESC;`                   |
| Top products by sales     | `SELECT TOP 5 product_name, SUM(amount) AS total_sales FROM dbo.sales_data GROUP BY product_name ORDER BY total_sales DESC;` |
| Sales in India            | `SELECT * FROM dbo.sales_data WHERE region='India';`                                                                         |
| _(any other question)_    | `SELECT TOP 10 * FROM dbo.sales_data;`                                                                                       |

### `GET /health`

Returns `{ "status": "ok" }` – useful for monitoring.
