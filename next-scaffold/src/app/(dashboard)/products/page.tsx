"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Eye,
  Download,
  Building,
  Sparkles,
  Layers,
  Thermometer,
  FileSpreadsheet
} from "lucide-react";

interface ProductItem {
  code: string;
  brandName: string;
  genericName: string;
  dosageForm: "INJECTABLE" | "EYE_EAR_DROPS" | "ORAL_LIQUID" | "TABLET" | "DRY_SYRUP";
  strength: string;
  packSize: string;
  category: "ANTIBIOTIC" | "ANALGESIC" | "ANTIEMETIC" | "GASTRO" | "OPHTHALMIC";
  storage: string;
  licenseNo: string;
}

const mockCatalogue: ProductItem[] = [
  { code: "PRD-INJ-001", brandName: "BJK-CIPRO 200", genericName: "Ciprofloxacin Injection USP", dosageForm: "INJECTABLE", strength: "200mg / 100ml", packSize: "100ml BFS Infusion Bottle", category: "ANTIBIOTIC", storage: "Store below 25°C, Do not freeze", licenseNo: "G/28/1420" },
  { code: "PRD-INJ-002", brandName: "BJK-CEF 1G", genericName: "Ceftriaxone Sodium for Injection IP", dosageForm: "INJECTABLE", strength: "1000mg Sterile Powder", packSize: "Vial with 10ml WFI Ampoule", category: "ANTIBIOTIC", storage: "Store below 25°C, Protected from light", licenseNo: "G/28/1421" },
  { code: "PRD-INJ-003", brandName: "BJK-PARA IV", genericName: "Paracetamol IV Infusion", dosageForm: "INJECTABLE", strength: "1000mg / 100ml", packSize: "100ml BFS Bottle", category: "ANALGESIC", storage: "Store below 30°C", licenseNo: "G/28/1425" },
  { code: "PRD-INJ-004", brandName: "BJK-PANTO 40", genericName: "Pantoprazole for Injection BP", dosageForm: "INJECTABLE", strength: "40mg Lyophilized Powder", packSize: "10ml Clear Glass Vial", category: "GASTRO", storage: "Store below 25°C", licenseNo: "G/28/1428" },
  { code: "PRD-INJ-005", brandName: "BJK-ONSET 4", genericName: "Ondansetron Injection IP", dosageForm: "INJECTABLE", strength: "2mg / ml (2ml / 4ml)", packSize: "Ampoule 2ml x 10 Tray", category: "ANTIEMETIC", storage: "Store below 25°C", licenseNo: "G/28/1432" },
  { code: "PRD-INJ-006", brandName: "BJK-AMIKA 500", genericName: "Amikacin Sulphate Injection IP", dosageForm: "INJECTABLE", strength: "250mg / ml (2ml)", packSize: "2ml Vial x 10 Pack", category: "ANTIBIOTIC", storage: "Store below 25°C", licenseNo: "G/28/1435" },
  { code: "PRD-OPH-001", brandName: "BJK-MOXI EYE", genericName: "Moxifloxacin Eye Drops IP", dosageForm: "EYE_EAR_DROPS", strength: "0.5% w/v", packSize: "5ml LDPE Dropper Bottle", category: "OPHTHALMIC", storage: "Store below 25°C", licenseNo: "G/28/1440" },
  { code: "PRD-OPH-002", brandName: "BJK-TOBRA EYE", genericName: "Tobramycin & Dexamethasone Drops", dosageForm: "EYE_EAR_DROPS", strength: "0.3% + 0.1% w/v", packSize: "5ml Sterile Dropper", category: "OPHTHALMIC", storage: "Store at 2°C - 8°C (Cold Chain)", licenseNo: "G/28/1442" },
  { code: "PRD-LIQ-001", brandName: "BJK-CETIRIZINE", genericName: "Cetirizine Hydrochloride Syrup", dosageForm: "ORAL_LIQUID", strength: "5mg / 5ml", packSize: "60ml Amber PET Bottle", category: "ANALGESIC", storage: "Store below 25°C", licenseNo: "G/25/1890" },
  { code: "PRD-TAB-001", brandName: "BJK-PARACET 650", genericName: "Paracetamol Tablets IP", dosageForm: "TABLET", strength: "650mg", packSize: "10 x 10 Blister Pack", category: "ANALGESIC", storage: "Store below 25°C", licenseNo: "G/25/1894" },
  { code: "PRD-DRY-001", brandName: "BJK-AMOX-CLAV", genericName: "Amoxicillin & Potassium Clavulanate", dosageForm: "DRY_SYRUP", strength: "228.5mg / 5ml", packSize: "30ml HDPE with Measuring Cap", category: "ANTIBIOTIC", storage: "Store below 25°C in dry place", licenseNo: "G/25/1899" },
];

export default function MasterProductsCataloguePage() {
  const [selectedForm, setSelectedForm] = useState("ALL");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockCatalogue.filter((p) => {
    const matchesForm = selectedForm === "ALL" || p.dosageForm === selectedForm;
    const matchesCat = selectedCat === "ALL" || p.category === selectedCat;
    const matchesQuery = p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesForm && matchesCat && matchesQuery;
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
                111-Product Master Pharmaceutical Catalogue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Form 25 / Form 28 Licensed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Formulation dossier library covering Small Volume Parenterals (SVP), IV Infusions, Eye Drops, and Dry Syrups
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Exported 111-Product Master Regulatory Catalogue Spreadsheet.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <FileSpreadsheet size={14} />
            <span>Export Product Master Index</span>
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Approved Products</div>
          <div className="text-2xl font-black text-slate-900 mt-1">111 Formulations</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">100% CDSCO / FDCA Licensed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sterile Injectables (SVP/LVP)</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">54 Products</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Grade A/B Cleanroom Line</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ophthalmic Droppers</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">28 Products</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Sterile BFS Technology</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Export Registered</div>
          <div className="text-2xl font-black text-slate-900 mt-1">82 Products</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">COPP & CTD Dossier Ready</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand name, generic molecule, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div>
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Dosage Forms</option>
            <option value="INJECTABLE">Small & Large Volume Injectables (SVP/LVP)</option>
            <option value="EYE_EAR_DROPS">Ophthalmic & Otic Eye/Ear Drops</option>
            <option value="ORAL_LIQUID">Oral Liquids & Syrups</option>
            <option value="TABLET">Solid Orals (Tablets)</option>
            <option value="DRY_SYRUP">Pediatric Dry Syrups</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Therapeutic Categories</option>
            <option value="ANTIBIOTIC">Antibiotics & Anti-Infectives</option>
            <option value="ANALGESIC">Analgesics & Antipyretics</option>
            <option value="ANTIEMETIC">Antiemetics & Gastro-prokinetics</option>
            <option value="GASTRO">Proton Pump Inhibitors & Antacids</option>
            <option value="OPHTHALMIC">Ophthalmic Formulations</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prod) => (
          <div
            key={prod.code}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                  {prod.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {prod.dosageForm.replace(/_/g, " ")}
                </span>
              </div>

              <h3 className="text-sm font-black text-slate-900">{prod.brandName}</h3>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{prod.genericName}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Strength</span>
                  <span className="font-semibold text-slate-800">{prod.strength}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pack Format</span>
                  <span className="font-semibold text-slate-800">{prod.packSize}</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-500">
                <span className="text-slate-400">License: </span>
                <strong className="text-slate-700 font-mono">{prod.licenseNo}</strong>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Thermometer size={12} className="text-amber-500" />
                <span>{prod.storage}</span>
              </span>

              <button
                onClick={() => {
                  setActionSuccess(`Opened formulation master dossier for ${prod.brandName}`);
                  setTimeout(() => setActionSuccess(null), 3000);
                }}
                className="text-teal-700 font-bold hover:underline"
              >
                Dossier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
