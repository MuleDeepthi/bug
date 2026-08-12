const express = require("express");

const {
  suggestDeveloper,
} = require("../controllers/assignmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// SUGGEST DEVELOPER
// Admin, Manager and Tester can request suggestion
// =====================================================

router.get(
  "/suggest-developer",
  authMiddleware,
  roleMiddleware("admin", "manager", "tester"),
  suggestDeveloper
);

module.exports = router;