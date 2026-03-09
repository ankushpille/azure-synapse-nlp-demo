import "./Feedback.css";

function Feedback({ feedback, setFeedback, onSubmit }) {
  return (
    <div className="feedback-section">
      <div className="section-title">💬 Feedback</div>
      {!feedback.type ? (
        <>
          <div className="feedback-buttons">
            <button
              className="btn-helpful"
              onClick={() => onSubmit("helpful")}
              disabled={feedback.submitting}
            >
              {feedback.submitting ? "Submitting..." : "Helpful 👍"}
            </button>
            <button
              className="btn-not-helpful"
              onClick={() => onSubmit("not_helpful")}
              disabled={feedback.submitting}
            >
              {feedback.submitting ? "Submitting..." : "Not Helpful 👎"}
            </button>
          </div>
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
        </>
      ) : (
        <div className="feedback-thank-you">
          <span className="checkmark">✓</span>
          Thank you for your feedback!
        </div>
      )}
    </div>
  );
}

export default Feedback;
