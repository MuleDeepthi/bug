import { useEffect, useState } from "react";

function CreateBug() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    severity: "Medium",
    project: "BugFlow",
    assignedTo: "",
    dueDate: "",
  });

  const [developers, setDevelopers] = useState([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DEVELOPERS
  // ==========================================

  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/auth/users?role=developer",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load developers");
          return;
        }

        setDevelopers(data.users || []);
      } catch (err) {
        console.error("Developer loading error:", err);
        setError("Unable to load developers");
      } finally {
        setLoadingDevelopers(false);
      }
    };

    loadDevelopers();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // CREATE BUG
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/bugs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            severity: formData.severity,
            project: formData.project,
            assignedTo: formData.assignedTo || null,
            dueDate: formData.dueDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create bug");
        return;
      }

      setMessage("Bug created and assigned successfully!");

      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        severity: "Medium",
        project: "BugFlow",
        assignedTo: "",
        dueDate: "",
      });
    } catch (err) {
      console.error("Create bug error:", err);
      setError("Unable to connect to server.");
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="create-page">

      <div className="page-heading">
        <span className="eyebrow">NEW ISSUE</span>

        <h1>Create a bug</h1>

        <p>
          Capture enough detail for your team to reproduce and
          resolve the issue.
        </p>
      </div>

      <div className="create-card">

        {message && (
          <div className="alert alert-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ! {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* BUG TITLE */}

          <div className="form-grid">

            <div className="form-field full">
              <label>BUG TITLE</label>

              <input
                className="form-control"
                type="text"
                name="title"
                placeholder="e.g. Profile page is not loading"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="form-field full">
              <label>DESCRIPTION</label>

              <textarea
                className="form-control form-textarea"
                name="description"
                placeholder="Describe what happened, what you expected, and how to reproduce it."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* PRIORITY */}

            <div className="form-field">
              <label>PRIORITY</label>

              <select
                className="form-control"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* SEVERITY */}

            <div className="form-field">
              <label>SEVERITY</label>

              <select
                className="form-control"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* PROJECT */}

            <div className="form-field">
              <label>PROJECT</label>

              <input
                className="form-control"
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
              />
            </div>

            {/* ASSIGN DEVELOPER */}

            <div className="form-field">
              <label>ASSIGN TO</label>

              <select
                className="form-control"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={loadingDevelopers}
              >
                <option value="">
                  {loadingDevelopers
                    ? "Loading developers..."
                    : "Select Developer"}
                </option>

                {developers.map((developer) => (
                  <option
                    key={developer._id}
                    value={developer._id}
                  >
                    {developer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DUE DATE */}

            <div className="form-field">
              <label>DUE DATE</label>

              <input
                className="form-control"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* ACTION */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              Create Bug →
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateBug;