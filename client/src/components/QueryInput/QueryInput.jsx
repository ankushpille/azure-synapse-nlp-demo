import "./QueryInput.css";

const SUGGESTIONS = [
  "What are the total sales?",
  "Show sales by region",
  "Top products by sales",
  "Sales in India",
  "Show me all data",
];

function QueryInput({
  question,
  setQuestion,
  loading,
  error,
  onSubmit,
  onSuggestion,
}) {
  return (
    <>
      {/* Query Card */}
      <div className="card query-card">
        <label htmlFor="nlp-input" className="query-label">
          Ask your question
        </label>
        <div className="input-row">
          <input
            id="nlp-input"
            type="text"
            className="input"
            placeholder='e.g. "What are the total sales?"'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            disabled={loading}
          />
          <button
            className="btn btn-primary btn-submit"
            onClick={onSubmit}
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
    </>
  );
}

export default QueryInput;
