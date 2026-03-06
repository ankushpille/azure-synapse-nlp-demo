// client\src\App.jsx

import { useState, useEffect } from "react";
import QueryInput from "./components/QueryInput/QueryInput";
import ResultsTable from "./components/ResultsTable/ResultsTable";
import Feedback from "./components/Feedback/Feedback";
import QueryHistory from "./components/QueryHistory/QueryHistory";
import "./styles/global.css";
import "./styles/layout.css";

const API_URL = "http://localhost:3001";

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
        <div className="container">
          {/* Analytics Summary */}
          {analytics && (
            <div className="card analytics-section">
              <div className="section-title">📈 Analytics Summary</div>
              <div className="analytics-grid">
                <div className="stat-card">
                  <div className="stat-value">{analytics.totalQueries}</div>
                  <div className="stat-label">Total Queries</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {analytics.successfulQueries}
                  </div>
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

          {/* Query Input */}
          <QueryInput
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onSuggestion={onSuggestion}
          />

          {/* Results Table */}
          <ResultsTable result={result} />

          {/* Feedback */}
          {result && (
            <Feedback
              feedback={feedback}
              setFeedback={setFeedback}
              onSubmit={handleFeedbackSubmit}
            />
          )}

          {/* Query History */}
          <QueryHistory history={queryHistory} />
        </div>
      </main>

      {/* ── Footer ────────────────────────────── */}
      <footer className="app-footer">
        Azure Synapse NLP Demo &middot; Rule-based NLP → Serverless SQL
      </footer>
    </div>
  );
}
