import { useEffect, useState } from "react";

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

function Bugs({ onSelectBug }) {
  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/bugs", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load bugs");
          return;
        }
        setBugs(data.bugs || []);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to server");
      }
    };

    fetchBugs();
  }, []);

  const filteredBugs = bugs.filter((bug) => {
    const text = `${bug.title} ${bug.description} ${bug.project} ${bug.status} ${bug.priority}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (error) return <div className="error-state"><h2>Couldn’t load bugs</h2><p>{error}</p></div>;

  return (
    <div className="bugs-page">
      <div className="page-heading">
        <span className="eyebrow">ISSUE TRACKER</span>
        <h1>All bugs</h1>
        <p>Review, prioritize and follow every issue in your workspace.</p>
      </div>

      <div className="toolbar">
        <input
          className="search-box"
          placeholder="Search bugs, projects, priority..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="meta-pill">{filteredBugs.length} of {bugs.length} bugs</span>
      </div>

      {filteredBugs.length === 0 ? (
        <div className="empty-state">
          <h3>No bugs found</h3>
          <p>Try another search or create a new bug.</p>
        </div>
      ) : (
        <div className="bug-list">
          {filteredBugs.map((bug) => (
            <div key={bug._id} className="bug-card" onClick={() => onSelectBug(bug._id)}>
              <div className="bug-card-head">
                <div>
                  <h2 className="bug-title">{bug.title}</h2>
                  <p className="bug-description">{bug.description}</p>
                </div>
                <span className={`badge ${statusClass[bug.status] || "badge-medium"}`}>
                  ● {bug.status || "Open"}
                </span>
              </div>

              <div className="bug-meta">
                <span className={`badge ${priorityClass[bug.priority] || "badge-medium"}`}>{bug.priority || "Medium"}</span>
                <span className="meta-pill">Severity: {bug.severity || "—"}</span>
                <span className="meta-pill">Project: {bug.project || "—"}</span>
                <span className="meta-pill">Assigned: {bug.assignedTo?.name || "Unassigned"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bugs;
