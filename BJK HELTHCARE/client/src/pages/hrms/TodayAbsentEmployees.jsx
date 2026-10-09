import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  UserX,
  Search,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  Phone
} from 'lucide-react';

export const TodayAbsentEmployees = () => {
  const { showToast } = useNotification();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const fetchData = async (dateParam) => {
    try {
      setRefreshing(true);
      const res = await hrmsAPI.getDailyAttendance({
        date: dateParam || selectedDate,
        employeeCategory: 'TECHNICAL'
      });
      if (res.data?.success && res.data?.data) {
        const absentList = (res.data.data.todayAttendance || []).filter(e =>
          ['ABSENT', 'A', 'AB'].includes(String(e.status || '').toUpperCase())
        );
        setEmployees(absentList);
      }
    } catch (err) {
      console.error('Failed to load absent technical employees:', err);
      showToast('error', 'Failed to load absent employees list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleMarkPresent = async (employeeId) => {
    try {
      const res = await hrmsAPI.markAttendance({
        employeeId,
        date: selectedDate,
        status: 'PRESENT',
        remarks: 'Corrected to Present from Today Absent list'
      });
      if (res.data?.success) {
        showToast('success', `Marked ${employeeId} as Present`);
        fetchData(selectedDate);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update attendance');
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesSearch = !searchQuery.trim() ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const exportCSV = () => {
    if (filteredEmployees.length === 0) {
      showToast('warning', 'No records to export');
      return;
    }
    const headers = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Status', 'Date', 'Mobile', 'Marked By'];
    const rows = filteredEmployees.map(e => [
      e.employeeId,
      `"${e.fullName}"`,
      `"${e.department}"`,
      `"${e.designation}"`,
      e.status,
      selectedDate,
      `"${e.mobile || '--'}"`,
      `"${e.markedBy || 'HR Admin'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BJK_Absent_Employees_${selectedDate}.csv`);
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
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center font-bold">
              <UserX size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Absent Employees</h1>
              <p className="text-xs text-slate-500 font-medium">Review and contact all employees marked Absent for {selectedDate}</p>
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
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-rose-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search absent staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Absent Count: <span className="text-rose-700 font-extrabold">{filteredEmployees.length}</span> staff
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Employee ID</th>
                <th className="py-2.5 px-4">Employee Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Designation</th>
                <th className="py-2.5 px-4">Contact Phone</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Quick HR Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Loading absent employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    No employees marked absent for {selectedDate}.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800 font-mono">{emp.employeeId}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{emp.fullName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{emp.department}</td>
                    <td className="py-2.5 px-4 text-slate-500">{emp.designation}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">
                      {emp.mobile ? (
                        <a href={`tel:${emp.mobile}`} className="inline-flex items-center text-teal-700 hover:underline">
                          <Phone size={12} className="mr-1" />
                          {emp.mobile}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        ABSENT
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => handleMarkPresent(emp.employeeId)}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          Mark Present
                        </button>
                        <Link
                          to={`/hr/employees/${emp.employeeId || emp._id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          <Eye size={12} />
                          <span>Profile</span>
                        </Link>
                      </div>
                    </td>
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

export default TodayAbsentEmployees;
