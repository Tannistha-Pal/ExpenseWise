import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useDebounce } from "@/hooks/useDebounce";
import { SummaryCard } from "@/components/SummaryCard";
import { PiggyBank, TrendingDown, Target, Wallet, TrendingUp, Info, Settings2, Search, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

export default function BudgetPage() {
  const { transactions, budgets, budgetPreferences, updateBudget, updateBudgetPreferences, scaleBudgetsToPercent } = useAppContext();
  const { formatAmount } = useCurrency();
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempBudgetPct, setTempBudgetPct] = useState(budgetPreferences.budgetPercent);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "over" | "under" | "warning">("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const tempSavingsPct = 100 - tempBudgetPct;

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const totalSpent = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const spending = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const spent = spending[budget.category] || 0;
      const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      
      // Search filter
      const matchesSearch = budget.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Status filter
      const matchesFilter = 
        filterStatus === "all" ||
        (filterStatus === "over" && pct >= 100) ||
        (filterStatus === "warning" && pct >= 70 && pct < 100) ||
        (filterStatus === "under" && pct < 70);
      
      return matchesSearch && matchesFilter;
    });
  }, [budgets, spending, debouncedSearchTerm, filterStatus]);

  const budgetAllocation = (budgetPreferences.budgetPercent / 100) * totalIncome;
  const savingsAllocation = (budgetPreferences.savingsPercent / 100) * totalIncome;
  const remainingBudget = Math.max(0, budgetAllocation - totalSpent);
  const budgetPct = budgetAllocation > 0 ? Math.min((totalSpent / budgetAllocation) * 100, 100) : 0;
  const savingsPct = savingsAllocation > 0 ? Math.min(((totalIncome - totalSpent) / savingsAllocation) * 100, 100) : 0;
  const isOverBudget = totalSpent > budgetAllocation;

  const handleEditSave = () => {
    if (editCategory && editLimit) {
      updateBudget(editCategory, parseFloat(editLimit));
      setEditCategory(null);
      setEditLimit("");
    }
  };

  const handleSavePreferences = () => {
  scaleBudgetsToPercent(tempBudgetPct);
  updateBudgetPreferences({
    budgetPercent: tempBudgetPct,
    savingsPercent: tempSavingsPct,
  });
  setShowSettings(false);
 };

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return "bg-destructive";
    if (pct >= 70) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Budget</h2>
            <p className="text-muted-foreground">Track your spending limits &amp; savings</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => {
                setTempBudgetPct(budgetPreferences.budgetPercent);
                setShowSettings(true);
              }}
              className="gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Budget Rules
            </Button>
          </div>
        </div>

        {/* Active Rule Badge */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>
            Current rule: <strong className="text-foreground">{budgetPreferences.budgetPercent}% Budget / {budgetPreferences.savingsPercent}% Savings</strong>
          </span>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button className="underline decoration-dotted text-primary text-xs hover:text-primary/80 cursor-help">How does this work?</button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs z-50">
              <p>Your total income is split into two pools: <strong>Budget</strong> (for spending) and <strong>Savings</strong> (for saving). Adjust the percentages in Budget Rules to match your goals (e.g., 50/50, 60/40, 80/20).</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard title="Total Income" value={formatAmount(totalIncome)} icon={TrendingUp} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SummaryCard title={`Budget (${budgetPreferences.budgetPercent}%)`} value={formatAmount(budgetAllocation)} icon={Target} iconBg="bg-blue-100" iconColor="text-blue-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>{budgetPreferences.budgetPercent}% of your total income allocated for spending</TooltipContent>
          </Tooltip>
          <SummaryCard title="Total Spent" value={formatAmount(totalSpent)} icon={TrendingDown} iconBg="bg-red-100" iconColor="text-red-600" />
          <SummaryCard
            title="Remaining"
            value={formatAmount(remainingBudget)}
            icon={Wallet}
            iconBg={isOverBudget ? "bg-red-100" : "bg-emerald-100"}
            iconColor={isOverBudget ? "text-red-600" : "text-emerald-600"}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SummaryCard title={`Savings (${budgetPreferences.savingsPercent}%)`} value={formatAmount(savingsAllocation)} icon={PiggyBank} iconBg="bg-blue-100" iconColor="text-blue-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>{budgetPreferences.savingsPercent}% of your total income allocated for savings</TooltipContent>
          </Tooltip>
        </div>

        {/* Budget & Savings Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Budget Usage
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>How much of your budget allocation you've spent</TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                {formatAmount(totalSpent)} of {formatAmount(budgetAllocation)} used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isOverBudget ? "Over budget!" : `${budgetPct.toFixed(0)}% used`}
                  </span>
                  <span className={cn("font-semibold", isOverBudget ? "text-destructive" : budgetPct >= 70 ? "text-yellow-600" : "text-emerald-600")}>
                    {isOverBudget
                      ? `${formatAmount(totalSpent - budgetAllocation)} over`
                      : `${formatAmount(remainingBudget)} left`}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", getProgressColor(budgetPct))}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Savings Progress
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Your actual savings (income − expenses) vs. your savings goal</TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                {formatAmount(Math.max(0, totalIncome - totalSpent))} of {formatAmount(savingsAllocation)} saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{savingsPct.toFixed(0)}% of goal</span>
                  <span className="font-semibold text-primary">
                    {savingsPct >= 100 ? "Goal reached! 🎉" : `${formatAmount(savingsAllocation - Math.max(0, totalIncome - totalSpent))} to go`}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(savingsPct, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Budgets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Category Budgets</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredBudgets.length} of {budgets.length} categories
              </span>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {filterStatus !== "all" && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Filter by Status</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Clear
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="justify-start"
                >
                  All ({budgets.length})
                </Button>
                <Button
                  variant={filterStatus === "under" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("under")}
                  className="justify-start"
                >
                  Under Budget ({budgets.filter(b => {
                    const spent = spending[b.category] || 0;
                    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                    return pct < 70;
                  }).length})
                </Button>
                <Button
                  variant={filterStatus === "warning" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("warning")}
                  className="justify-start"
                >
                  Warning ({budgets.filter(b => {
                    const spent = spending[b.category] || 0;
                    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                    return pct >= 70 && pct < 100;
                  }).length})
                </Button>
                <Button
                  variant={filterStatus === "over" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("over")}
                  className="justify-start"
                >
                  Over Budget ({budgets.filter(b => {
                    const spent = spending[b.category] || 0;
                    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                    return pct >= 100;
                  }).length})
                </Button>
              </div>
            </div>
          )}

          {/* Results Message */}
          {filteredBudgets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No categories found</p>
              <p className="text-sm">
                {searchTerm && filterStatus !== "all" 
                  ? `No categories matching "${searchTerm}" with the selected filter.`
                  : searchTerm 
                  ? `No categories matching "${searchTerm}".`
                  : "No categories match the selected filter."
                }
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBudgets.map((b) => {
              const spent = spending[b.category] || 0;
              const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;

              return (
                <Card key={b.category} className="border border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{b.category}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditCategory(b.category); setEditLimit(b.limit.toString()); }}
                        className="text-xs text-muted-foreground"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatAmount(spent)} / {formatAmount(b.limit)}
                        </span>
                        <span className={cn(
                          "font-medium",
                          pct >= 90 ? "text-destructive" : pct >= 70 ? "text-yellow-600" : "text-emerald-600"
                        )}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", getProgressColor(pct))}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Edit Category Budget Dialog */}
        <Dialog open={!!editCategory} onOpenChange={(o) => !o && setEditCategory(null)}>
          <DialogContent className="sm:max-w-sm bg-background">
            <DialogHeader>
              <DialogTitle>Edit Budget — {editCategory}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label htmlFor="budgetLimit">Monthly Limit</Label>
              <Input
                id="budgetLimit"
                type="number"
                min="0"
                step="100"
                value={editLimit}
                onChange={(e) => setEditLimit(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCategory(null)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Rules Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md bg-background">
            <DialogHeader>
              <DialogTitle>Budget Rules</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-2">
              <p className="text-sm text-muted-foreground">
                Set how your income is split between spending budget and savings. The two must always total 100%.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Budget</Label>
                    <span className="text-sm font-semibold text-foreground">{tempBudgetPct}%</span>
                  </div>
                  <Slider
                    value={[tempBudgetPct]}
                    onValueChange={([v]) => setTempBudgetPct(v)}
                    min={10}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Savings</Label>
                    <span className="text-sm font-semibold text-foreground">{tempSavingsPct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${tempSavingsPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Preview */}
              <Card className="border border-border">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">Preview with current income ({formatAmount(totalIncome)})</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-lg font-bold text-foreground">{formatAmount((tempBudgetPct / 100) * totalIncome)}</p>
                      <p className="text-xs text-emerald-600">{tempBudgetPct}%</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="text-lg font-bold text-primary">{formatAmount((tempSavingsPct / 100) * totalIncome)}</p>
                      <p className="text-xs text-primary">{tempSavingsPct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Popular rules: 50/50, 60/40, 70/30, 80/20</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
              <Button onClick={handleSavePreferences}>Save Rules</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
