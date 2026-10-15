import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00A896]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#8338EC]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00A896] to-[#02C39A] p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#00A896]" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              BJK HEALTHCARE
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-[#00A896] border border-teal-500/20">
                PROD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Enterprise Digital Brain & Operations
            </p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Relational Persistence Online</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Center Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Bottom Compliance Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          <span>21 CFR Part 11 Electronic Records Compliant</span>
        </div>
        <div>
          © 2026 BJK Healthcare Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
