"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Radio,
  DoorOpen,
  UserCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Flame,
  Thermometer,
  Lock,
  Unlock,
  Building,
  Clock,
  Laptop
} from "lucide-react";

interface TurnstileEvent {
  id: string;
  timestamp: string;
  empCode: string;
  name: string;
  department: string;
  gate: string;
  direction: "IN" | "OUT";
  confidence: number;
  temperature: string;
  status: "AUTHORIZED" | "FLAGGED";
  reason?: string;
}

const mockPings: TurnstileEvent[] = [
  { id: "EVT-1092", timestamp: "17:14:22", empCode: "BJK-PROD-014", name: "Ramesh Patel", department: "Production (Injectable)", gate: "Cleanroom Air Shower Turnstile T-2", direction: "IN", confidence: 99.6, temperature: "36.4°C", status: "AUTHORIZED" },
  { id: "EVT-1091", timestamp: "17:12:05", empCode: "BJK-QC-008", name: "Priya Shah", department: "Quality Control", gate: "QC Analytical Lab Access T-4", direction: "IN", confidence: 98.9, temperature: "36.5°C", status: "AUTHORIZED" },
  { id: "EVT-1090", timestamp: "17:09:41", empCode: "BJK-WH-003", name: "Ajay Verma", department: "Warehouse", gate: "Lavad Main Gate Turnstile T-1", direction: "OUT", confidence: 99.2, temperature: "36.6°C", status: "AUTHORIZED" },
  { id: "EVT-1089", timestamp: "17:05:18", empCode: "BJK-ENG-005", name: "Kiran Joshi", department: "Engineering & HVAC", gate: "Utility Substation Turnstile T-5", direction: "IN", confidence: 97.4, temperature: "36.7°C", status: "AUTHORIZED" },
  { id: "EVT-1088", timestamp: "17:01:30", empCode: "BJK-QA-002", name: "Dr. Ananya Roy", department: "Quality Assurance", gate: "Lavad Admin & QA Block T-3", direction: "IN", confidence: 99.8, temperature: "36.3°C", status: "AUTHORIZED" },
  { id: "EVT-1087", timestamp: "16:58:12", empCode: "BJK-PROD-041", name: "Suresh Thakor", department: "Production (Oral Liquid)", gate: "Lavad Main Gate Turnstile T-1", direction: "IN", confidence: 99.1, temperature: "36.5°C", status: "AUTHORIZED" },
  { id: "EVT-1086", timestamp: "16:52:04", empCode: "BJK-SEC-001", name: "Mahesh Rabari", department: "Security & Plant Admin", gate: "Perimeter Perimeter Gate T-6", direction: "IN", confidence: 99.9, temperature: "36.4°C", status: "AUTHORIZED" },
];

const turnstiles = [
  { id: "T-1", name: "Lavad Plant Main Gate", type: "Optical Flap Barrier", status: "ONLINE", latency: "14ms", todayPings: 184, cleanroomZone: "Unclassified" },
  { id: "T-2", name: "Cleanroom Air Shower Barrier", type: "Sterile Interlock", status: "ONLINE", latency: "11ms", todayPings: 64, cleanroomZone: "Grade B Cleanroom" },
  { id: "T-3", name: "QA / QC Analytical Lab", type: "Biometric Card & Face", status: "ONLINE", latency: "16ms", todayPings: 89, cleanroomZone: "Grade C Lab" },
  { id: "T-4", name: "Warehouse & Cold Storage", type: "Full Height Barrier", status: "ONLINE", latency: "18ms", todayPings: 72, cleanroomZone: "Ambient Controlled" },
  { id: "T-5", name: "Engineering & Utilities", type: "Tripod Turnstile", status: "ONLINE", latency: "22ms", todayPings: 38, cleanroomZone: "Technical Area" },
  { id: "T-6", name: "Corporate Admin Entrance", type: "Speed Gate Optical", status: "ONLINE", latency: "12ms", todayPings: 112, cleanroomZone: "Executive Office" },
];

export default function BiometricCommandCenterPage() {
  const [filterGate, setFilterGate] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredPings = mockPings.filter((p) => {
    const matchesGate = filterGate === "ALL" || p.gate.includes(filterGate);
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGate && matchesQuery;
  });

  const handleEmergencyOverride = (turnstileName: string) => {
    setActionSuccess(`Emergency gate release triggered for: ${turnstileName}. 21 CFR Part 11 security audit recorded.`);
    setTimeout(() => setActionSuccess(null), 5000);
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
                Biometric Command Center
              </h1>
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time hardware telemetry from Lavad Formulation Facility turnstiles & cleanroom interlocks
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/hrms/attendance"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Form D Muster Roll
          </Link>
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
              isLiveStreaming
                ? "bg-teal-600 text-white shadow-xs hover:bg-teal-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            <Radio size={14} className={isLiveStreaming ? "animate-pulse" : ""} />
            <span>{isLiveStreaming ? "Streaming Real-Time" : "Stream Paused"}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active On-Site</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">78 / 91</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">85.7% Shift Adherence</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shift Distribution</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">A: 42 | B: 24</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">General: 12 Staff</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Turnstiles Status</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wifi size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">6 / 6 Online</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Avg Latency 14ms (SQL Synced)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Biometric Accuracy</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">99.4%</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">0 Security Rejections Today</div>
        </div>
      </div>

      {/* Main Grid: Turnstiles Hardware Grid + Live In-Out Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Turnstile Hardware Nodes */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-1.5">
              <Building size={16} className="text-slate-500" />
              <span>Plant Barriers & Interlocks</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-400">6 Gates</span>
          </div>

          <div className="space-y-2.5">
            {turnstiles.map((gate) => (
              <div
                key={gate.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                      {gate.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{gate.name}</span>
                  </div>
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{gate.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 my-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400">Zone: </span>
                    <span className="font-semibold text-slate-700">{gate.cleanroomZone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Today Pings: </span>
                    <span className="font-semibold text-slate-700">{gate.todayPings}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Type: </span>
                    <span className="font-semibold text-slate-700">{gate.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Ping Latency: </span>
                    <span className="font-semibold text-teal-600">{gate.latency}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEmergencyOverride(gate.name)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 flex items-center space-x-1 transition-colors"
                  >
                    <Unlock size={11} />
                    <span>Admin Override</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Stream Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, employee ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterGate}
                onChange={(e) => setFilterGate(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Gates & Barriers</option>
                <option value="Main Gate">Main Gate</option>
                <option value="Cleanroom">Cleanroom Air Shower</option>
                <option value="QC Analytical">QC Lab</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Admin">Admin Block</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-teal-600 animate-spin" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Live Biometric & Turnstile Event Feed
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {filteredPings.length} Events Logged
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPings.map((ping) => (
                <div key={ping.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wider ${
                        ping.direction === "IN"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ping.direction}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{ping.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{ping.empCode}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center space-x-2 mt-0.5">
                        <span>{ping.department}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{ping.gate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 text-right">
                    <div className="text-[11px]">
                      <div className="font-mono font-bold text-slate-800">{ping.timestamp}</div>
                      <div className="text-slate-400 text-[10px] flex items-center justify-end space-x-1">
                        <Thermometer size={10} className="text-amber-500" />
                        <span>{ping.temperature}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {ping.confidence}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
