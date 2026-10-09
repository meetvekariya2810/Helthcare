import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  Coffee,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Filter,
  Download,
  ShieldCheck,
  UserCheck,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { employeeAttendanceAPI } from '../../services/employeeApi';
import { hrmsAPI } from '../../services/api';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { AttendanceGeofenceWidget } from '../../components/employee/AttendanceGeofenceWidget';

export const EmployeeAttendancePage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [activeTab, setActiveTab] = useState('SEP_2026'); // 'SEP_2026' | 'AUG_2026' | 'TODAY_PUNCH'
  const [attendanceDataset, setAttendanceDataset] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const empCode = employeeUser?.employeeCode || employeeUser?.employeeId;

      const requests = [
        employeeAttendanceAPI.getToday().catch(() => ({ data: { success: false } })),
        employeeAttendanceAPI.getHistory({ filter, startDate, endDate }).catch(() => ({ data: { success: false } }))
      ];

      if (empCode) {
        requests.push(hrmsAPI.getAttendanceByEmployeeCode(empCode).catch(() => ({ data: { success: false } })));
      }

      const [todayRes, histRes, attRes] = await Promise.all(requests);

      if (todayRes?.data?.success) {
        setTodayAttendance(todayRes.data.attendance);
      }
      if (histRes?.data?.success) {
        setHistory(histRes.data.records || []);
      }
      if (attRes?.data?.success) {
        setAttendanceDataset(attRes.data.data);
      }
    } catch (err) {
      console.error('[Load Attendance Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [filter, employeeUser]);

  const handleAction = async (actionFn, actionName) => {
    setMessage('');
    setErrorMessage('');
    try {
      const res = await actionFn();
      if (res.data?.success) {
        setMessage(res.data.message);
        loadAttendance();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || `${actionName} failed.`);
    }
  };

  // Month-specific calculations (Jan - Sep 2026)
  const monthTabMap = {
    'SEP_2026': { num: 9, days: 30, name: 'September 2026', prefix: '2026-09' },
    'AUG_2026': { num: 8, days: 31, name: 'August 2026', prefix: '2026-08' },
    'JUL_2026': { num: 7, days: 31, name: 'July 2026', prefix: '2026-07' },
    'JUN_2026': { num: 6, days: 30, name: 'June 2026', prefix: '2026-06' },
    'MAY_2026': { num: 5, days: 31, name: 'May 2026', prefix: '2026-05' },
    'APR_2026': { num: 4, days: 30, name: 'April 2026', prefix: '2026-04' },
    'MAR_2026': { num: 3, days: 31, name: 'March 2026', prefix: '2026-03' },
    'FEB_2026': { num: 2, days: 28, name: 'February 2026', prefix: '2026-02' },
    'JAN_2026': { num: 1, days: 31, name: 'January 2026', prefix: '2026-01' }
  };

  const currentMonthConfig = monthTabMap[activeTab] || monthTabMap['SEP_2026'];
  const selectedMonthNum = currentMonthConfig.num;
  const daysInMonth = currentMonthConfig.days;
  const monthName = currentMonthConfig.name;
  const monthPrefix = currentMonthConfig.prefix;

  const activeSummary =
    (attendanceDataset?.monthlySummaries || []).find(
      (s) => s.month === selectedMonthNum && s.year === 2026
    );

  const activeDailyRecords = (attendanceDataset?.dailyRecords || []).filter(
    (d) => d.month === selectedMonthNum || d.attendanceDate?.startsWith(monthPrefix)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance & Time Tracker</h1>
          <p className="text-xs text-slate-500">Record daily plant punches, break periods, and view verified work hours</p>
        </div>
      </div>

      {/* Action Alerts */}
      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'JAN_2026', label: 'Jan 2026' },
          { id: 'FEB_2026', label: 'Feb 2026' },
          { id: 'MAR_2026', label: 'Mar 2026' },
          { id: 'APR_2026', label: 'Apr 2026' },
          { id: 'MAY_2026', label: 'May 2026' },
          { id: 'JUN_2026', label: 'Jun 2026' },
          { id: 'JUL_2026', label: 'Jul 2026' },
          { id: 'AUG_2026', label: 'Aug 2026' },
          { id: 'SEP_2026', label: 'Sep 2026' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>{tab.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setActiveTab('TODAY_PUNCH')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TODAY_PUNCH'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Clock size={14} />
          <span>Today's Shift Console</span>
        </button>
      </div>

      {/* SECTION A: VERIFIED MONTHLY ATTENDANCE DASHBOARD */}
      {activeTab !== 'TODAY_PUNCH' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                  Verified Monthly Attendance
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {attendanceDataset?.employee?.name || employeeUser?.name || 'Authorized Employee'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                  <span>
                    Code: <strong className="text-slate-800 font-mono">{attendanceDataset?.employee?.employeeCode || employeeUser?.employeeCode || employeeUser?.employeeId}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Department: <strong className="text-slate-800">{attendanceDataset?.employee?.department || employeeUser?.department || 'General'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Month: <strong className="text-teal-700">{monthName}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>HR Verified Sheet</span>
                </span>
              </div>
            </div>

            {/* Monthly Summary Cards */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                {monthName} Monthly Summary Breakdown
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2.5 text-center text-xs">
                {/* Present */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">Present</span>
                  <span className="text-lg font-black text-emerald-800 mt-0.5 block">
                    {activeSummary?.present ?? 0}
                  </span>
                </div>

                {/* Weekly Off */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-blue-700 font-bold block uppercase">Weekly Off</span>
                  <span className="text-lg font-black text-blue-800 mt-0.5 block">
                    {activeSummary?.weeklyOff ?? 0}
                  </span>
                </div>

                {/* Public Holiday */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-[10px] text-purple-700 font-bold block uppercase">Public Hol.</span>
                  <span className="text-lg font-black text-purple-800 mt-0.5 block">
                    {activeSummary?.publicHoliday ?? 0}
                  </span>
                </div>

                {/* Casual Leave */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-bold block uppercase">Casual L.</span>
                  <span className="text-lg font-black text-amber-800 mt-0.5 block">
                    {activeSummary?.casualLeave ?? 0}
                  </span>
                </div>

                {/* Sick Leave */}
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <span className="text-[10px] text-orange-700 font-bold block uppercase">Sick Leave</span>
                  <span className="text-lg font-black text-orange-800 mt-0.5 block">
                    {activeSummary?.sickLeave ?? 0}
                  </span>
                </div>

                {/* Compensatory Off */}
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <span className="text-[10px] text-indigo-700 font-bold block uppercase">Comp. Off</span>
                  <span className="text-lg font-black text-indigo-800 mt-0.5 block">
                    {activeSummary?.compensatoryOff ?? 0}
                  </span>
                </div>

                {/* LWP */}
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-700 font-bold block uppercase">LWP</span>
                  <span className="text-lg font-black text-rose-800 mt-0.5 block">
                    {activeSummary?.leaveWithoutPay ?? 0}
                  </span>
                </div>

                {/* A.Pay Days */}
                <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl font-bold">
                  <span className="text-[10px] text-slate-800 font-black block uppercase">A.Pay Days</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    {activeSummary?.absentPayDays ?? 0}
                  </span>
                </div>

                {/* Total Days */}
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl font-bold">
                  <span className="text-[10px] text-teal-800 font-black block uppercase">Total Days</span>
                  <span className="text-lg font-black text-teal-900 mt-0.5 block">
                    {activeSummary?.totalDays ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Attendance Grid (1 to 30 for Sep, 1 to 31 for Aug) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {monthName} Daily Punch Status (1 - {daysInMonth})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Exact status values preserved from verified company attendance record
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-11 gap-2 text-center text-xs">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dayFormatted = String(day).padStart(2, '0');
                  const dateStr = `${monthPrefix}-${dayFormatted}`;
                  const dayRecord = activeDailyRecords.find(
                    (d) => d.attendanceDate === dateStr || d.dateString === dateStr
                  );

                  const status = dayRecord?.attendanceStatus || dayRecord?.status || '-';

                  return (
                    <div
                      key={day}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition-all ${
                        status === 'P'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : status === 'WO'
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : status === 'PH'
                          ? 'bg-purple-50 border-purple-200 text-purple-800'
                          : status === 'AB'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : status === '-'
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-500">{day} {monthName.split(' ')[0].substring(0, 3)}</span>
                      <span className="text-sm font-black mt-1 font-mono">{status}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 mt-3 italic">
                * Note: Blank cells from the verified source sheet are preserved as '-' and never converted
                to Absent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: TODAY'S PUNCH CONSOLE */}
      {activeTab === 'TODAY_PUNCH' && (
      <div className="space-y-6">
        <AttendanceGeofenceWidget
          attendance={todayAttendance}
          onAttendanceUpdated={loadAttendance}
          currentTime={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        />

      {/* ATTENDANCE HISTORY */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Attendance Log (My Punches)</h2>
            <p className="text-xs text-slate-500">Verified historical log for {employeeUser?.employeeId}</p>
          </div>

          {/* History Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['today', 'week', 'month'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">In Time</th>
                <th className="py-3 px-4">Out Time</th>
                <th className="py-3 px-4">Break</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((rec, idx) => (
                  <tr key={rec._id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {rec.dateString || new Date(rec.date).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rec.shiftName || 'General Shift'}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{rec.actualIn || '--:--'}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{rec.actualOut || '--:--'}</td>
                    <td className="py-3 px-4 text-slate-600">{rec.totalBreakMinutes || 0} min</td>
                    <td className="py-3 px-4 font-bold text-teal-700">{rec.totalHours || '--'} hrs</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.status === 'ON_LEAVE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                    No attendance records found for this period. Mark check-in above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
