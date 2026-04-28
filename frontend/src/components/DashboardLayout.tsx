import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardBackground from "./DashboardBackground";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardBackground>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 md:pl-8 pt-16 md:pt-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </DashboardBackground>
  );
}
