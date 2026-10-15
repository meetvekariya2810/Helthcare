"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  QrCode,
  Building2,
  Droplets,
  Phone,
  Sparkles,
  User
} from "lucide-react";

interface EmployeeCardData {
  empCode: string;
  name: string;
  role: string;
  department: string;
  bloodGroup: string;
  emergencyContact: string;
  cleanroomGrade: "Grade A/B" | "Grade C" | "Grade D" | "Unclassified";
  issueDate: string;
  validTill: string;
}

const mockStaffCards: EmployeeCardData[] = [
  { empCode: "BJK-PROD-001", name: "Ramesh Patel", role: "Cleanroom Operator", department: "Production", bloodGroup: "B+", emergencyContact: "+91 98765 43210", cleanroomGrade: "Grade A/B", issueDate: "01/01/2026", validTill: "31/12/2027" },
  { empCode: "BJK-QC-004", name: "Priya Shah", role: "Senior Chemist", department: "Quality Control", bloodGroup: "O+", emergencyContact: "+91 98223 34455", cleanroomGrade: "Grade C", issueDate: "15/02/2026", validTill: "31/12/2027" },
  { empCode: "BJK-QA-002", name: "Dr. Ananya Roy", role: "QA Officer", department: "Quality Assurance", bloodGroup: "A+", emergencyContact: "+91 94001 22334", cleanroomGrade: "Grade A/B", issueDate: "10/01/2026", validTill: "31/12/2027" },
  { empCode: "BJK-WH-006", name: "Ajay Verma", role: "Dispensing Supervisor", department: "Warehouse", bloodGroup: "AB+", emergencyContact: "+91 97112 23344", cleanroomGrade: "Grade D", issueDate: "01/03/2026", validTill: "31/12/2027" },
  { empCode: "BJK-ENG-003", name: "Kiran Joshi", role: "HVAC Engineer", department: "Engineering", bloodGroup: "B+", emergencyContact: "+91 96554 43322", cleanroomGrade: "Grade C", issueDate: "20/01/2026", validTill: "31/12/2027" },
  { empCode: "BJK-MICRO-002", name: "Neha Trivedi", role: "Microbiologist", department: "Microbiology", bloodGroup: "O-", emergencyContact: "+91 99887 76655", cleanroomGrade: "Grade A/B", issueDate: "12/02/2026", validTill: "31/12/2027" },
];

export default function SmartIdCardsCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredCards = mockStaffCards.filter((c) => {
    const matchesDept = selectedDept === "ALL" || c.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesGrade = selectedGrade === "ALL" || c.cleanroomGrade === selectedGrade;
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.empCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesGrade && matchesQuery;
  });

  const handlePrintAll = () => {
    setActionSuccess("Initiated high-resolution PVC Card Batch Print queue with 21 CFR Part 11 security audit.");
    setTimeout(() => setActionSuccess(null), 4000);
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
                Smart Biometric ID Cards Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Encrypted QR Verification
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generate standardized ISO/IEC 7810 PVC identity cards with cleanroom zone clearance and public verification tokens
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintAll}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Print PVC Badge Batch ({filteredCards.length})</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, code, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
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
            <option value="Microbiology">Microbiology</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Cleanroom Grades</option>
            <option value="Grade A/B">Grade A/B (Sterile Core)</option>
            <option value="Grade C">Grade C (Clean Area)</option>
            <option value="Grade D">Grade D (Controlled)</option>
            <option value="Unclassified">Unclassified / Admin</option>
          </select>
        </div>
      </div>

      {/* Badges Grid Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <div
            key={card.empCode}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col justify-between hover:border-teal-400 transition-all"
          >
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-3.5 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-teal-200">
                  BJK Healthcare Pvt Ltd
                </div>
                <div className="text-xs font-black tracking-tight">Lavad Formulation Unit</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-teal-500/30 border border-teal-400/50 text-white">
                WHO-GMP
              </span>
            </div>

            {/* Badge Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                  <User size={32} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 truncate">{card.name}</h3>
                  <div className="text-xs font-semibold text-slate-500 truncate">{card.role}</div>
                  <div className="text-[11px] font-mono font-bold text-teal-700">{card.empCode}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-semibold text-slate-800">{card.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                  <span className="font-semibold text-rose-600 flex items-center space-x-0.5">
                    <Droplets size={10} />
                    <span>{card.bloodGroup}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cleanroom Zone</span>
                  <span className="font-bold text-teal-700">{card.cleanroomGrade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Validity</span>
                  <span className="font-semibold text-slate-700">{card.validTill}</span>
                </div>
              </div>

              {/* QR Code Strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                  <QrCode size={24} className="text-slate-800" />
                  <div className="leading-tight">
                    <span className="font-bold text-slate-700 block">Scan to Verify</span>
                    <span className="text-[9px] text-slate-400 font-mono">/verify-id?code={card.empCode}</span>
                  </div>
                </div>

                <Link
                  href={`/verify-id?code=${card.empCode}`}
                  target="_blank"
                  className="px-2.5 py-1 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                >
                  Verify
                </Link>
              </div>
            </div>

            {/* Bottom Card Footer Actions */}
            <div className="bg-slate-50 p-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-slate-400 font-mono">ID: {card.empCode}</span>
              <button
                onClick={() => {
                  setActionSuccess(`Sent ${card.name}'s badge to ID Card Printer.`);
                  setTimeout(() => setActionSuccess(null), 3000);
                }}
                className="text-teal-700 hover:text-teal-800 font-bold flex items-center space-x-1"
              >
                <Printer size={12} />
                <span>Print Badge</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
