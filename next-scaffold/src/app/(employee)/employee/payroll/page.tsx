"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Download,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface Payslip {
  id: string;
  month: string;
  gross: number;
  deductions: number;
  net: number;
  paidOn: string;
  status: "PAID";
}

const mockPayslips: Payslip[] = [
  { id: "PS-2026-09", month: "September 2026", gross: 55000, deductions: 6750, net: 48250, paidOn: "01 Oct 2026", status: "PAID" },
  { id: "PS-2026-08", month: "August 2026", gross: 55000, deductions: 6750, net: 48250, paidOn: "01 Sep 2026", status: "PAID" },
  { id: "PS-2026-07", month: "July 2026", gross: 55000, deductions: 6750, net: 48250, paidOn: "01 Aug 2026", status: "PAID" },
];

export default function EmployeePayrollPage() {
  const [payslips] = useState<Payslip[]>(mockPayslips);

  const handleDownloadPDF = (month: string) => {
    alert(`Downloading Official BJK Healthcare Payslip PDF for ${month}...`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Payroll & Statutory Compensation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monthly salary distribution, tax declarations, and official payslip downloads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
            Bank Transfer: HDFC •••• 5544
          </span>
        </div>
      </div>

      {/* Salary Structure Card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl shadow-xl border border-slate-700/60 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Active Compensation Package
            </span>
            <h2 className="text-lg font-bold text-white">Monthly Cost to Company (CTC)</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">₹48,250</div>
            <div className="text-[10px] text-slate-400">Net Take-Home Pay</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Basic Salary</span>
            <span className="font-extrabold text-white text-sm block mt-0.5">₹30,000</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">House Rent (HRA)</span>
            <span className="font-extrabold text-white text-sm block mt-0.5">₹15,000</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Special Allowance</span>
            <span className="font-extrabold text-white text-sm block mt-0.5">₹10,000</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-rose-400 block">Total Deductions (PF/PT)</span>
            <span className="font-extrabold text-rose-400 text-sm block mt-0.5">-₹6,750</span>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Payslip Archive</h3>
          <span className="text-xs text-slate-400">Financial Year 2026-27</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Salary Month</th>
                <th className="py-3 px-6">Gross Pay</th>
                <th className="py-3 px-6">Statutory Deductions</th>
                <th className="py-3 px-6">Net Take-Home</th>
                <th className="py-3 px-6">Disbursement Date</th>
                <th className="py-3 px-6 text-right">Payslip PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{ps.month}</span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">₹{ps.gross.toLocaleString()}</td>
                  <td className="py-3.5 px-6 text-rose-600 font-semibold">-₹{ps.deductions.toLocaleString()}</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-700 text-sm">₹{ps.net.toLocaleString()}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">{ps.paidOn}</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDownloadPDF(ps.month)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-[#00A896] hover:bg-[#009B8D] shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
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
