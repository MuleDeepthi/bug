const express = require("express");

const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  assignBug,
  getAssignedBugs,
  updateBugStatus,
} = require("../controllers/bugController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// VIEW BUGS
// All authenticated users can view bugs
// =====================================================

// Get all bugs
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer", "tester"),
  getBugs
);

// Get bugs assigned to logged-in user
// IMPORTANT: Keep this BEFORE /:id
router.get(
  "/assigned",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer", "tester"),
  getAssignedBugs
);

// Get a single bug
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer", "tester"),
  getBugById
);

// =====================================================
// CREATE BUG
// Admin, Manager and Tester can create bugs
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "tester"),
  createBug
);

// =====================================================
// UPDATE STATUS
// Admin, Manager and Developer can update status
// =====================================================

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer","tester"),
  updateBugStatus
);

// =====================================================
// UPDATE BUG
// Admin, Manager and Developer can edit bugs
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer"),
  updateBug
);

// =====================================================
// ASSIGN BUG
// Admin, Manager and Tester can assign bugs
// =====================================================

router.put(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("admin", "manager", "developer"),
  assignBug
);
// =====================================================
// DELETE BUG
// Only Admin and Manager can delete bugs
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  deleteBug
);

module.exports = router;