import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, Trash2, Edit, ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
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

export default function TransactionsPage() {
  const { transactions, deleteTransaction, updateTransaction, loading } = useAppContext();
  const { formatAmount } = useCurrency();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    date: "",
  });

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { total: transactions.length, income, expense };
  }, [transactions]);

  const handleDelete = async () => {
    if (!deleteTxId) return;
    try {
      await deleteTransaction(deleteTxId);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteTxId(null);
    }
  };

  const handleEdit = (tx: any) => {
    setEditTx(tx);
    setEditForm({
      description: tx.description,
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
      date: new Date(tx.date).toISOString().split('T')[0],
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
      setEditTx(null);
    } catch (err) {
      console.error("Failed to save transaction:", err);
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
        <SummaryCard title="Total Transactions" value={stats.total.toString()} icon={ArrowLeftRight} />
        <SummaryCard title="Total Income" value={formatAmount(stats.income)} icon={TrendingUp} />
        <SummaryCard title="Total Expenses" value={formatAmount(stats.expense)} icon={TrendingDown} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>
                    {format(new Date(tx.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className={cn("text-right font-medium", tx.type === "income" ? "text-green-600" : "text-red-500")}>
                    {tx.type === "income" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tx)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTxId(tx.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
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
                <Select value={editForm.type} onValueChange={(value: "income" | "expense") => setEditForm({ ...editForm, type: value, category: "" })}>
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
                <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
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
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
