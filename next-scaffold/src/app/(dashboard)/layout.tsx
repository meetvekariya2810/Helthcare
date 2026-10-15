"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Factory,
  FlaskConical,
  ShieldCheck,
  Boxes,
  Wrench,
  CreditCard,
  ShoppingCart,
  Globe,
  TrendingUp,
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  path: string;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupTitle: "Executive & Core Operations",
    items: [
      { id: "dispatcher", label: "Operations Dispatcher", shortLabel: "Dispatcher", icon: LayoutDashboard, path: "/dashboard" },
      { id: "hr", label: "Workforce & HRMS", shortLabel: "HRMS", icon: Users, path: "/dashboard/hr", badge: "91 Active", badgeColor: "bg-teal-50 text-[#00A896]" },
      { id: "production", label: "Production & eBR", shortLabel: "Production", icon: Factory, path: "/dashboard/production", badge: "4 Batches", badgeColor: "bg-indigo-50 text-indigo-600" },
      { id: "qc", label: "Quality Control Lab", shortLabel: "QC Lab", icon: FlaskConical, path: "/dashboard/quality-control", badge: "6 Samples", badgeColor: "bg-amber-50 text-amber-600" },
      { id: "qa", label: "Quality Assurance QMS", shortLabel: "QA QMS", icon: ShieldCheck, path: "/dashboard/quality-assurance", badge: "GMP Ready", badgeColor: "bg-rose-50 text-rose-600" },
    ],
  },
  {
    groupTitle: "Materials, Plant & Supply",
    items: [
      { id: "warehouse", label: "Warehouse & Inventory", shortLabel: "Warehouse", icon: Boxes, path: "/dashboard/warehouse", badge: "111 SKUs", badgeColor: "bg-teal-50 text-[#00A896]" },
      { id: "engineering", label: "Plant Engineering", shortLabel: "Engineering", icon: Wrench, path: "/dashboard/engineering" },
      { id: "procurement", label: "Purchase & ASL", shortLabel: "Purchase", icon: ShoppingCart, path: "/dashboard/procurement" },
      { id: "facilities", label: "Facilities & Admin", shortLabel: "Facilities", icon: Building2, path: "/dashboard/facilities" },
    ],
  },
  {
    groupTitle: "Commercial & Compliance",
    items: [
      { id: "finance", label: "Finance & Accounts", shortLabel: "Finance", icon: CreditCard, path: "/dashboard/finance" },
      { id: "regulatory", label: "Regulatory Affairs", shortLabel: "Regulatory", icon: Globe, path: "/dashboard/regulatory", badge: "50 Mkts", badgeColor: "bg-cyan-50 text-cyan-700" },
      { id: "sales", label: "Sales & CRM", shortLabel: "Sales", icon: TrendingUp, path: "/dashboard/sales" },
      { id: "micro", label: "QC Microbiology", shortLabel: "Microbiology", icon: Activity, path: "/dashboard/microbiology" },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [userName, setUserName] = useState("Director / Administrator");
  const [userRole, setUserRole] = useState("SUPER_ADMIN");
  const [userCode, setUserCode] = useState("BJK-EXEC-01");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Real-time clock in Asia/Kolkata
    const updateTime = () => {
      const d = new Date();
      const formatted = d.toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " " + d.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " IST";
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
        if (u.role) setUserRole(u.role);
        if (u.employeeCode || u.employeeId) setUserCode(u.employeeCode || u.employeeId);
      }
    } catch {
      // Keep defaults
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.clear();
      document.cookie = "bjk_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    } catch {
      // Ignored
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased">
      {/* =========================================================================
          DESKTOP SIDEBAR
      ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 z-30 fixed top-0 bottom-0 left-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#00A896]/20">
                BJK
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 tracking-tight leading-none">
                  BJK HEALTHCARE
                </span>
                <span className="text-[10px] font-bold text-[#00A896] tracking-wider uppercase mt-0.5">
                  Digital Brain &bull; Ops
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#00A896]/20">
                B
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-[#00A896] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <ItemIcon
                        size={17}
                        className={isActive ? "text-white" : "text-slate-400 group-hover:text-[#00A896] transition-colors"}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${
                          isActive ? "bg-white/20 text-white" : item.badgeColor || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Portal Switcher */}
          {!isCollapsed && (
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                External Portals
              </div>
              <Link
                href="/employee/dashboard"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="flex items-center space-x-2.5">
                  <UserCheck size={15} className="text-slate-400" />
                  <span>Employee Self-Service</span>
                </span>
                <ExternalLink size={12} className="text-slate-400" />
              </Link>
              <Link
                href="/canteen/dashboard"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="flex items-center space-x-2.5">
                  <Sparkles size={15} className="text-slate-400" />
                  <span>Canteen Management</span>
                </span>
                <ExternalLink size={12} className="text-slate-400" />
              </Link>
            </div>
          )}
        </div>

        {/* 21 CFR Part 11 Audit Shield Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2 text-[10px] text-slate-500">
              <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Lock size={11} />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-slate-700">21 CFR Part 11 Compliant</p>
                <p className="text-[9px] text-slate-400">Audit Trail Immutable</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="21 CFR Part 11 Compliant">
              <Lock size={15} className="text-emerald-600" />
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA & TOP NAVBAR
      ========================================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Header Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile hamburger & Plant Telemetry */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Lavad Formulation Facility:</span>
              <span className="font-bold text-[#00A896]">Operational &bull; ISO Class 7</span>
            </div>
          </div>

          {/* Right: Clock, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            {/* Live Clock */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              <Clock size={13} className="text-[#00A896]" />
              <span>{currentTime || "Asia/Kolkata (IST)"}</span>
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 relative transition-all"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Plant Alerts & Notifications</span>
                    <span className="text-[10px] font-bold text-[#00A896]">3 New</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <p className="font-bold text-slate-800">Batch Formulation Complete</p>
                      <p className="text-[11px] text-slate-500">Paracetamol 500mg (Batch BJK-TAB-2026-088) moved to Packaging.</p>
                      <span className="text-[9px] text-slate-400">12 mins ago</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <p className="font-bold text-slate-800">QC COA Issued</p>
                      <p className="text-[11px] text-slate-500">Certificate of Analysis for Amoxicillin Raw Material released.</p>
                      <span className="text-[9px] text-slate-400">45 mins ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-50 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{userName}</span>
                  <span className="text-[10px] font-semibold text-[#00A896] uppercase">{userRole}</span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{userName}</p>
                    <p className="text-[11px] font-mono text-slate-500">{userCode}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-[#00A896] mt-1">
                      {userRole}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/employee/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg"
                    >
                      <UserCheck size={14} />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER
      ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00A896] text-white flex items-center justify-center font-bold text-sm">
                  BJK
                </div>
                <span className="text-sm font-black text-slate-900">BJK Operations</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.groupTitle}
                  </div>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-[#00A896] text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <ItemIcon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
