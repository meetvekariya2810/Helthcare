"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldAlert,
  FileCheck,
  Calendar,
  ChevronRight,
  Upload,
  RefreshCw
} from "lucide-react";

interface StatutoryCredential {
  id: string;
  empCode: string;
  name: string;
  department: string;
  credentialType: string;
  issuingAuthority: string;
  certificateNo: string;
  expiryDate: string;
  daysRemaining: number;
  status: "VALID" | "WARNING_60" | "CRITICAL_30" | "EXPIRED";
}

const mockCredentials: StatutoryCredential[] = [
  { id: "CRED-001", empCode: "BJK-PROD-001", name: "Ramesh Patel", department: "Production", credentialType: "Schedule M Medical Fitness (Form 33)", issuingAuthority: "Certifying Factory Surgeon, Ahmedabad", certificateNo: "SURG-2025-091", expiryDate: "2026-11-12", daysRemaining: 28, status: "CRITICAL_30" },
  { id: "CRED-002", empCode: "BJK-QC-004", name: "Priya Shah", department: "Quality Control", credentialType: "Gujarat State Pharmacy Council Registration", issuingAuthority: "GSPC, Gandhinagar", certificateNo: "GSPC-REG-84920", expiryDate: "2026-12-05", daysRemaining: 51, status: "WARNING_60" },
  { id: "CRED-003", empCode: "BJK-ENG-003", name: "Kiran Joshi", department: "Engineering", credentialType: "First Class Boiler Operator Certificate", issuingAuthority: "Directorate of Boilers, Gujarat", certificateNo: "BLR-GJ-2022-108", expiryDate: "2027-04-18", daysRemaining: 185, status: "VALID" },
  { id: "CRED-004", empCode: "BJK-QA-002", name: "Dr. Ananya Roy", department: "Quality Assurance", credentialType: "Approved Technical Staff (Form 25 / Form 28)", issuingAuthority: "Food and Drug Control Administration (FDCA)", certificateNo: "FDCA-APP-9912", expiryDate: "2027-08-30", daysRemaining: 319, status: "VALID" },
  { id: "CRED-005", empCode: "BJK-WH-006", name: "Ajay Verma", department: "Warehouse", credentialType: "Annual Cleanroom Visual Acuity & Color Blindness", issuingAuthority: "Civil Hospital Eye Clinic", certificateNo: "EYE-MED-2025-44", expiryDate: "2026-11-20", daysRemaining: 36, status: "WARNING_60" },
];

export default function StatutoryCredentialsPage() {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockCredentials.filter((cred) => {
    const matchesFilter = selectedFilter === "ALL" || cred.status === selectedFilter;
    const matchesQuery = cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.credentialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.certificateNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const getStatusBadge = (status: string, days: number) => {
    switch (status) {
      case "CRITICAL_30":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">Critical: {days} Days Left</span>;
      case "WARNING_60":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Expiring in {days} Days</span>;
      case "VALID":
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Valid ({days} Days)</span>;
    }
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
                Statutory Credentials & License Radar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                30 / 60 / 90d Early Warning
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Approved Technical Staff approvals (Form 25/28), Pharmacy Council registrations & medical fitness certificates
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Automated email and SMS renewal alerts dispatched to 2 staff members.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <RefreshCw size={14} />
            <span>Trigger Renewal Alerts</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Radar KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tracked Licenses</div>
          <div className="text-2xl font-black text-slate-900 mt-1">91 Staff</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">100% Repository Indexed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Critical (&lt;30 Days)</div>
          <div className="text-2xl font-black text-rose-600 mt-1">1 License</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Requires urgent renewal</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Warning (30-60 Days)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">2 Licenses</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Renewal initiated</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fully Compliant</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">88 Staff</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">FDCA audit safe</div>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Active Regulatory Licenses & Certifications ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((cred) => (
            <div key={cred.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{cred.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{cred.empCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {cred.department}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 pt-0.5">
                  {cred.credentialType}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                  <span>Authority: <strong className="text-slate-700">{cred.issuingAuthority}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-slate-600">Cert: {cred.certificateNo}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">
                    Expires: <strong className="text-slate-800">{cred.expiryDate}</strong>
                  </div>
                  <div className="mt-1">{getStatusBadge(cred.status, cred.daysRemaining)}</div>
                </div>

                <button
                  onClick={() => {
                    setActionSuccess(`Initiated renewal docket for ${cred.name}'s ${cred.credentialType}.`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Renew Docket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
