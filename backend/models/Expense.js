const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: String, required: true },
});

// Indexes for faster user-specific transaction queries and filtering
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, type: 1 });
expenseSchema.index({ userId: 1, title: "text", category: "text", type: "text" });

module.exports = mongoose.model("Expense", expenseSchema);