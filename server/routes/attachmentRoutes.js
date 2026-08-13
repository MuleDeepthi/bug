const express = require("express");

const {
  uploadAttachment,
  getAttachments,
} = require("../controllers/attachmentController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// UPLOAD ATTACHMENT
// =====================================================

router.post(
  "/:bugId",
  authMiddleware,
  upload.single("file"),
  uploadAttachment
);

// =====================================================
// GET ATTACHMENTS
// =====================================================

router.get(
  "/:bugId",
  authMiddleware,
  getAttachments
);

module.exports = router;