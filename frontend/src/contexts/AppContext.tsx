import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory, DEFAULT_BUDGETS } from "@/types";

export interface BudgetPreferences {
  budgetPercent: number;
  savingsPercent: number;
}

interface AppState {
  transactions: Transaction[];
  loading: boolean;
  currency: string;
  budgets: BudgetCategory[];
  budgetPreferences: BudgetPreferences;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  setCurrency: (code: string) => void;
  updateBudget: (category: string, limit: number) => void;
  updateBudgetPreferences: (prefs: BudgetPreferences) => void;
  scaleBudgetsToPercent: (newBudgetPercent: number) => void;
}

const AppContext = createContext<AppState | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

/** Normalise a raw backend transaction (_id) to our frontend Transaction type (id) */
function normaliseTransaction(raw: any): Transaction {
  return {
    id: raw._id ?? raw.id,
    description: raw.title || raw.description, // Backend uses 'title', frontend expects 'description'
    amount: Number(raw.amount),
    type: raw.type,
    category: raw.category || 'General', // Backend doesn't have category, provide default
    date: raw.date ? new Date(raw.date).toISOString() : new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [currency, setCurrencyState] = useState<string>(() =>
    loadFromStorage("ew_currency", "INR")
  );
  const [budgetPreferences, setBudgetPreferences] = useState<BudgetPreferences>(() =>
    loadFromStorage("ew_budget_preferences", { budgetPercent: 60, savingsPercent: 40 })
  );

  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = loadFromStorage<BudgetCategory[]>("ew_budgets", DEFAULT_BUDGETS);
    const total = saved.reduce((sum, b) => sum + b.limit, 0);
    const bills = saved.find((b) => b.category.toLowerCase() === "bills");
    const others = saved.filter((b) => b.category.toLowerCase() !== "bills");
    const minBills = total * 0.3;
    const billsLimit = bills ? Math.max(bills.limit, minBills) : minBills;
    const remaining = Math.max(total - billsLimit, 0);
    const otherTotal = others.reduce((sum, b) => sum + b.limit, 0);
    return saved.map((b) => {
      if (b.category.toLowerCase() === "bills") return { ...b, limit: Math.round(billsLimit) };
      const ratio = otherTotal > 0 ? b.limit / otherTotal : 0;
      return { ...b, limit: Math.round(remaining * ratio) };
    });
  });

  // ─── Fetch all transactions from backend ──────────────────────────────────
  const refreshTransactions = useCallback(async () => {
    try {
      console.log("Fetching transactions from backend...");
      const res = await fetch("http://localhost:5000/expenses");
      console.log("Response status:", res.status, res.statusText);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw: any[] = await res.json();
      console.log("Received data:", raw);
      setTransactions(raw.map(normaliseTransaction));
    } catch (err) {
      console.error("Failed to load transactions from backend:", err);
      console.error("Error details:", err.message, err.stack);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    const res = await fetch("http://localhost:5000/add-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: t.description, // Backend expects 'title', not 'description'
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { expense: raw } = await res.json(); // Backend returns 'expense', not 'transaction'
    setTransactions((prev) => [normaliseTransaction(raw), ...prev]);
  }, []);

  const updateTransaction = useCallback(async (t: Transaction) => {
    try {
      const res = await fetch(`http://localhost:5000/expenses/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t.description, // Backend expects 'title', not 'description'
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date,
        }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const { expense: raw } = await res.json();
      const updatedTransaction = normaliseTransaction(raw);
      
      // Update local state with the updated transaction
      setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? updatedTransaction : tx)));
    } catch (err) {
      console.error("Failed to update transaction:", err);
      // Fallback to optimistic update if backend fails
      setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? t : tx)));
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const res = await fetch(`http://localhost:5000/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    // Refresh transactions to ensure frontend is in sync with backend
    await refreshTransactions();
  }, [refreshTransactions]);

  // ─── Persist non-transaction state ────────────────────────────────────────
  useEffect(() => { localStorage.setItem("ew_currency", JSON.stringify(currency)); }, [currency]);
  useEffect(() => { localStorage.setItem("ew_budgets", JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem("ew_budget_preferences", JSON.stringify(budgetPreferences)); }, [budgetPreferences]);

  const setCurrency = useCallback((code: string) => setCurrencyState(code), []);

  const updateBudget = useCallback((category: string, limit: number) => {
    setBudgets((prev) => prev.map((b) => (b.category === category ? { ...b, limit } : b)));
  }, []);

  const updateBudgetPreferences = useCallback((prefs: BudgetPreferences) => {
    setBudgetPreferences(prefs);
  }, []);

  const scaleBudgetsToPercent = useCallback(
    (newBudgetPercent: number) => {
      setBudgets((prev) => {
        const oldPercent = budgetPreferences.budgetPercent || 100;
        const scaleFactor = newBudgetPercent / oldPercent;
        const totalOld = prev.reduce((sum, b) => sum + b.limit, 0);
        const newTotal = totalOld * scaleFactor;
        const bills = prev.find((b) => b.category.toLowerCase() === "bills");
        const others = prev.filter((b) => b.category.toLowerCase() !== "bills");
        const minBills = newTotal * 0.3;
        const newBills = bills ? Math.max(bills.limit * scaleFactor, minBills) : minBills;
        const remaining = Math.max(newTotal - newBills, 0);
        const othersOldTotal = others.reduce((sum, b) => sum + b.limit, 0);
        return prev.map((b) => {
          if (b.category.toLowerCase() === "bills") return { ...b, limit: Math.round(newBills) };
          const ratio = othersOldTotal > 0 ? b.limit / othersOldTotal : 0;
          return { ...b, limit: Math.round(remaining * ratio) };
        });
      });
    },
    [budgetPreferences.budgetPercent]
  );

  return (
    <AppContext.Provider
      value={{
        transactions,
        loading,
        currency,
        budgets,
        budgetPreferences,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        setCurrency,
        updateBudget,
        updateBudgetPreferences,
        scaleBudgetsToPercent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
