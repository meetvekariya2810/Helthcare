"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Building2, CreditCard, ShieldCheck } from "lucide-react";

export default function EmployeeProfilePage() {
  const [profile] = useState({
    name: "Dr. Rajesh Sharma",
    code: "BJK-EMP-001",
    department: "Quality Assurance",
    designation: "Senior QA Lead",
    email: "rajesh.sharma@bjkhealthcare.com",
    phone: "+91 98765 43210",
    joiningDate: "01 March 2024",
    bloodGroup: "O+",
    panMasked: "ABCDE••••F",
    aadhaarMasked: "•••• •••• 1234",
    bankName: "HDFC Bank Ltd",
    accountMasked: "••••••••5544",
    ifsc: "HDFC0001234",
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Personnel Record & Compliance Dossier
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official HR employee master profile and statutory payroll credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Employment Details */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00A896]" />
            <span>Employment Profile</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Full Legal Name</span>
              <span className="font-bold text-slate-800">{profile.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Employee ID</span>
              <span className="font-mono font-bold text-[#00A896]">{profile.code}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-slate-800">{profile.department}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Designation</span>
              <span className="font-semibold text-slate-800">{profile.designation}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Official Email</span>
              <span className="font-mono text-slate-800">{profile.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Mobile Phone</span>
              <span className="font-mono text-slate-800">{profile.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Blood Group</span>
              <span className="font-bold text-rose-600">{profile.bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Statutory & Bank Verification */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7B2CBF]" />
            <span>Statutory Verification (Masked for Privacy)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">PAN Number</span>
              <span className="font-mono font-bold text-slate-800">{profile.panMasked}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Aadhaar Card</span>
              <span className="font-mono font-bold text-slate-800">{profile.aadhaarMasked}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Bank Name</span>
              <span className="font-semibold text-slate-800">{profile.bankName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Account Number</span>
              <span className="font-mono font-bold text-emerald-700">{profile.accountMasked}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">IFSC Code</span>
              <span className="font-mono text-slate-800">{profile.ifsc}</span>
            </div>
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-[11px] text-teal-800 leading-relaxed mt-4">
              Bank credentials verified with State Bank / HDFC clearing network. To update direct deposit details, contact HR Operations with a cancelled cheque copy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
