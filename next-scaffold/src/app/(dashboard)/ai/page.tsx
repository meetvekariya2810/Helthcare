"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Activity,
  User
} from "lucide-react";

interface AiPrediction {
  batchNumber: string;
  product: string;
  predictedYield: string;
  historicalAvg: string;
  confidenceScore: string;
  riskFactor: "LOW" | "NORMAL" | "MODERATE";
  recommendation: string;
}

const mockPredictions: AiPrediction[] = [
  { batchNumber: "BJK-TAB-2026-088", product: "Paracetamol 500mg Tablets", predictedYield: "99.4%", historicalAvg: "98.9%", confidenceScore: "96.8%", riskFactor: "LOW", recommendation: "Optimal compression speed: 14,200 tabs/hr maintain current granulation humidity." },
  { batchNumber: "BJK-INJ-2026-042", product: "Ciprofloxacin 200mg/100ml Infusion", predictedYield: "99.8%", historicalAvg: "99.5%", confidenceScore: "98.2%", riskFactor: "LOW", recommendation: "WFI circulation loop at 82.4°C maintains sterility assurance level 10^-6." },
  { batchNumber: "BJK-SYR-2026-019", product: "Cetirizine 5mg/5ml Syrup", predictedYield: "97.6%", historicalAvg: "98.1%", confidenceScore: "91.4%", riskFactor: "MODERATE", recommendation: "Slight viscosity variance detected; increase compounding agitation by 50 RPM." },
];

export default function DigitalBrainAiPage() {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Welcome to BJK Healthcare Digital Brain AI. I continuously analyze sensor telemetry, batch yields, cleanroom particulate counters, and QC chromatographic peaks. How may I assist your formulation or QA investigation today?",
      timestamp: "17:00",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userQuery = inputVal;
    setMessages((prev) => [
      ...prev,
      { sender: "USER", text: userQuery, timestamp: "17:15" },
    ]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      let aiText = "Digital Brain analyzed the active formulation logs: Batch parameters are within validated limits with zero particulate alerts.";
      if (userQuery.toLowerCase().includes("yield") || userQuery.toLowerCase().includes("batch")) {
        aiText = "Based on continuous neural regression modeling of mixing speed, temperature, and API moisture content, the predicted yield for active batch BJK-TAB-2026-088 is 99.4%, outperforming the historical plant baseline of 98.9%.";
      } else if (userQuery.toLowerCase().includes("deviation") || userQuery.toLowerCase().includes("root cause")) {
        aiText = "Ishikawa root cause classification indicates 88% probability that the minor temperature excursion in Blending Room 2 was caused by AHU-04 damper servo latency during shift changeover, rather than chilled water loop failure.";
      }
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: aiText, timestamp: "17:15" },
      ]);
      setIsTyping(false);
    }, 700);
  };

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
                BJK Digital Brain AI & Batch Yield Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center space-x-1">
                <Sparkles size={12} />
                <span>Neural Predictive Analytics</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Formulation yield optimization, Ishikawa deviation root cause engine, and accelerated stability simulators
            </p>
          </div>
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yield Prediction Accuracy</div>
          <div className="text-2xl font-black text-teal-700 mt-1">99.2%</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">±0.3% Standard Error</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Batches Optimized</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">48 Batches</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">+1.4% Overall Yield Gain</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deviation Prevented</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">6 Early Alerts</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Zero Batch Scrap Rate</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Neural SCADA Sync</div>
          <div className="text-2xl font-black text-slate-900 mt-1">Real-time</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">60 SCADA Data Points/sec</div>
        </div>
      </div>

      {/* Main Grid: AI Yield Predictions + Interactive Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Batch Yield Predictions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <Cpu size={16} className="text-teal-600" />
              <span>Real-Time Batch Yield Predictions</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Live In-Flight Batches</span>
          </div>

          <div className="space-y-3">
            {mockPredictions.map((pred) => (
              <div
                key={pred.batchNumber}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900">{pred.product}</span>
                    <span className="block text-[10px] font-mono text-slate-400">{pred.batchNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Confidence: {pred.confidenceScore}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Predicted Yield</span>
                    <span className="text-sm font-black text-emerald-700 block">{pred.predictedYield}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Historical Baseline</span>
                    <span className="text-sm font-bold text-slate-700 block">{pred.historicalAvg}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 italic">
                  &quot;{pred.recommendation}&quot;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Conversational AI Copilot */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col h-[480px]">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot size={16} className="text-teal-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Digital Brain Interactive Reasoning
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Model Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => {
              const isUser = m.sender === "USER";
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser ? "bg-slate-900 text-white" : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}
                  >
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className={`max-w-[85%] ${isUser ? "items-end text-right" : ""}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-slate-900 text-white rounded-tr-none"
                          : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
                <Bot size={14} className="text-teal-600 animate-spin" />
                <span>Computing neural batch correlations...</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask about batch yield anomalies, Ishikawa root causes, or stability..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
