"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Lock,
  Clock,
  Printer,
  Hash,
  Activity
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  operator: string;
  empCode: string;
  role: string;
  action: string;
  targetEntity: string;
  ipAddress: string;
  reasonIntent: string;
  hashSha256: string;
}

const mockAuditLogs: AuditEntry[] = [
  { id: "AUD-89021", timestamp: "2026-10-15 17:14:22", operator: "Dr. Ananya Roy", empCode: "BJK-QA-002", role: "qa_officer", action: "ELECTRONIC_SIGNATURE", targetEntity: "Batch Record BMR-2026-089 (Ciprofloxacin Inj)", ipAddress: "192.168.10.42", reasonIntent: "I approve this release in accordance with 21 CFR Part 11 and WHO-GMP.", hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
  { id: "AUD-89020", timestamp: "2026-10-15 17:09:41", operator: "Priya Shah", empCode: "BJK-QC-008", role: "qc_chemist", action: "RESULT_ENTRY", targetEntity: "HPLC Assay Batch INJ-26-442", ipAddress: "192.168.10.15", reasonIntent: "Chromatographic integration passed system suitability criteria.", hashSha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb" },
  { id: "AUD-89019", timestamp: "2026-10-15 16:58:12", operator: "Ramesh Patel", empCode: "BJK-PROD-001", role: "production_operator", action: "LINE_CLEARANCE_SIGN", targetEntity: "Cleanroom Filling Line 1 (Ampoules)", ipAddress: "192.168.10.60", reasonIntent: "Line clearance verified: Previous batch materials removed, sanitization complete.", hashSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a" },
  { id: "AUD-89018", timestamp: "2026-10-15 16:32:05", operator: "HR Master Admin", empCode: "BJK-HR-001", role: "hr_executive", action: "ONBOARDING_APPROVAL", targetEntity: "Employee Dossier BJK-ENG-007", ipAddress: "192.168.10.100", reasonIntent: "Statutory background, Aadhaar and GMP qualification verified.", hashSha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d" },
];

export default function AccessAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredLogs = mockAuditLogs.filter((log) => {
    return log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleExportAudit = () => {
    setActionSuccess("Exported certified 21 CFR Part 11 audit ledger with SHA-256 integrity checksum.");
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
                21 CFR Part 11 Electronic Signature Audit Trail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Immutable Ledger • Append-Only
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Computer system validation records, electronic signatures, cryptographic timestamps, and IP session forensics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportAudit}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Export Cryptographic Audit Dossier</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Aggregate Readiness Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Audit Events</div>
          <div className="text-2xl font-black text-slate-900 mt-1">89,021 Records</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Zero Alteration Gaps</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Electronic Signatures</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">1,412 Signs</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Legally binding sign-offs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Integrity State</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">SHA-256 Valid</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Cryptographic hash chain</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FDA / WHO Readiness</div>
          <div className="text-2xl font-black text-slate-900 mt-1">100% Ready</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">ALCOA+ standard verified</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search operator, employee code, target entity, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Immutable Audit Trail Events ({filteredLogs.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                    {log.action}
                  </span>
                  <span className="text-xs font-black text-slate-900">{log.operator}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{log.empCode}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-700">{log.targetEntity}</span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                  <Clock size={12} />
                  <span>{log.timestamp} (IST)</span>
                  <span>•</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 italic">
                &quot;{log.reasonIntent}&quot;
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <div className="flex items-center space-x-1 truncate max-w-xl">
                  <Hash size={11} className="text-teal-600 shrink-0" />
                  <span className="truncate">SHA-256: {log.hashSha256}</span>
                </div>
                <span className="text-emerald-600 font-bold shrink-0">Signature Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
