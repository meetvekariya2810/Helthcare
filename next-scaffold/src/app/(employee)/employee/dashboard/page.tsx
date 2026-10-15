"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Megaphone,
  Sparkles,
  AlertCircle,
  FileText,
  Utensils,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const [employeeName, setEmployeeName] = useState("Staff Member");
  const [employeeCode, setEmployeeCode] = useState("BJK-EMP-001");
  const [department, setDepartment] = useState("Quality Assurance");
  const [clockedIn, setClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState("08:55 AM");
  const [punchLoading, setPunchLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("bjk_employee_user") ||
        localStorage.getItem("bjk_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.fullName || u.name) setEmployeeName(u.fullName || u.name);
          if (u.employeeCode || u.employeeId) setEmployeeCode(u.employeeCode || u.employeeId);
          if (u.departmentName || u.department) setDepartment(u.departmentName || u.department);
        } catch {}
      }
    }
  }, []);

  const handlePunchToggle = () => {
    setPunchLoading(true);
    setTimeout(() => {
      setClockedIn(!clockedIn);
      if (!clockedIn) {
        setClockInTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
      setPunchLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00A896]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Plant Shift Active: General Shift (GS)</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome, {employeeName}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2 font-mono">
              <span>{employeeCode}</span>
              <span>•</span>
              <span className="text-teal-300 font-sans">{department}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-sans text-slate-400">
                <MapPin className="w-3 h-3 text-[#00A896]" />
                Ahmedabad Formulation Facility
              </span>
            </p>
          </div>

          {/* Quick Action Clock In/Out */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Today's Punch Status
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{clockedIn ? `In at ${clockInTime}` : "Clocked Out"}</span>
              </div>
            </div>

            <button
              onClick={handlePunchToggle}
              disabled={punchLoading}
              className={`px-5 py-3 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5 ${
                clockedIn
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-900/30"
                  : "bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-teal-900/30"
              }`}
            >
              {punchLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span>{clockedIn ? "Punch Clock Out" : "Punch Clock In"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attendance</span>
            <Clock className="w-4 h-4 text-[#00A896]" />
          </div>
          <div className="text-2xl font-black text-slate-900">96.4%</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>21 of 22 Days Present</span>
          </div>
        </div>

        {/* Leave Ledger */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Leave</span>
            <Calendar className="w-4 h-4 text-[#7B2CBF]" />
          </div>
          <div className="text-2xl font-black text-slate-900">14 Days</div>
          <div className="text-[11px] text-slate-500">CL: 4 • SL: 5 • EL: 5</div>
        </div>

        {/* Shift Timings */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shift Window</span>
            <Calendar className="w-4 h-4 text-[#F77F00]" />
          </div>
          <div className="text-xl font-black text-slate-900">09:00 - 17:30</div>
          <div className="text-[11px] text-slate-500">General Plant Shift (GS)</div>
        </div>

        {/* Current Net Pay */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Estimated Net Pay</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹48,250</div>
          <div className="text-[11px] text-teal-600 font-medium">October 2026 Cycle</div>
        </div>
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/employee/leave"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#00A896] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 text-[#00A896] w-fit group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Apply Leave</div>
            <div className="text-[10px] text-slate-400">CL, SL & Earned leaves</div>
          </div>
        </Link>

        <Link
          href="/employee/payroll"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#00A896] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#7B2CBF] w-fit group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">View Payslips</div>
            <div className="text-[10px] text-slate-400">Salary breakdown & PDF</div>
          </div>
        </Link>

        <Link
          href="/employee/id-card"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#00A896] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-orange-50 text-[#F77F00] w-fit group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Digital ID Card</div>
            <div className="text-[10px] text-slate-400">QR security credential</div>
          </div>
        </Link>

        <Link
          href="/employee/canteen"
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#00A896] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Canteen Ledger</div>
            <div className="text-[10px] text-slate-400">Meal records & quotas</div>
          </div>
        </Link>
      </div>

      {/* Corporate Circulars & Announcements */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-[#00A896]" />
            <h3 className="text-sm font-bold text-slate-900">Corporate Circulars & Quality Alerts</h3>
          </div>
          <span className="text-xs text-teal-600 font-semibold">October 2026</span>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/60 flex items-start justify-between gap-3">
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white uppercase tracking-wider mb-1">
                GMP Compliance
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Annual ISO 9001:2015 & WHO-GMP Cleanroom Audit Schedule
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                All production and QA personnel are requested to verify their cleanroom gowning certifications prior to the scheduled internal audit on October 24th.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white uppercase tracking-wider mb-1">
                Plant Notice
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Diwali Holiday Schedule & Factory Roster Notice
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Holiday schedules and optional continuous-batch plant duty rosters for the upcoming festival period have been released in the Shift Schedule tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
