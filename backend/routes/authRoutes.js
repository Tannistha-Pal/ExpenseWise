const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { sendError, sendSuccess } = require("../utils/responses");
const { sendPasswordResetEmail } = require("../utils/email");

const router = express.Router();
const RESET_TOKEN_EXPIRES_MINUTES = 15;

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "replace_me_in_env",
    { expiresIn: "7d" }
  );
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
};

const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return sendError(res, 400, "All fields are required");
    }
    if (String(password).length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 400, "User with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: hashedPassword,
    });
    const token = createToken(user);

    return sendSuccess(res, "User created successfully", { user, token }, 201);
  } catch (err) {
    return sendError(res, 500, "Signup failed", err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    email = String(email).trim().toLowerCase();
    password = String(password);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = createToken(user);
    return sendSuccess(res, "Login successful", { user, token });
  } catch (err) {
    return sendError(res, 500, "Login failed", err.message);
  }
});

router.get("/me", authMiddleware, (req, res) => {
  return sendSuccess(res, "User fetched", { user: req.user });
});

router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!String(name).trim()) return sendError(res, 400, "Name is required");
      updates.name = String(name).trim();
    }
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) return sendError(res, 400, "Email is required");
      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
      if (existingUser) return sendError(res, 400, "Email is already in use");
      updates.email = normalizedEmail;
    }
    if (phone !== undefined) {
      if (!String(phone).trim()) return sendError(res, 400, "Phone is required");
      updates.phone = String(phone).trim();
    }
    if (avatar !== undefined) {
      updates.avatar = String(avatar);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");

    return sendSuccess(res, "Profile updated", { user });
  } catch (err) {
    return sendError(res, 500, "Profile update failed", err.message);
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "Current password and new password are required");
    }
    if (String(newPassword).length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.comparePassword(String(currentPassword)))) {
      return sendError(res, 400, "Current password is incorrect");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    return sendSuccess(res, "Password changed successfully");
  } catch (err) {
    return sendError(res, 500, "Password change failed", err.message);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return sendError(res, 400, "Please enter a valid email address");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return sendSuccess(res, "If an account exists for this email, a reset link has been sent");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashResetToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    const resetLink = `${frontendOrigin}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetLink,
      expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES,
    });

    const responseData = { expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES };
    if (process.env.NODE_ENV !== "production" && emailResult.preview) {
      responseData.resetLink = emailResult.preview;
    }

    return sendSuccess(
      res,
      "If an account exists for this email, a reset link has been sent",
      responseData
    );
  } catch (err) {
    return sendError(res, 500, "Could not send password reset email", err.message);
  }
});

router.get("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = hashResetToken(req.params.token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("_id email passwordResetExpires");

    if (!user) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    return sendSuccess(res, "Reset token is valid", {
      email: user.email,
      expiresAt: user.passwordResetExpires,
    });
  } catch (err) {
    return sendError(res, 500, "Could not verify reset token", err.message);
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || String(password).length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const hashedToken = hashResetToken(req.params.token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(password), salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return sendSuccess(res, "Password reset successfully");
  } catch (err) {
    return sendError(res, 500, "Password reset failed", err.message);
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return sendSuccess(res, "Users fetched", { users });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch users", err.message);
  }
});

module.exports = router;
