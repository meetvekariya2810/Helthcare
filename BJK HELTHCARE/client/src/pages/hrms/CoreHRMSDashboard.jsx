import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Percent,
  Building2,
  UserPlus,
  UserMinus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Download,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const CoreHRMSDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState({
    kpis: {
      totalEmployees: 0,
      activeEmployees: 0,
      inactiveEmployees: 0,
      newJoinersThisMonth: 0,
      totalDepartments: 0,
      presentToday: 0,
      absentToday: 0,
      leaveToday: 0,
      weeklyOffToday: 0,
      holidayToday: 0,
      attendancePercentage: 0
    },
    todayAttendance: [],
    analytics: {
      departmentPerformance: [],
      workforceByDept: {},
      employmentTypeDistribution: [],
      employeeStatusDistribution: []
    }
  });

  const fetchData = async (dateParam) => {
    try {
      setRefreshing(true);
      const res = await hrmsAPI.getCoreDashboard({ date: dateParam || selectedDate });
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load Core HRMS dashboard data:', err);
      showToast('error', 'Failed to refresh HRMS telemetry data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleQuickMark = async (employeeId, status) => {
    try {
      const res = await hrmsAPI.markAttendance({
        employeeId,
        date: selectedDate,
        status,
        remarks: `Direct quick-mark from Core HRMS dashboard by ${user?.name || 'HR'}`
      });
      if (res.data?.success) {
        showToast('success', res.data.message || 'Attendance status updated');
        fetchData(selectedDate);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update attendance');
    }
  };

  const filteredAttendance = (data.todayAttendance || []).filter(item => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const kpis = data.kpis || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
      case 'P':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">PRESENT</span>;
      case 'ABSENT':
      case 'A':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">ABSENT</span>;
      case 'LEAVE':
      case 'ON_LEAVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">LEAVE</span>;
      case 'WEEKLY_OFF':
      case 'WO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">WEEKLY OFF</span>;
      case 'HOLIDAY':
      case 'H':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">HOLIDAY</span>;
      case 'HALF_DAY':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">HALF DAY</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">UNMARKED</span>;
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A896] border border-teal-200/60 flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Core HRMS Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">BJK Healthcare — Human Resources & Non-Technical Staff Management</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar size={14} className="text-slate-500 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => fetchData(selectedDate)}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <Link
            to="/hrms/attendance"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#00A896] text-white hover:bg-[#009383] text-xs font-bold shadow-xs transition-colors"
          >
            <CheckCircle2 size={14} />
            <span>Mark Daily Attendance</span>
          </Link>
        </div>
      </div>

      {/* 2. 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {/* Total Non-Technical Staff */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Non-Technical Staff</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{kpis.totalEmployees || 0}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Non-Technical workers</p>
        </div>

        {/* Present Today */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Present</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700">{kpis.presentToday || 0}</div>
          <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">Marked present</p>
        </div>

        {/* Absent Today */}
        <div className="bg-white p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-rose-700 tracking-wider">Absent</span>
            <UserX size={16} className="text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-700">{kpis.absentToday || 0}</div>
          <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">Marked absent</p>
        </div>

        {/* Leave Today */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">On Leave</span>
            <CalendarDays size={16} className="text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-700">{kpis.leaveToday || 0}</div>
          <p className="text-[10px] text-amber-600/80 font-medium mt-0.5">Approved leaves</p>
        </div>

        {/* Attendance % */}
        <div className="bg-white p-3.5 rounded-xl border border-teal-200/80 bg-teal-50/20 shadow-2xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-[#00A896] tracking-wider">Adherence</span>
            <Percent size={16} className="text-[#00A896]" />
          </div>
          <div className="text-xl font-extrabold text-[#00A896]">{kpis.attendancePercentage || 0}%</div>
          <p className="text-[10px] text-teal-600/80 font-medium mt-0.5">Present / Active total</p>
        </div>

        {/* Departments */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Departments</span>
            <Building2 size={16} className="text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{kpis.totalDepartments || 0}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active units</p>
        </div>

        {/* New Employees */}
        <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-blue-700 tracking-wider">New Joined</span>
            <UserPlus size={16} className="text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-700">{kpis.newJoinersThisMonth || 0}</div>
          <p className="text-[10px] text-blue-600/80 font-medium mt-0.5">Current month</p>
        </div>

        {/* Inactive Employees */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Inactive</span>
            <UserMinus size={16} className="text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{kpis.inactiveEmployees || 0}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Separated / Inactive</p>
        </div>
      </div>

      {/* 3. Quick Action Operations Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/hrms/attendance"
          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Daily Attendance</div>
              <div className="text-[10px] text-slate-400">Mark P / A / L</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
        </Link>

        <Link
          to="/hrms/attendance/present"
          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Present Staff</div>
              <div className="text-[10px] text-slate-400">{kpis.presentToday || 0} employees</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          to="/hrms/attendance/absent"
          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <UserX size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Absent Staff</div>
              <div className="text-[10px] text-slate-400">{kpis.absentToday || 0} employees</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
        </Link>

        <Link
          to="/hrms/employees"
          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Staff Master</div>
              <div className="text-[10px] text-slate-400">Non-Technical Staff</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link
          to="/hrms/departments"
          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Departments</div>
              <div className="text-[10px] text-slate-400">{kpis.totalDepartments || 0} units</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
        </Link>

        <Link
          to="/hrms/reports/attendance"
          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileSpreadsheet size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">HR Reports</div>
              <div className="text-[10px] text-slate-400">Excel / CSV / PDF</div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
        </Link>
      </div>

      {/* 4. Today's Attendance Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Today's Attendance Status</span>
              <span className="text-xs font-medium text-slate-500">({selectedDate})</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Daily manual attendance ledger (NO punch-in / biometric required)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 w-52 md:w-64"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PRESENT', label: 'Present' },
                { id: 'ABSENT', label: 'Absent' },
                { id: 'LEAVE', label: 'Leave' },
                { id: 'UNMARKED', label: 'Unmarked' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Employee ID</th>
                <th className="py-2.5 px-3.5">Employee Name</th>
                <th className="py-2.5 px-3.5">Department</th>
                <th className="py-2.5 px-3.5">Designation</th>
                <th className="py-2.5 px-3.5">Attendance Status</th>
                <th className="py-2.5 px-3.5">Marked By</th>
                <th className="py-2.5 px-3.5">Marked At</th>
                <th className="py-2.5 px-3.5 text-right">HR Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Loading daily attendance data...
                  </td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No employee records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((emp) => (
                  <tr key={emp._id || emp.employeeId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-3.5 font-bold text-slate-800 font-mono">{emp.employeeId}</td>
                    <td className="py-2 px-3.5 font-semibold text-slate-900">{emp.fullName}</td>
                    <td className="py-2 px-3.5 text-slate-600">{emp.department}</td>
                    <td className="py-2 px-3.5 text-slate-500">{emp.designation}</td>
                    <td className="py-2 px-3.5">{getStatusBadge(emp.status)}</td>
                    <td className="py-2 px-3.5 text-slate-500 text-[11px]">{emp.markedBy || '--'}</td>
                    <td className="py-2 px-3.5 text-slate-400 text-[11px]">{emp.markedAt || '--'}</td>
                    <td className="py-2 px-3.5 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => handleQuickMark(emp.employeeId, 'PRESENT')}
                          title="Mark Present"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleQuickMark(emp.employeeId, 'ABSENT')}
                          title="Mark Absent"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          A
                        </button>
                        <button
                          onClick={() => handleQuickMark(emp.employeeId, 'LEAVE')}
                          title="Mark Leave"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                        >
                          L
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. HR Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Department Attendance Performance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Department Attendance</h3>
            <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">Adherence</span>
          </div>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {(data.analytics?.departmentPerformance || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No department attendance records found.</p>
            ) : (
              data.analytics.departmentPerformance.map((dept) => (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.department}</span>
                    <span className="font-bold text-slate-900">{dept.present} / {dept.total} ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00A896] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, dept.percentage || 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workforce Distribution */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Workforce Distribution</h3>
            <span className="text-[10px] font-semibold text-slate-500">By Department</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {Object.keys(data.analytics?.workforceByDept || {}).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No department headcount records available.</p>
            ) : (
              Object.entries(data.analytics.workforceByDept).map(([deptName, count]) => (
                <div key={deptName} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                  <span className="font-semibold text-slate-700">{deptName}</span>
                  <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {count} staff
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employment Type & Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Staff Categories</h3>
            <span className="text-[10px] font-semibold text-slate-500">Classification</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Employment Type</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(data.analytics?.employmentTypeDistribution || []).map(item => (
                <div key={item.type} className="p-2 rounded-xl bg-slate-50 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium truncate">{item.type}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Account Status</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(data.analytics?.employeeStatusDistribution || []).map(item => (
                <div key={item.status} className="p-2 rounded-xl bg-slate-50 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium truncate">{item.status}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreHRMSDashboard;
