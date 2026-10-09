import React from 'react';
import { ChevronRight, Palmtree, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExecutiveWarningsRow = ({ warningsData }) => {
  const navigate = useNavigate();

  const submitted = warningsData?.submitted ?? 0;
  const submittedPercentage = warningsData?.submittedPercentage ?? '0.0% of total';
  const pending = warningsData?.pending ?? 0;
  const pendingPercentage = warningsData?.pendingPercentage ?? '0.0% of total';
  const banner = warningsData?.banner || {
    title: 'Employees without Leave Assigned',
    count: 2,
    subtitle: 'No leave policy assigned',
    link: '/hr/leave'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* 1. Submitted card */}
      <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div>
            <div className="text-xs font-bold text-slate-800">Submitted</div>
            <div className="text-[11px] text-slate-400">{submittedPercentage}</div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold text-sm flex items-center justify-center">
          {submitted}
        </div>
      </div>

      {/* 2. Pending card */}
      <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div>
            <div className="text-xs font-bold text-slate-800">Pending</div>
            <div className="text-[11px] text-slate-400">{pendingPercentage}</div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold text-sm flex items-center justify-center">
          {pending}
        </div>
      </div>

      {/* 3. Warning Banner (Employees without Leave Assigned) */}
      <div
        onClick={() => banner.link && navigate(banner.link)}
        className="md:col-span-6 bg-white hover:bg-rose-50/40 rounded-2xl border border-rose-200/80 p-4 shadow-2xs flex items-center justify-between cursor-pointer transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Palmtree size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              {banner.title}
            </div>
            <div className="text-[11px] text-slate-400">
              {banner.subtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center">
            {banner.count}
          </span>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveWarningsRow;
