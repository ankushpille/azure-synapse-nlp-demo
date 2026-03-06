// client\src\App.jsx

import { useState, useEffect } from "react";

const API_URL = "http://localhost:3001";

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
  const [queryHistory, setQueryHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState({
    type: null,
    comment: "",
    submitting: false,
  });

  // Fetch initial data
  useEffect(() => {
    fetchAnalytics();
    fetchQueryHistory();
  }, []);

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  // Fetch query history
  const fetchQueryHistory = async (limit = 10) => {
    try {
      const res = await fetch(
        `${API_URL}/analytics/query-history?limit=${limit}`,
      );
      if (res.ok) {
        const data = await res.json();
        setQueryHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch query history:", err);
    }
  };

  // Handle query submission
  const handleSubmit = async (q) => {
    const text = (q || question).trim();
    if (!text) return;

    setLoading(true);
    setError("");
    setResult(null);
    setFeedback({ type: null, comment: "", submitting: false });

    try {
      const res = await fetch(`${API_URL}/query`, {
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

      // Refresh analytics and query history
      fetchAnalytics();
      fetchQueryHistory();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion click
  const onSuggestion = (s) => {
    setQuestion(s);
    handleSubmit(s);
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (type) => {
    if (!result) return;

    setFeedback((prev) => ({ ...prev, submitting: true }));

    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: result.question,
          generatedSql: result.generatedSql,
          feedback: type,
          comment: feedback.comment.trim() || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server responded with ${res.status}`);
      }

      setFeedback((prev) => ({ ...prev, type, submitting: false }));
      fetchAnalytics(); // Refresh analytics
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setFeedback((prev) => ({ ...prev, submitting: false }));
    }
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
        {/* Analytics Summary */}
        {analytics && (
          <div className="analytics-section">
            <div className="section-title">📈 Analytics Summary</div>
            <div className="analytics-grid">
              <div className="stat-card">
                <div className="stat-value">{analytics.totalQueries}</div>
                <div className="stat-label">Total Queries</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analytics.successfulQueries}</div>
                <div className="stat-label">Successful Queries</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analytics.failedQueries}</div>
                <div className="stat-label">Failed Queries</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {analytics.averageResponseTimeMs}ms
                </div>
                <div className="stat-label">Avg Response Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {analytics.helpfulFeedbackCount}
                </div>
                <div className="stat-label">Helpful Feedback</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {analytics.notHelpfulFeedbackCount}
                </div>
                <div className="stat-label">Not Helpful Feedback</div>
              </div>
            </div>
          </div>
        )}

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

            {/* Feedback Section */}
            <div className="feedback-section">
              <div className="section-title">💬 Feedback</div>
              {!feedback.type ? (
                <div className="feedback-buttons">
                  <button
                    className="btn-helpful"
                    onClick={() => handleFeedbackSubmit("helpful")}
                    disabled={feedback.submitting}
                  >
                    {feedback.submitting ? "Submitting..." : "Helpful"}
                  </button>
                  <button
                    className="btn-not-helpful"
                    onClick={() => handleFeedbackSubmit("not_helpful")}
                    disabled={feedback.submitting}
                  >
                    {feedback.submitting ? "Submitting..." : "Not Helpful"}
                  </button>
                </div>
              ) : (
                <div className="feedback-thank-you">
                  <span className="checkmark">✓</span>
                  Thank you for your feedback!
                </div>
              )}
              {!feedback.type && (
                <div className="feedback-comment">
                  <textarea
                    placeholder="Add optional comment..."
                    value={feedback.comment}
                    onChange={(e) =>
                      setFeedback((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    disabled={feedback.submitting}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Query History */}
        {queryHistory.length > 0 && (
          <div className="history-section">
            <div className="section-title">
              📜 Query History ({queryHistory.length})
            </div>
            <div className="history-list">
              {queryHistory.map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-question">{log.question}</div>
                  <div className="history-meta">
                    <span className={`status status-${log.status}`}>
                      {log.status === "success" ? "✓" : "✗"}
                      {log.status}
                    </span>
                    <span className="response-time">
                      {log.responseTimeMs}ms
                    </span>
                    <span className="row-count">{log.rowCount} rows</span>
                    <span className="timestamp">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.errorMessage && (
                    <div className="history-error">
                      Error: {log.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
