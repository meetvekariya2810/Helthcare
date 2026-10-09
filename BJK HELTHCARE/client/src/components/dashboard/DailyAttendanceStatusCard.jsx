import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const DailyAttendanceStatusCard = ({ data }) => {
  const monthLabel = data?.monthLabel || 'October-2026';
  const subtitle = data?.subtitle || 'Daily presence, punch discrepancies, and pending status records';
  const records = data?.records || [
    { day: '01', label: '1', present: 47, missingPunch: 0, pending: 0 },
    { day: '02', label: '2', present: 45, missingPunch: 0, pending: 0 },
    { day: '03', label: '3', present: 42, missingPunch: 0, pending: 0 },
    { day: '04', label: 'Today', present: 42, missingPunch: 0, pending: 0, isToday: true }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Employee Attendance Status &bull; {monthLabel}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Legend matching Screenshot 5 */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 text-[11px] font-medium">Present</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 text-[11px] font-medium">Missing Punch Out</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-600 text-[11px] font-medium">Pending</span>
          </div>
        </div>
      </div>

      {/* Bar Chart matching Screenshot 5 */}
      <div className="h-56 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={({ x, y, payload }) => {
                const isToday = payload.value === 'Today';
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={14}
                      textAnchor="middle"
                      fill={isToday ? '#10B981' : '#64748B'}
                      fontSize={11}
                      fontWeight={isToday ? 'bold' : 'normal'}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 50]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl font-mono space-y-1">
                      <div className="font-bold text-slate-200">October {d.day} ({d.label})</div>
                      <div className="text-emerald-400">Present: {d.present}</div>
                      <div className="text-rose-400">Missing Punch Out: {d.missingPunch}</div>
                      <div className="text-amber-400">Pending: {d.pending}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="present" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {records.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="#22C55E"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyAttendanceStatusCard;
