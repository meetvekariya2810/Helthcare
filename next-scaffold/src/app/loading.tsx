import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-[#00A896]/20 border-t-[#00A896] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#00A896] animate-ping" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
          BJK Healthcare
        </h3>
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Synchronizing workforce operations...
        </p>
      </div>
    </div>
  );
}
