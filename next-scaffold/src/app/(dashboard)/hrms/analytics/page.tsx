"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowLeft,
  Users,
  Clock,
  Award,
  DollarSign,
  PieChart,
  BarChart2,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function WorkforceAnalyticsPage() {
  const departmentBreakdown = [
    { name: "Production (Injectables & Liquids)", count: 42, percentage: "46.2%", color: "bg-teal-500" },
    { name: "Quality Control (QC Analytical Lab)", count: 16, percentage: "17.6%", color: "bg-blue-500" },
    { name: "Warehouse & Cold Chain", count: 10, percentage: "11.0%", color: "bg-amber-500" },
    { name: "Quality Assurance & Compliance", count: 8, percentage: "8.8%", color: "bg-purple-500" },
    { name: "Engineering & Plant Utilities", count: 7, percentage: "7.7%", color: "bg-indigo-500" },
    { name: "Facilities & Plant Security", count: 5, percentage: "5.5%", color: "bg-rose-500" },
    { name: "Finance, Accounts & Procurement", count: 3, percentage: "3.2%", color: "bg-slate-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/hrms"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Workforce Analytics & Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Plant Human Capital Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Department headcount distribution, overtime expenditure curve, cleanroom certification readiness
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Staff</div>
          <div className="text-2xl font-black text-slate-900 mt-1">91 Employees</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">100% Retained (0 Attrition)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Overtime</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">142.5 Hours</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Factories Act Sec 59</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cleanroom Qualified</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">96.8%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Grade A/B Certified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Tenure</div>
          <div className="text-2xl font-black text-slate-900 mt-1">3.4 Years</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Lavad Plant Facility</div>
        </div>
      </div>

      {/* Department Distribution Bars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 size={16} className="text-teal-600" />
            <span>Departmental Headcount & Operational Distribution</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400">91 Total Personnel</span>
        </div>

        <div className="space-y-3">
          {departmentBreakdown.map((dept) => (
            <div key={dept.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{dept.name}</span>
                <span className="font-mono text-slate-500">
                  <strong className="text-slate-900">{dept.count}</strong> staff ({dept.percentage})
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${dept.color} rounded-full`}
                  style={{ width: dept.percentage }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
