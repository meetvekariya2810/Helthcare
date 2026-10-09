import React from 'react';
import { Clock } from 'lucide-react';

export const TopHoursSpentCard = ({ employeesData }) => {
  const list = employeesData?.length ? employeesData : [
    { name: 'Priyang Vaghani', designation: 'Trainee', hours: '28 Hours 56 Minute', initials: 'PV', avatarBg: 'bg-emerald-600' },
    { name: 'Surendra Kumar', designation: 'Head', hours: '28 Hours 16 Minute', initials: 'SK', avatarBg: 'bg-purple-600' },
    { name: 'Hiteshkumar Chauhan', designation: 'Officer', hours: '28 Hours 08 Minute', initials: 'HC', avatarBg: 'bg-cyan-600' },
    { name: 'Sachinkumar Patel', designation: 'Sr. Officer', hours: '27 Hours 30 Minute', initials: 'SP', avatarBg: 'bg-teal-600' },
    { name: 'Chiragkumar Patel', designation: 'Officer', hours: '26 Hours 45 Minute', initials: 'CP', avatarBg: 'bg-indigo-600' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Clock size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Most hours are spent in October-2026
          </h3>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {list.map((emp, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl ${emp.avatarBg || 'bg-teal-600'} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-2xs`}
                >
                  {emp.initials || emp.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {emp.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {emp.designation}
                  </div>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold font-mono whitespace-nowrap flex-shrink-0">
                {emp.hours}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopHoursSpentCard;
