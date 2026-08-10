const express = require("express");

const {
  registerUser,
  loginUser,
  getUsersByRole,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
// Get users by role
router.get("/users", authMiddleware, getUsersByRole);

// Protected profile route
router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Admin-only route
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin! You have admin access.",
      user: req.user,
    });
  }
);

module.exports = router;