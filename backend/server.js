const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Expense = require("./models/Expense");
const User = require("./models/User");
const { upload } = require("./middleware/uploadMiddleware");

dotenv.config();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      try {
        const parsed = new URL(origin);
        const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
        if (isLocalhost) {
          callback(null, true);
          return;
        }
      } catch {
        // ignore invalid origin
      }
      if (origin === process.env.FRONTEND_ORIGIN) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const JWT_SECRET = process.env.JWT_SECRET || "replace_me_in_env";

const sendSuccess = (res, message, data = {}) => {
  return res.status(200).json({ success: true, message, data, ...data });
};

const sendError = (res, status, message, error = null) => {
  return res.status(status).json({ success: false, message, data: null, error });
};

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Protect routes with token verification
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Authorization header missing or malformed", "Authorization header missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return sendError(res, 401, "Invalid token: user not found", "Invalid token: user not found");

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 401, "Invalid or expired token", err.message);
  }
};

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

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, "Expenses fetched", {
      expenses,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("❌ Fetch error:", err?.message ?? err);
    return sendError(res, 500, "Failed to fetch expenses", err?.message ?? "Unknown error");
  }
});

// ✅ Add expense
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
    console.log("✅ Saved to MongoDB:", saved);
    return sendSuccess(res, "Expense saved", { expense: saved });
  } catch (err) {
    console.error("❌ Save error:", err.message);
    return sendError(res, 500, "Failed to save expense", err.message);
  }
});

// ✅ Update expense
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
    console.error("❌ Update error:", err.message);
    return sendError(res, 500, "Failed to update expense", err.message);
  }
});

// ✅ Delete expense
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
    return sendError(res, 500, "Failed to delete expense", err.message);
  }
});

// ✅ User Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return sendError(res, 400, "All fields are required", "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "User with this email already exists", "User with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = new User({ 
      name, 
      email, 
      phone, 
      password: hashedPassword 
    });
    
    const savedUser = await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, JWT_SECRET, { expiresIn: "7d" });

    console.log("✅ User saved to MongoDB:", savedUser);
    return res.status(201).json({ 
      success: true,
      message: "User created successfully",
      data: { user: savedUser, token },
      user: savedUser,
      token,
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    return sendError(res, 500, "Signup failed", err.message);
  }
});

// ✅ User Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required", "Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid email or password", "Invalid email or password");
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password", "Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    console.log("✅ User logged in:", user.email);
    return res.json({ 
      success: true,
      message: "Login successful",
      data: { user, token },
      user,
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    return sendError(res, 500, "Login failed", err.message);
  }
});

// Return current user from token
app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    return res.json({ success: true, message: "User restored", data: { user: req.user }, user: req.user });
  } catch (err) {
    return sendError(res, 500, "Failed to restore user", err.message);
  }
});

// Upload profile photo
app.post("/upload/profile-photo", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "Please upload a profile image");
    }

    let imageUrl = req.file.secure_url || req.file.filename || "";
    if (!req.file.secure_url && req.file.path) {
      const filename = path.basename(req.file.path);
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    }

    req.user.avatar = imageUrl;
    await req.user.save();

    return sendSuccess(res, "Profile photo uploaded", { user: req.user, imageUrl });
  } catch (err) {
    return sendError(res, 500, "Failed to upload profile photo", err.message);
  }
});

// Upload expense receipt image
app.post("/upload/expense-receipt", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "Please upload a receipt image");
    }

    const imageUrl = req.file.path || req.file.secure_url || req.file.filename || "";
    return sendSuccess(res, "Receipt uploaded", { imageUrl });
  } catch (err) {
    return sendError(res, 500, "Failed to upload receipt", err.message);
  }
});

// ✅ Get all users (for testing)
app.get("/auth/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return sendSuccess(res, "Users fetched", { users });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch users", err.message);
  }
});

// Multer error handler
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

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensewise")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});