import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leaveAPI } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';

// Modular Leave Components
import { LeaveApprovalTimeline } from '../../components/leave/LeaveApprovalTimeline';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { ManagerActionModal } from '../../components/leave/ManagerActionModal';
import { HROverrideModal } from '../../components/leave/HROverrideModal';
import { AdjustBalanceModal } from '../../components/leave/AdjustBalanceModal';
import { LeaveCalendarView } from '../../components/leave/LeaveCalendarView';
import { LeaveActivityView } from '../../components/leave/LeaveActivityView';
import { LeaveReportsView } from '../../components/leave/LeaveReportsView';

// BJK-HR-POL-001 Policy Components
import { PolicyConfigView } from '../../components/leave/PolicyConfigView';
import { CompOffCommandCenter } from '../../components/leave/CompOffCommandCenter';
import { GMPPharmaControlsView } from '../../components/leave/GMPPharmaControlsView';
import { YearEndEncashmentView } from '../../components/leave/YearEndEncashmentView';
import { GrievanceRegisterView } from '../../components/leave/GrievanceRegisterView';


import {
  CalendarCheck,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  BarChart3,
  History,
  Eye,
  RotateCcw,
  Search,
  Filter,
  Users,
  Upload,
  Download,
  CalendarDays,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const LeaveManagement = () => {
  const { employeeCode: routeEmployeeCode } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const userRole = user?.role || 'EMPLOYEE';

  const isHR = ['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'SUPER_ADMIN', 'DIRECTOR'].includes(userRole);
  const isDeptManager = ['DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'WAREHOUSE_MANAGER'].includes(userRole);
  const isTeamLead = userRole === 'TEAM_LEAD';

  // Navigation Tab State
  const getDefaultTab = () => {
    if (isHR) return 'MASTER_LEDGER';
    if (isDeptManager) return 'DEPT_QUEUE';
    if (isTeamLead) return 'TEAM_QUEUE';
    return 'MY_LEAVES';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Data State
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [monthlyMatrix, setMonthlyMatrix] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('Jan-26');
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);

  // Modals State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRequestForTimeline, setSelectedRequestForTimeline] = useState(null);
  const [managerActionState, setManagerActionState] = useState({ isOpen: false, request: null, actionType: '' });
  const [overrideState, setOverrideState] = useState({ isOpen: false, request: null });
  const [adjustBalanceState, setAdjustBalanceState] = useState({ isOpen: false, employee: null });

  // Employee Detailed View Modal State (e.g. Dixita BH1022)
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState(null);
  const [isEmployeeDetailOpen, setIsEmployeeDetailOpen] = useState(false);
  const [isEmployeeDetailLoading, setIsEmployeeDetailLoading] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [typesRes, balRes] = await Promise.all([
        leaveAPI.getTypes().catch(() => ({ data: { types: [] } })),
        leaveAPI.getBalances(user?.employeeId).catch(() => ({ data: { balances: [] } }))
      ]);

      if (typesRes.data?.success) setLeaveTypes(typesRes.data.types || []);
      if (balRes.data?.success) setBalances(balRes.data.balances || []);

      // If HR/Admin, fetch 2026 Master Leave Ledger & KPIs
      if (isHR) {
        const ledgerRes = await leaveAPI.getLedger({
          search,
          department: departmentFilter,
          year: 2026
        }).catch(() => ({ data: { ledgers: [], kpis: null, departmentAnalytics: [] } }));

        if (ledgerRes.data?.success) {
          setLedgers(ledgerRes.data.ledgers || []);
          setKpis(ledgerRes.data.kpis || null);
          setDepartmentAnalytics(ledgerRes.data.departmentAnalytics || []);
        }

        // Also fetch monthly matrix if on monthly tab
        if (activeTab === 'MONTHLY_VIEW') {
          const matrixRes = await leaveAPI.getMonthlyMatrix({
            month: selectedMonth,
            department: departmentFilter,
            search,
            year: 2026
          }).catch(() => ({ data: { rows: [], totals: null } }));

          if (matrixRes.data?.success) {
            setMonthlyMatrix(matrixRes.data);
          }
        }
      }

      // Fetch requests according to active tab & role
      let reqViewMode = 'employee';
      if (activeTab === 'ALL_REQUESTS' || activeTab === 'HR_REVIEW_QUEUE') reqViewMode = 'hr';
      else if (activeTab === 'DEPT_QUEUE') reqViewMode = 'department-manager';
      else if (activeTab === 'TEAM_QUEUE') reqViewMode = 'manager';

      const reqRes = await leaveAPI.getRequests({
        viewMode: reqViewMode,
        status: statusFilter,
        leaveType: typeFilter,
        department: departmentFilter,
        search
      }).catch(() => ({ data: { requests: [] } }));

      if (reqRes.data?.success) {
        setRequests(reqRes.data.requests || []);
      }
    } catch (err) {
      console.warn('[LeaveManagement] Fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, typeFilter, departmentFilter, search, selectedMonth]);

  useEffect(() => {
    if (routeEmployeeCode) {
      handleOpenEmployeeDetail(routeEmployeeCode);
    }
  }, [routeEmployeeCode]);

  // Open Employee Detailed View
  const handleOpenEmployeeDetail = async (employeeCode) => {
    setIsEmployeeDetailLoading(true);
    setIsEmployeeDetailOpen(true);
    try {
      const res = await leaveAPI.getEmployeeDetail(employeeCode);
      if (res.data?.success) {
        setSelectedEmployeeDetail(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load employee leave details', 'error', 'Error');
    } finally {
      setIsEmployeeDetailLoading(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      const res = await leaveAPI.exportCSV({
        department: departmentFilter,
        search,
        year: 2026
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BJK_Leave_2026_${departmentFilter !== 'ALL' ? departmentFilter : 'All_Dept'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('2026 Leave Data exported successfully.', 'success', 'Export Complete');
    } catch (err) {
      showToast('Failed to export leave data', 'error', 'Export Error');
    }
  };

  // Handle CSV Import
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      showToast('Please select a CSV file to import.', 'warning', 'No File Selected');
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await leaveAPI.importCSV(formData);
      if (res.data?.success) {
        showToast(res.data.message || 'Leave CSV imported successfully.', 'success', 'Import Successful');
        setIsImportModalOpen(false);
        setImportFile(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to import CSV.', 'error', 'Import Failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleWithdraw = async (requestId) => {
    if (!window.confirm('Are you sure you want to withdraw this leave application?')) return;
    try {
      const res = await leaveAPI.withdraw(requestId, { reason: 'Withdrawn by employee' });
      if (res.data?.success) {
        showToast('Leave application withdrawn', 'success', 'Withdrawn');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Withdraw Failed');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm(`Are you sure you want to cancel / revoke leave request [${requestId}]? This will restore the employee's balance.`)) return;
    try {
      const res = await leaveAPI.cancel(requestId, { reason: 'Cancelled by HR Administrator' });
      if (res.data?.success) {
        showToast('Leave application cancelled and balance restored.', 'success', 'Cancelled');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Cancel Failed');
    }
  };

  const toggleSelectRequest = (id) => {
    setSelectedRequestIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRequests = () => {
    const pendingIds = requests
      .filter(r => !['APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(r.currentStatus || r.status))
      .map(r => r._id || r.requestId);

    if (selectedRequestIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(pendingIds);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequestIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to grant Direct HR Sanction for all ${selectedRequestIds.length} selected leave requests across departments?`)) return;

    try {
      setIsLoading(true);
      const res = await leaveAPI.bulkApprove({
        requestIds: selectedRequestIds,
        comment: 'Bulk Approved by HR Direct Executive Sanction.'
      });
      if (res.data?.success) {
        showToast(res.data.message || `Successfully approved ${selectedRequestIds.length} requests.`, 'success', 'Bulk Approval Complete');
        setSelectedRequestIds([]);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bulk approve requests.', 'error', 'Bulk Action Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Unique Department list from ledgers or default master
  const departmentsList = Array.from(new Set([
    'ALL',
    'Production',
    'Quality Control (QC)',
    'Quality Assurance (QA)',
    'Warehouse & Inventory',
    'Maintenance & Engineering',
    'HR & Admin',
    'Accounts & Finance',
    'Regulatory Affairs',
    'Sales & Marketing',
    'PRD',
    'QC',
    'QA',
    'ENGG.',
    'QC MICRO',
    'ACCOUNTS',
    'WAREHOUSE',
    'HRA',
    'PURCHASE',
    'ADMIN',
    'BD',
    ...departmentAnalytics.map(d => d.department),
    ...requests.map(r => r.department)
  ])).filter(Boolean);

  // Define Request Table Columns
  const requestColumns = [
    ...(isHR ? [{
      header: (
        <input
          type="checkbox"
          checked={
            requests.filter(r => !['APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(r.currentStatus || r.status)).length > 0 &&
            selectedRequestIds.length === requests.filter(r => !['APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(r.currentStatus || r.status)).length
          }
          onChange={toggleSelectAllRequests}
          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4"
          title="Select all pending requests"
        />
      ),
      accessor: '_id',
      render: (row) => {
        const s = row.currentStatus || row.status;
        const isPending = !['APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(s);
        if (!isPending) return null;
        return (
          <input
            type="checkbox"
            checked={selectedRequestIds.includes(row._id || row.requestId)}
            onChange={() => toggleSelectRequest(row._id || row.requestId)}
            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4"
          />
        );
      }
    }] : []),
    {
      header: 'Request ID & Applied',
      accessor: 'requestId',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">{row.requestId}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(row.submittedAt || row.createdAt).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: 'Employee & Dept',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => handleOpenEmployeeDetail(row.employeeId)}
            className="font-bold text-teal-700 hover:underline block text-xs text-left"
          >
            {row.employeeName}
          </button>
          <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
            {row.employeeId} &bull; {row.department}
          </span>
        </div>
      )
    },
    {
      header: 'Leave Category',
      accessor: 'leaveTypeName',
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">{row.leaveTypeName || row.leaveType}</span>
      )
    },
    {
      header: 'Dates & Duration',
      accessor: 'duration',
      render: (row) => (
        <div>
          <span className="font-black text-slate-900 text-xs">
            {row.duration || row.totalDays} day(s) {row.isHalfDay && <span className="text-[10px] text-teal-600 font-normal">(Half)</span>}
          </span>
          <span className="block text-[10px] text-slate-500 font-mono">
            {row.startDateString} &rarr; {row.endDateString}
          </span>
        </div>
      )
    },
    {
      header: 'Workflow Stage',
      accessor: 'currentStatus',
      render: (row) => {
        const s = row.currentStatus || row.status;
        let badgeStyle = 'bg-slate-100 text-slate-700';

        if (s === 'APPROVED') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
        else if (s.includes('REJECTED')) badgeStyle = 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
        else if (s === 'HR_REVIEW') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-300 font-bold animate-pulse';
        else if (s === 'DEPARTMENT_MANAGER_PENDING') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-300 font-semibold';
        else if (s === 'TEAM_MANAGER_PENDING' || s === 'SUBMITTED') badgeStyle = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
        else if (s === 'WITHDRAWN') badgeStyle = 'bg-slate-100 text-slate-500 border-slate-300';

        return (
          <div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeStyle} inline-block font-mono`}>
              {s.replace(/_/g, ' ')}
            </span>
            {row.isOverridden && (
              <span className="block text-[9px] text-amber-600 font-bold mt-0.5">
                HR Sanctioned
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-xs" title={row.reason}>
          {row.reason}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => {
        const s = row.currentStatus || row.status;
        const isPending = !['APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(s);

        return (
          <div className="flex items-center justify-end space-x-1.5">
            <button
              onClick={() => setSelectedRequestForTimeline(row)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              title="View Approval Timeline"
            >
              <Eye size={14} />
            </button>

            {/* HR Universal Direct Sanction / Approve across all departments */}
            {isHR && isPending && (
              <>
                <button
                  onClick={() => setManagerActionState({ isOpen: true, request: row, actionType: 'HR_APPROVE' })}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs group"
                  title="Direct HR Sanction / Department Bypass Approval"
                >
                  <CheckCircle size={13} className="text-emerald-600 group-hover:text-white" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => setManagerActionState({ isOpen: true, request: row, actionType: 'HR_REJECT' })}
                  className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs group"
                  title="Direct HR Reject"
                >
                  <XCircle size={13} className="text-rose-600 group-hover:text-white" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {/* Team Manager Actions (for non-HR team leads) */}
            {!isHR && isTeamLead && (s === 'TEAM_MANAGER_PENDING' || s === 'SUBMITTED') && (
              <>
                <button
                  onClick={() => setManagerActionState({ isOpen: true, request: row, actionType: 'TEAM_APPROVE' })}
                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                  title="Team Manager Approve"
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={() => setManagerActionState({ isOpen: true, request: row, actionType: 'TEAM_REJECT' })}
                  className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                  title="Team Manager Reject"
                >
                  <XCircle size={14} />
                </button>
              </>
            )}

            {/* Department Manager Actions (for non-HR department heads) */}
            {!isHR && isDeptManager && (s === 'DEPARTMENT_MANAGER_PENDING' || s === 'TEAM_MANAGER_APPROVED') && (
              <>
                <button
                  onClick={() => setManagerActionState({ isOpen: true, request: row, actionType: 'DEPT_APPROVE' })}
                  className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                  title="Department Head Approve"
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={() => setManagerActionState({ isOpen: true, request: row, actionType: 'DEPT_REJECT' })}
                  className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                  title="Department Head Reject"
                >
                  <XCircle size={14} />
                </button>
              </>
            )}

            {/* HR Administrative Override Action */}
            {isHR && isPending && (
              <button
                onClick={() => setOverrideState({ isOpen: true, request: row })}
                className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                title="HR Administrative Override"
              >
                <ShieldAlert size={14} />
              </button>
            )}

            {/* HR Direct Cancel / Delete Action for any active or approved leave */}
            {isHR && !['CANCELLED', 'WITHDRAWN'].includes(s) && (
              <button
                onClick={() => handleCancelRequest(row.requestId || row._id)}
                className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-bold transition-colors"
                title="Cancel & Revoke Leave (Restore Balance)"
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-mono text-[11px] font-bold tracking-wider uppercase border border-teal-200">
              {isHR ? 'HR Master Leave Management' : isDeptManager ? 'Department Governance' : isTeamLead ? 'Team Lead Queue' : 'Self Service'}
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-slate-500 text-xs font-medium">BJK Healthcare Pvt. Ltd.</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Workforce Leave & Absence Governance (Year 2026)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict single source of truth ledger preserved from Leave 2026(Sheet1).csv with employee-level isolation & audit traceability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isHR && (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <Upload size={14} />
                <span>Import Leave CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </>
          )}

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
          >
            <Plus size={16} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards for HR / Admin */}
      {isHR && kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Employees</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">{kpis.totalEmployees || 49}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-amber-200 bg-amber-50/30">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">Pending Requests</span>
            <span className="text-xl font-black text-amber-800 mt-1 block">{kpis.pendingRequests || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Approved</span>
            <span className="text-xl font-black text-emerald-800 mt-1 block">{kpis.approvedRequests || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-rose-200 bg-rose-50/30">
            <span className="text-[10px] text-rose-700 font-bold uppercase block">Rejected</span>
            <span className="text-xl font-black text-rose-800 mt-1 block">{kpis.rejectedRequests || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-teal-200 bg-teal-50/30">
            <span className="text-[10px] text-teal-700 font-bold uppercase block">CL Used</span>
            <span className="text-xl font-black text-teal-800 mt-1 block">{kpis.totalCLTaken || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-purple-200 bg-purple-50/30">
            <span className="text-[10px] text-purple-700 font-bold uppercase block">SL Used</span>
            <span className="text-xl font-black text-purple-800 mt-1 block">{kpis.totalSLTaken || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-amber-200 bg-amber-50/30">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">LWP Used</span>
            <span className="text-xl font-black text-amber-800 mt-1 block">{kpis.totalLWPTaken || 0}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-teal-300 bg-gradient-to-br from-teal-50 to-teal-100/50">
            <span className="text-[10px] text-teal-800 font-bold uppercase block">Closing Balance</span>
            <span className="text-xl font-black text-teal-900 mt-1 block">{kpis.totalClosingBalance || 0}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {isHR && (
          <>
            <button
              onClick={() => setActiveTab('MASTER_LEDGER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'MASTER_LEDGER'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2026 Master Leave Ledger (All Employees)
            </button>

            <button
              onClick={() => setActiveTab('MONTHLY_VIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'MONTHLY_VIEW'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Monthly Breakdown Table
            </button>

            <button
              onClick={() => setActiveTab('DEPARTMENT_ANALYTICS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'DEPARTMENT_ANALYTICS'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Department-wise Summary
            </button>

            <button
              onClick={() => setActiveTab('ALL_REQUESTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'ALL_REQUESTS'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Leave Requests & Approvals
            </button>
          </>
        )}

        {/* Team Manager Tab */}
        {(isTeamLead || isHR) && (
          <button
            onClick={() => setActiveTab('TEAM_QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'TEAM_QUEUE'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Team Lead Queue
          </button>
        )}

        {/* Department Manager Tab */}
        {(isDeptManager || isHR) && (
          <button
            onClick={() => setActiveTab('DEPT_QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DEPT_QUEUE'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Department Head Queue
          </button>
        )}

        {/* Calendar View Tab */}
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'CALENDAR'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leave Calendar & Holidays
        </button>

        {isHR && (
          <>
            <button
              onClick={() => setActiveTab('ACTIVITY_AUDIT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'ACTIVITY_AUDIT'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Audit Trail
            </button>

            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'REPORTS'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Reports & Analytics
            </button>

            {/* BJK-HR-POL-001 Policy-Based Tabs */}
            <button
              onClick={() => setActiveTab('POLICY_CONFIG')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'POLICY_CONFIG'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Policy BJK-HR-POL-001
            </button>

            <button
              onClick={() => setActiveTab('COMPOFF_CENTER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'COMPOFF_CENTER'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Comp-Off Center
            </button>

            <button
              onClick={() => setActiveTab('GMP_CONTROLS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'GMP_CONTROLS'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pharma & GMP Controls
            </button>

            <button
              onClick={() => setActiveTab('YEAR_END_ENCASHMENT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'YEAR_END_ENCASHMENT'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Year-End & Encashment
            </button>

            <button
              onClick={() => setActiveTab('GRIEVANCE_REGISTER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'GRIEVANCE_REGISTER'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Grievance Register
            </button>
          </>
        )}

      </div>

      {/* Global Filter Bar for HR / Admin */}
      {isHR && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Employee (e.g. Dixita, BH1022)..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 w-64"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-600"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : `Dept: ${d}`}
                </option>
              ))}
            </select>

            {activeTab === 'MONTHLY_VIEW' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="py-1.5 px-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-bold focus:outline-none focus:border-teal-600"
              >
                {['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26'].map((m) => (
                  <option key={m} value={m}>
                    Month: {m}
                  </option>
                ))}
              </select>
            )}
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Showing <strong>{ledgers.length}</strong> permitted records
          </span>
        </div>
      )}

      {/* TAB 1: 2026 MASTER LEAVE LEDGER (Prompt Sections 2, 3, 4, 13) */}
      {isHR && activeTab === 'MASTER_LEDGER' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">Sr.</th>
                  <th className="py-3 px-3">Emp. Code</th>
                  <th className="py-3 px-3">Emp. Name</th>
                  <th className="py-3 px-3">Dept</th>
                  <th className="py-3 px-3">DOJ</th>
                  <th className="py-3 px-3 text-center">Open CL</th>
                  <th className="py-3 px-3 text-center">Open SL</th>
                  <th className="py-3 px-3 text-center bg-teal-50/40">CL Taken</th>
                  <th className="py-3 px-3 text-center bg-purple-50/40">SL Taken</th>
                  <th className="py-3 px-3 text-center bg-amber-50/40">LWP Taken</th>
                  <th className="py-3 px-3 text-center bg-rose-50/40 font-black">Total Taken</th>
                  <th className="py-3 px-3 text-center bg-teal-100/50">Close CL</th>
                  <th className="py-3 px-3 text-center bg-purple-100/50">Close SL</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ledgers.length > 0 ? (
                  ledgers.map((row) => (
                    <tr key={row.employeeCode} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-sans">{row.srNo}</td>
                      <td className="py-3 px-3 font-bold text-teal-700">{row.employeeCode}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => handleOpenEmployeeDetail(row.employeeCode)}
                          className="hover:text-teal-700 hover:underline text-left"
                        >
                          {row.employeeName}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                          {row.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-sans text-[11px]">{row.doj}</td>
                      <td className="py-3 px-3 text-center text-slate-600">{row.openingBalance?.cl || 0}</td>
                      <td className="py-3 px-3 text-center text-slate-600">{row.openingBalance?.sl || 0}</td>
                      <td className="py-3 px-3 text-center font-bold text-teal-800 bg-teal-50/40">{row.totalLeaveTaken?.cl || 0}</td>
                      <td className="py-3 px-3 text-center font-bold text-purple-800 bg-purple-50/40">{row.totalLeaveTaken?.sl || 0}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-800 bg-amber-50/40">{row.totalLeaveTaken?.lwp || 0}</td>
                      <td className="py-3 px-3 text-center font-black text-rose-800 bg-rose-50/40">{row.totalLeaveTaken?.total || 0}</td>
                      <td className="py-3 px-3 text-center font-black text-teal-900 bg-teal-100/40">{row.closingBalance?.cl || 0}</td>
                      <td className="py-3 px-3 text-center font-black text-purple-900 bg-purple-100/40">{row.closingBalance?.sl || 0}</td>
                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEmployeeDetail(row.employeeCode)}
                            className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            title="View Dixita or Employee Details"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="py-12 text-center text-slate-400 font-sans">
                      No leave ledger records matched your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY BREAKDOWN TABLE VIEW (Prompt Section 15) */}
      {isHR && activeTab === 'MONTHLY_VIEW' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Monthly Breakdown View &mdash; {selectedMonth} 2026
              </h3>
              <p className="text-xs text-slate-500">
                Department and employee-wise Casual Leave (CL), Sick Leave (SL), and Leave Without Pay (LWP) for {selectedMonth}.
              </p>
            </div>
            {monthlyMatrix?.totals && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                  CL: <strong>{monthlyMatrix.totals.cl}</strong>
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg border border-purple-200">
                  SL: <strong>{monthlyMatrix.totals.sl}</strong>
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                  LWP: <strong>{monthlyMatrix.totals.lwp}</strong>
                </span>
                <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold">
                  Total: {monthlyMatrix.totals.total}
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Emp. Code</th>
                  <th className="py-3 px-3">Employee Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">CL</th>
                  <th className="py-3 px-3 text-center">SL</th>
                  <th className="py-3 px-3 text-center">LWP</th>
                  <th className="py-3 px-3 text-right">Month Total</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {monthlyMatrix?.rows?.length > 0 ? (
                  monthlyMatrix.rows.map((row) => (
                    <tr key={row.employeeCode} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-bold text-teal-700">{row.employeeCode}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-900">{row.employeeName}</td>
                      <td className="py-3 px-3 font-sans text-slate-600">{row.department}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={row.cl > 0 ? 'font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded' : 'text-slate-400'}>
                          {row.cl}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={row.sl > 0 ? 'font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded' : 'text-slate-400'}>
                          {row.sl}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={row.lwp > 0 ? 'font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded' : 'text-slate-400'}>
                          {row.lwp}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">{row.total}</td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleOpenEmployeeDetail(row.employeeCode)}
                          className="text-teal-600 hover:text-teal-800 font-bold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                      Loading monthly breakdown records...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENT-WISE SUMMARY (Prompt Section 16) */}
      {isHR && activeTab === 'DEPARTMENT_ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentAnalytics.map((dept) => (
            <div key={dept.department} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Department: {dept.department}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{dept.employeeCount} Active Employees</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-teal-50/70 border border-teal-200">
                  <span className="block text-[10px] text-teal-700 font-bold">CL TAKEN</span>
                  <span className="text-base font-black text-teal-900">{dept.takenCL}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <span className="block text-[10px] text-purple-700 font-bold">SL TAKEN</span>
                  <span className="text-base font-black text-purple-900">{dept.takenSL}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="block text-[10px] text-amber-700 font-bold">LWP TAKEN</span>
                  <span className="text-base font-black text-amber-900">{dept.takenLWP}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-mono text-slate-600">
                <span>Total Leave Taken: <strong className="text-slate-900">{dept.takenTotal}</strong></span>
                <span>Closing CL: <strong>{dept.closingCL}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: LEAVE REQUESTS & APPROVALS (Prompt Section 11, 13) */}
      {['ALL_REQUESTS', 'TEAM_QUEUE', 'DEPT_QUEUE', 'MY_LEAVES'].includes(activeTab) && (
        <div className="space-y-4">
          {/* HR Master Authority & Bypass Banner */}
          {isHR && activeTab !== 'MY_LEAVES' && (
            <div className="p-3.5 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl border border-teal-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-xs">
                  ⚡
                </div>
                <div>
                  <span className="font-black text-slate-900 block">HR Direct Sanction & All-Department Bypass Active</span>
                  <span className="text-slate-600 text-[11px]">
                    As HR / Management, you can directly approve or reject any employee leave request across any department (Production, QC, QA, Warehouse, Engineering, etc.) regardless of pending status.
                  </span>
                </div>
              </div>

              {selectedRequestIds.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <span className="font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-xl text-xs">
                    {selectedRequestIds.length} Selected
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkApprove}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Bulk Approve Selected</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRequestIds([])}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-all"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Department Quick Filter Pills for HR / Admin */}
          {isHR && activeTab !== 'MY_LEAVES' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {departmentsList.slice(0, 9).map((dept) => {
                const isSelected = departmentFilter === dept;
                const deptCount = dept === 'ALL'
                  ? requests.length
                  : requests.filter((r) => {
                      const d = r.department || r.employeeId?.department || '';
                      return d.toLowerCase().includes(dept.toLowerCase()) || dept.toLowerCase().includes(d.toLowerCase());
                    }).length;

                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{dept === 'ALL' ? 'All Depts' : dept}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {deptCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <DataTable
            columns={requestColumns}
            data={requests}
            isLoading={isLoading}
            filterComponent={
              <div className="flex flex-wrap items-center gap-2">
                {isHR && (
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-600"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d === 'ALL' ? 'All Departments' : `Dept: ${d}`}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-600"
                >
                  <option value="ALL">All Approval States</option>
                  <option value="TEAM_MANAGER_PENDING">Pending Team Manager</option>
                  <option value="DEPARTMENT_MANAGER_PENDING">Pending Department Head</option>
                  <option value="HR_REVIEW">Pending HR Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="TEAM_MANAGER_REJECTED">Team Manager Rejected</option>
                  <option value="DEPARTMENT_MANAGER_REJECTED">Dept Manager Rejected</option>
                  <option value="REJECTED">HR Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-teal-600"
                >
                  <option value="ALL">All Leave Types</option>
                  {leaveTypes.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            }
          />
        </div>
      )}

      {/* Tab: Calendar & Holidays */}
      {activeTab === 'CALENDAR' && (
        <LeaveCalendarView userRole={userRole} department={user?.department} />
      )}

      {/* Tab: Activity & Audit Trail */}
      {activeTab === 'ACTIVITY_AUDIT' && <LeaveActivityView />}

      {/* Tab: Reports & Analytics */}
      {activeTab === 'REPORTS' && <LeaveReportsView />}

      {/* BJK-HR-POL-001 Tab Views */}
      {activeTab === 'POLICY_CONFIG' && <PolicyConfigView />}
      {activeTab === 'COMPOFF_CENTER' && <CompOffCommandCenter isHR={isHR} user={user} />}
      {activeTab === 'GMP_CONTROLS' && <GMPPharmaControlsView />}
      {activeTab === 'YEAR_END_ENCASHMENT' && <YearEndEncashmentView isHR={isHR} />}
      {activeTab === 'GRIEVANCE_REGISTER' && <GrievanceRegisterView isHR={isHR} />}


      {/* ========================================================================= */}
      {/* EMPLOYEE-WISE DETAIL MODAL (Prompt Section 2, 5, 14: e.g. Dixita BH1022) */}
      {/* ========================================================================= */}
      {isEmployeeDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedEmployeeDetail?.employeeName?.charAt(0) || 'E'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      {selectedEmployeeDetail?.employeeName || 'Employee Leave Profile'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-[10px] font-bold">
                      {selectedEmployeeDetail?.employeeCode}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Department: <strong>{selectedEmployeeDetail?.department}</strong> &bull; DOJ: <strong>{selectedEmployeeDetail?.doj || 'N/A'}</strong> &bull; Year 2026 Master Leave
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmployeeDetailOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEmployeeDetailLoading ? (
              <div className="p-12 text-center text-slate-400">Loading detailed employee records...</div>
            ) : selectedEmployeeDetail?.ledger ? (
              <div className="p-6 space-y-6">
                {/* Leave Balance KPI Cards for this Employee */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
                    <span className="text-[10px] text-teal-700 font-bold uppercase block">Casual Leave (CL)</span>
                    <span className="text-xl font-black text-teal-900 mt-1 block">
                      {selectedEmployeeDetail.ledger.closingBalance?.cl ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Opening: {selectedEmployeeDetail.ledger.openingBalance?.cl || 0} &bull; Used: {selectedEmployeeDetail.ledger.totalLeaveTaken?.cl || 0}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] text-purple-700 font-bold uppercase block">Sick Leave (SL)</span>
                    <span className="text-xl font-black text-purple-900 mt-1 block">
                      {selectedEmployeeDetail.ledger.closingBalance?.sl ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Opening: {selectedEmployeeDetail.ledger.openingBalance?.sl || 0} &bull; Used: {selectedEmployeeDetail.ledger.totalLeaveTaken?.sl || 0}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Leave Without Pay (LWP)</span>
                    <span className="text-xl font-black text-amber-900 mt-1 block">
                      {selectedEmployeeDetail.ledger.totalLeaveTaken?.lwp ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500">Unpaid Absences</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] text-rose-700 font-bold uppercase block">Total Leave Taken</span>
                    <span className="text-xl font-black text-rose-900 mt-1 block">
                      {selectedEmployeeDetail.ledger.totalLeaveTaken?.total ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-500">CL + SL + LWP</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800">
                    <span className="text-[10px] text-teal-400 font-bold uppercase block">Closing Balance</span>
                    <span className="text-xl font-black text-teal-300 mt-1 block">
                      {selectedEmployeeDetail.ledger.closingBalance?.total ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-400">Total Days Remaining</span>
                  </div>
                </div>

                {/* Monthly Breakdown Matrix for this Employee */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">10-Month Leave Usage Breakdown (Jan &mdash; Oct 2026)</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Month</th>
                          <th className="py-2.5 px-3 text-center">Casual Leave (CL)</th>
                          <th className="py-2.5 px-3 text-center">Sick Leave (SL)</th>
                          <th className="py-2.5 px-3 text-center">Leave Without Pay (LWP)</th>
                          <th className="py-2.5 px-3 text-right">Total Taken</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEmployeeDetail.ledger.monthlyBreakdown?.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{m.monthName}</td>
                            <td className="py-2.5 px-3 text-center text-teal-800 font-bold">{m.cl}</td>
                            <td className="py-2.5 px-3 text-center text-purple-800 font-bold">{m.sl}</td>
                            <td className="py-2.5 px-3 text-center text-amber-800 font-bold">{m.lwp}</td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900">{m.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Applications History */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Submitted Leave Requests ({selectedEmployeeDetail.requests?.length || 0})</h4>
                  {selectedEmployeeDetail.requests?.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Dates</th>
                            <th className="py-2.5 px-3">Days</th>
                            <th className="py-2.5 px-3">Reason</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedEmployeeDetail.requests.map((req) => (
                            <tr key={req._id}>
                              <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{req.requestId}</td>
                              <td className="py-2.5 px-3">{req.leaveTypeName || req.leaveType}</td>
                              <td className="py-2.5 px-3 font-mono">{req.startDateString} &rarr; {req.endDateString}</td>
                              <td className="py-2.5 px-3 font-bold">{req.duration}</td>
                              <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{req.reason}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {req.currentStatus || req.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">No leave application requests recorded.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">Employee leave data not found.</div>
            )}

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsEmployeeDetailOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT LEAVE DATA MODAL (Prompt Section 22, 23) */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Import Leave 2026 Data</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600">
              Upload the verified <strong>Leave 2026(Sheet1).csv</strong> or XLSX file. Employee codes will be validated against existing master records.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                {importFile && (
                  <span className="block mt-2 font-mono text-teal-700 font-bold">
                    Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Duplicate Protection & Audit Policy
                </span>
                <p>
                  Existing data will be safely reconciled without silent overwriting. All administrative imports are logged in the Enterprise Audit Log.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !importFile}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-md"
                >
                  {isImporting ? 'Validating & Importing...' : 'Confirm Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={fetchData}
        leaveTypes={leaveTypes}
        balances={balances}
      />

      {/* Manager Action Modal (Approve / Reject) */}
      <ManagerActionModal
        isOpen={managerActionState.isOpen}
        onClose={() => setManagerActionState({ isOpen: false, request: null, actionType: '' })}
        onSuccess={fetchData}
        request={managerActionState.request}
        actionType={managerActionState.actionType}
        userRole={userRole}
      />

      {/* HR Administrative Override Modal */}
      <HROverrideModal
        isOpen={overrideState.isOpen}
        onClose={() => setOverrideState({ isOpen: false, request: null })}
        onSuccess={fetchData}
        request={overrideState.request}
      />

      {/* HR Adjust Leave Balance Modal */}
      <AdjustBalanceModal
        isOpen={adjustBalanceState.isOpen}
        onClose={() => setAdjustBalanceState({ isOpen: false, employee: null })}
        onSuccess={fetchData}
        employee={adjustBalanceState.employee}
        leaveTypes={leaveTypes}
      />

      {/* Timeline Modal */}
      {selectedRequestForTimeline && (
        <Modal
          isOpen={Boolean(selectedRequestForTimeline)}
          onClose={() => setSelectedRequestForTimeline(null)}
          title={`Leave Request History — ${selectedRequestForTimeline.requestId}`}
          subtitle={`Detailed governance audit trail for ${selectedRequestForTimeline.employeeName}`}
          size="lg"
        >
          <LeaveApprovalTimeline request={selectedRequestForTimeline} />
        </Modal>
      )}
    </div>
  );
};

export default LeaveManagement;
