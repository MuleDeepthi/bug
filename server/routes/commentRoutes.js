const express = require("express");

const {
  addComment,
  getComments,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add a comment to a bug
router.post("/:bugId", authMiddleware, addComment);

// Get comments for a bug
router.get("/:bugId", authMiddleware, getComments);

module.exports = router;