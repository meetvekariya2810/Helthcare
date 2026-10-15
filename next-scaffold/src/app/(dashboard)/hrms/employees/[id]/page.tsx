"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText,
  Boxes,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  GraduationCap,
  Award,
  Activity,
  Printer,
  Sparkles,
} from "lucide-react";

export default function EmployeeProfile360Page() {
  const params = useParams();
  const id = params?.id as string || "emp-1076";

  const [activeTab, setActiveTab] = useState<
    "overview" | "personal" | "job" | "salary" | "attendance" | "leave" | "documents" | "bank" | "training" | "assets" | "audit"
  >("overview");

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Mock Dossier Record
  const employee = {
    id: id,
    code: "BH1076",
    fullName: "Ajaykumar Mesariya",
    designation: "Senior Production Officer",
    department: "Production Operations",
    subDepartment: "Formulation & Granulation Suite",
    facility: "Lavad Formulation Plant (Unit 1)",
    category: "TECHNICAL",
    status: "CONFIRMED",
    joiningDate: "12-Jan-2022",
    email: "ajaykumar.m@bjkhealthcare.com",
    mobile: "+91 98250 11223",
    bloodGroup: "O+",
    dob: "14-May-1994",
    gender: "Male",
    maritalStatus: "Married",
    shift: "Shift A (07:00 - 15:30)",
    reportingManager: "Dr. Vikram Mehta (QA / Plant Head)",
    uan: "101827491028",
    pan: "ABCDE1234F",
    aadhaar: "XXXX-XXXX-8921",
    bankName: "HDFC Bank Ltd",
    accountNumber: "XXXX-XXXX-7291",
    ifsc: "HDFC0001242",
    basicSalary: "₹ 38,000",
    hra: "₹ 15,200",
    specialAllowance: "₹ 12,800",
    grossSalary: "₹ 66,000",
    netSalary: "₹ 59,400",
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal & Family", icon: Phone },
    { id: "job", label: "Job & Shift", icon: Building2 },
    { id: "salary", label: "Compensation", icon: CreditCard },
    { id: "attendance", label: "Attendance Muster", icon: Clock },
    { id: "leave", label: "Leave Ledger", icon: Calendar },
    { id: "documents", label: "Compliance Vault", icon: FileText },
    { id: "bank", label: "Bank & Statutory", icon: Receipt },
    { id: "training", label: "GMP Training", icon: GraduationCap },
    { id: "assets", label: "PPE & Assets", icon: Boxes },
    { id: "audit", label: "21 CFR Part 11 Audit", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Return link */}
      <Link
        href="/hrms/employees"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Employee Directory</span>
      </Link>

      {/* Top Employee Dossier Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#00A896]/20 flex-shrink-0">
              {employee.fullName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {employee.fullName}
                </h1>
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-teal-50 text-[#00A896] border border-teal-200">
                  {employee.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {employee.status}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-700">
                {employee.designation} &bull; <span className="text-slate-500 font-normal">{employee.department}</span>
              </p>

              <div className="flex items-center space-x-4 text-xs text-slate-500 flex-wrap gap-y-1 pt-0.5">
                <span className="flex items-center space-x-1">
                  <Mail size={12} className="text-slate-400" />
                  <span>{employee.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Phone size={12} className="text-slate-400" />
                  <span>{employee.mobile}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{employee.facility}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <button
              onClick={() => setShowIdCardModal(true)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5"
            >
              <Printer size={14} className="text-[#00A896]" />
              <span>Smart ID Card</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5"
            >
              <Lock size={14} className="text-amber-600" />
              <span>Reset Password</span>
            </button>

            <button
              onClick={() => alert(`Downloading 21 CFR Part 11 Certified PDF Dossier for ${employee.code}...`)}
              className="px-4 py-2 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Download size={14} />
              <span>Export Dossier PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-1 overflow-x-auto pb-1 text-xs font-bold">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-[#00A896] text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xl font-black text-slate-900">98.5%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Punctuality</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xl font-black text-[#00A896]">12 Days</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Leave Balance</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xl font-black text-emerald-600">Certified</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">GMP Training</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xl font-black text-slate-900">Class A</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Medical Fitness</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
                  Workforce Assignment Dossier
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Reporting Officer:</span>
                    <p className="font-bold text-slate-800">{employee.reportingManager}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Assigned Shift:</span>
                    <p className="font-bold text-slate-800">{employee.shift}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Joining Date:</span>
                    <p className="font-bold text-slate-800">{employee.joiningDate}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Technical Classification:</span>
                    <p className="font-bold text-[#00A896]">TECHNICAL (Pharmaceutical Formulation)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Statutory Badges */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center space-x-2 font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Statutory Compliance Badges</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aadhaar Verified:</span>
                    <span className="font-bold text-emerald-600">YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PAN Linked:</span>
                    <span className="font-bold text-emerald-600">YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">EPF UAN Active:</span>
                    <span className="font-bold text-emerald-600">YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Disbursal:</span>
                    <span className="font-bold text-emerald-600">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Compensation */}
        {activeTab === "salary" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
              Salary Structure & Disbursal Ledger
            </h3>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-bold text-slate-900">{employee.basicSalary}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-bold text-slate-900">{employee.hra}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">Special Cleanroom Allowance</span>
                <span className="font-bold text-slate-900">{employee.specialAllowance}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 font-bold text-slate-900">
                <span>Monthly Gross Earnings</span>
                <span className="text-[#00A896] font-black">{employee.grossSalary}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-800 font-bold">
                <span>Net Disbursal to Bank Account</span>
                <span className="text-emerald-600 font-black text-sm">{employee.netSalary}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Audit */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Lock size={16} className="text-emerald-600" />
              <span>21 CFR Part 11 Electronic Signature & Access Audit Log</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">PASSWORD_RESET_COMPLETED</p>
                  <p className="text-[11px] text-slate-400">Initiated by HR Administrator (IP: 192.168.1.42)</p>
                </div>
                <span className="font-mono text-[10px] text-slate-500">14-Oct-2026 09:30 IST</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">BIOMETRIC_PUNCH_RECORDED</p>
                  <p className="text-[11px] text-slate-400">Turnstile Gate 1 Inward Verification Passed</p>
                </div>
                <span className="font-mono text-[10px] text-slate-500">Today 06:54 IST</span>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs: Fallback preview */}
        {["personal", "job", "attendance", "leave", "documents", "bank", "training", "assets"].includes(activeTab) && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 capitalize">
              {activeTab} Detailed Information
            </h3>
            <p className="text-xs text-slate-500">
              Complete historical ledger and validated records for employee <strong>{employee.fullName}</strong> ({employee.code}). All entries are cryptographically synced with MySQL 8.0.
            </p>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Reset Account Password</h3>
            <p className="text-xs text-slate-500">
              Generate a temporary one-time password for <strong>{employee.fullName}</strong>. They will be forced to change it on next login.
            </p>
            {resetSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                Temporary password generated: <span className="font-mono">Bjk@2026!Tmp</span>
              </div>
            ) : null}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetSuccess(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {!resetSuccess && (
                <button
                  type="button"
                  onClick={() => setResetSuccess(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
                >
                  Generate Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart ID Card Modal */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Official Smart ID Card</h3>
              <button onClick={() => setShowIdCardModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-gradient-to-tr from-[#0F172A] to-[#1E293B] text-white p-5 rounded-2xl space-y-4 shadow-lg text-center">
              <div className="flex items-center justify-between text-[10px] text-[#02C39A] font-bold">
                <span>BJK HEALTHCARE</span>
                <span>LAVAD PLANT UNIT</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#00A896] text-white mx-auto flex items-center justify-center font-black text-xl shadow-md">
                {employee.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-black">{employee.fullName}</h4>
                <p className="text-[11px] text-slate-300">{employee.designation}</p>
                <p className="font-mono text-xs font-bold text-[#00A896] mt-1">{employee.code}</p>
              </div>
              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400">
                Blood Group: <strong className="text-white">{employee.bloodGroup}</strong> &bull; Emergency: <strong className="text-white">{employee.mobile}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl flex items-center space-x-1"
              >
                <Printer size={13} />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
