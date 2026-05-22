const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const Expense = require("./models/Expense");
const authRoutes = require("./routes/authRoutes");
const { upload } = require("./middleware/uploadMiddleware");
const authMiddleware = require("./middleware/authMiddleware");
const { globalLimiter } = require("./middleware/rateLimitMiddleware");
const { sendSuccess, sendError } = require("./utils/response");

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(globalLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (origin === process.env.FRONTEND_ORIGIN || origin.startsWith("http://localhost") || origin.startsWith("https://localhost")) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.get("/expenses", authMiddleware, async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const type = typeof req.query.type === "string" ? req.query.type.trim() : "";
    const month = typeof req.query.month === "string" ? parseInt(req.query.month, 10) : null;
    const year = typeof req.query.year === "string" ? parseInt(req.query.year, 10) : null;
    const startDate = typeof req.query.startDate === "string" && req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = typeof req.query.endDate === "string" && req.query.endDate ? new Date(req.query.endDate) : null;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "latest";
    const page = typeof req.query.page === "string" ? Math.max(parseInt(req.query.page, 10) || 1, 1) : 1;
    const limit = typeof req.query.limit === "string" ? Math.max(parseInt(req.query.limit, 10) || 10, 1) : 10;
    const sortOrderParam = typeof req.query.sortOrder === "string" ? req.query.sortOrder : "desc";
    const sortOrder = sortOrderParam.toLowerCase() === "asc" ? 1 : -1;

    const filter = { userId: req.user._id };

    if (search) {
      const orQuery = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { type: { $regex: `^${search}$`, $options: "i" } },
      ];

      const numericSearch = Number(search);
      if (!Number.isNaN(numericSearch)) {
        orQuery.push({ amount: numericSearch });
      }

      filter.$or = orQuery;
    }

    if (category && category.toLowerCase() !== "all") {
      filter.category = category;
    }

    if (type && type.toLowerCase() !== "all") {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (month !== null && year !== null && !Number.isNaN(month) && !Number.isNaN(year)) {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const total = await Expense.countDocuments(filter);
    const sort = {};
    if (sortBy === "latest") {
      sort.date = -1;
    } else if (sortBy === "oldest") {
      sort.date = 1;
    } else if (sortBy === "highest") {
      sort.amount = -1;
    } else if (sortBy === "lowest") {
      sort.amount = 1;
    } else if (sortBy === "date") {
      sort.date = sortOrder;
    } else if (sortBy === "amount") {
      sort.amount = sortOrder;
    } else {
      sort.date = -1;
    }

    const skip = (page - 1) * limit;
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return sendSuccess(res, "Expenses fetched", {
      expenses,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("? Fetch error:\n", err?.message ?? err);
    return sendError(res, 500, "Failed to fetch expenses", err?.message ?? "Unknown error");
  }
});

app.post("/add-expense", authMiddleware, async (req, res) => {
  try {
    const { title, amount, type, category, date, receiptUrl } = req.body;
    const amountValue = Number(amount);
    const validTypes = ["income", "expense"];

    if (!title || title.trim().length === 0) {
      return sendError(res, 400, "Title is required");
    }

    if (isNaN(amountValue) || amountValue <= 0) {
      return sendError(res, 400, "Amount must be a number greater than 0");
    }

    if (!type || !validTypes.includes(type)) {
      return sendError(res, 400, "Type must be either 'income' or 'expense'");
    }

    const expense = new Expense({
      title: title.trim(),
      amount: amountValue,
      type,
      category: category || "General",
      date: date ? new Date(date) : new Date(),
      receiptUrl: receiptUrl || "",
      userId: req.user._id,
      createdBy: req.user.name,
    });
    const saved = await expense.save();
    return sendSuccess(res, "Expense saved", { expense: saved });
  } catch (err) {
    console.error("? Save error:\n", err?.message ?? err);
    return sendError(res, 500, "Failed to save expense", err?.message ?? "Unknown error");
  }
});

app.put("/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const { title, amount, type, category, date, receiptUrl } = req.body;
    const amountValue = Number(amount);
    const validTypes = ["income", "expense"];

    if (!title || title.trim().length === 0) {
      return sendError(res, 400, "Title is required");
    }

    if (isNaN(amountValue) || amountValue <= 0) {
      return sendError(res, 400, "Amount must be a number greater than 0");
    }

    if (!type || !validTypes.includes(type)) {
      return sendError(res, 400, "Type must be either 'income' or 'expense'");
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) return sendError(res, 404, "Transaction not found");
    if (expense.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to update this expense");
    }

    expense.title = title.trim();
    expense.amount = amountValue;
    expense.type = type;
    expense.category = category || expense.category || "General";
    expense.date = date ? new Date(date) : expense.date || new Date();
    expense.receiptUrl = receiptUrl !== undefined ? receiptUrl : expense.receiptUrl;
    expense.createdBy = expense.createdBy || req.user.name;
    const updatedExpense = await expense.save();

    return sendSuccess(res, "Expense updated", { expense: updatedExpense });
  } catch (err) {
    console.error("? Update error:\n", err?.message ?? err);
    return sendError(res, 500, "Failed to update expense", err?.message ?? "Unknown error");
  }
});

app.delete("/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return sendError(res, 404, "Transaction not found");
    if (expense.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to delete this expense");
    }
    await expense.remove();
    return sendSuccess(res, "Expense deleted", {});
  } catch (err) {
    console.error("? Delete error:\n", err?.message ?? err);
    return sendError(res, 500, "Failed to delete expense", err?.message ?? "Unknown error");
  }
});

app.post("/upload/profile-photo", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "Please upload a profile image");
    }

    const imageUrl = req.file.path || req.file.secure_url || req.file.filename || "";
    req.user.avatar = imageUrl;
    await req.user.save();

    return sendSuccess(res, "Profile photo uploaded", { user: req.user, imageUrl });
  } catch (err) {
    console.error("? Profile upload error:\n", err?.message ?? err);
    return sendError(res, 500, "Failed to upload profile photo", err?.message ?? "Unknown error");
  }
});

app.post("/upload/expense-receipt", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "Please upload a receipt image");
    }

    const imageUrl = req.file.path || req.file.secure_url || req.file.filename || "";
    return sendSuccess(res, "Receipt uploaded", { imageUrl });
  } catch (err) {
    console.error("? Receipt upload error:\n", err?.message ?? err);
    return sendError(res, 500, "Failed to upload receipt", err?.message ?? "Unknown error");
  }
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
  next(err);
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensewise")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

