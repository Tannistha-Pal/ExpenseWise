const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");
const { sendError, sendSuccess } = require("../utils/responses");

const router = express.Router();

const buildExpensePayload = (body, user, existingExpense = {}) => {
  const title = body.title || body.description;
  const amountValue = Number(body.amount);
  const validTypes = ["income", "expense"];

  if (!title || !String(title).trim()) {
    return { error: "Title is required" };
  }
  if (Number.isNaN(amountValue) || amountValue <= 0) {
    return { error: "Amount must be a number greater than 0" };
  }
  if (!body.type || !validTypes.includes(body.type)) {
    return { error: "Type must be either 'income' or 'expense'" };
  }

  return {
    payload: {
      title: String(title).trim(),
      amount: amountValue,
      type: body.type,
      category: body.category || existingExpense.category || "General",
      date: body.date ? new Date(body.date) : existingExpense.date || new Date(),
      receiptUrl: body.receiptUrl !== undefined ? body.receiptUrl : existingExpense.receiptUrl || "",
      userId: user._id,
      createdBy: existingExpense.createdBy || user.name,
    },
  };
};

router.get("/", authMiddleware, async (req, res) => {
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
      if (!Number.isNaN(numericSearch)) orQuery.push({ amount: numericSearch });
      filter.$or = orQuery;
    }
    if (category && category.toLowerCase() !== "all") filter.category = category;
    if (type && type.toLowerCase() !== "all") filter.type = type;
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
      filter.date = {
        $gte: new Date(year, month, 1),
        $lte: new Date(year, month + 1, 0, 23, 59, 59, 999),
      };
    } else if ((month !== null && !Number.isNaN(month)) || (year !== null && !Number.isNaN(year))) {
      const dateExpressions = [];
      if (month !== null && !Number.isNaN(month)) {
        dateExpressions.push({ $eq: [{ $month: "$date" }, month + 1] });
      }
      if (year !== null && !Number.isNaN(year)) {
        dateExpressions.push({ $eq: [{ $year: "$date" }, year] });
      }
      filter.$expr = dateExpressions.length === 1 ? dateExpressions[0] : { $and: dateExpressions };
    }

    const sortMap = {
      latest: { date: -1 },
      oldest: { date: 1 },
      highest: { amount: -1 },
      lowest: { amount: 1 },
      date: { date: sortOrder },
      amount: { amount: sortOrder },
    };
    const total = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const expenses = await Expense.find(filter)
      .sort(sortMap[sortBy] || sortMap.latest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return sendSuccess(res, "Expenses fetched", {
      expenses,
      pagination: { total, totalPages, page, currentPage: page, limit },
    });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch expenses", err.message);
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { payload, error } = buildExpensePayload(req.body, req.user);
    if (error) return sendError(res, 400, error);
    const expense = await Expense.create(payload);
    return sendSuccess(res, "Expense saved", { expense }, 201);
  } catch (err) {
    return sendError(res, 500, "Failed to save expense", err.message);
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return sendError(res, 404, "Transaction not found");
    if (expense.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to update this expense");
    }

    const { payload, error } = buildExpensePayload(req.body, req.user, expense);
    if (error) return sendError(res, 400, error);
    Object.assign(expense, payload);
    const updatedExpense = await expense.save();
    return sendSuccess(res, "Expense updated", { expense: updatedExpense });
  } catch (err) {
    return sendError(res, 500, "Failed to update expense", err.message);
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return sendError(res, 404, "Transaction not found");
    if (expense.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to delete this expense");
    }
    await expense.deleteOne();
    return sendSuccess(res, "Expense deleted");
  } catch (err) {
    return sendError(res, 500, "Failed to delete expense", err.message);
  }
});

module.exports = router;
