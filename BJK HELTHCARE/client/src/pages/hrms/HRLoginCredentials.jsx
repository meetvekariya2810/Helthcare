import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { credentialsAPI } from '../../services/api';
import {
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  Search,
  Filter,
  Plus,
  Lock,
  Unlock,
  RotateCcw,
  Eye,
  Edit3,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Calendar,
  Building2,
  Briefcase,
  Mail,
  User,
  ExternalLink,
  RefreshCw,
  Layers,
  Sparkles,
  FileCheck,
  Clock,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

export const HRLoginCredentials = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotification();

  // State
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loginStatusFilter, setLoginStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkRole, setBulkRole] = useState('');
  const [bulkDepartment, setBulkDepartment] = useState('');
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Active items for modals
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [activeUserDetail, setActiveUserDetail] = useState(null);
  const [activeAuditLogs, setActiveAuditLogs] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Fetch initial stats and templates
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const res = await credentialsAPI.getStats();
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('[HR Login Credentials] Stats fetch note:', err.message);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await credentialsAPI.getTemplates();
      if (res.data?.success) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.warn('[HR Login Credentials] Templates fetch note:', err.message);
    }
  };

  const fetchCredentials = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await credentialsAPI.getAll({
        page,
        limit: 25,
        search: searchTerm,
        department: departmentFilter,
        role: roleFilter,
        designation: designationFilter,
        status: statusFilter,
        loginStatus: loginStatusFilter,
        sortBy,
        sortOrder
      });

      if (res.data?.success) {
        setCredentials(res.data.data || []);
        setPagination(res.data.pagination || { page, limit: 25, total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('[HR Login Credentials] Fetch error:', err);
      showToast('Failed to load login credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchCredentials(1);
  }, [searchTerm, departmentFilter, roleFilter, designationFilter, statusFilter, loginStatusFilter, sortBy, sortOrder]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(credentials.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkAction = async () => {
    if (!bulkAction) return;
    try {
      setIsBulkSubmitting(true);
      const res = await credentialsAPI.bulkUpdate({
        userIds: selectedIds,
        action: bulkAction,
        role: bulkRole,
        department: bulkDepartment,
        templateRole: bulkTemplate,
        reason: bulkReason || 'HR bulk access administration'
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Bulk operation completed successfully.', 'success');
        setSelectedIds([]);
        setShowBulkConfirmModal(false);
        setBulkAction('');
        fetchCredentials(pagination.page);
        fetchStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk operation failed.', 'error');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Open Edit / Config Modal
  const handleOpenConfig = async (userSummary) => {
    try {
      setActiveEmployee(userSummary);
      const res = await credentialsAPI.getById(userSummary._id || userSummary.id);
      if (res.data?.success) {
        setActiveUserDetail(res.data);
        setShowConfigModal(true);
      }
    } catch (err) {
      showToast('Failed to load user access details.', 'error');
    }
  };

  // Open Detail Drawer
  const handleOpenDetailDrawer = async (userSummary) => {
    try {
      setActiveEmployee(userSummary);
      const res = await credentialsAPI.getById(userSummary._id || userSummary.id);
      if (res.data?.success) {
        setActiveUserDetail(res.data);
        setShowDetailDrawer(true);
      }
    } catch (err) {
      showToast('Failed to load user details.', 'error');
    }
  };

  // Open Reset Password Modal
  const handleOpenReset = (userSummary) => {
    setActiveEmployee(userSummary);
    setShowResetModal(true);
  };

  // Open Audit Modal
  const handleOpenAudit = async (userSummary) => {
    try {
      setActiveEmployee(userSummary);
      const res = await credentialsAPI.getAudit(userSummary._id || userSummary.id);
      if (res.data?.success) {
        setActiveAuditLogs(res.data.auditLogs || []);
        setShowAuditModal(true);
      }
    } catch (err) {
      showToast('Failed to load audit trail.', 'error');
    }
  };

  // Quick Account Status Toggle (Activate / Deactivate / Lock / Unlock)
  const handleToggleStatus = async (userSummary, targetStatus) => {
    try {
      const isLocking = targetStatus === 'LOCKED';
      const isUnlocking = targetStatus === 'UNLOCKED';
      const isActivating = targetStatus === 'ACTIVE';
      const isDeactivating = targetStatus === 'INACTIVE';

      let payload = {};
      if (isLocking) {
        payload = { isLocked: true, status: 'LOCKED', reason: 'Locked by HR Administrator' };
      } else if (isUnlocking) {
        payload = { isLocked: false, status: 'ACTIVE', reason: 'Unlocked by HR Administrator' };
      } else if (isActivating) {
        payload = { status: 'ACTIVE', isLocked: false, reason: 'Login activated by HR' };
      } else if (isDeactivating) {
        payload = { status: 'INACTIVE', reason: 'Login deactivated by HR' };
      }

      const res = await credentialsAPI.updateStatus(userSummary._id || userSummary.id, payload);
      if (res.data?.success) {
        showToast(res.data.message || 'Account status updated.', 'success');
        fetchCredentials(pagination.page);
        fetchStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed.', 'error');
    }
  };

  // Close card menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#00A896] shadow-xs flex-shrink-0">
            <Key size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A896] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                HR Master Control
              </span>
              <span className="text-[10px] text-slate-400 font-mono">BJK-SEC-2026</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Login Credentials & Access Management
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Centralized enterprise security panel. HR manages employee credentials and assigns exact module, page, button action, and approval permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => { fetchCredentials(pagination.page); fetchStats(); }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            id="btn-create-login"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009282] text-white font-bold text-xs shadow-md shadow-teal-700/10 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} />
            <span>Create Login / Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Section 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <MetricCard
          label="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="teal"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Active Accounts"
          value={stats?.activeLogins || 0}
          icon={UserCheck}
          color="emerald"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Inactive Accounts"
          value={stats?.inactiveLogins || 0}
          icon={UserX}
          color="amber"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Pending Logins"
          value={stats?.pendingLogins || 0}
          icon={Clock}
          color="blue"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Team Heads"
          value={stats?.teamHeads || 0}
          icon={ShieldCheck}
          color="purple"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Dept. Heads"
          value={stats?.deptHeads || 0}
          icon={Building2}
          color="indigo"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Managers"
          value={stats?.managers || 0}
          icon={Briefcase}
          color="cyan"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Employees"
          value={stats?.employees || 0}
          icon={User}
          color="slate"
          loading={isStatsLoading}
        />
        <MetricCard
          label="Locked Accounts"
          value={stats?.lockedAccounts || 0}
          icon={Lock}
          color="rose"
          loading={isStatsLoading}
        />
      </div>

      {/* 3. Search, Filters, and Bulk Operations Bar (Section 22 & 23) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Employee Name, ID, Username, Email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-[#00A896]"
            >
              <option value="ALL">All Departments</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Manufacturing Operations">Production</option>
              <option value="Warehouse & Logistics">Warehouse</option>
              <option value="Regulatory Affairs">Regulatory</option>
              <option value="Commercial & Sales">CRM & Sales</option>
              <option value="International Business">Export</option>
              <option value="Finance & Accounts">Finance</option>
              <option value="Executive Management">Management</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-[#00A896]"
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="TEAM_HEAD">Team Head</option>
              <option value="DEPARTMENT_HEAD">Department Head</option>
              <option value="MANAGER">Manager</option>
              <option value="HR_ADMIN">HR Admin</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="QC_MANAGER">QC Manager</option>
              <option value="QA_MANAGER">QA Manager</option>
              <option value="PRODUCTION_MANAGER">Production Manager</option>
              <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
              <option value="REGULATORY_MANAGER">Regulatory Manager</option>
              <option value="FINANCE_MANAGER">Finance Manager</option>
              <option value="DIRECTOR">Director</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <select
              value={loginStatusFilter}
              onChange={(e) => setLoginStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-[#00A896]"
            >
              <option value="ALL">All Login Statuses</option>
              <option value="ACTIVE">Active Logins</option>
              <option value="INACTIVE">Inactive Logins</option>
              <option value="LOCKED">Locked Accounts</option>
              <option value="PENDING">Pending Logins</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-[#00A896]"
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="lastLogin-desc">Last Login (Recent)</option>
              <option value="department-asc">Department</option>
              <option value="role-asc">Role</option>
            </select>

            {(searchTerm || departmentFilter !== 'ALL' || roleFilter !== 'ALL' || loginStatusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('ALL');
                  setRoleFilter('ALL');
                  setLoginStatusFilter('ALL');
                }}
                className="px-2.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center space-x-1"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar (Appears when rows are selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-900">
              <span className="w-5 h-5 rounded-full bg-[#00A896] text-white flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span>Employees Selected for Bulk Access Configuration</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 bg-white border border-teal-300 rounded-xl font-medium text-slate-800 text-xs focus:outline-none"
              >
                <option value="">Select Bulk Action...</option>
                <option value="ACTIVATE">Activate Login Accounts</option>
                <option value="DEACTIVATE">Deactivate Login Accounts</option>
                <option value="ASSIGN_ROLE">Assign Role</option>
                <option value="ASSIGN_DEPARTMENT">Assign Department</option>
                <option value="APPLY_TEMPLATE">Apply Permission Template</option>
              </select>

              {bulkAction === 'ASSIGN_ROLE' && (
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs"
                >
                  <option value="">Select Role...</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="TEAM_HEAD">Team Head</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="MANAGER">Manager</option>
                  <option value="QC">QC</option>
                  <option value="QA">QA</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="REGULATORY">Regulatory</option>
                  <option value="FINANCE">Finance</option>
                  <option value="HR">HR</option>
                </select>
              )}

              {bulkAction === 'ASSIGN_DEPARTMENT' && (
                <select
                  value={bulkDepartment}
                  onChange={(e) => setBulkDepartment(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs"
                >
                  <option value="">Select Department...</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Manufacturing Operations">Production</option>
                  <option value="Warehouse & Logistics">Warehouse</option>
                  <option value="Regulatory Affairs">Regulatory</option>
                  <option value="Finance & Accounts">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Commercial & Sales">CRM & Sales</option>
                </select>
              )}

              {bulkAction === 'APPLY_TEMPLATE' && (
                <select
                  value={bulkTemplate}
                  onChange={(e) => setBulkTemplate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs"
                >
                  <option value="">Select Template...</option>
                  <option value="EMPLOYEE">Employee Template (Basic)</option>
                  <option value="TEAM_HEAD">Team Head Template</option>
                  <option value="DEPARTMENT_HEAD">Department Head Template</option>
                  <option value="QC">QC Master Template</option>
                  <option value="QA">QA Master Template</option>
                  <option value="PRODUCTION">Production Master Template</option>
                  <option value="FINANCE">Finance Master Template</option>
                </select>
              )}

              <button
                disabled={!bulkAction}
                onClick={() => setShowBulkConfirmModal(true)}
                className="px-3.5 py-1.5 bg-[#00A896] hover:bg-[#009282] text-white font-bold rounded-xl text-xs disabled:opacity-50 transition-colors shadow-2xs"
              >
                Apply to {selectedIds.length} Accounts
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Master Table (Section 2) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-5 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={credentials.length > 0 && selectedIds.length === credentials.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                  />
                </th>
                <th className="py-3.5 px-3">Employee</th>
                <th className="py-3.5 px-3">Employee ID</th>
                <th className="py-3.5 px-3">Department</th>
                <th className="py-3.5 px-3">Designation</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Login Status</th>
                <th className="py-3.5 px-3">Last Login</th>
                <th className="py-3.5 px-3">Authorized Access</th>
                <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#00A896] mb-2" />
                    <p className="font-semibold text-xs">Loading employee credentials...</p>
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <UserX size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-xs">No employee credentials match the current filter.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDepartmentFilter('ALL');
                        setRoleFilter('ALL');
                        setLoginStatusFilter('ALL');
                      }}
                      className="mt-2 text-[#00A896] hover:underline font-bold text-xs"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                credentials.map((emp) => {
                  const isSelected = selectedIds.includes(emp._id);
                  const isLocked = emp.isLocked || emp.status === 'LOCKED';
                  const isActive = emp.isActive && emp.status === 'ACTIVE' && !isLocked;

                  return (
                    <tr
                      key={emp._id}
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-teal-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(emp._id)}
                          className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                        />
                      </td>

                      {/* Employee Info */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => handleOpenDetailDrawer(emp)}
                              className="font-bold text-slate-900 hover:text-[#00A896] text-xs transition-colors truncate block text-left"
                            >
                              {emp.name}
                            </button>
                            <span className="text-[11px] text-slate-400 block truncate font-mono">
                              {emp.email}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              @{emp.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                        {emp.employeeId}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {emp.department}
                        </span>
                      </td>

                      {/* Designation */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium text-[11px]">
                        {emp.designation}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3">
                        <RoleBadge role={emp.role} />
                      </td>

                      {/* Login Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={emp.status} isActive={isActive} isLocked={isLocked} />
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-3 text-[11px] text-slate-500">
                        {emp.lastLogin ? (
                          <div>
                            <span className="font-medium text-slate-700">
                              {new Date(emp.lastLogin).toLocaleDateString()}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {new Date(emp.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Never logged in</span>
                        )}
                      </td>

                      {/* Access Badges */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1 items-center">
                          {emp.accessibleModules?.slice(0, 3).map(mod => (
                            <span
                              key={mod}
                              className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-teal-50 text-[#00A896] border border-teal-200/60"
                            >
                              {mod}
                            </span>
                          ))}
                          {(emp.accessibleModules?.length || 0) > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{emp.accessibleModules.length - 3} more
                            </span>
                          )}
                          {emp.approvalCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {emp.approvalCount} Approvals
                            </span>
                          )}
                          {emp.hasCustomPermissions && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Customized Permissions" />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 pl-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick Customize Access */}
                          <button
                            onClick={() => handleOpenConfig(emp)}
                            className="p-1.5 text-slate-500 hover:text-[#00A896] hover:bg-teal-50 rounded-lg transition-colors"
                            title="Customize Modules & Permissions"
                          >
                            <Sliders size={15} />
                          </button>

                          {/* Quick Password Reset */}
                          <button
                            onClick={() => handleOpenReset(emp)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key size={15} />
                          </button>

                          {/* Detail Profile Drawer */}
                          <button
                            onClick={() => handleOpenDetailDrawer(emp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Employee Access Profile"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Quick Lock / Unlock */}
                          {isLocked ? (
                            <button
                              onClick={() => handleToggleStatus(emp, 'UNLOCKED')}
                              className="p-1.5 text-rose-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Unlock Account"
                            >
                              <Unlock size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(emp, 'LOCKED')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Lock Account"
                            >
                              <Lock size={15} />
                            </button>
                          )}

                          {/* Status Activate / Deactivate Toggle */}
                          {isActive ? (
                            <button
                              onClick={() => handleToggleStatus(emp, 'INACTIVE')}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Deactivate Login"
                            >
                              <UserX size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(emp, 'ACTIVE')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Activate Login"
                            >
                              <UserCheck size={15} />
                            </button>
                          )}

                          {/* Audit Logs */}
                          <button
                            onClick={() => handleOpenAudit(emp)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Audit Trail"
                          >
                            <History size={15} />
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

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{credentials.length}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.total}</span> employees
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchCredentials(pagination.page - 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="font-bold text-slate-700">
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchCredentials(pagination.page + 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Employee + Login (Section 3 & 19) */}
      {showCreateModal && (
        <CreateEmployeeLoginModal
          templates={templates}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCredentials(1);
            fetchStats();
            showToast('Employee login created successfully.', 'success');
          }}
        />
      )}

      {/* MODAL 2: Login Credentials — Employee Access Configuration (Section 4 - 12, 20) */}
      {showConfigModal && activeUserDetail && (
        <AccessConfigurationModal
          userDetail={activeUserDetail}
          templates={templates}
          onClose={() => {
            setShowConfigModal(false);
            setActiveUserDetail(null);
          }}
          onSuccess={() => {
            setShowConfigModal(false);
            setActiveUserDetail(null);
            fetchCredentials(pagination.page);
            showToast('Employee permissions updated and applied immediately.', 'success');
          }}
        />
      )}

      {/* MODAL 3: Reset Password Modal */}
      {showResetModal && activeEmployee && (
        <ResetPasswordModal
          employee={activeEmployee}
          onClose={() => {
            setShowResetModal(false);
            setActiveEmployee(null);
          }}
          onSuccess={() => {
            setShowResetModal(false);
            setActiveEmployee(null);
            fetchCredentials(pagination.page);
          }}
        />
      )}

      {/* MODAL 4: Employee Detail Profile Drawer (Section 15) */}
      {showDetailDrawer && activeUserDetail && (
        <EmployeeDetailDrawer
          userDetail={activeUserDetail}
          templates={templates}
          onClose={() => {
            setShowDetailDrawer(false);
            setActiveUserDetail(null);
          }}
          onEditAccess={() => {
            setShowDetailDrawer(false);
            setShowConfigModal(true);
          }}
        />
      )}

      {/* MODAL 5: Audit Log Modal */}
      {showAuditModal && activeEmployee && (
        <AuditLogModal
          employee={activeEmployee}
          auditLogs={activeAuditLogs}
          onClose={() => {
            setShowAuditModal(false);
            setActiveEmployee(null);
            setActiveAuditLogs([]);
          }}
        />
      )}

      {/* MODAL 6: Bulk Confirmation Dialog */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-extrabold text-slate-900">Confirm Bulk Access Update</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to apply <span className="font-bold text-slate-900">[{bulkAction}]</span> to{' '}
              <span className="font-bold text-[#00A896]">{selectedIds.length} employee accounts</span>.
              This modification will be immediately effective and recorded in the immutable audit log.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Reason for Bulk Change:</label>
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="e.g. Departmental reorganization, quarterly audit revision"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A896]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isBulkSubmitting}
                onClick={handleExecuteBulkAction}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#009282] transition-colors flex items-center space-x-2"
              >
                {isBulkSubmitting ? <RefreshCw size={14} className="animate-spin" /> : null}
                <span>Confirm & Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------------------------

// Metric Card Component
const MetricCard = ({ label, value, icon: Icon, color, loading }) => {
  const colorMap = {
    teal: 'bg-teal-50 text-[#00A896] border-teal-200/80',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/80',
    blue: 'bg-blue-50 text-blue-600 border-blue-200/80',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/80',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200/80',
    rose: 'bg-rose-50 text-rose-600 border-rose-200/80',
    slate: 'bg-slate-50 text-slate-700 border-slate-200/80'
  };

  return (
    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg border flex-shrink-0 ${colorMap[color] || colorMap.slate}`}>
          <Icon size={14} />
        </div>
      </div>
      <div className="text-lg font-black text-slate-900 tracking-tight">
        {loading ? <span className="text-slate-300 text-sm">...</span> : value}
      </div>
    </div>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const r = (role || 'EMPLOYEE').toUpperCase();
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (r.includes('ADMIN') || r === 'DIRECTOR') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold';
  } else if (r.includes('HEAD')) {
    bg = 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
  } else if (r.includes('MANAGER')) {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
  } else if (r === 'QC') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
  } else if (r === 'QA') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
  } else if (r === 'PRODUCTION') {
    bg = 'bg-cyan-50 text-cyan-700 border-cyan-200 font-bold';
  } else if (r === 'HR') {
    bg = 'bg-teal-50 text-[#00A896] border-teal-200 font-bold';
  }

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider border ${bg}`}>
      {r.replace(/_/g, ' ')}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status, isActive, isLocked }) => {
  if (isLocked || status === 'LOCKED') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <Lock size={10} />
        <span>Locked</span>
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock size={10} />
        <span>Pending</span>
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={10} />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
      <XCircle size={10} />
      <span>Inactive</span>
    </span>
  );
};

// ---------------------------------------------------------------------------------------------
// MODAL 1: Create Employee + Login Credentials (17-Step HR Workflow)
// ---------------------------------------------------------------------------------------------
const CreateEmployeeLoginModal = ({ templates, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState('INFO'); // 'INFO', 'LOGIN', 'ROLE_PERMISSIONS', 'PREVIEW'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Employee Info
    name: '',
    employeeId: '',
    mobile: '',
    personalEmail: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    department: 'Quality Control',
    designation: 'QC Executive',
    reportingManager: '',
    reportingManagerName: '',
    location: 'Ahmedabad Formulation Unit 1',
    employmentType: 'FULL_TIME',
    employeeStatus: 'ACTIVE',

    // Login Info
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    loginStatus: 'ACTIVE',
    accountExpiry: '',
    requirePasswordChange: true,

    // Role
    role: 'QC',

    // Access Configuration (initialized from templates)
    accessConfig: null,
    approvalPermissions: []
  });

  // When role changes, automatically load default permission template (Step 9)
  useEffect(() => {
    if (!templates?.roleTemplates || !templates?.modules) return;
    const roleUpper = formData.role.toUpperCase();
    const template = templates.roleTemplates[roleUpper] || templates.roleTemplates.EMPLOYEE;

    const modules = templates.modules.map(mod => {
      const isAllowed = template.allowedModules.includes(mod.id);
      const modActions = template.moduleActions?.[mod.id] || [];
      const actionsObj = {};
      for (const a of mod.actions) {
        actionsObj[a] = isAllowed && modActions.includes(a);
      }

      const pages = mod.pages.map(p => {
        const pageAllowed = isAllowed && (template.allowedPages?.includes(p.id) || modActions.includes('view'));
        const pActionsObj = {};
        for (const pa of p.actions) {
          pActionsObj[pa] = pageAllowed && modActions.includes(pa);
        }
        return {
          id: p.id,
          name: p.name,
          path: p.path,
          enabled: pageAllowed,
          actions: pActionsObj
        };
      });

      return {
        id: mod.id,
        name: mod.name,
        path: mod.path,
        enabled: isAllowed,
        actions: actionsObj,
        pages
      };
    });

    setFormData(prev => ({
      ...prev,
      accessConfig: {
        role: roleUpper,
        department: prev.department,
        modules,
        approvalPermissions: [...(template.approvalPermissions || [])],
        teamHeadAccess: { ...(template.teamHeadAccess || {}) },
        departmentHeadAccess: { ...(template.departmentHeadAccess || {}) }
      },
      approvalPermissions: [...(template.approvalPermissions || [])]
    }));
  }, [formData.role, templates]);

  // Handle auto username & email generation from name
  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
    setFormData(prev => ({
      ...prev,
      name,
      username: prev.username || slug,
      email: prev.email || (slug ? `${slug}@bjkhealthcare.com` : '')
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name) {
      setErrorMsg('Employee name is required.');
      setActiveStep('INFO');
      return;
    }
    if (!formData.email) {
      setErrorMsg('Official email address is required.');
      setActiveStep('LOGIN');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setActiveStep('LOGIN');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Password and confirm password do not match.');
      setActiveStep('LOGIN');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await credentialsAPI.create({
        ...formData,
        customAccessConfig: formData.accessConfig,
        approvalPermissions: formData.approvalPermissions
      });

      if (res.data?.success) {
        onSuccess(res.data.user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create employee credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-[#00A896]">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Create Employee & Provision Login Credentials
              </h2>
              <p className="text-[11px] text-slate-500">
                Complete HR onboarding workflow with role-based access templates and granular customizations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveStep('INFO')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeStep === 'INFO'
                ? 'border-[#00A896] text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={14} />
            <span>1. Employee Information</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('LOGIN')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeStep === 'LOGIN'
                ? 'border-[#00A896] text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock size={14} />
            <span>2. Login Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('ROLE_PERMISSIONS')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeStep === 'ROLE_PERMISSIONS'
                ? 'border-[#00A896] text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>3. Customize Access</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('PREVIEW')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeStep === 'PREVIEW'
                ? 'border-[#00A896] text-[#00A896]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14} />
            <span>4. Effective Access Preview</span>
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Employee Information */}
          {activeStep === 'INFO' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Rahul Patel"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Employee ID (Optional - Auto generated)</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="e.g. BJK-EMP-105"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                >
                  <option value="Quality Control">Quality Control (QC)</option>
                  <option value="Quality Assurance">Quality Assurance (QA)</option>
                  <option value="Manufacturing Operations">Production</option>
                  <option value="Warehouse & Logistics">Warehouse & Inventory</option>
                  <option value="Regulatory Affairs">Regulatory Affairs</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Commercial & Sales">Sales / CRM</option>
                  <option value="International Business">Export Trade</option>
                  <option value="Human Resources">Human Resources (HR)</option>
                  <option value="Executive Management">Management / Executive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Designation *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. QC Executive / Analyst"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mobile Number</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Date of Joining</label>
                <input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Reporting Manager</label>
                <input
                  type="text"
                  value={formData.reportingManagerName}
                  onChange={(e) => setFormData({ ...formData, reportingManagerName: e.target.value })}
                  placeholder="e.g. Dr. Anita Desai (QA Head)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Location / Plant</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ahmedabad Formulation Unit 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                >
                  <option value="FULL_TIME">Full Time Permanent</option>
                  <option value="CONTRACT">Contractual</option>
                  <option value="PROBATION">Probationary</option>
                  <option value="CONSULTANT">Consultant</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Employee Status</label>
                <select
                  value={formData.employeeStatus}
                  onChange={(e) => setFormData({ ...formData, employeeStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_PROBATION">On Probation</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Login Information */}
          {activeStep === 'LOGIN' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. rahul.patel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#00A896]"
                  />
                  <span className="text-[10px] text-slate-400">Used for direct portal login authentication.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Official Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                    placeholder="rahul.patel@bjkhealthcare.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#00A896]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#00A896]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Confirm Temporary Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#00A896]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Login Account Status</label>
                  <select
                    value={formData.loginStatus}
                    onChange={(e) => setFormData({ ...formData, loginStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                  >
                    <option value="ACTIVE">Active (Immediate Login Enabled)</option>
                    <option value="INACTIVE">Inactive (Disabled temporarily)</option>
                    <option value="PENDING">Pending (Awaiting First Shift)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Account Expiry (Optional)</label>
                  <input
                    type="date"
                    value={formData.accountExpiry}
                    onChange={(e) => setFormData({ ...formData, accountExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A896]"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank for permanent non-expiring login.</span>
                </div>
              </div>

              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="reqPwdChange"
                  checked={formData.requirePasswordChange}
                  onChange={(e) => setFormData({ ...formData, requirePasswordChange: e.target.checked })}
                  className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                />
                <label htmlFor="reqPwdChange" className="font-bold text-slate-800 text-xs cursor-pointer">
                  Require password change on first login (Recommended for enterprise compliance)
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Customize Access (Section 4 - 12) */}
          {activeStep === 'ROLE_PERMISSIONS' && (
            <div className="space-y-6 text-xs">
              {/* Role Selection Dropdown (Section 3 & 10) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-extrabold text-slate-900 text-xs block uppercase tracking-wider">
                  Assigned Company Role & Default Template
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-[#00A896]"
                  >
                    <option value="EMPLOYEE">Employee (Basic Self Service)</option>
                    <option value="TEAM_HEAD">Team Head (Team Management & Approvals)</option>
                    <option value="DEPARTMENT_HEAD">Department Head (Department-wide)</option>
                    <option value="MANAGER">Manager (Operational Management)</option>
                    <option value="QC">Quality Control (QC)</option>
                    <option value="QA">Quality Assurance (QA)</option>
                    <option value="PRODUCTION">Production / Manufacturing</option>
                    <option value="WAREHOUSE">Warehouse / Inventory</option>
                    <option value="REGULATORY">Regulatory Affairs</option>
                    <option value="CRM">Sales / CRM</option>
                    <option value="EXPORT">Export Trade</option>
                    <option value="FINANCE">Finance & Accounts</option>
                    <option value="HR">Human Resources (HR)</option>
                    <option value="DIRECTOR">Director / Executive</option>
                  </select>
                  <span className="text-[11px] text-slate-500">
                    Role provides default permissions template. HR can further customize any module, page, button, or approval below.
                  </span>
                </div>
              </div>

              {/* Module & Page Permissions Configurator */}
              {formData.accessConfig?.modules && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center space-x-2">
                    <Layers size={14} className="text-[#00A896]" />
                    <span>Granular Module & Page Permission Matrix (Section 5 & 6)</span>
                  </h3>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {formData.accessConfig.modules.map((mod, mIndex) => {
                      return (
                        <div
                          key={mod.id}
                          className={`rounded-2xl border transition-all p-3.5 space-y-3 ${
                            mod.enabled
                              ? 'bg-white border-teal-200/90 shadow-2xs'
                              : 'bg-slate-50/50 border-slate-200 opacity-60'
                          }`}
                        >
                          {/* Module Header Toggle */}
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mod.enabled}
                                onChange={(e) => {
                                  const updated = { ...formData.accessConfig };
                                  updated.modules[mIndex].enabled = e.target.checked;
                                  setFormData({ ...formData, accessConfig: updated });
                                }}
                                className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                              />
                              <span className="font-extrabold text-slate-900 text-xs">
                                {mod.name}
                              </span>
                            </label>

                            {/* Module Action Level Toggles (Section 7) */}
                            {mod.enabled && (
                              <div className="flex items-center space-x-3 text-[10px]">
                                {Object.keys(mod.actions || {}).map((actionKey) => (
                                  <label key={actionKey} className="flex items-center space-x-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(mod.actions[actionKey])}
                                      onChange={(e) => {
                                        const updated = { ...formData.accessConfig };
                                        updated.modules[mIndex].actions[actionKey] = e.target.checked;
                                        setFormData({ ...formData, accessConfig: updated });
                                      }}
                                      className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                                    />
                                    <span className="capitalize font-bold text-slate-600">{actionKey}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Individual Pages Sub-Toggles (Section 6) */}
                          {mod.enabled && mod.pages?.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              {mod.pages.map((pg, pIndex) => (
                                <div
                                  key={pg.id}
                                  className={`p-2 rounded-xl border flex items-center justify-between ${
                                    pg.enabled
                                      ? 'bg-teal-50/40 border-teal-200/60 text-slate-900'
                                      : 'bg-white border-slate-200 text-slate-400'
                                  }`}
                                >
                                  <label className="flex items-center space-x-2 cursor-pointer truncate">
                                    <input
                                      type="checkbox"
                                      checked={pg.enabled}
                                      onChange={(e) => {
                                        const updated = { ...formData.accessConfig };
                                        updated.modules[mIndex].pages[pIndex].enabled = e.target.checked;
                                        setFormData({ ...formData, accessConfig: updated });
                                      }}
                                      className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                                    />
                                    <span className="font-semibold truncate">{pg.name}</span>
                                  </label>

                                  {pg.enabled && pg.actions?.approve !== undefined && (
                                    <label className="flex items-center space-x-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(pg.actions.approve)}
                                        onChange={(e) => {
                                          const updated = { ...formData.accessConfig };
                                          updated.modules[mIndex].pages[pIndex].actions.approve = e.target.checked;
                                          setFormData({ ...formData, accessConfig: updated });
                                        }}
                                        className="rounded border-amber-300 text-amber-600"
                                      />
                                      <span>Approve</span>
                                    </label>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dedicated Approval Permissions (Section 8) */}
              {templates?.approvals && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-amber-950 uppercase tracking-wider text-xs flex items-center space-x-2">
                      <ShieldCheck size={16} className="text-amber-600" />
                      <span>Approval Permissions Matrix (Section 8)</span>
                    </h3>
                    <span className="text-[10px] text-amber-800 font-medium">
                      Only authorized personnel can sign off production, QC, QA, or regulatory records
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    {templates.approvals.map(appr => {
                      const isChecked = formData.approvalPermissions.includes(appr.key);
                      return (
                        <label
                          key={appr.key}
                          className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-amber-100/60 border-amber-300 text-amber-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newApprovals = e.target.checked
                                ? [...formData.approvalPermissions, appr.key]
                                : formData.approvalPermissions.filter(k => k !== appr.key);
                              setFormData({
                                ...formData,
                                approvalPermissions: newApprovals,
                                accessConfig: {
                                  ...formData.accessConfig,
                                  approvalPermissions: newApprovals
                                }
                              });
                            }}
                            className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                          />
                          <div className="min-w-0">
                            <span className="block text-xs leading-tight truncate">{appr.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono block capitalize">{appr.module} module</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Team Head Specific Access Options (Section 11) */}
              {(formData.role === 'TEAM_HEAD' || formData.role === 'DEPARTMENT_HEAD') && templates?.teamHeadCapabilities && (
                <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-purple-950 uppercase tracking-wider text-xs flex items-center space-x-2">
                    <Users size={16} className="text-purple-600" />
                    <span>Team Head Management Capabilities (Section 11)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {templates.teamHeadCapabilities.map(cap => {
                      const isCapEnabled = Boolean(formData.accessConfig?.teamHeadAccess?.[cap.id]);
                      return (
                        <label
                          key={cap.id}
                          className={`p-2 rounded-xl border flex items-center space-x-2 cursor-pointer ${
                            isCapEnabled
                              ? 'bg-purple-100/70 border-purple-300 text-purple-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCapEnabled}
                            onChange={(e) => {
                              const updated = { ...formData.accessConfig };
                              if (!updated.teamHeadAccess) updated.teamHeadAccess = {};
                              updated.teamHeadAccess[cap.id] = e.target.checked;
                              setFormData({ ...formData, accessConfig: updated });
                            }}
                            className="rounded border-purple-300 text-purple-600"
                          />
                          <span className="truncate">{cap.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Department Head Specific Access Options (Section 12) */}
              {formData.role === 'DEPARTMENT_HEAD' && templates?.departmentHeadCapabilities && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-indigo-950 uppercase tracking-wider text-xs flex items-center space-x-2">
                    <Building2 size={16} className="text-indigo-600" />
                    <span>Department Head Oversight Capabilities (Section 12)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {templates.departmentHeadCapabilities.map(cap => {
                      const isCapEnabled = Boolean(formData.accessConfig?.departmentHeadAccess?.[cap.id]);
                      return (
                        <label
                          key={cap.id}
                          className={`p-2 rounded-xl border flex items-center space-x-2 cursor-pointer ${
                            isCapEnabled
                              ? 'bg-indigo-100/70 border-indigo-300 text-indigo-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCapEnabled}
                            onChange={(e) => {
                              const updated = { ...formData.accessConfig };
                              if (!updated.departmentHeadAccess) updated.departmentHeadAccess = {};
                              updated.departmentHeadAccess[cap.id] = e.target.checked;
                              setFormData({ ...formData, accessConfig: updated });
                            }}
                            className="rounded border-indigo-300 text-indigo-600"
                          />
                          <span className="truncate">{cap.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Effective Access Preview (Section 24) */}
          {activeStep === 'PREVIEW' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Effective Access Preview for {formData.name || 'New Employee'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Department: <span className="font-bold text-slate-700">{formData.department}</span> | Role:{' '}
                    <span className="font-bold text-[#00A896]">{formData.role}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[#00A896] font-bold text-[10px] uppercase tracking-wider">
                  Validated Matrix
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Can Access */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-extrabold uppercase tracking-wider text-[11px]">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Can Access ({formData.accessConfig?.modules?.filter(m => m.enabled).length || 0} Modules)</span>
                  </div>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {formData.accessConfig?.modules
                      ?.filter(m => m.enabled)
                      .map(mod => (
                        <div key={mod.id} className="p-2 bg-white rounded-xl border border-emerald-100 space-y-1">
                          <div className="flex items-center justify-between text-emerald-950 font-bold">
                            <span className="flex items-center space-x-1.5">
                              <Check size={12} className="text-emerald-600" />
                              <span>{mod.name}</span>
                            </span>
                            <span className="text-[9px] uppercase font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {Object.keys(mod.actions || {}).filter(k => mod.actions[k]).join(', ')}
                            </span>
                          </div>
                          {mod.pages?.filter(p => p.enabled).length > 0 && (
                            <div className="pl-4 text-[10px] text-slate-500 space-y-0.5">
                              {mod.pages.filter(p => p.enabled).map(p => (
                                <div key={p.id}>• {p.name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cannot Access */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-800 font-extrabold uppercase tracking-wider text-[11px]">
                    <XCircle size={16} className="text-rose-600" />
                    <span>Cannot Access ({formData.accessConfig?.modules?.filter(m => !m.enabled).length || 0} Modules)</span>
                  </div>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {formData.accessConfig?.modules
                      ?.filter(m => !m.enabled)
                      .map(mod => (
                        <div
                          key={mod.id}
                          className="p-2 bg-white rounded-xl border border-rose-100 flex items-center justify-between text-slate-500 font-medium"
                        >
                          <span className="flex items-center space-x-1.5">
                            <X size={12} className="text-rose-500" />
                            <span>{mod.name}</span>
                          </span>
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            Restricted (403)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Approvals Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-extrabold uppercase tracking-wider text-[11px]">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <span>Can Approve ({formData.approvalPermissions.length})</span>
                  </div>
                  {formData.approvalPermissions.length === 0 ? (
                    <p className="text-slate-400 italic text-[11px]">No approval responsibilities granted.</p>
                  ) : (
                    <div className="space-y-1 text-[11px] text-amber-950 font-bold">
                      {formData.approvalPermissions.map(appr => (
                        <div key={appr} className="flex items-center space-x-1.5">
                          <Check size={12} className="text-amber-600" />
                          <span>{templates?.approvals?.find(a => a.key === appr)?.label || appr}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                    <Lock size={16} className="text-slate-400" />
                    <span>Cannot Approve (Blocked)</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    {templates?.approvals
                      ?.filter(a => !formData.approvalPermissions.includes(a.key))
                      .slice(0, 5)
                      .map(appr => (
                        <div key={appr.key} className="flex items-center space-x-1.5">
                          <X size={12} className="text-slate-300" />
                          <span>{appr.label}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              {activeStep !== 'INFO' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'LOGIN') setActiveStep('INFO');
                    else if (activeStep === 'ROLE_PERMISSIONS') setActiveStep('LOGIN');
                    else if (activeStep === 'PREVIEW') setActiveStep('ROLE_PERMISSIONS');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              {activeStep !== 'PREVIEW' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'INFO') setActiveStep('LOGIN');
                    else if (activeStep === 'LOGIN') setActiveStep('ROLE_PERMISSIONS');
                    else if (activeStep === 'ROLE_PERMISSIONS') setActiveStep('PREVIEW');
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#00A896] hover:bg-[#009282] text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>Create Login & Apply Permissions</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// MODAL 2: Dedicated Access Configuration Modal (Section 4 - 12, 20)
// ---------------------------------------------------------------------------------------------
const AccessConfigurationModal = ({ userDetail, templates, onClose, onSuccess }) => {
  const user = userDetail.user || {};

  // Build robust initial config with fallback from templates or standard modules
  const getInitialConfig = () => {
    if (userDetail.accessConfig && Array.isArray(userDetail.accessConfig.modules) && userDetail.accessConfig.modules.length > 0) {
      return userDetail.accessConfig;
    }
    const roleUpper = (user.role || 'EMPLOYEE').toUpperCase();
    const isSuper = ['SUPER_ADMIN', 'DIRECTOR'].includes(roleUpper);
    const isHR = isSuper || ['HR_ADMIN', 'HR_MANAGER', 'HR'].includes(roleUpper);
    const effectiveMods = userDetail.effectivePermissions?.allowedModules || [];

    const fallbackModuleList = (templates?.modules && Array.isArray(templates.modules) && templates.modules.length > 0)
      ? templates.modules
      : [
          { id: 'executive', name: 'Executive Command Center', path: '/dashboard/hr', actions: ['view', 'manage', 'audit'] },
          { id: 'hr', name: 'HR & Personnel Operations', path: '/hr/employees', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
          { id: 'production', name: 'Batch Manufacturing (Production)', path: '/production', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'qc', name: 'Quality Control (QC)', path: '/quality/qc', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'qa', name: 'Quality Assurance (QA)', path: '/quality/qa', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'microbiology', name: 'QC Microbiology', path: '/dashboard/microbiology', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'inventory', name: 'Warehouse & Inventory', path: '/inventory', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'finance', name: 'Finance & Accounts', path: '/finance', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'procurement', name: 'Purchase & Procurement', path: '/dashboard/procurement', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'engineering', name: 'Engineering & Maintenance', path: '/dashboard/engineering', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'regulatory', name: 'Regulatory Affairs', path: '/regulatory', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'sales', name: 'Commercial & Sales', path: '/crm', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'facilities', name: 'Facilities & Services', path: '/dashboard/facilities', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'canteen', name: 'Canteen Management', path: '/hrms/canteen', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'documents', name: 'Controlled Documents & SOPs', path: '/documents', actions: ['view', 'create', 'edit', 'approve'] },
          { id: 'audit', name: 'Audit Logs & Governance', path: '/audit-logs', actions: ['view', 'export'] }
        ];

    return {
      role: roleUpper,
      department: user.department || 'General',
      modules: fallbackModuleList.map(mod => {
        const isAllowed = isSuper || effectiveMods.includes(mod.id) || (isHR && mod.id === 'hr') || user.department?.toLowerCase().includes(mod.id);
        const actObj = {};
        for (const a of (mod.actions || ['view', 'create', 'edit', 'approve'])) {
          actObj[a] = isAllowed;
        }
        return {
          id: mod.id,
          name: mod.name,
          path: mod.path,
          enabled: isAllowed,
          actions: actObj,
          pages: (mod.pages || []).map(pg => ({
            id: pg.id,
            name: pg.name,
            path: pg.path,
            enabled: isAllowed,
            actions: { view: isAllowed, edit: isAllowed, approve: isAllowed }
          }))
        };
      }),
      approvalPermissions: userDetail.accessConfig?.approvalPermissions || user.approvalPermissions || (isSuper ? ['ALL'] : []),
      teamHeadAccess: userDetail.accessConfig?.teamHeadAccess || {},
      departmentHeadAccess: userDetail.accessConfig?.departmentHeadAccess || {}
    };
  };

  const [config, setConfig] = useState(getInitialConfig);
  const [approvalPermissions, setApprovalPermissions] = useState(
    userDetail.accessConfig?.approvalPermissions || userDetail.user?.approvalPermissions || []
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('MODULES'); // 'MODULES', 'APPROVALS', 'TEAM', 'PREVIEW'

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const res = await credentialsAPI.updatePermissions(user._id || user.id, {
        accessConfig: {
          ...config,
          approvalPermissions
        },
        approvalPermissions,
        reason: reason || 'HR permission customization update'
      });

      if (res.data?.success) {
        onSuccess();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update access permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header (Section 4 Example) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00A896]">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Login Credentials — Employee Access Configuration
                </h2>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                  {user.employeeId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-800">{user.name}</span> | Department:{' '}
                <span className="font-semibold text-slate-700">{user.department}</span> | Designation:{' '}
                <span className="font-semibold text-slate-700">{user.designation}</span> | Role:{' '}
                <RoleBadge role={user.role} />
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Access Category Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MODULES')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'MODULES' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent text-slate-500'
            }`}
          >
            <Layers size={14} />
            <span>Modules & Pages Control (Section 5 & 6)</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'APPROVALS' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent text-slate-500'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Approval Responsibilities (Section 8)</span>
          </button>

          {(user.role === 'TEAM_HEAD' || user.role === 'DEPARTMENT_HEAD') && (
            <button
              onClick={() => setActiveTab('TEAM')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'TEAM' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent text-slate-500'
              }`}
            >
              <Users size={14} />
              <span>Head Oversight (Section 11 & 12)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('PREVIEW')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'PREVIEW' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent text-slate-500'
            }`}
          >
            <Eye size={14} />
            <span>Effective Access Preview (Section 24)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MODULES & PAGES */}
          {activeTab === 'MODULES' && config.modules && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Toggle modules and granular page actions. Disabled pages disappear from navigation and direct URL.</span>
              </div>

              {config.modules.map((mod, mIdx) => (
                <div
                  key={mod.id}
                  className={`rounded-2xl border p-4 transition-all space-y-3 ${
                    mod.enabled ? 'bg-white border-teal-200 shadow-2xs' : 'bg-slate-50/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mod.enabled}
                        onChange={(e) => {
                          const updated = { ...config };
                          updated.modules[mIdx].enabled = e.target.checked;
                          setConfig(updated);
                        }}
                        className="rounded border-slate-300 text-[#00A896] focus:ring-[#00A896]"
                      />
                      <span className="font-extrabold text-slate-900 text-xs">{mod.name}</span>
                    </label>

                    {mod.enabled && (
                      <div className="flex items-center space-x-3 text-[10px]">
                        {Object.keys(mod.actions || {}).map(act => (
                          <label key={act} className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(mod.actions[act])}
                              onChange={(e) => {
                                const updated = { ...config };
                                updated.modules[mIdx].actions[act] = e.target.checked;
                                setConfig(updated);
                              }}
                              className="rounded border-slate-300 text-[#00A896]"
                            />
                            <span className="capitalize font-bold text-slate-600">{act}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {mod.enabled && mod.pages?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {mod.pages.map((pg, pIdx) => (
                        <div
                          key={pg.id}
                          className={`p-2 rounded-xl border flex items-center justify-between ${
                            pg.enabled ? 'bg-teal-50/40 border-teal-200 text-slate-900' : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <label className="flex items-center space-x-2 cursor-pointer truncate">
                            <input
                              type="checkbox"
                              checked={pg.enabled}
                              onChange={(e) => {
                                const updated = { ...config };
                                updated.modules[mIdx].pages[pIdx].enabled = e.target.checked;
                                setConfig(updated);
                              }}
                              className="rounded border-slate-300 text-[#00A896]"
                            />
                            <span className="font-semibold truncate">{pg.name}</span>
                          </label>

                          {pg.enabled && pg.actions?.approve !== undefined && (
                            <label className="flex items-center space-x-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(pg.actions.approve)}
                                onChange={(e) => {
                                  const updated = { ...config };
                                  updated.modules[mIdx].pages[pIdx].actions.approve = e.target.checked;
                                  setConfig(updated);
                                }}
                                className="rounded border-amber-300 text-amber-600"
                              />
                              <span>Approve</span>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: APPROVAL RESPONSIBILITIES */}
          {activeTab === 'APPROVALS' && templates?.approvals && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <span className="font-bold">Enterprise Compliance Note:</span> Only employees with explicitly assigned approval responsibilities will see approval buttons and be authorized to digitally sign off pharmaceutical records.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {templates.approvals.map(appr => {
                  const isChecked = approvalPermissions.includes(appr.key);
                  return (
                    <label
                      key={appr.key}
                      className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer ${
                        isChecked ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApprovalPermissions([...approvalPermissions, appr.key]);
                          } else {
                            setApprovalPermissions(approvalPermissions.filter(k => k !== appr.key));
                          }
                        }}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs truncate leading-tight">{appr.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono block capitalize">{appr.module} module</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HEAD OVERSIGHT */}
          {activeTab === 'TEAM' && (
            <div className="space-y-6 text-xs">
              {templates?.teamHeadCapabilities && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-purple-950 uppercase tracking-wider text-xs">
                    Team Head Capabilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {templates.teamHeadCapabilities.map(cap => {
                      const isCapEnabled = Boolean(config.teamHeadAccess?.[cap.id]);
                      return (
                        <label
                          key={cap.id}
                          className={`p-2 rounded-xl border flex items-center space-x-2 cursor-pointer ${
                            isCapEnabled ? 'bg-purple-100/70 border-purple-300 text-purple-950 font-bold' : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCapEnabled}
                            onChange={(e) => {
                              const updated = { ...config };
                              if (!updated.teamHeadAccess) updated.teamHeadAccess = {};
                              updated.teamHeadAccess[cap.id] = e.target.checked;
                              setConfig(updated);
                            }}
                            className="rounded border-purple-300 text-purple-600"
                          />
                          <span className="truncate">{cap.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {user.role === 'DEPARTMENT_HEAD' && templates?.departmentHeadCapabilities && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-indigo-950 uppercase tracking-wider text-xs">
                    Department Head Oversight
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {templates.departmentHeadCapabilities.map(cap => {
                      const isCapEnabled = Boolean(config.departmentHeadAccess?.[cap.id]);
                      return (
                        <label
                          key={cap.id}
                          className={`p-2 rounded-xl border flex items-center space-x-2 cursor-pointer ${
                            isCapEnabled ? 'bg-indigo-100/70 border-indigo-300 text-indigo-950 font-bold' : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isCapEnabled}
                            onChange={(e) => {
                              const updated = { ...config };
                              if (!updated.departmentHeadAccess) updated.departmentHeadAccess = {};
                              updated.departmentHeadAccess[cap.id] = e.target.checked;
                              setConfig(updated);
                            }}
                            className="rounded border-indigo-300 text-indigo-600"
                          />
                          <span className="truncate">{cap.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PREVIEW */}
          {activeTab === 'PREVIEW' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-emerald-900 text-xs flex items-center space-x-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Can Access</span>
                  </span>
                  <div className="space-y-1 text-slate-700">
                    {config.modules?.filter(m => m.enabled).map(m => (
                      <div key={m.id} className="flex items-center space-x-1.5 font-bold">
                        <Check size={12} className="text-emerald-600" />
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-rose-900 text-xs flex items-center space-x-1.5">
                    <XCircle size={16} className="text-rose-600" />
                    <span>Cannot Access</span>
                  </span>
                  <div className="space-y-1 text-slate-500">
                    {config.modules?.filter(m => !m.enabled).map(m => (
                      <div key={m.id} className="flex items-center space-x-1.5">
                        <X size={12} className="text-rose-500" />
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <span className="font-bold">Authorized Approvals:</span>{' '}
                {approvalPermissions.length > 0 ? approvalPermissions.join(', ') : 'None assigned'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex-1 w-full max-w-md">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for change (Required for audit log)..."
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#00A896]"
            />
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleSave}
              className="px-6 py-2 bg-[#00A896] hover:bg-[#009282] text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>Save & Apply Immediately</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// MODAL 3: Reset Password Modal
// ---------------------------------------------------------------------------------------------
const ResetPasswordModal = ({ employee, onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultPassword, setResultPassword] = useState(null);

  const handleGenerate = () => {
    const randomChars = Math.random().toString(36).slice(-6);
    setNewPassword(`Bjk@${randomChars}!`);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await credentialsAPI.resetPassword(employee._id || employee.id, {
        newPassword: newPassword || undefined,
        requirePasswordChange
      });

      if (res.data?.success) {
        setResultPassword(res.data.temporaryPassword);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5 text-amber-600">
            <Key size={20} />
            <h3 className="text-base font-extrabold text-slate-900">Reset Employee Password</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        {resultPassword ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-emerald-800 font-bold block">Password Reset Successfully!</span>
              <p className="text-slate-600 text-xs">
                Provide this temporary password to <span className="font-bold text-slate-900">{employee.name}</span>:
              </p>
              <div className="p-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-black text-sm text-center text-slate-900 select-all">
                {resultPassword}
              </div>
              <span className="text-[10px] text-slate-400 block text-center">
                User will be required to change password on first login.
              </span>
            </div>

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-2.5 bg-[#00A896] hover:bg-[#009282] text-white font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              Reset login credentials for <span className="font-bold text-slate-900">{employee.name}</span> (
              <span className="font-mono">{employee.email}</span>).
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">New Temporary Password:</label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-[11px] font-bold text-[#00A896] hover:underline"
                >
                  Generate Strong Password
                </button>
              </div>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave empty to auto-generate"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#00A896]"
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requirePasswordChange}
                onChange={(e) => setRequirePasswordChange(e.target.checked)}
                className="rounded border-slate-300 text-[#00A896]"
              />
              <span className="font-bold text-slate-700">Require password change on first login</span>
            </label>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                <span>Reset Password</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// MODAL 4: Employee Detail Profile Drawer (Section 15)
// ---------------------------------------------------------------------------------------------
const EmployeeDetailDrawer = ({ userDetail, templates, onClose, onEditAccess }) => {
  const [drawerTab, setDrawerTab] = useState('CREDENTIALS'); // 'PROFILE', 'CREDENTIALS', 'PERMISSIONS', 'ACTIVITY', 'AUDIT'
  const user = userDetail.user || {};
  const employee = userDetail.employee || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-base text-[#00A896]">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{user.name}</h2>
              <p className="text-xs text-slate-500">
                {user.employeeId} • {user.designation} • {user.department}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons (Section 15) */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 font-bold text-slate-500 overflow-x-auto">
          <button
            onClick={() => setDrawerTab('PROFILE')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${drawerTab === 'PROFILE' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent'}`}
          >
            Employee Profile
          </button>
          <button
            onClick={() => setDrawerTab('CREDENTIALS')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${drawerTab === 'CREDENTIALS' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent'}`}
          >
            Login Credentials
          </button>
          <button
            onClick={() => setDrawerTab('PERMISSIONS')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${drawerTab === 'PERMISSIONS' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent'}`}
          >
            Permissions & Approvals
          </button>
          <button
            onClick={() => setDrawerTab('ACTIVITY')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${drawerTab === 'ACTIVITY' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent'}`}
          >
            Login Activity
          </button>
          <button
            onClick={() => setDrawerTab('AUDIT')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap ${drawerTab === 'AUDIT' ? 'border-[#00A896] text-[#00A896]' : 'border-transparent'}`}
          >
            Audit Trail
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PROFILE */}
          {drawerTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
                  <span className="font-mono font-bold text-slate-900">{user.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-bold text-slate-800">{user.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
                  <span className="font-bold text-slate-800">{user.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Manager</span>
                  <span className="font-medium text-slate-800">{user.reportingManagerName || 'Executive'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Employment Status</span>
                  <span className="font-medium text-slate-800">{employee.employmentStatus || user.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* CREDENTIALS */}
          {drawerTab === 'CREDENTIALS' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Account Status</span>
                  <StatusBadge status={user.status} isActive={user.isActive} isLocked={user.isLocked} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Portal Username</span>
                    <span className="font-mono font-bold text-slate-900">@{user.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Work Email</span>
                    <span className="font-mono font-bold text-slate-900">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Role</span>
                    <RoleBadge role={user.role} />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Login</span>
                    <span className="font-medium text-slate-800">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={onEditAccess}
                  className="px-4 py-2 bg-[#00A896] hover:bg-[#009282] text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                >
                  <Sliders size={14} />
                  <span>Customize Access Matrix</span>
                </button>
              </div>
            </div>
          )}

          {/* PERMISSIONS */}
          {drawerTab === 'PERMISSIONS' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-2">
                <span className="font-extrabold text-teal-900 uppercase tracking-wider text-[11px] block">
                  Accessible Modules
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {userDetail.effectivePermissions?.allowedModules?.map(m => (
                    <span key={m} className="px-2 py-1 rounded-md bg-white border border-teal-300 text-[#00A896] font-bold text-xs">
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                <span className="font-extrabold text-amber-900 uppercase tracking-wider text-[11px] block">
                  Authorized Approval Responsibilities
                </span>
                {userDetail.effectivePermissions?.approvalPermissions?.length > 0 ? (
                  <div className="space-y-1">
                    {userDetail.effectivePermissions.approvalPermissions.map(a => (
                      <div key={a} className="font-bold text-amber-950 flex items-center space-x-1">
                        <Check size={12} className="text-amber-600" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No approvals assigned.</p>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY */}
          {drawerTab === 'ACTIVITY' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                Recent Authentication History
              </h4>
              {userDetail.loginHistory?.length === 0 ? (
                <p className="text-slate-400 italic">No login records found.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {userDetail.loginHistory.map((log, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {log.device} • {log.browser} on {log.operatingSystem}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {log.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {new Date(log.loginTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AUDIT (Section 15 Audit) */}
          {drawerTab === 'AUDIT' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                Immutable Access & Permission Audit Trail
              </h4>
              {userDetail.auditLogs?.length === 0 ? (
                <p className="text-slate-400 italic">No audit records for this account.</p>
              ) : (
                <div className="space-y-2">
                  {userDetail.auditLogs.map((audit) => (
                    <div key={audit._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{audit.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(audit.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{audit.reason || audit.details}</p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Changed by: <strong className="text-slate-700">{audit.user?.name || 'HR Admin'}</strong></span>
                        <span>IP: {audit.ipAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// MODAL 5: Audit Log Modal (Section 15 Audit)
// ---------------------------------------------------------------------------------------------
const AuditLogModal = ({ employee, auditLogs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5 text-slate-900">
            <History size={18} className="text-[#00A896]" />
            <h3 className="text-sm font-extrabold">Audit Trail for {employee.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">No security or access audit entries recorded for this employee.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-[#00A896] border border-teal-200 text-[10px] font-mono">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{log.reason || log.details}</p>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Authorized HR Operator: <strong className="text-slate-800">{log.user?.name}</strong> ({log.user?.role})</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HRLoginCredentials;
