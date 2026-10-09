import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { leaveAPI } from '../../services/api';

export const LeaveCalendarView = ({ userRole, department }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Oct 2026
  const [calendarData, setCalendarData] = useState({ leaves: [], dateMap: {}, capacityAlerts: [] });
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayLeaves, setSelectedDayLeaves] = useState(null);

  const fetchCalendar = async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [calRes, holRes] = await Promise.all([
        leaveAPI.getCalendar({ year, month, department }),
        leaveAPI.getHolidays({ year })
      ]);

      if (calRes.data.success) {
        setCalendarData(calRes.data);
      }
      if (holRes.data.success) {
        setHolidays(holRes.data.holidays || []);
      }
    } catch (err) {
      console.warn('Calendar fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentDate, department]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysArray.push(d);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-4">
      {/* Capacity Alert Banner for Managers & HR */}
      {calendarData.capacityAlerts && calendarData.capacityAlerts.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs shadow-xs">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-900 block">Team Capacity Operational Warning</span>
            <div className="space-y-1 mt-1">
              {calendarData.capacityAlerts.map((a, idx) => (
                <p key={idx} className="text-amber-800 text-[11px]">
                  &bull; <strong>{a.date}:</strong> {a.absentCount} team members scheduled on leave ({a.employees.map(e => e.employeeName).join(', ')})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-bjk-teal/10 text-bjk-teal rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-[11px] text-slate-500">
              Absence roster & gazetted holiday schedule
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2 font-mono">
            {monthNames[month].slice(0, 3)} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-2.5">
          <span className="text-rose-600">Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-rose-600">Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[480px]">
          {daysArray.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="bg-slate-50/50 p-2 min-h-[90px]" />;
            }

            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isWeekend = idx % 7 === 0 || idx % 7 === 6;
            const dayLeaves = calendarData.dateMap[dayStr] || [];
            const dayHoliday = holidays.find(h => h.dateString === dayStr);

            return (
              <div
                key={idx}
                onClick={() => dayLeaves.length > 0 && setSelectedDayLeaves({ date: dayStr, leaves: dayLeaves })}
                className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors relative ${
                  isWeekend ? 'bg-slate-50/60' : 'bg-white'
                } ${dayLeaves.length > 0 ? 'cursor-pointer hover:bg-teal-50/40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isWeekend ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {day}
                  </span>

                  {dayHoliday && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold truncate max-w-[70px]">
                      {dayHoliday.name}
                    </span>
                  )}
                </div>

                {/* Day Leaves Badges */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayLeaves.slice(0, 2).map((l, lIdx) => (
                    <div
                      key={lIdx}
                      className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title={`${l.employeeName} (${l.leaveType})`}
                    >
                      {l.employeeName.split(' ')[0]} &bull; {l.leaveType.split('_')[0]}
                    </div>
                  ))}

                  {dayLeaves.length > 2 && (
                    <span className="text-[9px] text-slate-500 font-mono font-bold block">
                      +{dayLeaves.length - 2} more on leave
                    </span>
                  )}
                </div>

                <div className="text-right">
                  {dayLeaves.length >= 3 && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="High absence day" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayLeaves && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Scheduled Leaves on {selectedDayLeaves.date}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedDayLeaves.leaves.length} employee(s) absent / on leave
                </p>
              </div>
              <button
                onClick={() => setSelectedDayLeaves(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedDayLeaves.leaves.map((l, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{l.employeeName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{l.employeeId} &bull; {l.department}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bjk-teal/10 text-bjk-teal block">
                      {l.leaveType}
                    </span>
                    <span className="text-[9px] text-slate-400">{l.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendarView;
