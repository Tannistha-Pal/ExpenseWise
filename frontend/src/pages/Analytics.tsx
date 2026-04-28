import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
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

  const monthlyData = useMemo(() => {
    const data: { name: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const mTx = transactions.filter((t) =>
        isWithinInterval(new Date(t.date), { start: ms, end: me })
      );
      data.push({
        name: format(d, "MMM"),
        income: mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses: mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return data;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const savingsData = useMemo(() => {
    return monthlyData.map((m) => ({ name: m.name, savings: m.income - m.expenses }));
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">Detailed financial insights</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Income" value={formatAmount(totalIncome)} icon={TrendingUp} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <SummaryCard title="Total Expenses" value={formatAmount(totalExpense)} icon={TrendingDown} iconBg="bg-red-100" iconColor="text-red-600" />
        <SummaryCard title="Net Savings" value={formatAmount(totalIncome - totalExpense)} icon={BarChart3} iconBg="bg-blue-100" iconColor="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Pie */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">No expense data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
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

        {/* Savings Trend */}
        <Card className="border border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
