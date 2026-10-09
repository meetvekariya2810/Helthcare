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

export const MonthlyLeaveStatusCard = ({ data }) => {
  const chartData = data?.history || [
    { month: 'Jul-26', count: 0 },
    { month: 'Aug-26', count: 42 },
    { month: 'Sep-26', count: 43 },
    { month: 'Oct-26', count: 2 }
  ];

  const trendChange = data?.trendChange || '-95% vs Sep';
  const subtitle = data?.subtitle || 'Historical leave frequency normalized across departments';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Monthly Leave Status
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 font-mono">
            {trendChange}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {subtitle}
        </p>

        {/* Bar Chart matching Screenshot 5 */}
        <div className="h-44 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#64748B' }}
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
                      <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg font-mono">
                        <div>{d.month}</div>
                        <div className="font-bold text-emerald-400">{d.count} Leaves</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count === 0 ? '#E2E8F0' : '#2DD4BF'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Department-wide leaves log</span>
        <span className="font-semibold text-slate-700">Normalized View</span>
      </div>
    </div>
  );
};

export default MonthlyLeaveStatusCard;
