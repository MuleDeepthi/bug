const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Dashboard statistics
// All logged-in roles can access
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer", "tester"),
  getDashboardStats
);

module.exports = router;