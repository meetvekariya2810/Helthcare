import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Moon,
  TrendingUp,
  Fingerprint,
  Calendar,
  Send,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Columns,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  Building,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Printer,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  X
} from 'lucide-react';
import { AttendanceImportManager } from './AttendanceImportManager';

const COLUMN_DEFINITIONS = [
  { key: 'siNo', label: 'SI No.' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'branch', label: 'Branch / Plant' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'date', label: 'Date' },
  { key: 'day', label: 'Day' },
  { key: 'shift', label: 'Shift' },
  { key: 'scheduledIn', label: 'Scheduled In' },
  { key: 'scheduledOut', label: 'Scheduled Out' },
  { key: 'actualIn', label: 'Actual IN' },
  { key: 'actualOut', label: 'Actual OUT' },
  { key: 'status', label: 'Status' },
  { key: 'lateBy', label: 'Late By' },
  { key: 'earlyBy', label: 'Early By' },
  { key: 'workingHours', label: 'Working Hours' },
  { key: 'overtime', label: 'Overtime' },
  { key: 'nightHours', label: 'Night Hours' },
  { key: 'halfDayType', label: 'Half Day Type' },
  { key: 'leaveType', label: 'Leave Type' },
  { key: 'workLocation', label: 'Location' },
  { key: 'punchSource', label: 'Source' },
  { key: 'punchCondition', label: 'Punch Condition' },
  { key: 'regularizationStatus', label: 'Regularization' },
  { key: 'remarks', label: 'Remarks' }
];

export const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Active dates: default to August 2026 (Imported dataset)
  const [dateMode, setDateMode] = useState('AUG_2026');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-08-31');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('Ahmedabad');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatuses, setSelectedStatuses] = useState(['ALL']);
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedPunchCondition, setSelectedPunchCondition] = useState('ALL');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  // Data & KPI state
  const [records, setRecords] = useState([]);
  const [dashboardCounts, setDashboardCounts] = useState({
    totalEmployees: 47,
    present: 0,
    absent: 0,
    lateIn: 0,
    halfDay: 0,
    onLeave: 0,
    weekOff: 0,
    holiday: 0,
    wfh: 0,
    fieldDuty: 0,
    missingPunch: 0,
    overtimeCount: 0,
    pendingRegularization: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Column Customization Drawer State
  const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    'employeeId',
    'employeeName',
    'department',
    'date',
    'shift',
    'actualIn',
    'actualOut',
    'status',
    'lateBy',
    'workingHours'
  ]);

  // Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Punch modal state
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchType, setPunchType] = useState('IN');
  const [punchRemarks, setPunchRemarks] = useState('');
  const [isPunching, setIsPunching] = useState(false);

  // Regularization Modal State
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [regularizeTab, setRegularizeTab] = useState('REQUESTS'); // 'REQUESTS' | 'SUBMIT'
  const [pendingRegularizations, setPendingRegularizations] = useState([]);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState(null);
  const [reqType, setReqType] = useState('MISSING_OUT');
  const [reqReason, setReqReason] = useState('');
  const [reqTimeIn, setReqTimeIn] = useState('09:00');
  const [reqTimeOut, setReqTimeOut] = useState('18:00');
  const [reqStatus, setReqStatus] = useState('PRESENT');
  const [isImportManagerOpen, setIsImportManagerOpen] = useState(false);

  // Apply Date Preset
  const handleDatePreset = (preset) => {
    setDateMode(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === 'YESTERDAY') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setDateFrom(yStr);
      setDateTo(yStr);
    } else if (preset === 'JAN_2026') {
      setDateFrom('2026-01-01');
      setDateTo('2026-01-31');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'FEB_2026') {
      setDateFrom('2026-02-01');
      setDateTo('2026-02-28');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'MAR_2026') {
      setDateFrom('2026-03-01');
      setDateTo('2026-03-31');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'APR_2026') {
      setDateFrom('2026-04-01');
      setDateTo('2026-04-30');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'MAY_2026') {
      setDateFrom('2026-05-01');
      setDateTo('2026-05-31');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'JUN_2026') {
      setDateFrom('2026-06-01');
      setDateTo('2026-06-30');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'JUL_2026') {
      setDateFrom('2026-07-01');
      setDateTo('2026-07-31');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'AUG_2026') {
      setDateFrom('2026-08-01');
      setDateTo('2026-08-31');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'SEP_2026') {
      setDateFrom('2026-09-01');
      setDateTo('2026-09-30');
      setSelectedDepartment('ALL');
      setSelectedStatuses(['ALL']);
    } else if (preset === 'OCT_2026') {
      setDateFrom('2026-10-01');
      setDateTo('2026-10-31');
    } else if (preset === 'THIS_MONTH') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      setDateFrom(`${year}-${month}-01`);
      setDateTo(`${year}-${month}-${lastDay}`);
    }
  };

  // Fetch Live Attendance Data & Dashboard KPIs
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const filterPayload = {
        dateFrom,
        dateTo,
        branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
        departments: selectedDepartment === 'ALL' ? [] : [selectedDepartment],
        statuses: selectedStatuses,
        shifts: selectedShift === 'ALL' ? [] : [selectedShift],
        punchConditions: selectedPunchCondition === 'ALL' ? [] : [selectedPunchCondition],
        employees: selectedEmployeeIds,
        employeeSearch,
        selectedColumns
      };

      const [previewRes, dashRes, regRes] = await Promise.all([
        hrmsAPI.previewAttendanceReport(filterPayload),
        hrmsAPI.getAttendanceDashboard({
          dateFrom,
          dateTo,
          branch: selectedBranch,
          department: selectedDepartment
        }),
        hrmsAPI.getRegularizationRequests()
      ]);

      if (previewRes.data.success) {
        setRecords(previewRes.data.previewRows || []);
      }
      if (dashRes.data.success) {
        setDashboardCounts(dashRes.data.counts || {});
      }
      if (regRes.data.success) {
        setPendingRegularizations(regRes.data.requests || []);
      }
    } catch (err) {
      console.warn('[Attendance]: Using live fallback dataset:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo, selectedBranch, selectedDepartment, selectedStatuses, selectedShift, selectedPunchCondition, employeeSearch]);

  // Clickable KPI Handler: Instantly filters the view
  const handleKpiClick = (statusKey) => {
    if (statusKey === 'ALL') {
      setSelectedStatuses(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WEEK_OFF', 'HOLIDAY', 'NIGHT_SHIFT']);
      setSelectedPunchCondition('ALL');
    } else if (statusKey === 'MISSING_PUNCH') {
      setSelectedPunchCondition('MISSING_OUT');
      setSelectedStatuses(['PRESENT']);
    } else if (statusKey === 'OVERTIME') {
      setSelectedStatuses(['PRESENT', 'NIGHT_SHIFT']);
    } else if (statusKey === 'REGULARIZATION') {
      setIsRegularizeModalOpen(true);
    } else {
      setSelectedStatuses([statusKey]);
      setSelectedPunchCondition('ALL');
    }
    showToast(`Filtering attendance table for ${statusKey}`, 'info', 'Status Filter Applied');
  };

  // Generate Excel (.xlsx) Download
  const handleGenerateExcel = async (isMultiSheet = false) => {
    if (records.length === 0) {
      showToast('No records match current filters to export.', 'warning');
      return;
    }

    try {
      setIsExporting(true);
      showToast('Preparing Excel workbook with selected columns and filters...', 'info', 'Generating Excel');

      const payload = {
        dateFrom,
        dateTo,
        branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
        departments: selectedDepartment === 'ALL' ? [] : [selectedDepartment],
        employees: selectedEmployeeIds,
        employeeSearch,
        statuses: selectedStatuses,
        shifts: selectedShift === 'ALL' ? [] : [selectedShift],
        punchConditions: selectedPunchCondition === 'ALL' ? [] : [selectedPunchCondition],
        selectedColumns,
        sheetStructure: isMultiSheet ? 'SUMMARY_DETAIL' : 'SINGLE'
      };

      const res = await hrmsAPI.generateAttendanceExcel(payload);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const deptLabel = selectedDepartment !== 'ALL' ? selectedDepartment : 'Workforce';
      a.download = `BJK_Attendance_${deptLabel}_${dateFrom}_to_${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Excel report downloaded successfully.', 'success', 'Export Complete');
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV Download
  const handleGenerateCsv = async () => {
    try {
      const payload = {
        dateFrom,
        dateTo,
        branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
        departments: selectedDepartment === 'ALL' ? [] : [selectedDepartment],
        employees: selectedEmployeeIds,
        statuses: selectedStatuses,
        selectedColumns
      };
      const res = await hrmsAPI.generateAttendanceCsv(payload);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BJK_Attendance_${dateFrom}_to_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('CSV downloaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Single Column
  const toggleColumn = (key) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length === 1) return;
      setSelectedColumns(selectedColumns.filter((c) => c !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  // Reorder Column (Move Up / Down)
  const moveColumn = (index, dir) => {
    const newCols = [...selectedColumns];
    const target = index + dir;
    if (target < 0 || target >= newCols.length) return;
    const temp = newCols[index];
    newCols[index] = newCols[target];
    newCols[target] = temp;
    setSelectedColumns(newCols);
  };

  // Clock In / Out Submit
  const handlePunch = async (e) => {
    e.preventDefault();
    try {
      setIsPunching(true);
      const res = await hrmsAPI.markPunch({
        employeeId: user?.employeeId || 'BJK-00101',
        type: punchType,
        source: 'WEB',
        remarks: punchRemarks
      });
      if (res.data.success) {
        showToast(`Clock ${punchType} recorded successfully`, 'success', 'Punch Logged');
        setIsPunchModalOpen(false);
        setPunchRemarks('');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Punch Failed');
    } finally {
      setIsPunching(false);
    }
  };

  // Approve Regularization
  const handleApproveReg = async (id) => {
    try {
      const res = await hrmsAPI.approveRegularization(id, { remarks: reviewRemarks || 'Approved by HR' });
      if (res.data.success) {
        showToast('Attendance regularization approved & updated', 'success', 'Approved');
        fetchData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reject Regularization
  const handleRejectReg = async (id) => {
    try {
      const res = await hrmsAPI.rejectRegularization(id, { remarks: reviewRemarks || 'Rejected by HR' });
      if (res.data.success) {
        showToast('Attendance regularization rejected', 'info', 'Rejected');
        fetchData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Submit new Regularization
  const handleSubmitRegularization = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId: selectedRecordForCorrection?.employeeId || user?.employeeId || 'BJK-00103',
        employeeName: selectedRecordForCorrection?.employeeName || user?.name || 'Rajesh Patel',
        departmentName: selectedRecordForCorrection?.department || 'Production',
        date: dateFrom,
        requestType: reqType,
        proposedActualIn: reqTimeIn,
        proposedActualOut: reqTimeOut,
        proposedStatus: reqStatus,
        reason: reqReason
      };

      const res = await hrmsAPI.submitRegularization(payload);
      if (res.data.success) {
        showToast('Regularization request submitted to supervisor', 'success', 'Submitted');
        setRegularizeTab('REQUESTS');
        setReqReason('');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  // Checkbox row selection
  const toggleSelectRow = (empId) => {
    if (selectedEmployeeIds.includes(empId)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter((id) => id !== empId));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, empId]);
    }
  };

  const selectAllRows = () => {
    if (selectedEmployeeIds.length === records.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(records.map((r) => r.employeeId));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-50 text-bjk-teal rounded-xl">
              <Clock size={22} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Workforce Attendance Command Center
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated biometric telemetry, shift rules, overtime, late arrival tracking, and custom Excel reporting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Web Punch Button */}
          <button
            onClick={() => setIsPunchModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Clock size={14} />
            <span>Clock In / Out</span>
          </button>

          {/* Regularization Desk */}
          <button
            onClick={() => setIsRegularizeModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all"
          >
            <ShieldCheck size={14} />
            <span>Regularization Desk ({dashboardCounts.pendingRegularization || pendingRegularizations.length})</span>
          </button>

          {/* Dedicated Custom Report Builder Link */}
          <button
            onClick={() => navigate('/hr/attendance/reports')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
          >
            <FileSpreadsheet size={14} />
            <span>Report Builder</span>
          </button>

          {/* Attendance Upload & Rollback (Aug 2026) */}
          <button
            type="button"
            onClick={() => setIsImportManagerOpen(!isImportManagerOpen)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <UploadCloud size={14} />
            <span>Upload & Rollback Center (Aug 2026)</span>
          </button>

          {/* Primary: Generate Excel Button */}
          <button
            onClick={() => handleGenerateExcel(false)}
            disabled={isExporting || records.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-bjk-teal/20 transition-all"
          >
            <Download size={15} />
            <span>{isExporting ? 'Generating...' : 'Generate Excel'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Upload & Rollback Management Center */}
      {isImportManagerOpen && (
        <AttendanceImportManager onClose={() => setIsImportManagerOpen(false)} />
      )}

      {/* 2. Top Interactive KPI Cards (Clickable) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Total Workforce */}
        <button
          type="button"
          onClick={() => handleKpiClick('ALL')}
          className="p-3.5 bg-white hover:bg-slate-50 text-left rounded-2xl border border-slate-200 transition-all hover:border-slate-400 group"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Staff</span>
          <p className="text-xl font-black text-slate-900 mt-1">{dashboardCounts.totalEmployees ?? 9}</p>
          <span className="text-[10px] text-bjk-teal font-semibold group-hover:underline">Show All Records →</span>
        </button>

        {/* Present */}
        <button
          type="button"
          onClick={() => handleKpiClick('PRESENT')}
          className="p-3.5 bg-white hover:bg-emerald-50/40 text-left rounded-2xl border border-slate-200 transition-all hover:border-emerald-300 group"
        >
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Present</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{dashboardCounts.present ?? 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold group-hover:underline">Filter Present →</span>
        </button>

        {/* Absent */}
        <button
          type="button"
          onClick={() => handleKpiClick('ABSENT')}
          className="p-3.5 bg-white hover:bg-rose-50/40 text-left rounded-2xl border border-slate-200 transition-all hover:border-rose-300 group"
        >
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Absent</span>
          <p className="text-xl font-black text-rose-500 mt-1">{dashboardCounts.absent ?? 0}</p>
          <span className="text-[10px] text-rose-500 font-semibold group-hover:underline">Filter Absent →</span>
        </button>

        {/* Late In */}
        <button
          type="button"
          onClick={() => handleKpiClick('LATE')}
          className="p-3.5 bg-white hover:bg-amber-50/40 text-left rounded-2xl border border-slate-200 transition-all hover:border-amber-300 group"
        >
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Late Arrival</span>
          <p className="text-xl font-black text-amber-600 mt-1">{dashboardCounts.lateIn ?? 0}</p>
          <span className="text-[10px] text-amber-600 font-semibold group-hover:underline">Filter Late In →</span>
        </button>

        {/* Half Day */}
        <button
          type="button"
          onClick={() => handleKpiClick('HALF_DAY')}
          className="p-3.5 bg-white hover:bg-orange-50/40 text-left rounded-2xl border border-slate-200 transition-all hover:border-orange-300 group"
        >
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Half Day</span>
          <p className="text-xl font-black text-orange-600 mt-1">{dashboardCounts.halfDay ?? 0}</p>
          <span className="text-[10px] text-orange-600 font-semibold group-hover:underline">Filter Half Day →</span>
        </button>

        {/* Missing Punch */}
        <button
          type="button"
          onClick={() => handleKpiClick('MISSING_PUNCH')}
          className="p-3.5 bg-white hover:bg-red-50/40 text-left rounded-2xl border border-slate-200 transition-all hover:border-red-300 group"
        >
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Missing Punch</span>
          <p className="text-xl font-black text-red-600 mt-1">{dashboardCounts.missingPunch ?? 0}</p>
          <span className="text-[10px] text-red-600 font-semibold group-hover:underline">Filter Missing OUT →</span>
        </button>

        {/* Overtime */}
        <button
          type="button"
          onClick={() => handleKpiClick('OVERTIME')}
          className="p-3.5 bg-white hover:bg-cyan-50/40 text-left rounded-2xl border border-slate-200 transition-all hover:border-cyan-300 group"
        >
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block">Overtime Logs</span>
          <p className="text-xl font-black text-cyan-600 mt-1">{dashboardCounts.overtimeCount ?? 0}</p>
          <span className="text-[10px] text-cyan-600 font-semibold group-hover:underline">Filter Overtime →</span>
        </button>
      </div>

      {/* 3. Date Controls & Quick Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={16} className="text-bjk-teal" />
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {[
              { id: 'JAN_2026', label: 'Jan 2026' },
              { id: 'FEB_2026', label: 'Feb 2026' },
              { id: 'MAR_2026', label: 'Mar 2026' },
              { id: 'APR_2026', label: 'Apr 2026' },
              { id: 'MAY_2026', label: 'May 2026' },
              { id: 'JUN_2026', label: 'Jun 2026' },
              { id: 'JUL_2026', label: 'Jul 2026' },
              { id: 'AUG_2026', label: 'Aug 2026' },
              { id: 'SEP_2026', label: 'Sep 2026' },
              { id: 'TODAY', label: 'Today' },
              { id: 'THIS_MONTH', label: 'Current Month' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => handleDatePreset(m.id)}
                className={`px-2.5 py-1.5 rounded-xl font-semibold border transition-all ${
                  dateMode === m.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Date Pickers */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 text-xs">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setDateMode('CUSTOM');
              }}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:border-bjk-teal"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setDateMode('CUSTOM');
              }}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:border-bjk-teal"
            />
          </div>
        </div>

        {/* Organization Quick Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-bjk-teal"
          >
            <option value="Ahmedabad">Ahmedabad Plant</option>
            <option value="Vadodara">Vadodara Plant</option>
            <option value="Mumbai">Mumbai Head Office</option>
            <option value="ALL">All Branches</option>
          </select>

          {/* Department */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-bjk-teal"
          >
            <option value="ALL">All Departments</option>
            <option value="Production">Production</option>
            <option value="QC">Quality Control (QC)</option>
            <option value="QA">Quality Assurance (QA)</option>
            <option value="QC Micro">QC Micro</option>
            <option value="Warehouse">Warehouse & Logistics</option>
            <option value="Engg.">Engineering</option>
            <option value="Accounts">Accounts</option>
            <option value="HR & Admin">HR & Admin</option>
            <option value="Purchase">Purchase</option>
            <option value="Admin">Admin</option>
            <option value="BD">Business Development (BD)</option>
          </select>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Filter Drawer (Expandable) */}
      {isFilterDrawerOpen && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Filter size={14} className="text-bjk-teal" />
              <span>Advanced Attendance & Punch Filters</span>
            </span>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Close ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Debounced Search */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Employee Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ID, Name, or Title..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-bjk-teal focus:border-bjk-teal"
                />
              </div>
            </div>

            {/* Shift Filter */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
              >
                <option value="ALL">All Shifts</option>
                <option value="General Shift (09:00 - 18:00)">General Shift</option>
                <option value="Morning Shift (06:00 - 14:30)">Morning Shift</option>
                <option value="Pharma Night Shift (22:00 - 06:30)">Pharma Night Shift</option>
              </select>
            </div>

            {/* Punch Condition */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Punch Anomaly</label>
              <select
                value={selectedPunchCondition}
                onChange={(e) => setSelectedPunchCondition(e.target.value)}
                className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
              >
                <option value="ALL">All Punches</option>
                <option value="MISSING_OUT">Missing OUT Punch</option>
                <option value="MISSING_IN">Missing IN Punch</option>
                <option value="BOTH_MISSING">Both Punches Missing</option>
                <option value="HAS_BOTH">Valid IN & OUT</option>
                <option value="LATE_IN">Late IN</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedBranch('Ahmedabad');
                  setSelectedDepartment('Production');
                  setSelectedStatuses(['PRESENT', 'LATE', 'HALF_DAY']);
                  setSelectedShift('ALL');
                  setSelectedPunchCondition('ALL');
                  setEmployeeSearch('');
                  setDateMode('OCT_2026');
                  setDateFrom('2026-10-01');
                  setDateTo('2026-10-31');
                  showToast('Filters reset to default', 'info');
                }}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Table Toolbar (Inspired by education screenshots, styled for BJK Healthcare) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Export toolbar buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleGenerateExcel(false)}
            disabled={isExporting || records.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
            title="Download formatted Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} />
            <span>Excel</span>
          </button>

          <button
            onClick={() => handleGenerateExcel(true)}
            disabled={isExporting || records.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
            title="Export Sheet 1 (Executive Summary) + Sheet 2 (Detailed)"
          >
            <FileSpreadsheet size={14} />
            <span>Summary + Detail</span>
          </button>

          <button
            onClick={handleGenerateCsv}
            disabled={isExporting || records.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            onClick={() => setIsColumnDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors ml-2"
          >
            <Columns size={14} />
            <span>Customize Columns ({selectedColumns.length})</span>
          </button>
        </div>

        {/* Right: Record count & Refresh */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{records.length}</strong> records
            {selectedEmployeeIds.length > 0 && (
              <span className="text-bjk-teal font-bold ml-1">
                ({selectedEmployeeIds.length} selected for export)
              </span>
            )}
          </span>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh Table"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 6. Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <div className="w-6 h-6 border-2 border-bjk-teal border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading enterprise attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <AlertTriangle size={32} className="mx-auto text-amber-500 opacity-80" />
            <p className="text-sm font-bold text-slate-800">No attendance records found for the selected filters.</p>
            <p className="text-xs text-slate-500">
              Try adjusting your date range or changing your status and department filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">
                    <button type="button" onClick={selectAllRows}>
                      {selectedEmployeeIds.length === records.length ? (
                        <CheckSquare size={16} className="text-bjk-teal" />
                      ) : (
                        <Square size={16} className="text-slate-400" />
                      )}
                    </button>
                  </th>
                  {selectedColumns.map((colKey) => {
                    const colDef = COLUMN_DEFINITIONS.find((c) => c.key === colKey);
                    return (
                      <th key={colKey} className="px-3.5 py-3 whitespace-nowrap text-[11px] uppercase tracking-wider">
                        {colDef?.label || colKey}
                      </th>
                    );
                  })}
                  <th className="px-3.5 py-3 text-right whitespace-nowrap text-[11px] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row, idx) => {
                  const isSelected = selectedEmployeeIds.includes(row.employeeId);
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <button type="button" onClick={() => toggleSelectRow(row.employeeId)}>
                          {isSelected ? (
                            <CheckSquare size={16} className="text-bjk-teal" />
                          ) : (
                            <Square size={16} className="text-slate-300" />
                          )}
                        </button>
                      </td>
                      {selectedColumns.map((colKey) => (
                        <td key={colKey} className="px-3.5 py-2.5 whitespace-nowrap text-slate-700 text-xs">
                          {colKey === 'status' ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                ['PRESENT', 'P', 'p', 'M'].includes(row.status)
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ['LATE'].includes(row.status)
                                  ? 'bg-amber-100 text-amber-800'
                                  : ['HALF_DAY', 'P1/2', 'CL1/2', 'SL1/2'].includes(row.status)
                                  ? 'bg-orange-100 text-orange-800'
                                  : ['WEEK_OFF', 'WEEKOFF', 'WO'].includes(row.status)
                                  ? 'bg-slate-100 text-slate-700'
                                  : ['HOLIDAY', 'PH', 'PUBLIC_HOLIDAY'].includes(row.status)
                                  ? 'bg-fuchsia-100 text-fuchsia-800'
                                  : ['CL', 'SL', 'CO', 'LWP', 'E', 'ON_LEAVE', 'LEAVE'].includes(row.status)
                                  ? 'bg-purple-100 text-purple-800'
                                  : ['NIGHT_SHIFT'].includes(row.status)
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.status === 'P' ? 'P (Present)' :
                               row.status === 'WO' ? 'WO (Week Off)' :
                               row.status === 'PH' ? 'PH (Holiday)' :
                               row.status === 'CL' ? 'CL (Casual Leave)' :
                               row.status === 'SL' ? 'SL (Sick Leave)' :
                               row.status === 'CO' ? 'CO (Comp Off)' :
                               row.status === 'LWP' ? 'LWP' :
                               row.status === 'AB' ? 'AB (Absent)' :
                               row.status === 'P1/2' ? 'P1/2 (Half Day)' :
                               row.status === 'M' ? 'M (Present)' :
                               row.status}
                            </span>
                          ) : colKey === 'employeeId' ? (
                            <span className="font-mono font-bold text-slate-900">{row.employeeId}</span>
                          ) : colKey === 'employeeName' ? (
                            <span className="font-bold text-slate-900">{row.employeeName}</span>
                          ) : colKey === 'workingHours' ? (
                            <span className="font-semibold text-slate-800">{row.workingHours || 0} hrs</span>
                          ) : (
                            row[colKey] || '-'
                          )}
                        </td>
                      ))}
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedRecordForCorrection(row);
                            setIsRegularizeModalOpen(true);
                            setRegularizeTab('SUBMIT');
                          }}
                          className="text-xs text-bjk-teal font-semibold hover:underline"
                        >
                          Regularize
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Column Customization Drawer (Slide-in Panel) */}
      {isColumnDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Columns size={18} className="text-bjk-teal" />
                  <h3 className="font-black text-slate-900 text-base">Customize Report Columns</h3>
                </div>
                <button
                  onClick={() => setIsColumnDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Choose exactly which columns to show in the table and in the generated Excel (.xlsx) file. Drag/move up or down to reorder.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedColumns(COLUMN_DEFINITIONS.map((c) => c.key))}
                  className="text-bjk-teal font-semibold hover:underline"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedColumns([
                      'employeeId',
                      'employeeName',
                      'date',
                      'shift',
                      'actualIn',
                      'actualOut',
                      'status',
                      'lateBy',
                      'workingHours'
                    ])
                  }
                  className="text-slate-500 hover:underline"
                >
                  Reset Default
                </button>
              </div>

              {/* Active Ordered Columns */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {selectedColumns.map((colKey, index) => {
                  const def = COLUMN_DEFINITIONS.find((c) => c.key === colKey);
                  return (
                    <div
                      key={colKey}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-400 w-4">{index + 1}.</span>
                        <span className="font-bold text-slate-800">{def?.label || colKey}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => moveColumn(index, -1)}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveColumn(index, 1)}
                          disabled={index === selectedColumns.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleColumn(colKey)}
                          className="p-1 text-rose-500 font-bold ml-1"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add More Columns Pills */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Unselected Columns:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COLUMN_DEFINITIONS.filter((c) => !selectedColumns.includes(c.key)).map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleColumn(c.key)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-bjk-teal rounded-lg text-xs text-slate-600 font-medium transition-colors"
                    >
                      + {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">{selectedColumns.length} columns active</span>
              <button
                type="button"
                onClick={() => setIsColumnDrawerOpen(false)}
                className="px-5 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Apply Columns
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Regularization Desk Modal */}
      {isRegularizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={20} className="text-purple-600" />
                <h3 className="font-black text-slate-900 text-base">Attendance Regularization Desk</h3>
              </div>
              <button
                onClick={() => setIsRegularizeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setRegularizeTab('REQUESTS')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                  regularizeTab === 'REQUESTS'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Pending Requests ({pendingRegularizations.length})
              </button>

              <button
                type="button"
                onClick={() => setRegularizeTab('SUBMIT')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                  regularizeTab === 'SUBMIT'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Submit Regularization Request
              </button>
            </div>

            {/* Tab 1: Pending Requests */}
            {regularizeTab === 'REQUESTS' && (
              <div className="space-y-3">
                {pendingRegularizations.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">
                    No pending regularization requests currently require review.
                  </p>
                ) : (
                  pendingRegularizations.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.employeeName}</span>
                          <span className="text-[11px] text-slate-400">
                            {item.departmentName} • {item.dateString} • Request: {item.requestType}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200/60">
                        "{item.reason}"
                      </p>

                      {item.status === 'PENDING' && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <input
                            type="text"
                            placeholder="Add approval / audit notes..."
                            value={reviewRemarks}
                            onChange={(e) => setReviewRemarks(e.target.value)}
                            className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg flex-1 mr-2"
                          />
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleRejectReg(item._id)}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveReg(item._id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Submit New Request */}
            {regularizeTab === 'SUBMIT' && (
              <form onSubmit={handleSubmitRegularization} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Request Type</label>
                    <select
                      value={reqType}
                      onChange={(e) => setReqType(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="MISSING_OUT">Missing OUT Punch</option>
                      <option value="MISSING_IN">Missing IN Punch</option>
                      <option value="WRONG_TIME">Wrong Timestamp Adjustment</option>
                      <option value="WRONG_STATUS">Wrong Status Correction</option>
                      <option value="WRONG_SHIFT">Wrong Shift Assignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Proposed Status</label>
                    <select
                      value={reqStatus}
                      onChange={(e) => setReqStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="NIGHT_SHIFT">Night Shift</option>
                      <option value="ON_DUTY">On Duty</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Proposed IN Time</label>
                    <input
                      type="time"
                      value={reqTimeIn}
                      onChange={(e) => setReqTimeIn(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Proposed OUT Time</label>
                    <input
                      type="time"
                      value={reqTimeOut}
                      onChange={(e) => setReqTimeOut(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Justification Reason *</label>
                  <textarea
                    required
                    rows={3}
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    placeholder="e.g. Exit biometric terminal was offline during shift handover..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRegularizeModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Submit Regularization
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 9. Web Punch Terminal Modal */}
      <Modal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
        title="Web Punch Terminal"
        subtitle="Log employee shift check-in / check-out with biometric fallback"
      >
        <form onSubmit={handlePunch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Punch Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPunchType('IN')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  punchType === 'IN'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock size={16} />
                <span>CHECK IN (START)</span>
              </button>

              <button
                type="button"
                onClick={() => setPunchType('OUT')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  punchType === 'OUT'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock size={16} />
                <span>CHECK OUT (END)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Shift Notes</label>
            <textarea
              rows={2}
              value={punchRemarks}
              onChange={(e) => setPunchRemarks(e.target.value)}
              placeholder="e.g. Cleanroom B morning handover completed..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPunchModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPunching}
              className="px-5 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              {isPunching ? 'Recording Punch...' : `Confirm Check ${punchType}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
