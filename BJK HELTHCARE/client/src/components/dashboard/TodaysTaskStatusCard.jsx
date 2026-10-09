import React from 'react';
import { PieChart as PieIcon, Trash2 } from 'lucide-react';

export const TodaysTaskStatusCard = ({ data }) => {
  const totalActive = data?.totalActive ?? 0;
  const pending = data?.pending ?? 0;
  const inProgress = data?.inProgress ?? 0;
  const complete = data?.complete ?? 0;
  const onHold = data?.onHold ?? 0;
  const cancel = data?.cancel ?? 0;
  const notApplicable = data?.notApplicable ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Today's Task Status
          </h3>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Total Active Tasks: <strong className="text-blue-600 font-mono">{totalActive}</strong>
        </p>

        {/* Center Donut / Empty state matching Screenshot 5 */}
        <div className="h-40 w-full flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-slate-400 flex items-center justify-center mb-2">
            <PieIcon size={20} className="text-slate-400" />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            No active breakdown records today
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            0 overall active tasks in backlog across enterprise projects
          </span>
        </div>
      </div>

      {/* Status Pills Grid matching Screenshot 5 */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50/70 border border-amber-100">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-800 text-[11px] font-semibold">Pending</span>
          </div>
          <span className="font-bold text-amber-900 font-mono text-[11px]">{pending}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50/70 border border-blue-100">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-blue-800 text-[11px] font-semibold">In Progress</span>
          </div>
          <span className="font-bold text-blue-900 font-mono text-[11px]">{inProgress}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-800 text-[11px] font-semibold">Complete</span>
          </div>
          <span className="font-bold text-emerald-900 font-mono text-[11px]">{complete}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-purple-50/70 border border-purple-100">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-purple-800 text-[11px] font-semibold">On Hold</span>
          </div>
          <span className="font-bold text-purple-900 font-mono text-[11px]">{onHold}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-rose-50/70 border border-rose-100">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-rose-800 text-[11px] font-semibold">Cancel</span>
          </div>
          <span className="font-bold text-rose-900 font-mono text-[11px]">{cancel}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100/70 border border-slate-200">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-slate-800 text-[11px] font-semibold">Not Applicable</span>
          </div>
          <span className="font-bold text-slate-900 font-mono text-[11px]">{notApplicable}</span>
        </div>
      </div>
    </div>
  );
};

export default TodaysTaskStatusCard;
