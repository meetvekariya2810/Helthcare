"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Radio,
  Tablet,
  Key,
  RefreshCw,
  Plus
} from "lucide-react";

interface AssetRecord {
  id: string;
  tagNo: string;
  category: "CLEANROOM_GEAR" | "HARDWARE_TABLET" | "RADIO_COMMS" | "CHANGE_ROOM_LOCKER";
  name: string;
  assignedTo: string;
  department: string;
  washCycles?: number;
  maxCycles?: number;
  condition: "EXCELLENT" | "GOOD" | "DUE_FOR_AUTOCLAVE" | "NEEDS_REPLACEMENT";
  issuedDate: string;
}

const mockAssets: AssetRecord[] = [
  { id: "AST-01", tagNo: "CR-SUIT-108", category: "CLEANROOM_GEAR", name: "Grade A/B Tyvek Sterile Gowning Suit (Size L)", assignedTo: "Ramesh Patel (BJK-PROD-001)", department: "Production", washCycles: 18, maxCycles: 50, condition: "GOOD", issuedDate: "2026-06-10" },
  { id: "AST-02", tagNo: "TAB-QC-03", category: "HARDWARE_TABLET", name: "Samsung Galaxy Tab Active4 Pro (21 CFR Part 11 Scanners)", assignedTo: "Priya Shah (BJK-QC-004)", department: "Quality Control", condition: "EXCELLENT", issuedDate: "2026-01-15" },
  { id: "AST-03", tagNo: "RAD-EX-02", category: "RADIO_COMMS", name: "Motorola ATEX Intrinsically Safe Plant Radio", assignedTo: "Kiran Joshi (BJK-ENG-003)", department: "Engineering", condition: "EXCELLENT", issuedDate: "2026-02-01" },
  { id: "AST-04", tagNo: "LCK-CR1-042", category: "CHANGE_ROOM_LOCKER", name: "Lavad Change Room #1 Sterile Locker", assignedTo: "Dr. Ananya Roy (BJK-QA-002)", department: "Quality Assurance", condition: "EXCELLENT", issuedDate: "2026-01-01" },
  { id: "AST-05", tagNo: "CR-SUIT-144", category: "CLEANROOM_GEAR", name: "Grade A/B Antistatic Sterile Jumpsuit (Size M)", assignedTo: "Suresh Thakor (BJK-PROD-014)", department: "Production", washCycles: 47, maxCycles: 50, condition: "DUE_FOR_AUTOCLAVE", issuedDate: "2026-03-12" },
];

export default function AssetsManagementPage() {
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredAssets = mockAssets.filter((a) => {
    const matchesCat = selectedCat === "ALL" || a.category === selectedCat;
    const matchesQuery = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tagNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

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
                Assets & Cleanroom Gear Ledger
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                PPE & Autoclave Cycles
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Track sterile garments, ATEX communication gear, CFR-compliant mobile tablets, and cleanroom lockers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Cleanroom garment autoclave batch dispatch scheduled.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <RefreshCw size={14} />
            <span>Schedule Autoclave Cycle</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tracked Assets</div>
          <div className="text-2xl font-black text-slate-900 mt-1">214 Items</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">100% Barcode Tagged</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sterile Cleanroom Suits</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">84 Active</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Avg 22 / 50 Wash Cycles</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Due for Replacement</div>
          <div className="text-2xl font-black text-amber-600 mt-1">3 Suits</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">&gt; 45 Cycles Reached</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Locker Occupancy</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">91 / 100</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">9 Spare Lockers Available</div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Equipment & PPE Inventory ({filteredAssets.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{asset.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                    {asset.tagNo}
                  </span>
                </div>

                <div className="text-xs text-slate-600 pt-0.5">
                  <span className="text-slate-400">Assigned To: </span>
                  <strong className="text-slate-800">{asset.assignedTo}</strong>
                  <span className="text-slate-400"> ({asset.department})</span>
                </div>

                {asset.washCycles !== undefined && (
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                    <span>Autoclave Sterilization: <strong>{asset.washCycles} / {asset.maxCycles} Cycles</strong></span>
                    <span>•</span>
                    <span className="text-teal-600 font-medium">Valid for Cleanroom Entry</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  asset.condition === "DUE_FOR_AUTOCLAVE"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {asset.condition.replace(/_/g, " ")}
                </span>

                <button
                  onClick={() => {
                    setActionSuccess(`Audited asset tag: ${asset.tagNo}`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
