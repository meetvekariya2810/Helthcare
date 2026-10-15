"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileText
} from "lucide-react";

interface ReportRow {
  empCode: string;
  name: string;
  department: string;
  shift: string;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  overtimeHours: number;
  lateArrivals: number;
  complianceRate: string;
}

const mockReportData: ReportRow[] = [
  { empCode: "BJK-PROD-001", name: "Ramesh Patel", department: "Production", shift: "Shift A", workingDays: 26, presentDays: 25, leaveDays: 1, absentDays: 0, overtimeHours: 12.5, lateArrivals: 0, complianceRate: "96.1%" },
  { empCode: "BJK-QC-004", name: "Priya Shah", department: "Quality Control", shift: "General", workingDays: 26, presentDays: 26, leaveDays: 0, absentDays: 0, overtimeHours: 4.0, lateArrivals: 1, complianceRate: "100.0%" },
  { empCode: "BJK-QA-002", name: "Dr. Ananya Roy", department: "Quality Assurance", shift: "General", workingDays: 26, presentDays: 24, leaveDays: 2, absentDays: 0, overtimeHours: 0.0, lateArrivals: 0, complianceRate: "92.3%" },
  { empCode: "BJK-WH-006", name: "Ajay Verma", department: "Warehouse", shift: "Shift A", workingDays: 26, presentDays: 23, leaveDays: 2, absentDays: 1, overtimeHours: 16.0, lateArrivals: 2, complianceRate: "88.4%" },
  { empCode: "BJK-ENG-003", name: "Kiran Joshi", department: "Engineering", shift: "Shift B", workingDays: 26, presentDays: 26, leaveDays: 0, absentDays: 0, overtimeHours: 22.5, lateArrivals: 0, complianceRate: "100.0%" },
  { empCode: "BJK-MICRO-002", name: "Neha Trivedi", department: "Microbiology", shift: "General", workingDays: 26, presentDays: 25, leaveDays: 1, absentDays: 0, overtimeHours: 6.0, lateArrivals: 0, complianceRate: "96.1%" },
  { empCode: "BJK-ADM-005", name: "Mahesh Rabari", department: "Facilities", shift: "Shift B", workingDays: 26, presentDays: 26, leaveDays: 0, absentDays: 0, overtimeHours: 8.0, lateArrivals: 0, complianceRate: "100.0%" },
  { empCode: "BJK-ACC-001", name: "Hardik Dave", department: "Finance", shift: "General", workingDays: 26, presentDays: 24, leaveDays: 2, absentDays: 0, overtimeHours: 5.5, lateArrivals: 1, complianceRate: "92.3%" },
];

export default function AttendanceReportsPage() {
  const [reportType, setReportType] = useState("MUSTER_FORM_D");
  const [datePeriod, setDatePeriod] = useState("CURRENT_MONTH");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredData = mockReportData.filter((row) => {
    return selectedDept === "ALL" || row.department.toLowerCase().includes(selectedDept.toLowerCase());
  });

  const totalOvertime = filteredData.reduce((acc, curr) => acc + curr.overtimeHours, 0);
  const avgCompliance = "95.7%";

  const handleExport = (format: "EXCEL" | "CSV" | "PDF") => {
    setDownloadSuccess(`Generated ${format} report for ${reportType} (${datePeriod}). Download started.`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/hrms/attendance"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Attendance & Muster Reports Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Statutory Factory Act Form D
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generate periodic muster rolls, overtime audit ledgers, and compliance exports for labor inspectors
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport("CSV")}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
          >
            <FileText size={14} />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport("EXCEL")}
            className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center space-x-1.5"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Print Form D PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Control Panel / Filter Matrix */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="MUSTER_FORM_D">Form D Official Muster Roll (Factories Act)</option>
            <option value="OVERTIME_LEDGER">Overtime & Double Wage Ledger (Section 59)</option>
            <option value="ABSENTEEISM_REPORT">Absenteeism & Loss of Pay Register</option>
            <option value="LATE_EARLY_PUNCH">Late Arrival & Early Exit Punch Audit</option>
            <option value="BIO_PUNCH_LOGS">Raw Turnstile Optical Punch History</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Audit Period
          </label>
          <select
            value={datePeriod}
            onChange={(e) => setDatePeriod(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="CURRENT_MONTH">October 2026 (Current Cycle)</option>
            <option value="PREVIOUS_MONTH">September 2026 (Closed Payroll)</option>
            <option value="Q3_2026">Q3 FY26 (July - September)</option>
            <option value="YEAR_TO_DATE">FY26 Year to Date</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Department Scope
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Departments (91 Headcount)</option>
            <option value="Production">Production (Injectables & Liquids)</option>
            <option value="Quality Control">Quality Control (QC Lab)</option>
            <option value="Quality Assurance">Quality Assurance (QA)</option>
            <option value="Warehouse">Warehouse & Cold Storage</option>
            <option value="Engineering">Engineering & Utilities</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Finance">Finance & Accounts</option>
          </select>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Audited Staff</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{filteredData.length} Employees</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">100% Biometric Synchronized</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Muster Compliance</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{avgCompliance}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Factories Act Threshold: 90%</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cumulative Overtime</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{totalOvertime.toFixed(1)} Hrs</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">Double Wage Eligible</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Statutory Form Status</div>
          <div className="text-2xl font-black text-slate-900 mt-1">Verified</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Ready for Labor Inspector</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Muster Roll Preview ({reportType})
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Records 1 - {filteredData.length} of {filteredData.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3 text-center">Work Days</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Leave</th>
                <th className="px-4 py-3 text-center">Absent</th>
                <th className="px-4 py-3 text-center">OT (Hrs)</th>
                <th className="px-4 py-3 text-center">Late</th>
                <th className="px-4 py-3 text-right">Adherence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => (
                <tr key={row.empCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{row.empCode}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{row.department}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {row.shift}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">{row.workingDays}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">{row.presentDays}</td>
                  <td className="px-4 py-3 text-center font-semibold text-amber-700">{row.leaveDays}</td>
                  <td className="px-4 py-3 text-center font-semibold text-rose-700">{row.absentDays}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-indigo-700">{row.overtimeHours.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-600">{row.lateArrivals}</td>
                  <td className="px-4 py-3 text-right font-black text-teal-700">{row.complianceRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
