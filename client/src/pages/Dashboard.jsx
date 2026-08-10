import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const response = await fetch("http://localhost:5000/api/dashboard/stats", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Failed to load dashboard");
          return;
        }
        setStats(data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Unable to connect to server");
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <div className="error-state"><h2>Dashboard unavailable</h2><p>{error}</p></div>;
  }

  if (!stats) {
    return <div className="loading-state"><h2>Loading dashboard...</h2><p>Fetching your latest bug metrics.</p></div>;
  }

  const total = stats.totalBugs || 1;
  const percent = (value) => Math.min(100, Math.round((value / total) * 100));

  const cards = [
    ["Total Bugs", stats.totalBugs, "▦", ""],
    ["Open Bugs", stats.openBugs, "○", ""],
    ["In Progress", stats.inProgressBugs, "◐", "warning"],
    ["Resolved", stats.resolvedBugs, "✓", "success"],
    ["Closed", stats.closedBugs, "◆", ""],
    ["Critical Bugs", stats.criticalBugs, "!", "danger"],
    ["High Priority", stats.highPriorityBugs, "↑", "warning"],
  ];

  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">OVERVIEW</span>
        <h1>Good to see you back.</h1>
        <p>Here’s what’s happening across your BugFlow workspace.</p>
      </div>

      <div className="dashboard-grid">
        {cards.map(([label, value, icon, tone]) => (
          <div className={`stat-card ${tone}`} key={label}>
            <div className="stat-top">
              <span className="stat-label">{label}</span>
              <span className="stat-icon">{icon}</span>
            </div>
            <div className="stat-number">{value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-lower">
        <div className="panel">
          <h2 className="panel-title">Bug lifecycle</h2>
          <p className="panel-subtitle">Current distribution of reported issues</p>

          <div className="status-row">
            <div className="status-row-head"><span>Open</span><strong>{stats.openBugs}</strong></div>
            <div className="progress"><span style={{ width: `${percent(stats.openBugs)}%` }} /></div>
          </div>

          <div className="status-row">
            <div className="status-row-head"><span>In Progress</span><strong>{stats.inProgressBugs}</strong></div>
            <div className="progress orange"><span style={{ width: `${percent(stats.inProgressBugs)}%` }} /></div>
          </div>

          <div className="status-row">
            <div className="status-row-head"><span>Resolved</span><strong>{stats.resolvedBugs}</strong></div>
            <div className="progress green"><span style={{ width: `${percent(stats.resolvedBugs)}%` }} /></div>
          </div>

          <div className="status-row">
            <div className="status-row-head"><span>Closed</span><strong>{stats.closedBugs}</strong></div>
            <div className="progress"><span style={{ width: `${percent(stats.closedBugs)}%` }} /></div>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Priority snapshot</h2>
          <p className="panel-subtitle">Issues that need the most attention</p>
          <div className="detail-row"><span className="detail-label">Critical</span><span className="badge badge-critical">{stats.criticalBugs} bugs</span></div>
          <div className="detail-row"><span className="detail-label">High priority</span><span className="badge badge-high">{stats.highPriorityBugs} bugs</span></div>
          <div className="detail-row"><span className="detail-label">All reported</span><span className="badge badge-medium">{stats.totalBugs} bugs</span></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
