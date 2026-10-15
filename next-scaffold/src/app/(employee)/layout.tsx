"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  User,
  Clock,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  Users,
  Megaphone,
  LifeBuoy,
  Settings,
  LogOut,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Utensils,
  Menu,
  X,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NavGroup {
  title: string;
  items: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: Home, path: "/employee/dashboard" },
      { label: "Plant Calendar", icon: CalendarDays, path: "/employee/calendar" },
    ],
  },
  {
    title: "Workforce & Time",
    items: [
      { label: "Attendance & Punches", icon: Clock, path: "/employee/attendance" },
      { label: "Facial Punch Clock", icon: Sparkles, path: "/employee/attendance-face" },
      { label: "Shift Schedule", icon: Calendar, path: "/employee/shift" },
      { label: "Leave Ledger", icon: Calendar, path: "/employee/leave" },
    ],
  },
  {
    title: "Financials & HR",
    items: [
      { label: "Salary & Payslips", icon: CreditCard, path: "/employee/payroll" },
      { label: "Digital ID Card", icon: ShieldCheck, path: "/employee/id-card" },
      { label: "Compliance & Documents", icon: FileText, path: "/employee/documents" },
      { label: "GMP Training", icon: GraduationCap, path: "/employee/training" },
      { label: "HR Policies", icon: BookOpen, path: "/employee/policies" },
    ],
  },
  {
    title: "Services & Support",
    items: [
      { label: "Canteen History", icon: Utensils, path: "/employee/canteen" },
      { label: "Assigned Tasks", icon: CheckSquare, path: "/employee/tasks" },
      { label: "Colleague Directory", icon: Users, path: "/employee/team" },
      { label: "Announcements", icon: Megaphone, path: "/employee/notifications" },
      { label: "HR Helpdesk", icon: LifeBuoy, path: "/employee/support" },
      { label: "Account Settings", icon: Settings, path: "/employee/settings" },
    ],
  },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [employeeUser, setEmployeeUser] = useState({
    name: "Staff Employee",
    code: "BJK-EMP-001",
    department: "Quality Assurance",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("bjk_employee_user") ||
        localStorage.getItem("bjk_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setEmployeeUser({
            name: u.fullName || u.name || "Staff Member",
            code: u.employeeCode || u.employeeId || "BJK-001",
            department: u.departmentName || u.department || "Operations",
          });
        } catch {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bjk_employee_token");
      localStorage.removeItem("bjk_employee_user");
      localStorage.removeItem("bjk_token");
      localStorage.removeItem("bjk_user");
      document.cookie = "bjk_token=; path=/; max-age=0";
    }
    router.push("/employee/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-16 lg:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/employee/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] p-0.5 shadow-sm">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#00A896]" />
                </div>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 tracking-tight">
                  BJK HEALTHCARE
                </div>
                <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wide">
                  Employee Self-Service
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/employee/notifications"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-teal-500 absolute top-1.5 right-1.5" />
            </Link>

            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {employeeUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">{employeeUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{employeeUser.code}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          {/* Employee Mini Profile Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-sm border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-[#00A896] font-black text-sm flex items-center justify-center border border-teal-500/30">
                {employeeUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{employeeUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{employeeUser.code}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{employeeUser.department}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-3 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full p-4 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-900">Portal Directory</div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                      {group.title}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive ? "bg-[#00A896] text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/80 shadow-lg lg:hidden flex items-center justify-around h-16 px-2">
        <Link
          href="/employee/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === "/employee/dashboard" ? "text-[#00A896]" : "text-slate-400"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/employee/attendance"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === "/employee/attendance" ? "text-[#00A896]" : "text-slate-400"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Punch</span>
        </Link>
        <Link
          href="/employee/leave"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === "/employee/leave" ? "text-[#00A896]" : "text-slate-400"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Leave</span>
        </Link>
        <Link
          href="/employee/payroll"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            pathname === "/employee/payroll" ? "text-[#00A896]" : "text-slate-400"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Salary</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
