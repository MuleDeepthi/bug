import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Bugs from "./pages/Bugs";
import CreateBug from "./pages/CreateBug";
import BugDetails from "./pages/BugDetails";
import "./App.css";

function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [user, setUser] = useState(getUserFromToken());

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(getUserFromToken());
      setLoggedIn(true);
      setPage("dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLoggedIn(false);
    setSelectedBugId(null);
  };

  if (!loggedIn) {
    return (
      <div className="login-shell">
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />

        <div className="login-card">
          <div className="brand brand-centered">
            <div className="brand-mark">B</div>
            <div>
              <div className="brand-name">BugFlow</div>
              <div className="brand-tag">Lifecycle Management</div>
            </div>
          </div>

          <div className="login-copy">
            <span className="eyebrow">WELCOME BACK</span>
            <h1>Manage bugs.<br /><span>Ship better.</span></h1>
            <p>Track issues, collaborate with your team, and move every bug through its lifecycle.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <label>Email</label>
            <div className="input-wrap">
              <span>✉</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <span>●</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="primary-button login-button" type="submit" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign in"}
              {!loginLoading && <span>→</span>}
            </button>
          </form>

          <div className="login-footer">
            <span>Secure workspace</span>
            <span>•</span>
            <span>Role-based access</span>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "bugs", icon: "🐞", label: "All Bugs" },
    { id: "createBug", icon: "+", label: "Create Bug" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">B</div>
          <div>
            <div className="brand-name">BugFlow</div>
            <div className="brand-tag">Issue workspace</div>
          </div>
        </div>

        <div className="sidebar-section-title">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">✦</span>
            <div>
              <strong>Keep shipping</strong>
              <p>Resolve issues and keep your project moving.</p>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div>
            <div className="topbar-kicker">BUGFLOW WORKSPACE</div>
            <div className="topbar-title">
              {page === "dashboard" && "Dashboard"}
              {page === "bugs" && "All Bugs"}
              {page === "createBug" && "Create New Bug"}
              {page === "bugDetails" && "Bug Details"}
            </div>
          </div>

          <div className="topbar-user">
            <div className="online-dot" />
            <div className="avatar">
              {(user?.role || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="user-meta">
              <strong>{user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "User"}</strong>
              <span>Active session</span>
            </div>
          </div>
        </header>

        <div className="content-shell">
          {page === "dashboard" && <Dashboard />}

          {page === "bugs" && (
            <Bugs
              onSelectBug={(bugId) => {
                setSelectedBugId(bugId);
                setPage("bugDetails");
              }}
            />
          )}

          {page === "bugDetails" && selectedBugId && (
            <BugDetails
              bugId={selectedBugId}
              onBack={() => setPage("bugs")}
            />
          )}

          {page === "createBug" && <CreateBug />}
        </div>
      </main>
    </div>
  );
}

export default App;
