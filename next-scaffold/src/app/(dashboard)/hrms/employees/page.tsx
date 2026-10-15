"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  CreditCard,
  Mail,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  ShieldCheck,
  LayoutGrid,
  List,
  MoreVertical,
  X,
  ExternalLink,
} from "lucide-react";

interface EmployeeItem {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: string;
  category: "TECHNICAL" | "NON_TECHNICAL";
  status: "ACTIVE" | "PROBATION" | "CONFIRMED";
  email: string;
  mobile: string;
  joiningDate: string;
  shift: string;
  facility: string;
}

const sampleEmployees: EmployeeItem[] = [
  {
    id: "emp-1076",
    code: "BH1076",
    name: "Ajaykumar Mesariya",
    designation: "Senior Production Officer",
    department: "Production Operations",
    category: "TECHNICAL",
    status: "CONFIRMED",
    email: "ajaykumar.m@bjkhealthcare.com",
    mobile: "+91 98250 11223",
    joiningDate: "12-Jan-2022",
    shift: "Shift A (07:00 - 15:30)",
    facility: "Lavad Formulation Plant",
  },
  {
    id: "emp-1082",
    code: "BH1082",
    name: "Dr. Vikram Mehta",
    designation: "Quality Assurance Head",
    department: "Quality Assurance",
    category: "TECHNICAL",
    status: "CONFIRMED",
    email: "vikram.mehta@bjkhealthcare.com",
    mobile: "+91 98251 33445",
    joiningDate: "15-Aug-2020",
    shift: "General Shift",
    facility: "Lavad Formulation Plant",
  },
  {
    id: "emp-1090",
    code: "BH1090",
    name: "Pooja Trivedi",
    designation: "QC Senior Chemist (HPLC)",
    department: "Quality Control",
    category: "TECHNICAL",
    status: "CONFIRMED",
    email: "pooja.t@bjkhealthcare.com",
    mobile: "+91 98252 55667",
    joiningDate: "01-Jun-2023",
    shift: "Shift A (07:00 - 15:30)",
    facility: "Central Analytical QC Lab",
  },
  {
    id: "emp-1098",
    code: "BH1098",
    name: "Ramesh Patel",
    designation: "Warehouse Executive",
    department: "Warehouse & Supply Chain",
    category: "TECHNICAL",
    status: "ACTIVE",
    email: "ramesh.p@bjkhealthcare.com",
    mobile: "+91 98253 77889",
    joiningDate: "10-Nov-2024",
    shift: "General Shift",
    facility: "Lavad Central Warehouse",
  },
  {
    id: "emp-1105",
    code: "BH1105",
    name: "Sanjay Solanki",
    designation: "Cleanroom Utility Technician",
    department: "Plant Engineering",
    category: "TECHNICAL",
    status: "CONFIRMED",
    email: "sanjay.s@bjkhealthcare.com",
    mobile: "+91 98254 99001",
    joiningDate: "18-Feb-2021",
    shift: "Shift B (15:00 - 23:30)",
    facility: "Utilities & Purified Water Block",
  },
  {
    id: "emp-1120",
    code: "BH1120",
    name: "Kritika Parmar",
    designation: "Human Resources Lead",
    department: "Human Resources",
    category: "NON_TECHNICAL",
    status: "CONFIRMED",
    email: "kritika.p@bjkhealthcare.com",
    mobile: "+91 98255 12345",
    joiningDate: "05-Mar-2020",
    shift: "General Shift",
    facility: "Corporate Headquarters",
  },
  {
    id: "emp-1135",
    code: "BH1135",
    name: "Bharat Joshi",
    designation: "Senior Security Supervisor",
    department: "Facilities & Security",
    category: "NON_TECHNICAL",
    status: "ACTIVE",
    email: "bharat.j@bjkhealthcare.com",
    mobile: "+91 98256 67890",
    joiningDate: "14-Jul-2022",
    shift: "Shift A (07:00 - 15:30)",
    facility: "Gate 1 Security Turnstiles",
  },
];

export default function EmployeesDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryTab, setCategoryTab] = useState<"ALL" | "TECHNICAL" | "NON_TECHNICAL">("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedQuickView, setSelectedQuickView] = useState<EmployeeItem | null>(null);

  const filtered = sampleEmployees.filter((emp) => {
    if (categoryTab !== "ALL" && emp.category !== categoryTab) return false;
    if (deptFilter !== "ALL" && !emp.department.toLowerCase().includes(deptFilter.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#00A896] border border-teal-200">
              Workforce Directory
            </span>
            <span className="text-xs font-semibold text-slate-400">
              91 Total Registered Staff
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Employee Directory & 360 Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse pharmaceutical technical and non-technical staff across Lavad plant units
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <Link
            href="/hrms/employees/create"
            className="px-4 py-2.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Plus size={15} />
            <span>Onboard New Employee</span>
          </Link>
          <button
            onClick={() => alert("Exporting 91-Employee Dossier to Excel via ExcelJS (Server Node Runtime)...")}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCategoryTab("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                categoryTab === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Workforce (91)
            </button>
            <button
              onClick={() => setCategoryTab("TECHNICAL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                categoryTab === "TECHNICAL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Technical (74)
            </button>
            <button
              onClick={() => setCategoryTab("NON_TECHNICAL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                categoryTab === "NON_TECHNICAL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Non-Technical (17)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "cards" ? "bg-white text-[#00A896] shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid Cards"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white text-[#00A896] shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table List"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Dept Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee Name, BH Code, Designation or Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00A896] focus:border-transparent outline-hidden bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00A896] focus:border-transparent outline-hidden bg-white text-slate-700 font-semibold"
            >
              <option value="ALL">All Departments</option>
              <option value="Production">Production & Compounding</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Warehouse">Warehouse & Supply Chain</option>
              <option value="Engineering">Plant Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Facilities">Facilities & Security</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Cards View */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#00A896] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] text-white flex items-center justify-center font-black text-sm shadow-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00A896] transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#00A896] font-bold">
                        {emp.code}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {emp.status}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">{emp.designation}</p>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.department}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.facility}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedQuickView(emp)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center space-x-1"
                >
                  <Eye size={13} />
                  <span>Quick View</span>
                </button>

                <Link
                  href={`/hrms/employees/${emp.id}`}
                  className="px-3 py-1.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center space-x-1"
                >
                  <span>Profile 360</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{emp.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{emp.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{emp.designation}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {emp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{emp.shift}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/hrms/employees/${emp.id}`}
                        className="text-[#00A896] hover:underline font-bold"
                      >
                        Profile 360
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  {selectedQuickView.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedQuickView.name}</h3>
                  <p className="text-[11px] font-mono text-[#00A896]">{selectedQuickView.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuickView(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Designation</span>
                <span className="font-bold text-slate-800">{selectedQuickView.designation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Department</span>
                <span className="font-bold text-slate-800">{selectedQuickView.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Official Email</span>
                <span className="font-bold text-slate-800">{selectedQuickView.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Mobile Phone</span>
                <span className="font-bold text-slate-800">{selectedQuickView.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Assigned Shift</span>
                <span className="font-bold text-slate-800">{selectedQuickView.shift}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Joining Date</span>
                <span className="font-bold text-slate-800">{selectedQuickView.joiningDate}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedQuickView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <Link
                href={`/hrms/employees/${selectedQuickView.id}`}
                className="px-4 py-2 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Open Full 360 Dossier
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
