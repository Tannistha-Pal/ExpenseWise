import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory, DEFAULT_BUDGETS } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

export interface BudgetPreferences {
  budgetPercent: number;
  savingsPercent: number;
}

interface AppState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
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
    receiptUrl: raw.receiptUrl || raw.receipt_url || "",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = useCallback(
    (key: string) => `ew_${user ? `${user.id}_` : ""}${key}`,
    [user]
  );

  const [currency, setCurrencyState] = useState<string>(() =>
    loadFromStorage(storageKey("currency"), "INR")
  );
  const [budgetPreferences, setBudgetPreferences] = useState<BudgetPreferences>(() =>
    loadFromStorage(storageKey("budget_preferences"), { budgetPercent: 60, savingsPercent: 40 })
  );

  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = loadFromStorage<BudgetCategory[]>(storageKey("budgets"), DEFAULT_BUDGETS);
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
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:5000/expenses", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const body = await res.json();
      if (!res.ok) {
        const message = body?.message || body?.error || `HTTP ${res.status}`;
        setError(message);
        throw new Error(message);
      }
      const raw: any[] = body?.data?.expenses ?? body?.expenses ?? [];
      setTransactions(raw.map(normaliseTransaction));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch transactions";
      setError(message);
      console.error("Failed to load transactions from backend:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      setTransactions([]);
      setError(null);
      setLoading(false);
      return;
    }

    refreshTransactions();
  }, [refreshTransactions, user, isAuthReady]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    setCurrencyState(loadFromStorage(storageKey("currency"), "INR"));
    setBudgetPreferences(
      loadFromStorage(storageKey("budget_preferences"), { budgetPercent: 60, savingsPercent: 40 })
    );
    setBudgets(loadFromStorage<BudgetCategory[]>(storageKey("budgets"), DEFAULT_BUDGETS));
  }, [user, storageKey]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("http://localhost:5000/add-expense", {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: `Bearer ${token}` } : {}),
      body: JSON.stringify({
        title: t.description, // Backend expects 'title', not 'description'
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
        receiptUrl: t.receiptUrl || "",
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      const message = body?.message || body?.error || `HTTP ${res.status}`;
      toast.error(message);
      throw new Error(message);
    }
    const raw = body?.data?.expense ?? body?.expense;
    setTransactions((prev) => [normaliseTransaction(raw), ...prev]);
    toast.success("Expense added successfully");
  }, []);

  const updateTransaction = useCallback(async (t: Transaction) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`http://localhost:5000/expenses/${t.id}`, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify({
          title: t.description, // Backend expects 'title', not 'description'
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        const message = body?.message || body?.error || `HTTP ${res.status}`;
        toast.error(message);
        throw new Error(message);
      }
      const raw = body?.data?.expense ?? body?.expense;
      const updatedTransaction = normaliseTransaction(raw);
      setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? updatedTransaction : tx)));
      toast.success("Expense updated successfully");
    } catch (err) {
      console.error("Failed to update transaction:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update transaction");
      setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? t : tx)));
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`http://localhost:5000/expenses/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const body = await res.json();
    if (!res.ok) {
      const message = body?.message || body?.error || `HTTP ${res.status}`;
      toast.error(message);
      throw new Error(message);
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    toast.success("Expense deleted successfully");
    await refreshTransactions();
  }, [refreshTransactions]);

  // ─── Persist non-transaction state ────────────────────────────────────────
  useEffect(() => { localStorage.setItem(storageKey("currency"), JSON.stringify(currency)); }, [currency, storageKey]);
  useEffect(() => { localStorage.setItem(storageKey("budgets"), JSON.stringify(budgets)); }, [budgets, storageKey]);
  useEffect(() => { localStorage.setItem(storageKey("budget_preferences"), JSON.stringify(budgetPreferences)); }, [budgetPreferences, storageKey]);

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
        error,
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
