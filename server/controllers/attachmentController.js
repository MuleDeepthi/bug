const Bug = require("../models/Bug");

// =====================================================
// UPLOAD ATTACHMENT
// =====================================================

const uploadAttachment = async (req, res) => {
  try {
    const { bugId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    const attachment = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
    };

    bug.attachments.push(attachment);

    await bug.save();

    res.status(201).json({
      message: "File uploaded successfully",
      attachment,
    });
  } catch (error) {
    console.error("Upload attachment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET ATTACHMENTS
// =====================================================

const getAttachments = async (req, res) => {
  try {
    const { bugId } = req.params;

    const bug = await Bug.findById(bugId).select("attachments");

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found",
      });
    }

    res.status(200).json({
      count: bug.attachments.length,
      attachments: bug.attachments,
    });
  } catch (error) {
    console.error("Get attachments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  uploadAttachment,
  getAttachments,
};