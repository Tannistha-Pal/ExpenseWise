import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
}

const incomeCategories = [
  "Salary", "Freelance", "Investment", "Business", "Gift", "Other"
];

const expenseCategories = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"
];

export function AddTransactionModal({ open, onOpenChange, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadReceiptFile = async (): Promise<string | undefined> => {
    if (!receiptFile) return undefined;

    const token = localStorage.getItem("auth_token");
    const formData = new FormData();
    formData.append("image", receiptFile);

    setUploadingReceipt(true);
    try {
      const response = await fetch("http://localhost:8000/upload/expense-receipt", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Receipt upload failed");
      }
      return result?.data?.imageUrl || result?.imageUrl;
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Receipt upload failed";
      setError(errMessage);
      toast.error(errMessage);
      throw err;
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || !category) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const receiptUrl = receiptFile ? await uploadReceiptFile() : undefined;
      const res = await fetch("http://localhost:8000/add-expense", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          type,
          category,
          date,
          receiptUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      toast.success("Transaction added successfully");
      onAdd();
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setAmount("");
      setCategory("");
      setType("expense");
      setDate(new Date().toISOString().split('T')[0]);
      setReceiptFile(null);
      setReceiptPreview("");
    } catch (err) {
      setError("Cannot connect to server. Is backend running?");
      toast.error("Cannot connect to server. Is backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setError("");
    setTitle("");
    setAmount("");
    setCategory("");
    setType("expense");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border border-border max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/20">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Add Transaction
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Transaction Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Transaction Type</Label>
              <RadioGroup 
                value={type} 
                onValueChange={(value) => {
                  setType(value as "expense" | "income");
                  setCategory(""); // Reset category when type changes
                }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="relative">
                  <RadioGroupItem 
                    value="expense" 
                    id="expense" 
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="expense"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50 peer-data-[state=checked]:dark:bg-red-950/20 cursor-pointer transition-all"
                  >
                    <TrendingDown className="h-5 w-5 mb-2 text-red-500" />
                    <span className="text-sm font-medium">Expense</span>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem 
                    value="income" 
                    id="income" 
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="income"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:dark:bg-emerald-950/20 cursor-pointer transition-all"
                  >
                    <TrendingUp className="h-5 w-5 mb-2 text-emerald-500" />
                    <span className="text-sm font-medium">Income</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Description</Label>
              <Input
                id="title"
                placeholder="Enter description..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border"
              />
            </div>

            {/* Amount and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt image (optional)</Label>
              <input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (!file) {
                    setReceiptFile(null);
                    setReceiptPreview("");
                    return;
                  }
                  setReceiptFile(file);
                  setReceiptPreview(URL.createObjectURL(file));
                }}
                className="file-input border-border w-full rounded-lg bg-background p-2"
              />
              {receiptPreview && (
                <div className="relative rounded-lg border border-border overflow-hidden">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="h-32 w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-2 right-2 rounded-full p-2"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Preview Card */}
            {(title || amount) && (
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{title || "Untitled"}</p>
                      <p className="text-sm text-muted-foreground">{category || "No category"}</p>
                    </div>
                    <div className={`text-lg font-bold ${type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {type === "income" ? "+" : "-"}₹{amount || "0"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-3 px-6 py-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
