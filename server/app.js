const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const bugRoutes = require("./routes/bugRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded attachment files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/ai", aiRoutes);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.send("BugFlow Backend is Running 🚀");
});

module.exports = app;