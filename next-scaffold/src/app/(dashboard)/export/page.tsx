"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  ArrowLeft,
  Ship,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Plane,
  Clock,
  Printer
} from "lucide-react";

interface ExportConsignment {
  id: string;
  consignmentNo: string;
  destinationCountry: string;
  client: string;
  products: string;
  coppNo: string;
  temperatureRegime: string;
  shippingMode: "SEA_FREIGHT" | "AIR_CARGO";
  customsStatus: "CLEARED" | "CUSTOMS_SEALED" | "PORT_IN_TRANSIT" | "DOCUMENTATION";
  dispatchDate: string;
}

const mockExports: ExportConsignment[] = [
  { id: "EXP-01", consignmentNo: "BJK-EXP-2026-088", destinationCountry: "Kenya (Mombasa Port)", client: "Nairobi Health Supply Ltd", products: "Ciprofloxacin 200mg Inj (50,000 Vials)", coppNo: "COPP-FDCA-2026-881", temperatureRegime: "Controlled Ambient (15°C - 25°C)", shippingMode: "SEA_FREIGHT", customsStatus: "PORT_IN_TRANSIT", dispatchDate: "2026-10-08" },
  { id: "EXP-02", consignmentNo: "BJK-EXP-2026-089", destinationCountry: "Vietnam (Ho Chi Minh)", client: "Pharma Import Corp Vietnam", products: "Paracetamol 500mg IV Infusion (30,000 Bottles)", coppNo: "COPP-FDCA-2026-894", temperatureRegime: "Controlled Ambient (15°C - 25°C)", shippingMode: "SEA_FREIGHT", customsStatus: "CUSTOMS_SEALED", dispatchDate: "2026-10-14" },
  { id: "EXP-03", consignmentNo: "BJK-EXP-2026-090", destinationCountry: "Nigeria (Lagos Airport)", client: "Apex Medical Distributors", products: "Ceftriaxone 1g Sterile Dry Powder (25,000 Vials)", coppNo: "COPP-FDCA-2026-902", temperatureRegime: "Cold Chain (2°C - 8°C Data Logger)", shippingMode: "AIR_CARGO", customsStatus: "CLEARED", dispatchDate: "2026-10-12" },
  { id: "EXP-04", consignmentNo: "BJK-EXP-2026-091", destinationCountry: "Uzbekistan (Tashkent)", client: "Silk Road Pharma LLC", products: "Eye & Ear Drops Multi-Pack (40,000 Units)", coppNo: "COPP-FDCA-2026-915", temperatureRegime: "Ambient (15°C - 25°C)", shippingMode: "AIR_CARGO", customsStatus: "DOCUMENTATION", dispatchDate: "2026-10-20" },
];

export default function InternationalExportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockExports.filter((e) => {
    return e.consignmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.destinationCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.products.toLowerCase().includes(searchQuery.toLowerCase());
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
                International Export & COPP Certification
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                WHO-GMP Certificate of Pharmaceutical Product
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Track international pharmaceutical consignments, customs sealing, TempTale cold chain curves, and COPP dossiers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Consolidated Export Shipping Bill and COPP docket generated.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Generate Shipping Dossier</span>
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Export Markets</div>
          <div className="text-2xl font-black text-slate-900 mt-1">18 Countries</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Africa, CIS, SE Asia</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Consignments in Transit</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">3 Shipments</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">145,000 Units in Transit</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">COPP Clearances</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100% Issued</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">WHO Model Certified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cold Chain Integrity</div>
          <div className="text-2xl font-black text-teal-700 mt-1">2°C - 8°C Safe</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Zero Temp Excursion</div>
        </div>
      </div>

      {/* Consignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Active International Consignments ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((con) => (
            <div key={con.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{con.destinationCountry}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                    {con.consignmentNo}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {con.shippingMode}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 pt-0.5">
                  {con.products}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                  <span>Client: <strong className="text-slate-700">{con.client}</strong></span>
                  <span>•</span>
                  <span>COPP: <strong className="text-slate-700 font-mono">{con.coppNo}</strong></span>
                  <span>•</span>
                  <span className="text-teal-700 font-medium">{con.temperatureRegime}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-700">{con.dispatchDate}</div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {con.customsStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActionSuccess(`Generated Bill of Lading & COPP pack for ${con.consignmentNo}`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
