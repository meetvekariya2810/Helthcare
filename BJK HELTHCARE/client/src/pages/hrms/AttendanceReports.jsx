import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

export const AttendanceReports = () => {
  const { showToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [activeReport, setActiveReport] = useState('DAILY');
  const [dateFrom, setDateFrom] = useState(firstDayStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [department, setDepartment] = useState('ALL');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportData = async () => {
    try {
      setRefreshing(true);
      const res = await hrmsAPI.getAttendanceHistory({
        dateFrom,
        dateTo,
        department,
        limit: 500
      });
      if (res.data?.success) {
        setRecords(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load attendance report:', err);
      showToast('error', 'Failed to generate report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateFrom, dateTo, department, activeReport]);

  const exportCSV = () => {
    if (records.length === 0) {
      showToast('warning', 'No report records to export');
      return;
    }
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Working Hours', 'Marked By'];
    const rows = records.map(r => [
      r.dateString || r.attendanceDate,
      r.employeeId,
      `"${r.employeeName || ''}"`,
      `"${r.departmentName || r.department || ''}"`,
      r.status,
      r.workingHours || 0,
      `"${r.source || 'HR Admin'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BJK_${activeReport}_Report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">HR Attendance Reports</h1>
              <p className="text-xs text-slate-500 font-medium">Generate, analyze, and export comprehensive workforce reports</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchReportData}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {[
          { id: 'DAILY', label: 'Daily Attendance Report' },
          { id: 'MONTHLY', label: 'Monthly Attendance Report' },
          { id: 'EMPLOYEE', label: 'Employee Attendance Report' },
          { id: 'DEPARTMENT', label: 'Department Attendance Report' },
          { id: 'ABSENT', label: 'Absent Employee Report' },
          { id: 'PERCENTAGE', label: 'Attendance Percentage Report' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeReport === tab.id
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-slate-700"
          >
            <option value="ALL">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Accounts">Accounts</option>
            <option value="Security">Security</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Dispatch">Dispatch</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>
      </div>

      {/* Report Output Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            {activeReport} SUMMARY PREVIEW ({records.length} Total Records)
          </span>
          <span className="text-slate-500 font-medium">BJK Healthcare Digital Brain HRMS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Employee ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Hours</th>
                <th className="py-2.5 px-4">Marked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Generating report data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    No attendance records for the selected report filters.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">{r.dateString || r.attendanceDate}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{r.employeeId}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{r.employeeName || '--'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{r.departmentName || r.department || '--'}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-slate-800">{r.status}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{r.workingHours || 0} hrs</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">{r.source || 'HR Admin'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;
