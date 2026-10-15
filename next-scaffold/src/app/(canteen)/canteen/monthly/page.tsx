"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Building2,
  FileSpreadsheet,
} from "lucide-react";

interface MonthlyRollup {
  month: string;
  totalPlantMeals: number;
  totalSubsidizedCost: number;
  employeeDeductions: number;
  netCompanyExpense: number;
  status: "AUDITED" | "PENDING_AUDIT";
}

const mockMonthly: MonthlyRollup[] = [
  { month: "October 2026", totalPlantMeals: 2480, totalSubsidizedCost: 99200, employeeDeductions: 24800, netCompanyExpense: 74400, status: "PENDING_AUDIT" },
  { month: "September 2026", totalPlantMeals: 4120, totalSubsidizedCost: 164800, employeeDeductions: 41200, netCompanyExpense: 123600, status: "AUDITED" },
  { month: "August 2026", totalPlantMeals: 4050, totalSubsidizedCost: 162000, employeeDeductions: 40500, netCompanyExpense: 121500, status: "AUDITED" },
  { month: "July 2026", totalPlantMeals: 4210, totalSubsidizedCost: 168400, employeeDeductions: 42100, netCompanyExpense: 126300, status: "AUDITED" },
];

export default function CanteenMonthlyPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Monthly Catering Financial Rollups
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise monthly payroll meal deduction summaries and plant subsidy totals
          </p>
        </div>

        <button
          onClick={() => alert("Generating Monthly Payroll Deduction Sheet...")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#00A896] hover:bg-[#009B8D] shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Payroll Ledger</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Billing Period</th>
                <th className="py-3 px-6">Meals Served</th>
                <th className="py-3 px-6">Gross Subsidy</th>
                <th className="py-3 px-6">Payroll Deductions</th>
                <th className="py-3 px-6">Net Company Expense</th>
                <th className="py-3 px-6 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {mockMonthly.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{m.month}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-700">{m.totalPlantMeals.toLocaleString()}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">₹{m.totalSubsidizedCost.toLocaleString()}</td>
                  <td className="py-3.5 px-6 font-semibold text-amber-700">₹{m.employeeDeductions.toLocaleString()}</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-700">₹{m.netCompanyExpense.toLocaleString()}</td>
                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === "AUDITED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
