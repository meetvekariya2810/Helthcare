import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Users,
  Building2,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  UserX,
  History,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const DailyAttendanceManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [employeeCategory, setEmployeeCategory] = useState('TECHNICAL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    actionType: '',
    targetStatus: '',
    targetIds: [],
    message: ''
  });

  const fetchData = async (dateParam, catParam) => {
    try {
      setRefreshing(true);
      const targetCat = catParam || employeeCategory;
      const res = await hrmsAPI.getDailyAttendance({
        date: dateParam || selectedDate,
        employeeCategory: targetCat
      });
      if (res.data?.success && res.data?.data) {
        setEmployees(res.data.data.todayAttendance || []);
        setSelectedEmpIds([]);
      }
    } catch (err) {
      console.error('Failed to load daily attendance records:', err);
      showToast('error', 'Failed to load attendance list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate, employeeCategory);
  }, [selectedDate, employeeCategory]);

  // Handle single employee status mark
  const handleMarkIndividual = async (employeeId, status) => {
    try {
      setSubmitting(true);
      const res = await hrmsAPI.markAttendance({
        employeeId,
        date: selectedDate,
        status,
        remarks: `Manual attendance marked as ${status} by HR Admin`
      });
      if (res.data?.success) {
        showToast('success', res.data.message || `Marked ${status}`);
        fetchData(selectedDate);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Open confirmation for bulk actions
  const triggerBulkConfirm = (targetStatus, customIds) => {
    const ids = customIds || selectedEmpIds;
    if (!ids || ids.length === 0) {
      showToast('warning', 'Please select at least one employee from the list.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      actionType: 'BULK_MARK',
      targetStatus,
      targetIds: ids,
      message: `You are about to mark ${ids.length} employee${ids.length > 1 ? 's' : ''} as ${targetStatus} for ${selectedDate}. Continue?`
    });
  };

  // Execute bulk save
  const executeBulkAction = async () => {
    try {
      setSubmitting(true);
      const res = await hrmsAPI.bulkMarkAttendance({
        employeeIds: confirmModal.targetIds,
        date: selectedDate,
        status: confirmModal.targetStatus,
        remarks: `Bulk marked ${confirmModal.targetStatus} by HR Admin`
      });

      if (res.data?.success) {
        showToast('success', res.data.message || 'Bulk attendance updated successfully');
        setConfirmModal({ isOpen: false, actionType: '', targetStatus: '', targetIds: [], message: '' });
        setSelectedEmpIds([]);
        fetchData(selectedDate);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Bulk operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Selection helpers
  const handleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map(e => e.employeeId));
    }
  };

  const handleToggleSelect = (empId) => {
    setSelectedEmpIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  // Filtered employees
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const presentCount = employees.filter(e => ['PRESENT', 'P', 'LATE'].includes(e.status)).length;
  const absentCount = employees.filter(e => ['ABSENT', 'A'].includes(e.status)).length;
  const leaveCount = employees.filter(e => ['LEAVE', 'ON_LEAVE'].includes(e.status)).length;
  const unmarkedCount = employees.filter(e => e.status === 'UNMARKED').length;

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
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">UNMARKED</span>;
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen space-y-5">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A896] border border-teal-200/60 flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">HR Daily Attendance Management</h1>
              <p className="text-xs text-slate-500 font-medium">Mark & manage staff daily attendance (Manual Entry, No Punch In/Out)</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Workforce Category Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setEmployeeCategory('TECHNICAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                employeeCategory === 'TECHNICAL'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Technical Workforce
            </button>
            <button
              onClick={() => setEmployeeCategory('NON_TECHNICAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                employeeCategory === 'NON_TECHNICAL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non-Technical Staff
            </button>
          </div>

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
            onClick={() => fetchData(selectedDate, employeeCategory)}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <Link
            to="/hrms/attendance/history"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <History size={14} />
            <span>Attendance History</span>
          </Link>

          <Link
            to="/hrms/dashboard"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#00A896] text-white hover:bg-[#009383] text-xs font-bold shadow-xs transition-colors"
          >
            <span>HRMS Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Category Indicator Badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
            employeeCategory === 'TECHNICAL'
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {employeeCategory === 'TECHNICAL' ? '⚡ TECHNICAL WORKFORCE ATTENDANCE (91 Personnel)' : '🏢 NON-TECHNICAL STAFF ATTENDANCE (11 Staff)'}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Scope: {employeeCategory === 'TECHNICAL' ? 'Technical Directory' : 'Core HRMS Non-Technical'}</span>
      </div>

      {/* 2. Today's Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Staff</div>
            <div className="text-lg font-extrabold text-slate-800">{employees.length}</div>
          </div>
          <Users size={18} className="text-slate-400" />
        </div>

        <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-700">Present Today</div>
            <div className="text-lg font-extrabold text-emerald-700">{presentCount}</div>
          </div>
          <UserCheck size={18} className="text-emerald-600" />
        </div>

        <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-700">Absent Today</div>
            <div className="text-lg font-extrabold text-rose-700">{absentCount}</div>
          </div>
          <UserX size={18} className="text-rose-600" />
        </div>

        <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-700">On Leave / Unmarked</div>
            <div className="text-lg font-extrabold text-amber-700">{leaveCount + unmarkedCount}</div>
          </div>
          <Clock size={18} className="text-amber-600" />
        </div>
      </div>

      {/* 3. Bulk Action Floating / Sticky Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
          >
            {selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0 ? (
              <CheckSquare size={14} className="text-teal-600" />
            ) : (
              <Square size={14} className="text-slate-400" />
            )}
            <span>Select All ({selectedEmpIds.length} chosen)</span>
          </button>

          {selectedEmpIds.length > 0 && (
            <button
              onClick={() => setSelectedEmpIds([])}
              className="text-slate-400 hover:text-slate-600 text-xs underline font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => triggerBulkConfirm('PRESENT')}
            disabled={selectedEmpIds.length === 0 || submitting}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
          >
            Mark Selected Present
          </button>
          <button
            onClick={() => triggerBulkConfirm('ABSENT')}
            disabled={selectedEmpIds.length === 0 || submitting}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
          >
            Mark Selected Absent
          </button>
          <button
            onClick={() => triggerBulkConfirm('LEAVE')}
            disabled={selectedEmpIds.length === 0 || submitting}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
          >
            Mark Selected Leave
          </button>
          <button
            onClick={() => triggerBulkConfirm('WEEKLY_OFF')}
            disabled={selectedEmpIds.length === 0 || submitting}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
          >
            Mark Selected Off
          </button>
          <button
            onClick={() => triggerBulkConfirm('PRESENT', filteredEmployees.map(e => e.employeeId))}
            disabled={filteredEmployees.length === 0 || submitting}
            className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 font-bold shadow-2xs transition-colors"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Department Filter */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LEAVE">Leave</option>
            <option value="WEEKLY_OFF">Weekly Off</option>
            <option value="UNMARKED">Unmarked</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-800 font-bold">{filteredEmployees.length}</span> of {employees.length} employees
        </div>
      </div>

      {/* 5. Main Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-teal-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Employee Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Direct Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Loading attendance roster...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    No active staff records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isSelected = selectedEmpIds.includes(emp.employeeId);
                  return (
                    <tr
                      key={emp.employeeId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(emp.employeeId)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800 font-mono">{emp.employeeId}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{emp.fullName}</td>
                      <td className="py-2 px-3 text-slate-600">{emp.department}</td>
                      <td className="py-2 px-3 text-slate-500">{emp.designation}</td>
                      <td className="py-2 px-3">{getStatusBadge(emp.status)}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleMarkIndividual(emp.employeeId, 'PRESENT')}
                            disabled={submitting}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              emp.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkIndividual(emp.employeeId, 'ABSENT')}
                            disabled={submitting}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              emp.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleMarkIndividual(emp.employeeId, 'LEAVE')}
                            disabled={submitting}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              emp.status === 'LEAVE'
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            Leave
                          </button>
                          <button
                            onClick={() => handleMarkIndividual(emp.employeeId, 'WEEKLY_OFF')}
                            disabled={submitting}
                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                              emp.status === 'WEEKLY_OFF'
                                ? 'bg-slate-700 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            Off
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold mb-4">
              <ShieldCheck size={24} />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mb-2">Confirm Bulk Attendance Action</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end space-x-2.5">
              <button
                onClick={() => setConfirmModal({ isOpen: false, actionType: '', targetStatus: '', targetIds: [], message: '' })}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkAction}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009383] text-white text-xs font-bold shadow-xs transition-colors"
              >
                {submitting ? 'Saving...' : 'Yes, Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendanceManagement;
