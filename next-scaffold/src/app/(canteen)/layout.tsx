"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Calendar,
  BarChart3,
  Building2,
  FileSpreadsheet,
  Settings,
  LogOut,
  Clock,
  ShieldCheck,
  Coffee,
  Menu,
  X,
  UserCheck,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/canteen/dashboard" },
  { id: "today", label: "Today's Lunch", icon: UtensilsCrossed, path: "/canteen/today" },
  { id: "employees", label: "Employee Lunch Data", icon: Users, path: "/canteen/employees" },
  { id: "daily", label: "Daily Reports", icon: Calendar, path: "/canteen/daily" },
  { id: "monthly", label: "Monthly Reports", icon: BarChart3, path: "/canteen/monthly" },
  { id: "department", label: "Department Summary", icon: Building2, path: "/canteen/department" },
  { id: "export", label: "Export Excel", icon: FileSpreadsheet, path: "/canteen/export" },
  { id: "settings", label: "Canteen Settings", icon: Settings, path: "/canteen/settings" },
];

export default function CanteenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [operatorName, setOperatorName] = useState("Canteen Operator");

  // Real-time clock formatted in Asia/Kolkata
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const formatted = d.toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bjk_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.name || u.fullName) setOperatorName(u.name || u.fullName);
        } catch {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bjk_token");
      localStorage.removeItem("bjk_user");
      document.cookie = "bjk_token=; path=/; max-age=0";
    }
    router.push("/canteen/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/canteen/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F77F00] to-[#FCBF49] p-0.5 shadow-md shadow-orange-500/20">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-[#F77F00]" />
                </div>
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  BJK HEALTHCARE
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    CANTEEN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Plant Catering Operations Terminal
                </p>
              </div>
            </Link>
          </div>

          {/* Center Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#00A896]" />
            <span>{currentTime || "Synchronizing IST..."}</span>
          </div>

          {/* Right Operator Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-semibold text-white">{operatorName}</div>
                <div className="text-[10px] text-teal-400 font-medium">Terminal Station Active</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-[#00A896] border border-teal-500/30 flex items-center justify-center text-xs font-bold">
                {operatorName.charAt(0)}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-1">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Operations Navigation
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white shadow-md shadow-teal-900/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </div>

          {/* Plant Service Window Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Lunch Window</span>
            </div>
            <div className="text-sm font-extrabold text-white">12:30 PM — 03:00 PM</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard plant catering window. Subsidized employee meals verified via barcode scanner.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full p-4 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-900">Canteen Operations</div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#00A896] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Canteen Terminal</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
