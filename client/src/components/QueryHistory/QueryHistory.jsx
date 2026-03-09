import "./QueryHistory.css";

function QueryHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="card history-section">
      <div className="section-title">📜 Query History ({history.length})</div>
      <div className="history-list">
        {history.map((log) => (
          <div key={log.id} className="history-item">
            <div className="history-question">{log.question}</div>
            <div className="history-meta">
              <span className={`status status-${log.status}`}>
                {log.status === "success" ? "✓" : "✗"}
                {log.status}
              </span>
              <span className="response-time">{log.responseTimeMs}ms</span>
              <span className="row-count">{log.rowCount} rows</span>
              <span className="timestamp">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            {log.errorMessage && (
              <div className="history-error">
                <strong>Error:</strong> {log.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QueryHistory;
