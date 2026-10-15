"use client";

import React, { useState } from "react";
import { Camera, CheckCircle2, ShieldCheck, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function EmployeeFaceAttendancePage() {
  const [capturing, setCapturing] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleCapture = () => {
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      setVerified(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          AI Facial Biometric Punch Terminal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Optical face match verification for pharmaceutical cleanroom access
        </p>
      </div>

      <div className="max-w-md mx-auto p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-6 text-center">
        {/* Camera Viewfinder Mock */}
        <div className="relative aspect-square rounded-3xl bg-slate-950 border-2 border-dashed border-teal-500/50 flex flex-col items-center justify-center p-6 overflow-hidden">
          <div className="w-48 h-48 rounded-full border-2 border-[#00A896] flex items-center justify-center relative">
            <div className="w-full h-1 bg-[#00A896] absolute animate-pulse shadow-lg shadow-teal-500" />
            <Camera className="w-12 h-12 text-teal-400 opacity-60" />
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Align your face within the frame. Ensure adequate plant lighting.
          </p>

          {capturing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#00A896] animate-spin" />
              <span className="text-xs font-bold text-teal-300">Matching biometric vector...</span>
            </div>
          )}

          {verified && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="text-sm font-bold text-white">Face Biometric Verified</span>
              <span className="text-xs text-emerald-300 font-mono">Confidence: 99.4%</span>
            </div>
          )}
        </div>

        <button
          onClick={handleCapture}
          disabled={capturing}
          className="w-full py-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>{verified ? "Retake Biometric Verification" : "Scan Face Biometric"}</span>
        </button>
      </div>
    </div>
  );
}
