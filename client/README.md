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

The dev server starts at **http://localhost:5173** (default Vite port).

## Features

- Type a question or click a suggestion chip
- See the generated SQL query
- View results in a dynamic table
- Loading spinner and error handling
