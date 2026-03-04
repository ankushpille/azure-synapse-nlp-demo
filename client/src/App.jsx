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
                <p>Ask a question in plain English — get SQL-powered answers from your data</p>
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
                            <button key={s} onClick={() => onSuggestion(s)} disabled={loading}>
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
