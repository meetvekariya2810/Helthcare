"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Building2,
  CalendarDays,
  ShieldCheck,
  GraduationCap,
  Award,
  Boxes,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Bot,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Lock,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

const hrmsModules = [
  { name: "Employee Directory", path: "/hrms/employees", icon: Users, badge: "91 Staff", desc: "Technical & Non-Technical profiles with role-based masking" },
  { name: "12-Stage Onboarding", path: "/hrms/employees/create", icon: UserPlus, badge: "Guided Wizard", desc: "Candidate biodata, statutory bank verification, GMP documents" },
  { name: "Biometric Command Center", path: "/hrms/attendance/command-center", icon: Activity, badge: "Live Telemetry", desc: "Real-time Lavad plant turnstiles, gate muster & shift pings" },
  { name: "Attendance & Muster Roll", path: "/hrms/attendance", icon: Clock, badge: "Form D Roll", desc: "Daily muster rolls, punch adjustments & regularization" },
  { name: "Shifts & Rostering", path: "/hrms/shifts", icon: Calendar, badge: "Multi-Shift", desc: "General, Shift A, Shift B rotational roasters & auto-assign" },
  { name: "Leave Approvals (3-Tier)", path: "/hrms/leave", icon: CalendarDays, badge: "Tier 1-3", desc: "Manager -> Dept Head -> HR sign-offs, CL/SL/EL ledger" },
  { name: "Statutory Payroll Engine", path: "/hrms/payroll", icon: CreditCard, badge: "EPF / ESI / PT", desc: "Automatic salary calculation, TDS deductions, payslip PDFs" },
  { name: "Smart ID Cards Center", path: "/hrms/id-cards", icon: ShieldCheck, badge: "QR Verification", desc: "Official biometric ID cards with QR codes & printable format" },
  { name: "Recruitment & Requisitions", path: "/hrms/recruitment", icon: Users, badge: "Openings", desc: "Job requisitions, candidate interviews & pipeline stages" },
  { name: "Cleanroom GMP Training", path: "/hrms/training", icon: GraduationCap, badge: "Schedule M", desc: "SOP certifications, cleanroom hygiene & annual refresher tests" },
  { name: "Statutory Credentials", path: "/hrms/credentials", icon: Award, badge: "30/60/90d Alert", desc: "Pharmacist licenses, medical fitness & statutory expiry alerts" },
  { name: "Assets & Cleanroom Gear", path: "/hrms/assets", icon: Boxes, badge: "PPE Tracking", desc: "Cleanroom sterile suits, goggles, hardware & lockers" },
  { name: "Travel & Expense Claims", path: "/hrms/expenses", icon: Receipt, badge: "Claims", desc: "Corporate expense approvals, travel allowances & receipts" },
  { name: "Workforce Analytics", path: "/hrms/analytics", icon: TrendingUp, badge: "Telemetry", desc: "Attrition curves, overtime expenditure & department distribution" },
  { name: "Labor Law Compliance", path: "/hrms/compliance", icon: ShieldCheck, badge: "Form B/C/D", desc: "Factories Act registers, wage code compliance & inspections" },
  { name: "13-Policy AI Copilot", path: "/hrms/copilot", icon: Bot, badge: "Internal NLP", desc: "Instant conversational guidance across official BJK handbooks" },
  { name: "Account Credentials", path: "/hrms/login-credentials", icon: Lock, badge: "Security", desc: "Account unlocks, permanent password resets & role assignment" },
  { name: "21 CFR Part 11 Audit Trail", path: "/hrms/access-audit", icon: FileText, badge: "Immutable", desc: "Electronic signature ledger, login IP history & security events" },
];

export default function MasterHRMSDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Total Headcount",
      value: 91,
      subtext: "100% Bio-Synced",
      icon: Users,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "0 Attrition",
      trendLabel: "this quarter",
    },
    {
      title: "Present Today",
      value: 78,
      subtext: "Lavad Plant Unit",
      icon: UserCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "85.7%",
      trendLabel: "Punctuality",
    },
    {
      title: "Active On Leave",
      value: 4,
      subtext: "Statutory Covered",
      icon: CalendarDays,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Cover Assigned",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Payroll Compliance",
      value: "100%",
      subtext: "EPF, ESI, PT, TDS",
      icon: CreditCard,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "Disbursal Ready",
      trendColor: "text-indigo-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "12-Stage Onboard New Hire", icon: UserPlus, primary: true },
    { label: "Biometric Turnstile Muster", icon: Activity },
    { label: "Issue Smart ID Cards", icon: ShieldCheck },
    { label: "Generate Statutory Registers", icon: FileSpreadsheet },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Master Enterprise HRMS Core Operations"
      departmentCode="HRMS"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="space-y-6">
        {/* Module Switchboard Grid */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Enterprise HRMS Module Switchboard (18 Modules)
              </h2>
              <p className="text-xs text-slate-400">
                Lavad Plant Formulation Facility & Corporate Workforce Directory
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#00A896] border border-teal-200">
              All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {hrmsModules.map((mod, idx) => {
              const ModIcon = mod.icon;
              return (
                <Link
                  key={idx}
                  href={mod.path}
                  className="group p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#00A896] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 group-hover:text-[#00A896] group-hover:border-teal-200 flex items-center justify-center transition-colors">
                        <ModIcon size={16} />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 font-mono">
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#00A896] transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end text-[#00A896] text-[11px] font-bold">
                    <span className="group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>Access Module</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
