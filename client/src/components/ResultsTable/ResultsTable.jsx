import "./ResultsTable.css";

function ResultsTable({ result }) {
  if (!result) return null;

  const columns = result?.rows?.length ? Object.keys(result.rows[0]) : [];

  return (
    <>
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
        <div className="card results-section">
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
              <table className="result-table">
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
    </>
  );
}

export default ResultsTable;
