import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  CalendarDays,
  RefreshCw,
  Building2,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const MyHRMSDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyAttendance = async () => {
    try {
      setRefreshing(true);
      const res = await hrmsAPI.getMyAttendance({
        year: currentYear,
        month: currentMonth
      });
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load employee attendance calendar:', err);
      showToast('error', 'Could not load your attendance record');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-${d < 10 ? '0' + d : d}`;
    const status = data?.calendar?.[dayStr] || null;
    calendarDays.push({ dayNumber: d, dateString: dayStr, status });
  }

  const getStatusColorClass = (st) => {
    if (!st) return 'bg-slate-50 text-slate-400 border-slate-200';
    switch (st) {
      case 'PRESENT':
      case 'P':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-2xs font-bold';
      case 'ABSENT':
      case 'A':
        return 'bg-rose-500 text-white border-rose-600 shadow-2xs font-bold';
      case 'LEAVE':
      case 'ON_LEAVE':
        return 'bg-amber-500 text-white border-amber-600 shadow-2xs font-bold';
      case 'WEEKLY_OFF':
      case 'WO':
        return 'bg-slate-200 text-slate-700 border-slate-300 font-semibold';
      case 'HOLIDAY':
      case 'H':
        return 'bg-indigo-400 text-white border-indigo-500 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const emp = data?.employee || {
    fullName: user?.name || 'Staff Member',
    employeeId: user?.employeeId || '--',
    department: user?.department || 'Operations',
    designation: user?.role || 'Non-Technical Staff'
  };

  const stats = data?.monthStats || {
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    attendancePercentage: 0
  };

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen space-y-5">
      {/* 1. Welcoming Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, {emp.fullName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Non-Technical Staff Self-Service Portal — {emp.department} • {emp.designation} ({emp.employeeId})
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchMyAttendance}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Status & Month KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Today's Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500">Today's Status</span>
            <CheckCircle2 size={16} className="text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-teal-700">
            {data?.todayStatus || 'PRESENT'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Recorded for today</p>
        </div>

        {/* This Month Present */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-emerald-700">This Month Present</span>
            <CalendarDays size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700">{stats.presentDays} Days</div>
          <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">Marked present</p>
        </div>

        {/* This Month Absent */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-rose-700">Absent</span>
            <XCircle size={16} className="text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-700">{stats.absentDays} Days</div>
          <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">Absences</p>
        </div>

        {/* Attendance % */}
        <div className="bg-white p-4 rounded-2xl border border-teal-200/80 bg-teal-50/20 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-[#00A896]">Attendance %</span>
            <Percent size={16} className="text-[#00A896]" />
          </div>
          <div className="text-xl font-extrabold text-[#00A896]">{stats.attendancePercentage}%</div>
          <p className="text-[10px] text-teal-600/80 font-medium mt-0.5">Monthly Adherence</p>
        </div>
      </div>

      {/* 3. My Attendance Calendar Visualization */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">My Attendance Calendar</h2>
            <p className="text-xs text-slate-500 font-medium">Monthly view-only record of your attendance history</p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              onClick={() => {
                if (currentMonth === 1) {
                  setCurrentMonth(12);
                  setCurrentYear(y => y - 1);
                } else {
                  setCurrentMonth(m => m - 1);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              ← Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-extrabold text-slate-800">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={() => {
                if (currentMonth === 12) {
                  setCurrentMonth(1);
                  setCurrentYear(y => y + 1);
                } else {
                  setCurrentMonth(m => m + 1);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
            <span className="text-slate-600 font-medium">Present</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-500" />
            <span className="text-slate-600 font-medium">Absent</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500" />
            <span className="text-slate-600 font-medium">Leave</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200" />
            <span className="text-slate-600 font-medium">Weekly Off</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-indigo-400" />
            <span className="text-slate-600 font-medium">Holiday</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="font-bold text-slate-400 py-1 uppercase text-[10px]">
              {d}
            </div>
          ))}

          {calendarDays.map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-50/50" />;
            }

            return (
              <div
                key={item.dateString}
                className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between items-start transition-all ${getStatusColorClass(item.status)}`}
              >
                <span className="text-xs font-bold">{item.dayNumber}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-tight truncate w-full text-right">
                  {item.status || 'UNMARKED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyHRMSDashboard;
