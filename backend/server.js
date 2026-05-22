require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { sendError } = require("./utils/responses");

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensewise";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const allowedOrigins = new Set([
  FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const parsed = new URL(origin);
        const isLocalDev = ["localhost", "127.0.0.1"].includes(parsed.hostname);
        if (isLocalDev || allowedOrigins.has(origin)) return callback(null, true);
      } catch {
        return callback(new Error("CORS policy: invalid origin"));
      }
      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ success: true, message: "ExpenseWise API working" });
});
app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", database: mongoose.connection.readyState });
});

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/add-expense", expenseRoutes);
app.use("/upload", uploadRoutes);

app.use((req, res) => {
  return sendError(res, 404, "Route not found");
});

app.use((err, req, res, next) => {
  if (err && err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, 400, "Upload failed: file must be smaller than 2MB", err.message);
    }
    return sendError(res, 400, "Upload failed", err.message);
  }
  if (err && err.message === "Only image files are allowed") {
    return sendError(res, 400, "Upload failed: only image files are allowed", err.message);
  }
  if (err && err.message && err.message.startsWith("CORS policy")) {
    return sendError(res, 403, err.message);
  }

  console.error("Unhandled error:", err);
  return sendError(res, 500, "Internal server error", err?.message || "Unknown error");
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
