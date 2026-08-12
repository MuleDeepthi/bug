const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const bugRoutes = require("./routes/bugRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const app = express();

// Middlewarecd server
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assignments", assignmentRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("BugFlow Backend is Running 🚀");
});

module.exports = app;