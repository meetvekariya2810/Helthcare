"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Printer,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  ScanLine,
} from "lucide-react";

export default function EmployeeIDCardPage() {
  const [emp, setEmp] = useState({
    name: "Dr. Rajesh Sharma",
    code: "BJK-EMP-001",
    designation: "Senior Quality Assurance Lead",
    department: "Quality Assurance",
    bloodGroup: "O+ Positive",
    emergencyContact: "+91 98765 43210",
    joiningDate: "01 March 2024",
    validTill: "31 March 2027",
    plantLocation: "Ahmedabad Formulation Unit",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("bjk_employee_user") ||
        localStorage.getItem("bjk_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setEmp((prev) => ({
            ...prev,
            name: u.fullName || u.name || prev.name,
            code: u.employeeCode || u.employeeId || prev.code,
            designation: u.designationTitle || u.designation || prev.designation,
            department: u.departmentName || u.department || prev.department,
            bloodGroup: u.bloodGroup || prev.bloodGroup,
          }));
        } catch {}
      }
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Official Plant Digital ID Credential
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            21 CFR Part 11 compliant digital smart pass for cleanroom & plant access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print ID Pass</span>
          </button>
          <Link
            href={`/verify/employee/${emp.code}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#009B8D] shadow-sm transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Public Verification URL</span>
          </Link>
        </div>
      </div>

      {/* ID Card Presentation */}
      <div className="flex justify-center py-4">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-900 relative">
          {/* Top Header Card Lanyard Hole */}
          <div className="h-4 bg-slate-900 flex justify-center items-center">
            <div className="w-12 h-1.5 rounded-full bg-slate-800" />
          </div>

          {/* Brand Banner */}
          <div className="bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="inline-flex p-2.5 rounded-2xl bg-white/15 border border-white/20 mb-2">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-sm font-black tracking-wider uppercase">
              BJK HEALTHCARE PRIVATE LIMITED
            </h2>
            <div className="text-[10px] text-teal-100 font-medium tracking-wide">
              Enterprise Operations & Pharmaceutical Manufacturing
            </div>
          </div>

          {/* Employee Photo & Identification */}
          <div className="p-6 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] p-1 shadow-md mx-auto">
                <div className="w-full h-full rounded-[22px] bg-slate-100 flex items-center justify-center text-slate-700 font-black text-2xl">
                  {emp.name.charAt(0)}
                </div>
              </div>
              <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{emp.name}</h3>
              <p className="text-xs font-bold text-[#00A896] uppercase tracking-wide">
                {emp.designation}
              </p>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 mt-1">
                {emp.code}
              </div>
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] pt-3 border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Department</span>
                <span className="font-bold text-slate-800">{emp.department}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Blood Group</span>
                <span className="font-bold text-rose-600">{emp.bloodGroup}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Issue Date</span>
                <span className="font-bold text-slate-800 font-mono">{emp.joiningDate}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Valid Thru</span>
                <span className="font-bold text-slate-800 font-mono">{emp.validTill}</span>
              </div>
            </div>

            {/* QR Code & Scan verification block */}
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex items-center justify-between gap-3">
              <div className="text-left text-[10px] space-y-0.5">
                <div className="font-bold text-slate-900">QR Clearance Pass</div>
                <p className="text-slate-500">Scan to verify authentic credentials against cloud ledger</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl p-1 shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                <QrCode className="w-11 h-11 text-slate-900" />
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="pt-2 text-center">
              <div className="h-7 w-48 bg-[repeating-linear-gradient(90deg,#0F172A_0px,#0F172A_2px,transparent_2px,transparent_5px,#0F172A_5px,#0F172A_8px,transparent_8px,transparent_10px)] mx-auto opacity-80" />
              <div className="text-[9px] text-slate-400 font-mono mt-1 tracking-widest">
                *{emp.code}*
              </div>
            </div>
          </div>

          {/* Card Bottom Strip */}
          <div className="p-3 bg-slate-900 text-white text-center text-[10px] font-medium border-t border-slate-800">
            Authorized Personnel • BJK Formulation Facility
          </div>
        </div>
      </div>
    </div>
  );
}
