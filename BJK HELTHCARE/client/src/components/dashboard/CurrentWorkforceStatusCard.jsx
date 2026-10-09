import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const CurrentWorkforceStatusCard = ({ data }) => {
  const total = data?.totalActiveWorkforce ?? 42;
  const inOfficePercentage = data?.inOfficePercentage ?? 100;
  const breakdown = data?.breakdown || {
    inOffice: 42,
    workFromHome: 0,
    inField: 0,
    punchedOut: 0
  };

  const donutData = [
    { name: 'In-office', value: breakdown.inOffice, color: '#22C55E' },
    { name: 'Work from home', value: breakdown.workFromHome, color: '#F59E0B' },
    { name: 'In Field', value: breakdown.inField, color: '#3B82F6' },
    { name: 'Punched Out', value: breakdown.punchedOut, color: '#EF4444' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Current Status
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 font-mono">
            {inOfficePercentage}% In-office
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Total Active Workforce: <strong className="text-slate-700 font-mono">{total}</strong>
        </p>

        {/* Center Donut matching Screenshot 5 */}
        <div className="relative h-36 w-full mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={64}
                paddingAngle={2}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 font-mono">
              {total}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase -mt-0.5">
              Employees
            </span>
          </div>
        </div>
      </div>

      {/* Legend matching Screenshot 5 */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 text-[11px] font-medium">In-office</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">{breakdown.inOffice}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-600 text-[11px] font-medium">Work from home</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">{breakdown.workFromHome}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600 text-[11px] font-medium">In Field</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">{breakdown.inField}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 text-[11px] font-medium">Punched Out</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">{breakdown.punchedOut}</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWorkforceStatusCard;
