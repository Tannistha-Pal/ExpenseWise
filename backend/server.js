const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Expense = require("./models/Expense");
const User = require("./models/User");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// ✅ Get all expenses
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add expense
app.post("/add-expense", async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    // Validate required fields
    if (!title || !amount || !type) {
      return res.status(400).json({ error: "title, amount, and type are required" });
    }

    const expense = new Expense({ 
      title, 
      amount, 
      type, 
      category: category || "General", 
      date: date || new Date() 
    });
    const saved = await expense.save();
    console.log("✅ Saved to MongoDB:", saved);
    res.json({ message: "Saved", expense: saved });
  } catch (err) {
    console.error("❌ Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update expense
app.put("/expenses/:id", async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, type, category, date: date || new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedExpense) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    res.json({ message: "Updated", expense: updatedExpense });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete expense
app.delete("/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ User Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
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
    
    console.log("✅ User saved to MongoDB:", savedUser);
    res.status(201).json({ 
      message: "User created successfully", 
      user: savedUser 
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ User Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("✅ User logged in:", user.email);
    res.json({ 
      message: "Login successful", 
      user: user 
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all users (for testing)
app.get("/auth/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/expensewise")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});