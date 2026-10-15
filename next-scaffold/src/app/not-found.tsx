import Link from "next/link";
import { AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bjk-glass-dark border border-slate-700/60 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00A896]">
          <ShieldCheck className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            Error 404 • Resource Not Found
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Page Not Located
          </h1>
          <p className="text-sm text-slate-400">
            The requested operations dashboard or HRMS record could not be found
            in the BJK Healthcare repository.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-lg shadow-teal-900/30 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portal Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
