import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const EmployeeStatusPenetrationCard = ({ data }) => {
  const totalRegistered = data?.totalRegistered ?? 48;
  const totalSeats = data?.totalSeats ?? 48;
  const android = data?.androidClients || { count: 45, percentage: 93.8 };
  const apple = data?.appleIOS || { count: 3, percentage: 6.3 };
  const notLoggedIn = data?.notLoggedIn || { count: 0, percentage: 0.0 };

  const gaugeData = [
    { name: 'Android Clients', value: android.count, color: '#00A896' },
    { name: 'Apple iOS', value: apple.count, color: '#00B4D8' },
    { name: 'Not Logged In', value: notLoggedIn.count, color: '#F1F5F9' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Employee Status
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
            {totalRegistered} Registered
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Mobile attendance app penetration
        </p>

        {/* Half Donut / Gauge matching Screenshot 4 */}
        <div className="relative h-36 w-full mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside gauge */}
          <div className="absolute bottom-2 text-center pointer-events-none">
            <span className="text-2xl font-black text-rose-500 font-mono tracking-tight block">
              {totalSeats}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block -mt-0.5">
              TOTAL SEATS
            </span>
          </div>
        </div>
      </div>

      {/* Legend matching Screenshot 4 */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00A896]" />
            <span className="text-slate-600 font-medium">Android Clients</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">
            {android.count} ({android.percentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
            <span className="text-slate-600 font-medium">Apple iOS</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">
            {apple.count} ({apple.percentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">Not Logged In</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-[11px]">
            {notLoggedIn.count} ({notLoggedIn.percentage}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatusPenetrationCard;
