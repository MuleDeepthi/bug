import { useState } from "react";

function CreateBug() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    severity: "Medium",
    project: "BugFlow",
    dueDate: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create bug");
        return;
      }

      setMessage("Bug created successfully!");
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        severity: "Medium",
        project: "BugFlow",
        dueDate: "",
      });
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="create-page">
      <div className="page-heading">
        <span className="eyebrow">NEW ISSUE</span>
        <h1>Create a bug</h1>
        <p>Capture enough detail for your team to reproduce and resolve the issue.</p>
      </div>

      <div className="create-card">
        {message && <div className="alert alert-success">✓ {message}</div>}
        {error && <div className="alert alert-error">! {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field full">
              <label>BUG TITLE</label>
              <input className="form-control" type="text" name="title" placeholder="e.g. Profile page is not loading" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-field full">
              <label>DESCRIPTION</label>
              <textarea className="form-control form-textarea" name="description" placeholder="Describe what happened, what you expected, and how to reproduce it." value={formData.description} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>PRIORITY</label>
              <select className="form-control" name="priority" value={formData.priority} onChange={handleChange}>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>

            <div className="form-field">
              <label>SEVERITY</label>
              <select className="form-control" name="severity" value={formData.severity} onChange={handleChange}>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>

            <div className="form-field">
              <label>PROJECT</label>
              <input className="form-control" type="text" name="project" value={formData.project} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>DUE DATE</label>
              <input className="form-control" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">Create Bug →</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBug;
