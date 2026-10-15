"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  CalendarCheck,
  CreditCard,
  Building2,
  CalendarDays,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function HRDashboardPage() {
  const [workforceData, setWorkforceData] = useState({
    totalEmployees: 91,
    activeEmployees: 91,
    presentToday: 78,
    onLeave: 4,
    shiftA: 42,
    shiftB: 36,
  });

  const kpis: KPICardItem[] = [
    {
      title: "Active Workforce",
      value: workforceData.totalEmployees,
      subtext: "100% Bio-Enrolled",
      icon: Users,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "0 Attrition",
      trendLabel: "this quarter",
    },
    {
      title: "Present Today",
      value: workforceData.presentToday,
      subtext: "Lavad Plant & HQ",
      icon: UserCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "85.7%",
      trendLabel: "Punctuality Rate",
    },
    {
      title: "Approved Leaves",
      value: workforceData.onLeave,
      subtext: "CL / SL / EL",
      icon: CalendarCheck,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Cover Assigned",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Statutory Payroll",
      value: "Compliant",
      subtext: "EPF, ESI, PT, TDS",
      icon: CreditCard,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "Ready for Disbursal",
      trendColor: "text-indigo-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Add New Employee", icon: Plus, primary: true },
    { label: "Review Biometric Muster", icon: Clock },
    { label: "Export Statutory Reports", icon: FileSpreadsheet },
    { label: "Approve Pending Leaves", icon: CalendarCheck },
  ];

  const departmentBreakdown = [
    { name: "Production & Compounding", count: 21, percentage: "23%", status: "Shift Active" },
    { name: "Quality Control Analytical", count: 14, percentage: "15%", status: "Shift Active" },
    { name: "Quality Assurance QMS", count: 12, percentage: "13%", status: "Shift Active" },
    { name: "Warehouse & Supply Chain", count: 11, percentage: "12%", status: "Shift Active" },
    { name: "Plant Engineering & Utilities", count: 9, percentage: "10%", status: "Shift Active" },
    { name: "Regulatory & Clinical Affairs", count: 7, percentage: "8%", status: "Shift Active" },
    { name: "Finance, Commercial & Admin", count: 17, percentage: "19%", status: "Shift Active" },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Human Resources & Workforce Command Center"
      departmentCode="HRMS"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Departmental Muster & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Headcount Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Department Workforce Allocation
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Active staff deployed across Lavad plant units
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {workforceData.totalEmployees} Employees Total
              </span>
            </div>

            <div className="space-y-3">
              {departmentBreakdown.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{dept.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {dept.count} Members &bull; {dept.percentage} of workforce
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {dept.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Compliance & Shift Telemetry */}
        <div className="space-y-6">
          {/* Biometric Muster Telemetry */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Biometric Live Muster</h3>
                <p className="text-[11px] text-slate-400">Lavad Turnstile Terminals</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-medium">Shift A (07:00 – 15:30)</span>
                <span className="font-bold text-slate-800">42 / 42 Present</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-medium">Shift B (15:00 – 23:30)</span>
                <span className="font-bold text-slate-800">36 / 36 Scheduled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-medium">General Office Shift</span>
                <span className="font-bold text-slate-800">13 / 13 Checked In</span>
              </div>
            </div>
          </div>

          {/* Statutory Compliance Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Statutory Registers</h3>
                <p className="text-[11px] text-slate-400">Indian Labour Law & Factories Act</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                <span className="font-bold">Form B (Register of Employees)</span>
                <span className="text-[10px] font-bold">UP TO DATE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                <span className="font-bold">Form D (Attendance Muster Roll)</span>
                <span className="text-[10px] font-bold">VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                <span className="font-bold">Form C (Bonus & Statutory Dues)</span>
                <span className="text-[10px] font-bold">AUDITED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
