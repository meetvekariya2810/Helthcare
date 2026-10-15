"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BJK Runtime Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bjk-glass-dark border border-rose-500/30 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertTriangle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            System Fault Intercepted
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Operational Service Notice
          </h1>
          <p className="text-sm text-slate-400">
            An unexpected error occurred while executing this component. The
            incident has been logged to the compliance registry.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-900/30 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Attempt Recovery</span>
          </button>
        </div>
      </div>
    </div>
  );
}
