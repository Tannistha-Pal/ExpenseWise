const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { upload, cloudinaryConfigured } = require("../middleware/uploadMiddleware");
const { sendError, sendSuccess } = require("../utils/responses");

const router = express.Router();

const getFileUrl = (req) => {
  if (!req.file) return "";
  if (cloudinaryConfigured) return req.file.path;
  return `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
};

router.post("/profile-photo", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const imageUrl = getFileUrl(req);
    if (!imageUrl) return sendError(res, 400, "No image file uploaded");

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    return sendSuccess(res, "Profile photo uploaded", { imageUrl, user });
  } catch (err) {
    return sendError(res, 500, "Profile photo upload failed", err.message);
  }
});

router.delete("/profile-photo", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: "" },
      { returnDocument: "after", runValidators: true }
    ).select("-password");
    return sendSuccess(res, "Profile photo deleted", { user });
  } catch (err) {
    return sendError(res, 500, "Profile photo delete failed", err.message);
  }
});

router.post("/expense-receipt", authMiddleware, upload.single("image"), (req, res) => {
  const imageUrl = getFileUrl(req);
  if (!imageUrl) return sendError(res, 400, "No image file uploaded");
  return sendSuccess(res, "Expense receipt uploaded", { imageUrl });
});

module.exports = router;
