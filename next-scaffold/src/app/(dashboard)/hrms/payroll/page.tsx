"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  Download,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  Percent,
  Printer,
  ChevronRight,
  Send
} from "lucide-react";

interface EmployeePayroll {
  empCode: string;
  name: string;
  department: string;
  role: string;
  grossSalary: number;
  basic: number;
  hra: number;
  allowances: number;
  epfDeduction: number;
  esiDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  canteenDeduction: number;
  netPay: number;
  status: "CALCULATED" | "DISBURSED" | "LOCKED";
}

const mockPayrollData: EmployeePayroll[] = [
  { empCode: "BJK-PROD-001", name: "Ramesh Patel", department: "Production", role: "Cleanroom Operator", grossSalary: 32000, basic: 16000, hra: 8000, allowances: 8000, epfDeduction: 1920, esiDeduction: 240, ptDeduction: 200, tdsDeduction: 0, canteenDeduction: 650, netPay: 28990, status: "DISBURSED" },
  { empCode: "BJK-QC-004", name: "Priya Shah", department: "Quality Control", role: "Senior Chemist", grossSalary: 45000, basic: 22500, hra: 11250, allowances: 11250, epfDeduction: 2700, esiDeduction: 0, ptDeduction: 200, tdsDeduction: 1250, canteenDeduction: 450, netPay: 40400, status: "DISBURSED" },
  { empCode: "BJK-QA-002", name: "Dr. Ananya Roy", department: "Quality Assurance", role: "QA Officer", grossSalary: 65000, basic: 32500, hra: 16250, allowances: 16250, epfDeduction: 3900, esiDeduction: 0, ptDeduction: 200, tdsDeduction: 3800, canteenDeduction: 300, netPay: 56800, status: "DISBURSED" },
  { empCode: "BJK-WH-006", name: "Ajay Verma", department: "Warehouse", role: "Dispensing Supervisor", grossSalary: 28000, basic: 14000, hra: 7000, allowances: 7000, epfDeduction: 1680, esiDeduction: 210, ptDeduction: 200, tdsDeduction: 0, canteenDeduction: 800, netPay: 25110, status: "DISBURSED" },
  { empCode: "BJK-ENG-003", name: "Kiran Joshi", department: "Engineering", role: "HVAC Engineer", grossSalary: 38000, basic: 19000, hra: 9500, allowances: 9500, epfDeduction: 2280, esiDeduction: 0, ptDeduction: 200, tdsDeduction: 600, canteenDeduction: 500, netPay: 34420, status: "DISBURSED" },
  { empCode: "BJK-MICRO-002", name: "Neha Trivedi", department: "Microbiology", role: "Microbiologist", grossSalary: 42000, basic: 21000, hra: 10500, allowances: 10500, epfDeduction: 2520, esiDeduction: 0, ptDeduction: 200, tdsDeduction: 900, canteenDeduction: 400, netPay: 37980, status: "DISBURSED" },
];

export default function StatutoryPayrollPage() {
  const [payrollPeriod, setPayrollPeriod] = useState("OCT_2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredData = mockPayrollData.filter((emp) => {
    const matchesDept = selectedDept === "ALL" || emp.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesQuery = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const totalGross = filteredData.reduce((acc, curr) => acc + curr.grossSalary, 0);
  const totalNet = filteredData.reduce((acc, curr) => acc + curr.netPay, 0);
  const totalEPF = filteredData.reduce((acc, curr) => acc + curr.epfDeduction, 0);
  const totalTDS = filteredData.reduce((acc, curr) => acc + curr.tdsDeduction, 0);

  const handleBankDisbursal = () => {
    setActionSuccess("Generated HDFC/SBI Corporate Bulk NEFT payment file with 21 CFR Part 11 sign-off.");
    setTimeout(() => setActionSuccess(null), 5000);
  };

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
                Statutory Indian Payroll Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                EPF • ESI • PT • TDS Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated salary computation, Gujarat PT slabs, statutory PF challan preparation, and NEFT batch transfers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Exported EPFO ECR Text File & ESIC Monthly Return CSV.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
          >
            <Download size={14} />
            <span>Statutory ECR File</span>
          </button>
          <button
            onClick={handleBankDisbursal}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Send size={14} />
            <span>Generate NEFT Bank Batch</span>
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Gross Payroll</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{totalGross.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">91 Headcount Basis</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Disbursal Amount</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalNet.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Direct Bank Transfer</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">EPF Employee Share</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">₹{totalEPF.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">+12% Employer Match</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TDS Withheld (192)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{totalTDS.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Quarterly 24Q compliant</div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, code, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={payrollPeriod}
            onChange={(e) => setPayrollPeriod(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="OCT_2026">October 2026 (Live Cycle)</option>
            <option value="SEP_2026">September 2026 (Disbursed)</option>
            <option value="AUG_2026">August 2026 (Disbursed)</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Production">Production</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Engineering">Engineering</option>
          </select>
        </div>
      </div>

      {/* Salary Computation Register */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Monthly Salary & Deductions Register
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredData.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Gross (₹)</th>
                <th className="px-4 py-3 text-right">Basic (₹)</th>
                <th className="px-4 py-3 text-right">EPF (12%)</th>
                <th className="px-4 py-3 text-right">ESI / PT</th>
                <th className="px-4 py-3 text-right">TDS (₹)</th>
                <th className="px-4 py-3 text-right">Canteen (₹)</th>
                <th className="px-4 py-3 text-right">Net Payable</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((emp) => (
                <tr key={emp.empCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{emp.empCode}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{emp.department}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    ₹{emp.grossSalary.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ₹{emp.basic.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-700 font-medium">
                    -₹{emp.epfDeduction}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    -₹{emp.esiDeduction + emp.ptDeduction}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-rose-700">
                    {emp.tdsDeduction > 0 ? `-₹${emp.tdsDeduction}` : "₹0"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700">
                    -₹{emp.canteenDeduction}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                    ₹{emp.netPay.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {emp.status}
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
