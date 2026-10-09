import React from 'react';
import { Gift, Briefcase, Smile } from 'lucide-react';

export const CelebrationsCard = ({ celebrationsData }) => {
  const birthdays = celebrationsData?.birthdays || [];
  const anniversaries = celebrationsData?.anniversaries || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Birthday Card matching Screenshot 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-[200px] overflow-hidden">
        <div className="flex items-center space-x-2 mb-2">
          <Gift size={16} className="text-pink-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Birthday</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 overflow-y-auto">
          {birthdays.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2">
                <Smile size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-600">
                No birthdays celebrated today
              </span>
            </div>
          ) : (
            <div className="space-y-1.5 w-full px-1">
              {birthdays.map((b, i) => (
                <div key={i} className="text-xs font-medium text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                  {b.fullName} &bull; <span className="text-slate-500 text-[11px]">{b.departmentName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Work & Wedding Anniversaries Card matching Screenshot 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-[200px] overflow-hidden">
        <div className="flex items-center space-x-2 mb-2">
          <Briefcase size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Work and Wedding Anniversaries
          </h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 overflow-y-auto">
          {anniversaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2">
                <Smile size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-600">
                No anniversaries celebrated today
              </span>
            </div>
          ) : (
            <div className="space-y-1.5 w-full px-1">
              {anniversaries.map((a, i) => (
                <div key={i} className="text-xs font-medium text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                  {a.fullName} &bull; <span className="text-slate-500 text-[11px]">{a.departmentName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelebrationsCard;
