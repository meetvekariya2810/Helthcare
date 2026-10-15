"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowLeft,
  Calendar,
  Lock,
  BadgeCheck,
} from "lucide-react";

interface VerificationData {
  employeeId: string;
  fullName: string;
  designation: string;
  department: string;
  organization: string;
  branch?: string;
  status: string;
  verifiedAt: string;
}

export default function PublicEmployeeVerificationPage() {
  const params = useParams();
  const code = (params?.code as string) || "";

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      verifyCredential(code);
    }
  }, [code]);

  const verifyCredential = async (tokenId: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/employees/verify/employee/${tokenId}`);
      const json = await res.json();
      if (json.success && json.verified) {
        setData(json.verificationData);
      } else {
        setError(json.message || "Invalid verification token or record not found.");
      }
    } catch (err) {
      console.error("[Verification error]:", err);
      setError("Unable to reach security verification servers. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00A896]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-900 border border-teal-500/30 shadow-xl mb-1">
            <ShieldCheck className="w-9 h-9 text-[#00A896]" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            BJK HEALTHCARE PRIVATE LIMITED
          </h1>
          <p className="text-xs text-teal-300 font-bold tracking-wider uppercase">
            Official Credential & Security Verification Portal
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-500/20 border-t-[#00A896] rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Verifying Employee Security Certificate...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">
                  Verification Failed
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">{error}</p>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Token / Code: {code}
              </div>
            </div>
          ) : data ? (
            <div>
              {/* Card Top Banner */}
              <div className="bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-100 block">
                      Security Clearance
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      Active & Authorized Employee
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-white/20 text-white font-mono">
                    {data.employeeId}
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-6 space-y-5">
                {/* Employee Name & Title */}
                <div className="text-center pb-4 border-b border-slate-100 space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {data.fullName}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#00A896]">
                    {data.designation} • {data.department}
                  </p>
                </div>

                {/* Verification Fields Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Organization
                    </span>
                    <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
                      {data.organization || "BJK Healthcare Pvt Ltd"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Facility / Branch
                    </span>
                    <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
                      {data.branch || "Ahmedabad Facility"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Status
                    </span>
                    <span className="font-extrabold text-emerald-700 text-[11px] block mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {data.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Verified At
                    </span>
                    <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5 font-mono">
                      {new Date(data.verifiedAt || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Safe Privacy Disclaimer */}
                <div className="p-3.5 bg-teal-50 border border-teal-200/80 rounded-xl text-[11px] text-teal-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00A896] shrink-0 mt-0.5" />
                  <p>
                    This is an authentic digital credential issued by{" "}
                    <strong>BJK Healthcare Private Limited</strong>. Confidential
                    personal details are protected under pharmaceutical compliance standards.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Corporate Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <div>
            © 2026 BJK Healthcare Private Limited • Corporate Registry Gujarat
          </div>
          <div className="text-[11px] text-slate-400">
            410-4th Floor, Syphon Gardenia, On SP Ring Road, Nana Chiloda, Ahmedabad, Gujarat 382330
          </div>
        </div>
      </div>
    </div>
  );
}
