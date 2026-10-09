import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const MonthlyAttendanceStatusCard = ({ data }) => {
  const chartData = data?.series || [
    { month: 'August-2026', count: 1107, label: 'gust-2026' },
    { month: 'September-2026', count: 1076, label: 'September-2026' },
    { month: 'October-2026', count: 176, label: 'October-2026', isMTD: true }
  ];

  const quarter = data?.quarter || 'Q4 2026';
  const runRate = data?.runRate || '-83.6% on schedule';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Monthly Attendance Status
          </h3>
          <span className="text-[11px] font-bold text-blue-600 font-mono">
            {quarter}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Quarterly cumulative log
        </p>

        {/* Area Chart matching Screenshot 4 */}
        <div className="h-44 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.includes('October') ? 'October-2026' : val.includes('September') ? 'September-2026' : 'August-2026'}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 1300]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg font-mono">
                        <div>{d.month}</div>
                        <div className="font-bold text-blue-400">{d.count} {d.isMTD ? '(MTD)' : 'Logs'}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#attGradient)"
                dot={{ r: 4, fill: '#3B82F6', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Run Rate indicator matching Screenshot 4 */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">Current Run Rate</span>
        <span className="font-bold text-slate-800 font-mono">{runRate}</span>
      </div>
    </div>
  );
};

export default MonthlyAttendanceStatusCard;
