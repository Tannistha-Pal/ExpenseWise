import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
} from "recharts";
import { useAppContext } from "@/contexts/AppContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/SummaryCard";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const PIE_COLORS = ["#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AnalyticsPage() {
  const { transactions } = useAppContext();
  const { formatAmount } = useCurrency();
  const now = new Date();

  // Custom tooltip component with white text
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 shadow-xl">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-white">{formatAmount(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const monthlyData = useMemo(() => {
    const data: { name: string; income: number; expenses: number; savings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const mTx = transactions.filter((t) =>
        isWithinInterval(new Date(t.date), { start: ms, end: me })
      );
      const income = mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      data.push({
        name: format(d, "MMM"),
        income,
        expenses,
        savings: income - expenses,
      });
    }
    return data;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topCategories = useMemo(() => {
    return categoryData.slice(0, 5);
  }, [categoryData]);

  const savingsData = useMemo(() => {
    return monthlyData.map((m) => ({ name: m.name, savings: m.savings }));
  }, [monthlyData]);

  const incomeExpenseDistribution = useMemo(() => {
    return [
      { name: "Income", value: totalIncome },
      { name: "Expenses", value: totalExpense },
    ];
  }, [totalIncome, totalExpense]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">Detailed financial insights and trends</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Income"
          value={formatAmount(totalIncome)}
          icon={TrendingUp}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatAmount(totalExpense)}
          icon={TrendingDown}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <SummaryCard
          title="Net Savings"
          value={formatAmount(netSavings)}
          icon={BarChart3}
          iconBg={netSavings >= 0 ? "bg-blue-100" : "bg-orange-100"}
          iconColor={netSavings >= 0 ? "text-blue-600" : "text-orange-600"}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses Bar Chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.some((m) => m.income > 0 || m.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Savings Trend Area Chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Savings Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {savingsData.some((m) => m.savings !== 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={savingsData}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#3b82f6"
                    fill="url(#colorSavings)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expense Distribution Pie */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Income vs Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {totalIncome > 0 || totalExpense > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeExpenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Top 5 Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No spending data yet</div>
          ) : (
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
                        style={{
                          width: `${
                            topCategories[0]?.value
                              ? (category.value / topCategories[0].value) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-right min-w-fit ml-4">
                    {formatAmount(category.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Details Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Categories Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No expense data yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Category</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((category) => (
                    <tr key={category.name} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">{category.name}</td>
                      <td className="py-2 px-2 font-medium">{formatAmount(category.value)}</td>
                      <td className="py-2 px-2">
                        {totalExpense > 0
                          ? `${((category.value / totalExpense) * 100).toFixed(1)}%`
                          : "0%"}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-muted">
                    <td className="py-2 px-2">Total</td>
                    <td className="py-2 px-2">{formatAmount(totalExpense)}</td>
                    <td className="py-2 px-2">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
