import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  ArrowLeft,
  Edit2
} from 'lucide-react';

export const AttendanceHistory = () => {
  const { showToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState(firstDayStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await hrmsAPI.getAttendanceHistory({
        dateFrom,
        dateTo,
        department,
        status,
        employeeSearch: search,
        page,
        limit: 50
      });
      if (res.data?.success) {
        setRecords(res.data.data || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
      showToast('error', 'Failed to load attendance history records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo, department, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const getStatusBadge = (st) => {
    switch (st) {
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
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">{st || 'PRESENT'}</span>;
    }
  };

  const exportCSV = () => {
    if (records.length === 0) {
      showToast('warning', 'No records to export');
      return;
    }
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Working Hours', 'Marked By', 'Remarks'];
    const rows = records.map(r => [
      r.dateString || r.attendanceDate,
      r.employeeId,
      `"${r.employeeName || ''}"`,
      `"${r.departmentName || r.department || ''}"`,
      r.status,
      r.workingHours || 0,
      `"${r.source || 'HR Admin'}"`,
      `"${r.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BJK_Attendance_History_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-3">
            <Link to="/hrms/dashboard" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A896] border border-teal-200/60 flex items-center justify-center font-bold">
              <History size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Staff Attendance History</h1>
              <p className="text-xs text-slate-500 font-medium">Historical audit and attendance ledger records</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#00A896] text-white hover:bg-[#009383] text-xs font-bold shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
              <option value="WEEKLY_OFF">Weekly Off</option>
              <option value="HOLIDAY">Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Search Staff</label>
            <div className="relative">
              <input
                type="text"
                placeholder="ID, Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Search size={14} />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Employee ID</th>
                <th className="py-2.5 px-4">Employee Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Hours</th>
                <th className="py-2.5 px-4">Marked By / Source</th>
                <th className="py-2.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    Loading attendance history...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    No attendance records found for the selected timeframe.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={r._id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-700 font-mono">{r.dateString || r.attendanceDate || '--'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 font-mono">{r.employeeId}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{r.employeeName || '--'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{r.departmentName || r.department || '--'}</td>
                    <td className="py-2.5 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-mono font-semibold">{r.workingHours || 0} hrs</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">{r.source || 'HR Admin'}</td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-xs">{r.remarks || '--'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Total <span className="font-bold">{pagination.total}</span> records (Page {page} of {pagination.pages})
            </div>
            <div className="flex items-center space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
