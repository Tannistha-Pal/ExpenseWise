import { useState, useMemo, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { Search, Trash2, Edit, ArrowLeftRight, TrendingUp, TrendingDown, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useDebounce } from "@/hooks/useDebounce";
import { SummaryCard } from "@/components/SummaryCard";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";
import { toast } from "@/components/ui/sonner";

const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"];
const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];


export default function TransactionsPage() {
  const { transactions, deleteTransaction, updateTransaction, loading, error, refreshTransactions, fetchTransactionsPage } = useAppContext();
  const { formatAmount } = useCurrency();

  // State for search, filters, sorting, and pagination
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [pageTransactions, setPageTransactions] = useState<typeof transactions>([]);
  const [pagePagination, setPagePagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Dialog states
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    date: "",
  });

  // Get unique categories and years
  const categories = useMemo(() => {
    return Array.from(new Set(ALL_CATEGORIES)).sort();
  }, []);

  const years = useMemo(() => {
    const yrs = new Set(transactions.map((t) => new Date(t.date).getFullYear()));
    return Array.from(yrs)
      .sort((a, b) => b - a)
      .map((y) => y.toString());
  }, [transactions]);

  // Filter and sort transactions
  const filteredAndSorted = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter((t) => {
        const searchLower = debouncedSearch.toLowerCase();
        const searchNumeric = Number(debouncedSearch);
        return (
          t.description?.toLowerCase().includes(searchLower) ||
          t.category?.toLowerCase().includes(searchLower) ||
          t.type?.toLowerCase().includes(searchLower) ||
          (!Number.isNaN(searchNumeric) && t.amount === searchNumeric)
        );
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((t) => new Date(t.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= end);
    }

    // Month and year filter
    if (selectedYear !== "all") {
      const year = parseInt(selectedYear);
      filtered = filtered.filter((t) => new Date(t.date).getFullYear() === year);
    }
    if (selectedMonth !== "all") {
      const month = parseInt(selectedMonth);
      filtered = filtered.filter((t) => new Date(t.date).getMonth() === month);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.amount - a.amount;
        case "lowest":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    transactions,
    debouncedSearch,
    typeFilter,
    categoryFilter,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    sortBy,
  ]);

  const totalPages = pagePagination.totalPages;
  const paginatedTransactions = pageTransactions;

  // Stats
  const stats = useMemo(() => {
    const income = filteredAndSorted
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = filteredAndSorted
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { total: filteredAndSorted.length, income, expense };
  }, [filteredAndSorted]);

  useEffect(() => {
    if (!debouncedSearch) return;
    toast.success(
      filteredAndSorted.length > 0
        ? `${filteredAndSorted.length} result${filteredAndSorted.length === 1 ? "" : "s"} found`
        : "No transactions match your search"
    );
  }, [debouncedSearch, filteredAndSorted.length]);

  const loadTransactionsPage = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      const result = await fetchTransactionsPage({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        type: typeFilter,
        category: categoryFilter,
        startDate,
        endDate,
        month: selectedMonth,
        year: selectedYear,
        sortBy,
      });
      setPageTransactions(result.transactions);
      setPagePagination(result.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load transactions";
      setPageError(message);
      setPageTransactions([]);
      setPagePagination({ total: 0, totalPages: 0, page: currentPage, limit: pageSize });
    } finally {
      setPageLoading(false);
    }
  }, [
    fetchTransactionsPage,
    currentPage,
    pageSize,
    debouncedSearch,
    typeFilter,
    categoryFilter,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    sortBy,
  ]);

  useEffect(() => {
    loadTransactionsPage();
  }, [loadTransactionsPage, transactions.length]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), Math.max(totalPages, 1)));
  };

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSortBy("latest");
    setCurrentPage(1);
    toast.success("Filters reset");
  }, []);

  // Export handlers
  const handleExportPDF = () => {
    if (filteredAndSorted.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    exportToPDF(
      filteredAndSorted,
      `transactions_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      formatAmount
    );
    toast.success(`Exported ${filteredAndSorted.length} transactions to PDF`);
  };

  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    exportToCSV(
      filteredAndSorted,
      `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    toast.success(`Exported ${filteredAndSorted.length} transactions to CSV`);
  };

  // Delete transaction
  const handleDelete = async () => {
    if (!deleteTxId) return;
    try {
      await deleteTransaction(deleteTxId);
      await loadTransactionsPage();
      toast.success("Transaction deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteTxId(null);
    }
  };

  // Edit transaction
  const handleEdit = (tx: any) => {
    setEditTx(tx);
    setEditForm({
      description: tx.description,
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
      date: new Date(tx.date).toISOString().split("T")[0],
    });
  };

  const handleSaveEdit = async () => {
    if (!editTx) return;

    const updatedTransaction = {
      ...editTx,
      description: editForm.description,
      amount: parseFloat(editForm.amount),
      type: editForm.type,
      category: editForm.category,
      date: new Date(editForm.date).toISOString(),
    };

    try {
      await updateTransaction(updatedTransaction);
      await loadTransactionsPage();
      setEditTx(null);
      toast.success("Transaction updated");
    } catch (err) {
      console.error("Failed to save transaction:", err);
      toast.error("Failed to update transaction");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Transactions</h2>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Transactions"
          value={stats.total.toString()}
          icon={ArrowLeftRight}
        />
        <SummaryCard
          title="Total Income"
          value={formatAmount(stats.income)}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Total Expenses"
          value={formatAmount(stats.expense)}
          icon={TrendingDown}
        />
      </div>

      {/* Search and Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, category, type, or amount..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters & Sorting</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Type Filter */}
          <div>
            <Label className="text-xs mb-2 block">Type</Label>
            <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Label className="text-xs mb-2 block">Category</Label>
            <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div>
            <Label className="text-xs mb-2 block">Sort By</Label>
            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Size */}
          <div>
            <Label className="text-xs mb-2 block">Per Page</Label>
            <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(parseInt(value)); setCurrentPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs mb-2 block">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs mb-2 block">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Month/Year</Label>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={(value) => { setSelectedMonth(value); setCurrentPage(1); }}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2024, i), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={(value) => { setSelectedYear(value); setCurrentPage(1); }}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {loading || pageLoading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-muted-foreground border-t-foreground animate-spin" />
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading transactions...</p>
          </div>
        ) : error || pageError ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <p className="text-lg font-medium">Unable to load transactions</p>
              <p className="text-sm mb-4">{error || pageError}</p>
              <Button onClick={() => { refreshTransactions(); loadTransactionsPage(); }}>Retry</Button>
            </div>
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              {pagePagination.total === 0 && transactions.length > 0 ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </>
              ) : transactions.length === 0 ? (
                <>
                  <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No transactions yet</p>
                  <p className="text-sm">Start by adding your first transaction</p>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-muted">
                        {tx.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.receiptUrl ? (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg border border-border bg-muted/10 p-1 hover:bg-muted/20"
                          onClick={() => setReceiptPreviewUrl(tx.receiptUrl || null)}
                        >
                          <img
                            src={tx.receiptUrl}
                            alt="Receipt"
                            className="h-10 w-16 rounded-md object-cover"
                          />
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(tx.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatAmount(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(tx)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-500"
                          onClick={() => setDeleteTxId(tx.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="border-t bg-muted/50 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagePagination.total === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, pagePagination.total)} of{" "}
                {pagePagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={totalPages <= 1 || currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!receiptPreviewUrl} onOpenChange={() => setReceiptPreviewUrl(null)}>
        <DialogContent className="max-w-3xl bg-background">
          <DialogHeader>
            <DialogTitle>Receipt preview</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
            <img
              src={receiptPreviewUrl || undefined}
              alt="Receipt preview"
              className="w-full max-h-[70vh] object-contain"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptPreviewUrl(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The transaction will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTx} onOpenChange={() => setEditTx(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter description..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value: "income" | "expense") =>
                    setEditForm({ ...editForm, type: value, category: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {editForm.type === "income" ? (
                      <>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Gift">Gift</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Bills">Bills</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTx(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
