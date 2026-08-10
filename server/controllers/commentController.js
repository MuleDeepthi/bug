const Comment = require("../models/Comment");

// Add a comment to a bug
const addComment = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const comment = await Comment.create({
      bug: bugId,
      user: req.user.id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name email role")
      .populate("bug", "title status");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get comments for a bug
const getComments = async (req, res) => {
  try {
    const { bugId } = req.params;

    const comments = await Comment.find({
      bug: bugId,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addComment,
  getComments,
};