const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/responses");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Authorization header missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "replace_me_in_env");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, 401, "Invalid token: user not found");
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 401, "Invalid or expired token", err.message);
  }
};

module.exports = authMiddleware;
