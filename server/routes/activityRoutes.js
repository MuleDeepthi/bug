const express = require("express");

const {
  getBugActivities,
  addActivity,
} = require("../controllers/activityController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get activity history for a bug
router.get("/:bugId", authMiddleware, getBugActivities);

// Add activity to a bug
router.post("/:bugId", authMiddleware, addActivity);

module.exports = router;