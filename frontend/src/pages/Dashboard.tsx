import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, Hash, Home } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAppContext } from "@/contexts/AppContext";
import { useCurrency } from "@/hooks/useCurrency";
import { SummaryCard } from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const PIE_COLORS = ["#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function DashboardPage() {
  const { transactions } = useAppContext();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();

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

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    const monthlyTx = transactions.filter((t) =>
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const monthlyIncome = monthlyTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthlyTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, monthlyIncome, monthlyExpense, count: transactions.length };
  }, [transactions, monthStart, monthEnd]);

  const lineChartData = useMemo(() => {
    const last6Months: { name: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const monthTx = transactions.filter((t) =>
        isWithinInterval(new Date(t.date), { start: ms, end: me })
      );
      last6Months.push({
        name: format(d, "MMM"),
        income: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return last6Months;
  }, [transactions]);

  const pieChartData = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your finances</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Balance" 
          value={formatAmount(stats.balance)} 
          icon={Wallet} 
          iconBg="bg-primary/20" 
          iconColor="text-primary"
          className="hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg"
        />
        <SummaryCard 
          title="Monthly Income" 
          value={formatAmount(stats.monthlyIncome)} 
          icon={TrendingUp} 
          iconBg="bg-emerald-500/20" 
          iconColor="text-emerald-500"
          className="hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg"
        />
        <SummaryCard 
          title="Monthly Expenses" 
          value={formatAmount(stats.monthlyExpense)} 
          icon={TrendingDown} 
          iconBg="bg-red-500/20" 
          iconColor="text-red-500"
          className="hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg"
        />
        <SummaryCard 
          title="Transactions" 
          value={stats.count.toString()} 
          icon={Hash} 
          iconBg="bg-purple-500/20" 
          iconColor="text-purple-500"
          className="hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-lg"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Income vs Expenses
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke={document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#374151"}
                  fill={document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#374151"}
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke={document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#374151"}
                  fill={document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#374151"}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                    padding: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={true}
                  animationDuration={300}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#incomeGradient)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "hsl(var(--background))", cursor: "pointer" }}
                  activeDot={{ r: 8, fill: "#10b981", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="url(#expenseGradient)"
                  dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "hsl(var(--background))", cursor: "pointer" }}
                  activeDot={{ r: 8, fill: "#ef4444", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Spending by Category
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieChartData.map((_, i) => (
                      <Cell 
                        key={i} 
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
