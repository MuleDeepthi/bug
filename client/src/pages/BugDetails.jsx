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
  Open: "badge-open",
  "In Progress": "badge-progress",
  Resolved: "badge-resolved",
  Closed: "badge-closed",
};

const priorityClass = {
  Critical: "badge-critical",
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
};

function BugDetails({ bugId, onBack }) {
  const [bug, setBug] = useState(null);
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [role] = useState(getRole());

  const loadActivities = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/activities/${bugId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setActivities(Array.isArray(data.activities) ? data.activities : []);
    } catch (err) {
      console.error("Activity error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const bugResponse = await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bugData = await bugResponse.json();

        if (!bugResponse.ok) {
          setError(bugData.message || "Failed to load bug");
          return;
        }

        setBug(bugData.bug);
        await loadActivities(token);

        try {
          const commentResponse = await fetch(`http://localhost:5000/api/comments/${bugId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const commentData = await commentResponse.json();
          if (commentResponse.ok) setComments(Array.isArray(commentData.comments) ? commentData.comments : []);
        } catch (err) {
          console.error("Comment loading error:", err);
        }
      } catch (err) {
        console.error("Bug details error:", err);
        setError("Unable to connect to server");
      }
    };

    if (bugId) fetchData();
  }, [bugId]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    try {
      setStatusLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/bugs/${bugId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

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

      const response = await fetch(`http://localhost:5000/api/comments/${bugId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add comment");
        return;
      }

      setComments((previous) => [...previous, data.comment]);
      setCommentText("");
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Unable to connect to server.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (error) {
    return <div className="error-state"><button className="back-button" onClick={onBack}>← Back to bugs</button><h2>Unable to open bug</h2><p>{error}</p></div>;
  }

  if (!bug) {
    return <div className="loading-state"><h2>Loading bug details...</h2><p>Fetching issue information and activity.</p></div>;
  }

  const canUpdateStatus = ["admin", "manager", "developer"].includes(role);

  return (
    <div>
      <div className="details-header">
        <div>
          <button className="back-button" onClick={onBack}>← Back to bugs</button>
          <h1 className="details-title">{bug.title}</h1>
          <p className="details-subtitle">Bug ID: {bug._id}</p>
        </div>

        <div className="status-control">
          <label>STATUS</label>
          <select
            className="status-select"
            value={bug.status || "Open"}
            onChange={handleStatusChange}
            disabled={statusLoading || !canUpdateStatus}
            title={!canUpdateStatus ? "Only admin, manager or developer can update status" : "Update bug status"}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          {statusLoading && <span className="muted">Updating...</span>}
        </div>
      </div>

      <div className="details-grid">
        <div>
          <div className="detail-panel">
            <h2>Bug information</h2>
            <div className="description-box">{bug.description}</div>

            <div className="detail-row"><span className="detail-label">Status</span><span className={`badge ${statusClass[bug.status] || "badge-medium"}`}>{bug.status || "Open"}</span></div>
            <div className="detail-row"><span className="detail-label">Priority</span><span className={`badge ${priorityClass[bug.priority] || "badge-medium"}`}>{bug.priority || "Medium"}</span></div>
            <div className="detail-row"><span className="detail-label">Severity</span><span className="detail-value">{bug.severity || "—"}</span></div>
            <div className="detail-row"><span className="detail-label">Project</span><span className="detail-value">{bug.project || "—"}</span></div>
            <div className="detail-row"><span className="detail-label">Reported by</span><span className="detail-value">{bug.reportedBy?.name || "—"}</span></div>
            <div className="detail-row"><span className="detail-label">Assigned to</span><span className="detail-value">{bug.assignedTo?.name || "Unassigned"}</span></div>
            {bug.dueDate && <div className="detail-row"><span className="detail-label">Due date</span><span className="detail-value">{new Date(bug.dueDate).toLocaleDateString()}</span></div>}
          </div>

          <div className="detail-panel" style={{ marginTop: 18 }}>
            <h2>Comments <span className="meta-pill">{comments.length}</span></h2>

            {comments.length === 0 ? (
              <p className="muted">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <strong>{comment.user?.name || "User"}</strong>
                  <p>{comment.text}</p>
                  <small>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</small>
                </div>
              ))
            )}

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                className="form-control form-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment for your team..."
                rows="3"
              />
              <button className="primary-button comment-button" type="submit" disabled={commentLoading}>
                {commentLoading ? "Adding..." : "Add comment"}
              </button>
            </form>
          </div>
        </div>

        <div className="detail-panel">
          <h2>Activity history</h2>
          {activities.length === 0 ? (
            <p className="muted">No activities yet.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity._id} className="activity-item">
                <strong>{activity.action}</strong>
                <p>{activity.details}</p>
                <small>
                  {activity.user?.name || "User"} {activity.createdAt ? `• ${new Date(activity.createdAt).toLocaleString()}` : ""}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BugDetails;
