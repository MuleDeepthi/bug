const express = require("express");

const {
  analyzeBug,
} = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// AI BUG ANALYSIS
// =====================================================

router.post(
  "/analyze",
  authMiddleware,
  analyzeBug
);

module.exports = router;