export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string
}

export interface BudgetCategory {
  category: string;
  limit: number;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Gift",
  "Other",
];

export const DEFAULT_BUDGETS: BudgetCategory[] = [
  { category: "Food", limit: 5000 },
  { category: "Transport", limit: 3000 },
  { category: "Shopping", limit: 4000 },
  { category: "Bills", limit: 6000 },
  { category: "Entertainment", limit: 2000 },
  { category: "Health", limit: 3000 },
  { category: "Education", limit: 5000 },
  { category: "Other", limit: 2000 },
];
