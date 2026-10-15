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
  Activity,
  Layers,
  Cpu
} from "lucide-react";

interface MasterLogEntry {
  id: string;
  timestamp: string;
  system: "MANUFACTURING_eBR" | "QC_HPLC_INSTRUMENT" | "WAREHOUSE_DISPENSING" | "HRMS_BIOMETRIC" | "ACCESS_SECURITY";
  operator: string;
  empCode: string;
  action: string;
  details: string;
  ipAddress: string;
  hashSha256: string;
}

const mockMasterLogs: MasterLogEntry[] = [
  { id: "LOG-99214", timestamp: "2026-10-15 17:14:22", system: "MANUFACTURING_eBR", operator: "Dr. Ananya Roy", empCode: "BJK-QA-002", action: "ELECTRONIC_SIGNATURE", details: "Batch BMR-2026-089 (Ciprofloxacin Inj) released to packaging.", ipAddress: "192.168.10.42", hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
  { id: "LOG-99213", timestamp: "2026-10-15 17:09:41", system: "QC_HPLC_INSTRUMENT", operator: "Priya Shah", empCode: "BJK-QC-008", action: "CHROMATOGRAM_AUDIT", details: "HPLC Instrument #2 baseline integration approved.", ipAddress: "192.168.10.15", hashSha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb" },
  { id: "LOG-99212", timestamp: "2026-10-15 16:58:12", system: "WAREHOUSE_DISPENSING", operator: "Ajay Verma", empCode: "BJK-WH-006", action: "RAW_MATERIAL_DISPENSE", details: "Dispensed 50.00 kg Paracetamol IP Batch #RM-26-881 to cleanroom buffer.", ipAddress: "192.168.10.33", hashSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a" },
  { id: "LOG-99211", timestamp: "2026-10-15 16:45:00", system: "HRMS_BIOMETRIC", operator: "Turnstile T-2 Scanner", empCode: "BJK-PROD-001", action: "CLEANROOM_INGRESS", details: "Ramesh Patel verified via facial biometric match (99.6% confidence).", ipAddress: "192.168.10.82", hashSha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d" },
  { id: "LOG-99210", timestamp: "2026-10-15 16:30:18", system: "ACCESS_SECURITY", operator: "HR Master Admin", empCode: "BJK-HR-001", action: "PASSWORD_POLICY_AUDIT", details: "Enforced 90-day password aging on 91 active accounts.", ipAddress: "192.168.10.100", hashSha256: "98234abcf9823120194859238472910394857291029384756192837465192837" },
];

export default function MasterAuditLogsPage() {
  const [selectedSystem, setSelectedSystem] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockMasterLogs.filter((log) => {
    const matchesSys = selectedSystem === "ALL" || log.system === selectedSystem;
    const matchesQuery = log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSys && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/operations"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Master Plant-Wide 21 CFR Part 11 Audit Trail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Continuous Append-Only Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cross-subsystem forensic audit trail spanning formulation, laboratory instruments, warehouse dispensing, and access security
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Exported certified plant-wide audit log for regulatory authorities.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Export Official Audit File</span>
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Plant Events</div>
          <div className="text-2xl font-black text-slate-900 mt-1">99,214 Logs</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">100% Cryptographically Chained</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Systems Monitored</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">5 Subsystems</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">eBR, HPLC, WH, HRMS, SCADA</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Exceptions</div>
          <div className="text-2xl font-black text-slate-900 mt-1">0 Anomalies</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Zero unauthorized overrides</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ALCOA+ Compliance</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">100% Pass</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Attributable, Legible, Original</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search operator, employee ID, details, or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Plant Subsystems</option>
            <option value="MANUFACTURING_eBR">Manufacturing eBR</option>
            <option value="QC_HPLC_INSTRUMENT">QC Lab Instruments</option>
            <option value="WAREHOUSE_DISPENSING">Warehouse Dispensing</option>
            <option value="HRMS_BIOMETRIC">Biometric Turnstiles</option>
            <option value="ACCESS_SECURITY">Access Security</option>
          </select>
        </div>
      </div>

      {/* Master Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Plant-Wide Forensic Ledger ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                    {log.system}
                  </span>
                  <span className="text-xs font-black text-slate-900">{log.operator}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{log.empCode}</span>
                  <span className="text-slate-400">•</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                    {log.action}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                  <Clock size={12} />
                  <span>{log.timestamp}</span>
                  <span>•</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 font-medium pt-0.5">
                {log.details}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span className="truncate max-w-xl">SHA-256: {log.hashSha256}</span>
                <span className="text-emerald-600 font-bold shrink-0">Validated</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
