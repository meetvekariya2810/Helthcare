"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  FileText,
  CreditCard,
  Building,
  Check,
  X,
  Upload
} from "lucide-react";

interface ExpenseClaim {
  id: string;
  empCode: string;
  name: string;
  department: string;
  category: "TRAVEL_FUEL" | "VENDOR_DINNER" | "TRAINING_SEMINAR" | "EMERGENCY_UTILITY" | "MEDICAL";
  description: string;
  amount: number;
  submittedOn: string;
  status: "PENDING_HOD" | "PENDING_FINANCE" | "DISBURSED" | "REJECTED";
  receiptCount: number;
}

const mockClaims: ExpenseClaim[] = [
  { id: "EXP-2026-042", empCode: "BJK-QC-004", name: "Priya Shah", department: "Quality Control", category: "TRAINING_SEMINAR", description: "Registration for Advanced HPLC Method Validation Seminar, Ahmedabad", amount: 4500, submittedOn: "2026-10-12", status: "PENDING_FINANCE", receiptCount: 1 },
  { id: "EXP-2026-041", empCode: "BJK-SALES-002", name: "Rohan Varma", department: "Sales & Distribution", category: "TRAVEL_FUEL", description: "Doctor detailing visits in Gandhinagar & Mehsana hospitals", amount: 2850, submittedOn: "2026-10-10", status: "DISBURSED", receiptCount: 3 },
  { id: "EXP-2026-039", empCode: "BJK-ENG-003", name: "Kiran Joshi", department: "Engineering", category: "EMERGENCY_UTILITY", description: "Immediate replacement of HVAC HEPA filter differential gauge sensors", amount: 6200, submittedOn: "2026-10-08", status: "DISBURSED", receiptCount: 2 },
  { id: "EXP-2026-038", empCode: "BJK-PROD-001", name: "Ramesh Patel", department: "Production", category: "MEDICAL", description: "Annual medical vision test & chest X-ray at authorized diagnostic center", amount: 1500, submittedOn: "2026-10-05", status: "DISBURSED", receiptCount: 1 },
];

export default function ExpensesManagementPage() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockClaims.filter((exp) => {
    const matchesStatus = selectedStatus === "ALL" || exp.status === selectedStatus;
    const matchesQuery = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const totalClaimed = filtered.reduce((acc, curr) => acc + curr.amount, 0);

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
                Travel & Expense Reimbursements
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Corporate Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Audit staff expense claims, doctor detailing travel, emergency parts indents, and GST invoices
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Direct bank reimbursement batch prepared for Accounts approval.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <CreditCard size={14} />
            <span>Process Reimbursement Batch</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Claims</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{totalClaimed.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">{filtered.length} Claims submitted</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</div>
          <div className="text-2xl font-black text-amber-600 mt-1">1 Claim</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">₹4,500 waiting on Accounts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disbursed This Month</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹10,550</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Paid via NEFT</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">GST Input Credit</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">₹1,890</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">100% Tax Compliant</div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Employee Expense Claims ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((claim) => (
            <div key={claim.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{claim.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{claim.empCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {claim.department}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {claim.category.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 pt-0.5">
                  {claim.description}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                  <span>Submitted: {claim.submittedOn}</span>
                  <span>•</span>
                  <span>Receipts: {claim.receiptCount} Attached</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    ₹{claim.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      claim.status === "DISBURSED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {claim.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActionSuccess(`Audited expense claim ${claim.id}`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  View Receipts
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
