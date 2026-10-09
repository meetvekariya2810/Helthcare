import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Coffee,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Building2,
  AlertCircle,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { employeeCalendarAPI } from '../../services/employeeApi';

export const EmployeeCalendarWidget = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [sumRes, schRes] = await Promise.all([
        employeeCalendarAPI.getMyTodaySummary().catch(() => ({ data: { success: false } })),
        employeeCalendarAPI.getMySchedule().catch(() => ({ data: { success: false } }))
      ]);

      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (schRes.data?.success) setSchedule(schRes.data.data);
    } catch (err) {
      console.warn('Calendar widget load note:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WORKING':
      case 'PRESENT':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Working Day',
          icon: Clock
        };
      case 'WEEK_OFF':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          label: 'Scheduled Week Off',
          icon: Coffee
        };
      case 'HOLIDAY':
      case 'SPECIAL_HOLIDAY':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
          label: 'Company Holiday',
          icon: Sparkles
        };
      case 'APPROVED_LEAVE':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
          label: 'Approved Leave',
          icon: CalendarCheck
        };
      case 'PENDING_LEAVE':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          dot: 'bg-orange-400',
          label: 'Pending Leave',
          icon: AlertCircle
        };
      case 'SPECIAL_WORKING_DAY':
        return {
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
          dot: 'bg-teal-400',
          label: 'Special Working Day',
          icon: ShieldCheck
        };
      default:
        return {
          bg: 'bg-slate-700/30 border-slate-600/30 text-slate-300',
          dot: 'bg-slate-400',
          label: status || 'Scheduled',
          icon: Calendar
        };
    }
  };

  const todayBadge = getStatusBadge(summary?.today?.status || 'WORKING');
  const tomorrowBadge = getStatusBadge(summary?.tomorrow?.status || 'WORKING');

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00A896]/10 border border-[#00A896]/30 flex items-center justify-center text-[#00A896]">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">My Work Calendar</h3>
            <p className="text-[11px] text-slate-400">Centrally Managed HR Workforce Policy</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/employee/calendar')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00A896] hover:text-[#00cbb4] bg-[#00A896]/10 hover:bg-[#00A896]/20 rounded-lg transition-all"
        >
          <span>Full Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Today Status Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Today Card */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Today's Schedule
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${todayBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${todayBadge.dot}`} />
              {todayBadge.label}
            </div>
            <span className="text-xs text-slate-300 font-medium">
              {summary?.today?.shiftName || '09:00 - 18:00'}
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Policy Source: <strong className="text-slate-200">{summary?.today?.ruleSource || 'Company Standard'}</strong></span>
            {summary?.today?.reason && (
              <span className="text-teal-400 truncate max-w-[130px]" title={summary.today.reason}>
                {summary.today.reason}
              </span>
            )}
          </div>
        </div>

        {/* Tomorrow Card */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Tomorrow
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${tomorrowBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${tomorrowBadge.dot}`} />
              {tomorrowBadge.label}
            </div>
            <span className="text-xs text-slate-300 font-medium">
              {summary?.tomorrow?.shiftName || '09:00 - 18:00'}
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            <span>Expected: <strong className="text-slate-200">{summary?.tomorrow?.ruleSource || 'Standard Schedule'}</strong></span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Mini Grid */}
      {schedule?.weekSchedule && schedule.weekSchedule.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This Week Pattern</span>
            <span className="text-[10px] text-slate-400">HR Shift: {schedule.shift}</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {schedule.weekSchedule.map((day, idx) => {
              const isToday = new Date(day.date).toDateString() === new Date().toDateString();
              const isOff = day.status === 'WEEK_OFF';
              const isHol = day.status === 'HOLIDAY' || day.status === 'SPECIAL_HOLIDAY';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg text-center border transition-all ${
                    isToday
                      ? 'bg-[#00A896]/15 border-[#00A896] text-white shadow-sm'
                      : isOff
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                      : isHol
                      ? 'bg-purple-500/5 border-purple-500/20 text-purple-300'
                      : 'bg-slate-800/30 border-slate-700/40 text-slate-300'
                  }`}
                >
                  <p className="text-[10px] font-semibold text-slate-400">{day.dayName.slice(0, 3)}</p>
                  <p className="text-xs font-bold my-0.5">
                    {new Date(day.date).getDate()}
                  </p>
                  <span
                    className={`inline-block text-[9px] px-1 py-0.5 rounded font-bold ${
                      isOff
                        ? 'bg-amber-500/20 text-amber-300'
                        : isHol
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {isOff ? 'OFF' : isHol ? 'HOL' : 'ON'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Holiday & Event Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
        {summary?.nextHoliday ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Next Holiday</p>
              <p className="text-xs font-bold text-white truncate">{summary.nextHoliday.name}</p>
              <p className="text-[10px] text-slate-400">{summary.nextHoliday.dateString}</p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-800/20 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span>No immediate holiday within 30 days</span>
          </div>
        )}

        {summary?.nextEvent ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#00A896]/5 border border-[#00A896]/20">
            <Building2 className="w-4 h-4 text-[#00A896] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-[#00A896] tracking-wider">Upcoming Company Event</p>
              <p className="text-xs font-bold text-white truncate">{summary.nextEvent.title}</p>
              <p className="text-[10px] text-slate-400">{summary.nextEvent.dateString} • {summary.nextEvent.startTime}</p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-800/20 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>No pending company events</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCalendarWidget;
