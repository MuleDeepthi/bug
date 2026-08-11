


import { useEffect, useState } from "react";

function getRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";

    return JSON.parse(atob(token.split(".")[1])).role || "";
  } catch {
    return "";
  }
}

const statusClass = {
  Open: "status-open",
  "In Progress": "status-progress",
  Resolved: "status-resolved",
  Closed: "status-closed",
};

const priorityClass = {
  Critical: "priority-critical",
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

function BugDetails({ bugId, onBack }) {
  const [bug, setBug] = useState(null);
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const role = getRole();

  const canChangeStatus = ["admin", "manager", "developer"].includes(role);

  const loadActivities = async (token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/activities/${bugId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setActivities(
          Array.isArray(data.activities) ? data.activities : []
        );
      }
    } catch (err) {
      console.error("Activity error:", err);
    }
  };

  const loadComments = async (token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${bugId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setComments(
          Array.isArray(data.comments) ? data.comments : []
        );
      }
    } catch (err) {
      console.error("Comment loading error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/bugs/${bugId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load bug");
          return;
        }

        setBug(data.bug);

        await Promise.all([
          loadActivities(token),
          loadComments(token),
        ]);
      } catch (err) {
        console.error("Bug details error:", err);
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    if (bugId) {
      fetchData();
    }
  }, [bugId]);

  // ===============================
  // CHANGE STATUS
  // ===============================

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    try {
      setStatusLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/bugs/${bugId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      setBug(data.bug);

      await loadActivities(token);
    } catch (err) {
      console.error("Status update error:", err);
      alert("Unable to connect to server.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ===============================
  // ADD COMMENT
  // ===============================

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      setCommentLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/comments/${bugId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: commentText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add comment");
        return;
      }

      setComments((previous) => [
        ...previous,
        data.comment,
      ]);

      setCommentText("");

      await loadActivities(token);
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Unable to connect to server.");
    } finally {
      setCommentLoading(false);
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <p>Loading bug details...</p>
      </div>
    );
  }

  // ===============================
  // ERROR
  // ===============================

  if (error) {
    return (
      <div className="error-state">
        <button className="back-button" onClick={onBack}>
          ← Back to Bugs
        </button>

        <div className="error-card">
          <h2>Couldn't load bug</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="empty-state">
        <button className="back-button" onClick={onBack}>
          ← Back to Bugs
        </button>

        <h2>Bug not found</h2>
      </div>
    );
  }

  return (
    <div className="bug-details-page">

      {/* HEADER */}

      <div className="details-topbar">
        <button className="back-button" onClick={onBack}>
          ← Back to Bugs
        </button>

        <span className="bug-id">
          BUG #{bug._id?.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* MAIN BUG CARD */}

      <div className="bug-hero">

        <div className="bug-hero-content">

          <div className="bug-label">
            ISSUE TRACKER
          </div>

          <h1>{bug.title}</h1>

          <p className="bug-hero-description">
            {bug.description}
          </p>

          <div className="bug-badges">

            <span
              className={`status-badge ${
                statusClass[bug.status] || "status-open"
              }`}
            >
              ● {bug.status || "Open"}
            </span>

            <span
              className={`priority-badge ${
                priorityClass[bug.priority] || "priority-medium"
              }`}
            >
              {bug.priority || "Medium"} Priority
            </span>

            <span className="info-badge">
              Severity: {bug.severity || "Not specified"}
            </span>

          </div>
        </div>

        {/* STATUS CONTROL */}

        {canChangeStatus && (
          <div className="status-control">

            <label>Update Status</label>

            <select
              value={bug.status || "Open"}
              onChange={handleStatusChange}
              disabled={statusLoading}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {statusLoading && (
              <small>Updating...</small>
            )}

          </div>
        )}

      </div>

      {/* INFORMATION GRID */}

      <div className="details-grid">

        <div className="info-card">
          <span className="info-label">PROJECT</span>
          <strong>{bug.project || "—"}</strong>
        </div>

        <div className="info-card">
          <span className="info-label">ASSIGNED TO</span>
          <strong>
            {bug.assignedTo?.name || "Unassigned"}
          </strong>

          {bug.assignedTo?.email && (
            <small>{bug.assignedTo.email}</small>
          )}
        </div>

        <div className="info-card">
          <span className="info-label">REPORTED BY</span>
          <strong>
            {bug.reportedBy?.name || "Unknown"}
          </strong>

          {bug.reportedBy?.email && (
            <small>{bug.reportedBy.email}</small>
          )}
        </div>

        <div className="info-card">
          <span className="info-label">YOUR ROLE</span>
          <strong>
            {role
              ? role.charAt(0).toUpperCase() + role.slice(1)
              : "User"}
          </strong>
        </div>

      </div>

      {/* TWO COLUMN SECTION */}

      <div className="details-columns">

        {/* COMMENTS */}

        <section className="details-section">

          <div className="section-heading">
            <div>
              <span className="section-eyebrow">
                DISCUSSION
              </span>

              <h2>Comments</h2>
            </div>

            <span className="count-pill">
              {comments.length}
            </span>
          </div>

          <div className="comments-list">

            {comments.length === 0 ? (
              <div className="section-empty">
                <div className="empty-icon">💬</div>
                <p>No comments yet.</p>
                <small>
                  Start the discussion about this bug.
                </small>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div
                  className="comment-card"
                  key={comment._id || index}
                >

                  <div className="comment-avatar">
                    {(comment.user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="comment-content">

                    <div className="comment-header">

                      <strong>
                        {comment.user?.name || "User"}
                      </strong>

                      <span>
                        {comment.createdAt
                          ? new Date(
                              comment.createdAt
                            ).toLocaleString()
                          : ""}
                      </span>

                    </div>

                    <p>
                      {comment.text}
                    </p>

                  </div>

                </div>
              ))
            )}

          </div>

          {/* ADD COMMENT */}

          <form
            className="comment-form"
            onSubmit={handleAddComment}
          >

            <textarea
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
              placeholder="Write a comment..."
              rows="4"
            />

            <button
              type="submit"
              disabled={commentLoading}
            >
              {commentLoading
                ? "Posting..."
                : "Add Comment"}
            </button>

          </form>

        </section>

        {/* ACTIVITY HISTORY */}

        <section className="details-section">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                AUDIT TRAIL
              </span>

              <h2>Activity History</h2>
            </div>

            <span className="count-pill">
              {activities.length}
            </span>

          </div>

          <div className="activity-list">

            {activities.length === 0 ? (
              <div className="section-empty">
                <div className="empty-icon">◷</div>
                <p>No activity recorded.</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  className="activity-item"
                  key={activity._id || index}
                >

                  <div className="activity-dot"></div>

                  <div className="activity-content">

                    <strong>
                      {activity.action ||
                        "Activity"}
                    </strong>

                    <p>
                      {activity.details ||
                        "No details available."}
                    </p>

                    <small>
                      {activity.createdAt
                        ? new Date(
                            activity.createdAt
                          ).toLocaleString()
                        : ""}
                    </small>

                  </div>

                </div>
              ))
            )}

          </div>

        </section>

      </div>

    </div>
  );
}

export default BugDetails;