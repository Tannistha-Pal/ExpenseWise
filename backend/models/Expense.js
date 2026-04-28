const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String},
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", expenseSchema);