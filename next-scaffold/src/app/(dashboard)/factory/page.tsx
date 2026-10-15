"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building,
  ArrowLeft,
  Droplets,
  Zap,
  Wind,
  Gauge,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Cpu
} from "lucide-react";

interface UtilitySystem {
  id: string;
  name: string;
  location: string;
  parameter: string;
  currentValue: string;
  targetRange: string;
  status: "OPTIMAL" | "ATTENTION" | "IN_RECIRCULATION";
  lastSanitized: string;
}

const mockUtilities: UtilitySystem[] = [
  { id: "UTL-WFI-01", name: "Water for Injection (WFI) Loop #1", location: "Sterile Formulation Block", parameter: "Loop Temperature & TOC", currentValue: "82.4°C | TOC: 114 ppb", targetRange: "80°C - 85°C | TOC < 500 ppb", status: "OPTIMAL", lastSanitized: "Continuous Hot Circulation" },
  { id: "UTL-STM-02", name: "Pure Clean Steam Generator", location: "Utility Substation #1", parameter: "Steam Pressure", currentValue: "64.2 psi (4.4 bar)", targetRange: "60 - 70 psi", status: "OPTIMAL", lastSanitized: "Oct 12, 2026" },
  { id: "UTL-AHU-01", name: "Cleanroom AHU-01 (Grade A/B Core)", location: "Injectables Formulation Suite", parameter: "Differential Pressure", currentValue: "+32.4 Pa", targetRange: "> +30.0 Pa", status: "OPTIMAL", lastSanitized: "HEPA Certified Sep 2026" },
  { id: "UTL-AHU-02", name: "Cleanroom AHU-02 (Airlock Interlock)", location: "Gowning & De-Gowning Zone", parameter: "Differential Pressure", currentValue: "+16.8 Pa", targetRange: "+15.0 - +20.0 Pa", status: "OPTIMAL", lastSanitized: "HEPA Certified Sep 2026" },
  { id: "UTL-N2-01", name: "Pharmaceutical Nitrogen (N2) Plant", location: "Gas Manifold Room", parameter: "Gas Purity & Delivery Pressure", currentValue: "99.999% | 6.4 bar", targetRange: "> 99.99% | 6.0 - 7.0 bar", status: "OPTIMAL", lastSanitized: "Daily In-line Sensor" },
  { id: "UTL-DG-01", name: "Standby 500 kVA Cummins Diesel Generator", location: "Perimeter Power Yard", parameter: "Fuel Level & Battery Voltage", currentValue: "94% Tank | 27.2V Float", targetRange: "> 80% | 26V - 28V", status: "OPTIMAL", lastSanitized: "Tested Oct 11, 2026" },
];

export default function FactoryInfrastructurePage() {
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
                Lavad Plant Physical Infrastructure & Utilities
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                SCADA / PLC Synchronized
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Telemetry monitoring for Water for Injection (WFI), Pure Steam, Cleanroom HVAC AHU pressure cascades, and power
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Executed automated WFI loop diagnostic test: All temperature and TOC parameters within WHO-GMP limits.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <RefreshCw size={14} />
            <span>Poll SCADA Sensors</span>
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">WFI Loop Status</div>
          <div className="text-2xl font-black text-teal-700 mt-1">82.4°C Hot</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">TOC 114 ppb (Limit: 500)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cleanroom AHUs</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">6 / 6 Online</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Differential +32 Pa Grade A</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pure Clean Steam</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">64.2 psi</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">HTM 2010 Compliant</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Grid & Standby Power</div>
          <div className="text-2xl font-black text-slate-900 mt-1">100% Armed</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">500 kVA AMF Changeover</div>
        </div>
      </div>

      {/* Utility Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockUtilities.map((utl) => (
          <div
            key={utl.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                  {utl.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {utl.status}
                </span>
              </div>

              <h3 className="text-xs font-black text-slate-900">{utl.name}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{utl.location}</p>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="text-[11px] text-slate-500">{utl.parameter}:</div>
                <div className="text-sm font-black text-teal-700 font-mono">{utl.currentValue}</div>
                <div className="text-[10px] text-slate-400">Valid: {utl.targetRange}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{utl.lastSanitized}</span>
              <button
                onClick={() => {
                  setActionSuccess(`Logged SCADA calibration check for ${utl.name}.`);
                  setTimeout(() => setActionSuccess(null), 3000);
                }}
                className="text-teal-700 font-bold hover:underline"
              >
                Logbook
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
