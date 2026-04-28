import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Home", path: "/", icon: Home },
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", path: "/dashboard/transactions", icon: ArrowLeftRight },
  { title: "Budget", path: "/dashboard/budget", icon: PiggyBank },
  { title: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, forceUpdate] = useState({});

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleTransactionAdded = () => {
    forceUpdate({});
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Brand */}
      <div className="mb-8 px-2">
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-white dark:text-[#E2E8F0] tracking-tight hover:text-white/80 transition-colors text-left"
        >
          ExpenseWise
        </button>
      </div>

      {/* Add Transaction Button */}
      <Button
        onClick={() => { setAddModalOpen(true); setMobileOpen(false); }}
        className="mb-6 bg-white/20 hover:bg-white/12 dark:bg-white/10 dark:hover:bg-white/8 text-white dark:text-[#E2E8F0] border-0 backdrop-blur-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/20 dark:bg-white/10 text-white dark:text-[#E2E8F0] shadow-sm font-semibold hover:bg-transparent"
                  : "text-white dark:text-[#E2E8F0] hover:bg-white/12 dark:hover:bg-white/8"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Log Out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white dark:text-[#E2E8F0] hover:bg-white/12 dark:hover:bg-white/8 transition-colors mt-4"
      >
        <LogOut className="h-5 w-5" />
        Log Out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-gradient-to-b from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] dark:from-[#1E1B4B] dark:via-[#0F172A] dark:to-[#020617] p-2 text-white dark:text-[#E2E8F0] shadow-lg md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] dark:from-[#1E1B4B] dark:via-[#0F172A] dark:to-[#020617] transition-transform duration-300 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      <AddTransactionModal open={addModalOpen} onOpenChange={setAddModalOpen} onAdd={handleTransactionAdded} />
    </>
  );
}
