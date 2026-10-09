import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { employeeAPI, hrmsAPI, hrBankAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNotification } from '../../context/NotificationContext';
import { EmployeeQuickViewModal } from '../../components/hrms/EmployeeQuickViewModal';
import { EmployeeIdCardModal } from '../../components/hrms/EmployeeIdCardModal';
import { EmployeeBusinessCardModal } from '../../components/hrms/EmployeeBusinessCardModal';
import { EmployeeBulkImportExportModal } from '../../components/hrms/EmployeeBulkImportExportModal';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  Eye,
  Edit2,
  Archive,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  MoreVertical,
  LayoutGrid,
  List,
  RotateCcw,
  CheckCircle2,
  FileDown,
  AlertTriangle,
  X,
  ShieldAlert
} from 'lucide-react';

export const Employees = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters State (Strictly Technical Personnel)
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [bankStatusFilter, setBankStatusFilter] = useState('ALL');
  const [bankStatusMap, setBankStatusMap] = useState({});

  // View Mode: 'cards' (default department cards) vs 'list' (data table)
  const [viewMode, setViewMode] = useState('cards');

  // Modals State
  const [selectedQuickViewEmployee, setSelectedQuickViewEmployee] = useState(null);
  const [selectedIdCardEmployee, setSelectedIdCardEmployee] = useState(null);
  const [selectedBusinessCardEmployee, setSelectedBusinessCardEmployee] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalInitialMode, setBulkModalInitialMode] = useState('import');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Card More Actions Dropdown tracking
  const [activeMenuCardId, setActiveMenuCardId] = useState(null);

  useEffect(() => {
    if (location.pathname.includes('/import') || location.search.includes('action=import')) {
      setBulkModalInitialMode('import');
      setIsBulkModalOpen(true);
    }
  }, [location.pathname, location.search]);

  // Unclassified Employees state (Requirement 28 & 29)
  const [unclassifiedEmployees, setUnclassifiedEmployees] = useState([]);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [classifyingId, setClassifyingId] = useState(null);

  const fetchUnclassified = async () => {
    try {
      const res = await employeeAPI.getUnclassified();
      if (res.data?.success) {
        setUnclassifiedEmployees(res.data.data || []);
      }
    } catch (err) {
      console.warn('[Unclassified Check]:', err.message);
    }
  };

  const handleClassify = async (empId, targetCategory) => {
    try {
      setClassifyingId(empId);
      const res = await employeeAPI.classify(empId, targetCategory);
      if (res.data?.success) {
        showToast(res.data.message || `Classified as ${targetCategory}`, 'success', 'Classification Saved');
        fetchUnclassified();
        fetchEmployees(pagination.page);
      }
    } catch (err) {
      showToast(err.normalizedMessage || err.message, 'error', 'Classification Error');
    } finally {
      setClassifyingId(null);
    }
  };

  const fetchEmployees = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await employeeAPI.getAll({
        page,
        limit: 24,
        search: searchTerm,
        employeeCategory: 'TECHNICAL',
        category: 'TECHNICAL',
        staffCategory: 'TECHNICAL',
        department: departmentFilter,
        designation: designationFilter,
        branch: branchFilter,
        status: statusFilter,
        employmentType: employeeTypeFilter,
        shift: shiftFilter
      });

      if (res.data && res.data.success) {
        const list = res.data.data || res.data.employees || [];
        setEmployees(list);
        setPagination(res.data.pagination || { page, limit: 24, total: list.length, pages: 1 });
      }
    } catch (err) {
      console.warn('[BJK HRMS Employee Fetch]:', err.normalizedMessage || err.message);
      showToast('Connecting to local/fallback records: ' + (err.normalizedMessage || err.message), 'info', 'Directory Notice');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankStatuses = async () => {
    try {
      const res = await hrBankAPI.getAllBankDetails({ limit: 500 });
      if (res.data?.success && res.data.data) {
        const map = {};
        res.data.data.forEach(item => {
          map[item.employeeId] = item;
          if (item.employeeCode) map[item.employeeCode] = item;
        });
        setBankStatusMap(map);
      }
    } catch (err) {
      console.warn('[Bank Statuses Load]:', err.message);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
    fetchUnclassified();
    fetchBankStatuses();
  }, [searchTerm, branchFilter, departmentFilter, designationFilter, statusFilter, employeeTypeFilter, shiftFilter, bankStatusFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setBranchFilter('ALL');
    setDepartmentFilter('ALL');
    setDesignationFilter('ALL');
    setStatusFilter('ALL');
    setEmployeeTypeFilter('ALL');
    setShiftFilter('ALL');
    setBankStatusFilter('ALL');
  };

  // Group employees by department for department-wise cards layout
  const displayedEmployees = employees.filter(emp => {
    if (bankStatusFilter === 'ALL') return true;
    const b = bankStatusMap[emp._id] || bankStatusMap[emp.employeeId] || bankStatusMap[emp.employeeCode];
    const status = b?.verificationStatus || 'Not Submitted';
    if (bankStatusFilter === 'Pending Review') {
      return status === 'Submitted' || status === 'Under Review' || status === 'Needs Re-Verification';
    }
    return status === bankStatusFilter;
  });

  const departmentGroups = displayedEmployees.reduce((groups, emp) => {
    const dept = emp.departmentName || emp.department || 'Operations';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(emp);
    return groups;
  }, {});

  // Archive Handler
  const handleArchive = async (emp) => {
    if (!window.confirm(`Archive employee ${emp.fullName || emp.firstName} (${emp.employeeId || emp.employeeCode})?`)) return;
    try {
      const res = await employeeAPI.updateStatus(emp._id, 'ARCHIVED', 'Archived by HR Admin');
      if (res.data && res.data.success) {
        showToast(`Employee ${emp.employeeId} has been archived.`, 'info', 'Archived');
        fetchEmployees(pagination.page);
      }
    } catch (err) {
      showToast(err.normalizedMessage || err.message, 'error', 'Error');
    }
  };

  // Single Dossier Excel Export
  const handleExportSingleExcel = async (emp) => {
    try {
      showToast(`Generating complete multi-sheet dossier for ${emp.employeeId}...`, 'info', 'Exporting Excel');
      const res = await employeeAPI.exportSingleExcel(emp._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BJK_Dossier_${emp.employeeId || 'Employee'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Dossier workbook downloaded successfully!', 'success', 'Downloaded');
    } catch (err) {
      showToast('Export error: ' + (err.normalizedMessage || err.message), 'error', 'Export Error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header with Master Actions (Requirement Section 2) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-bold uppercase tracking-wider text-[10px]">
              TECHNICAL WORKFORCE
            </span>
            <span>&bull;</span>
            <span>BJK DIGITAL BRAIN</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Technical Employee Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-bold font-mono">
              Technical Employees: {pagination.total} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Management of technical workforce and technical operations staff
          </p>
        </div>

        {/* Master Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Employee Button */}
          <button
            onClick={() => navigate('/hr/employees/create')}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>+ Add Technical Employee</span>
          </button>

          {/* Import Bulk */}
          <button
            onClick={() => {
              setBulkModalInitialMode('import');
              setIsBulkModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <FileSpreadsheet size={15} className="text-teal-600" />
            <span>Import Bulk</span>
          </button>

          {/* Export Excel Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              <Download size={14} className="text-teal-600" />
              <span>Export Excel ▼</span>
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-30 text-xs font-semibold space-y-1">
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    employeeAPI.exportBulkExcel({ filter: 'all', employeeCategory: 'TECHNICAL' });
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 flex items-center justify-between"
                >
                  <span>Export All Technical Employees</span>
                  <FileDown size={13} />
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    employeeAPI.exportBulkExcel({ filter: 'active', employeeCategory: 'TECHNICAL' });
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 flex items-center justify-between"
                >
                  <span>Export Active Technical Staff</span>
                  <CheckCircle2 size={13} />
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    employeeAPI.exportBulkExcel({ filter: 'former', employeeCategory: 'TECHNICAL' });
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-800 text-slate-700 flex items-center justify-between"
                >
                  <span>Export Former Technical Staff</span>
                  <Archive size={13} />
                </button>
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    setBulkModalInitialMode('export');
                    setIsBulkModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 border-t border-slate-100 pt-1.5"
                >
                  More Export Options...
                </button>
              </div>
            )}
          </div>

          {/* Quick ID Card Generator Button */}
          <button
            onClick={() => {
              if (employees.length > 0) {
                setSelectedIdCardEmployee(employees[0]);
              } else {
                showToast('Please select a technical employee first.', 'info', 'ID Card');
              }
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <ShieldCheck size={14} className="text-teal-400" />
            <span>Identity Card</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Department Cards Layout"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List Table Layout"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Unclassified Employee Classification Alert (Requirement 28 & 29) */}
      {unclassifiedEmployees.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950 flex items-center space-x-2">
                <span>{unclassifiedEmployees.length} Employee{unclassifiedEmployees.length > 1 ? 's' : ''} Requiring Classification</span>
                <span className="px-2 py-0.2 bg-amber-200 text-amber-900 rounded-md text-[10px] font-mono font-bold">Action Needed</span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Unclassified employee records are strictly isolated and hidden from directories until assigned to Technical Workforce or Non-Technical Staff.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowClassificationModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex-shrink-0 flex items-center space-x-1.5"
          >
            <ShieldAlert size={14} />
            <span>Classify Records ({unclassifiedEmployees.length})</span>
          </button>
        </div>
      )}

      {/* Search & Multi-Filter Control Bar (Requirement Section 2) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Technical Employee by Name, ID (e.g. BHK0146), Mobile, Designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Reset */}
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all"
            title="Reset Filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Branch Dropdown */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Branch: All</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Sanand">Sanand</option>
            <option value="Mumbai HQ">Mumbai HQ</option>
            <option value="Vadodara">Vadodara</option>
          </select>

          {/* Department Dropdown (Strictly Technical Departments) */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Department: All</option>
            <option value="Production Operations">Production Operations</option>
            <option value="Production & Manufacturing">Production & Manufacturing</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Regulatory Affairs">Regulatory Affairs</option>
            <option value="R&D Formulation">R&D Formulation</option>
            <option value="Warehouse & Logistics">Warehouse & Logistics</option>
            <option value="Plant Operations & Technical Directorate">Plant Operations & Directorate</option>
          </select>

          {/* Designation Dropdown */}
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Designation: All</option>
            <option value="Manager">Manager</option>
            <option value="Executive">Executive</option>
            <option value="Officer">Officer</option>
            <option value="Specialist">Specialist</option>
            <option value="Operator">Operator</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Assistant">Assistant</option>
            <option value="Staff">Staff</option>
          </select>

          {/* Employment Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="NOTICE_PERIOD">Notice Period</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="RESIGNED">Resigned</option>
          </select>

          {/* Employee Type Dropdown */}
          <select
            value={employeeTypeFilter}
            onChange={(e) => setEmployeeTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Type: All</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="PROBATION">Probation</option>
            <option value="INTERN">Intern</option>
          </select>

          {/* Shift Dropdown */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Shift: All</option>
            <option value="General Shift">General Shift</option>
            <option value="Morning Shift">Morning Shift</option>
            <option value="Afternoon Shift">Afternoon Shift</option>
            <option value="Night Shift">Night Shift</option>
          </select>

          {/* Bank Details Status Filter (Section 29 & 32) */}
          <select
            value={bankStatusFilter}
            onChange={(e) => setBankStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">Bank: All</option>
            <option value="Verified">Bank: Verified</option>
            <option value="Pending Review">Bank: Pending</option>
            <option value="Needs Correction">Bank: Correction</option>
            <option value="Not Submitted">Bank: Not Added</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: DEPARTMENT-WISE EMPLOYEE CARDS (Requirement Section 2) */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
                  <div className="h-8 bg-slate-100 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Users size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-extrabold text-base text-slate-800">No Employees Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No matching personnel found with the selected filter criteria. Try resetting filters or adding a new employee.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            Object.keys(departmentGroups).map((deptName) => (
              <div key={deptName} className="space-y-3">
                {/* Department Section Header Banner */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                      <Building2 size={15} />
                    </div>
                    <h3 className="font-black text-sm text-slate-900 tracking-tight">
                      {deptName}
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {departmentGroups[deptName].length}
                    </span>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {departmentGroups[deptName].map((emp) => {
                    const empCode = emp.employeeId || emp.employeeCode || 'BHK0000';
                    const empName = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Personnel';
                    const desig = emp.designationTitle || emp.designation || 'Specialist';
                    const branchName = emp.branch || emp.facility || 'Ahmedabad';
                    const initials = empName.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={emp._id}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                      >
                        {/* Status Pin */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                              {empCode}
                            </span>
                            {emp.isNonTechnical || emp.staffCategory === 'NON_TECHNICAL' ? (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                Non-Tech
                              </span>
                            ) : (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 border border-teal-200">
                                Tech
                              </span>
                            )}
                          </div>
                          <StatusBadge status={emp.status || 'ACTIVE'} />
                        </div>

                        {/* Card Center: Photo, Name & Designation */}
                        <div
                          className="flex flex-col items-center text-center cursor-pointer my-2"
                          onClick={() => setSelectedQuickViewEmployee(emp)}
                        >
                          {emp.photo || emp.profilePhoto || emp.profilePhotoUrl || emp.avatar ? (
                            <img
                              src={emp.photo || emp.profilePhoto || emp.profilePhotoUrl || emp.avatar}
                              alt={empName}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white group-hover:scale-105 transition-transform">
                              {initials}
                            </div>
                          )}

                          <h4 className="font-extrabold text-sm text-slate-900 mt-2.5 line-clamp-1 group-hover:text-teal-600 transition-colors">
                            {empName}
                          </h4>

                          <p className="text-xs font-semibold text-slate-600 line-clamp-1 mt-0.5">
                            {desig}
                          </p>

                          {/* Bank Details Status Badge (Section 29) */}
                          {(() => {
                            const b = bankStatusMap[emp._id] || bankStatusMap[emp.employeeId] || bankStatusMap[emp.employeeCode];
                            const vStatus = b?.verificationStatus || 'Not Submitted';
                            return (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/hr/employees/${emp._id}?tab=bank`);
                                }}
                                className={`mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer hover:opacity-85 transition-opacity ${
                                  vStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  vStatus === 'Submitted' || vStatus === 'Under Review' || vStatus === 'Needs Re-Verification' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                  vStatus === 'Needs Correction' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                                title="Click to view/verify employee bank details"
                              >
                                <CreditCard size={10} />
                                <span>Bank: {vStatus}</span>
                              </div>
                            );
                          })()}

                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                            <MapPin size={11} />
                            <span className="truncate">{branchName}</span>
                          </div>
                        </div>

                        {/* Card Bottom Actions (Quick View, Profile, Menu) */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs font-bold">
                          <button
                            onClick={() => setSelectedQuickViewEmployee(emp)}
                            className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 transition-colors text-center text-[11px]"
                          >
                            Quick View
                          </button>

                          <button
                            onClick={() => navigate(`/hr/employees/${emp._id}`)}
                            className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors text-center text-[11px]"
                          >
                            Profile
                          </button>

                          {/* Context Dropdown Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuCardId(activeMenuCardId === emp._id ? null : emp._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical size={15} />
                            </button>

                            {activeMenuCardId === emp._id && (
                              <div className="absolute right-0 bottom-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-20 text-[11px] font-semibold space-y-0.5 animate-in fade-in">
                                <button
                                  onClick={() => {
                                    setActiveMenuCardId(null);
                                    setSelectedIdCardEmployee(emp);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 flex items-center space-x-2"
                                >
                                  <ShieldCheck size={13} className="text-teal-600" />
                                  <span>Identity Card</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuCardId(null);
                                    navigate(`/hr/employees/${emp._id}?tab=bank`);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 flex items-center space-x-2"
                                >
                                  <CreditCard size={13} className="text-teal-600" />
                                  <span>Bank Details</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuCardId(null);
                                    setSelectedBusinessCardEmployee(emp);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 hover:text-purple-800 text-slate-700 flex items-center space-x-2"
                                >
                                  <CreditCard size={13} className="text-purple-600" />
                                  <span>Business Card</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuCardId(null);
                                    handleExportSingleExcel(emp);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 flex items-center space-x-2"
                                >
                                  <FileSpreadsheet size={13} className="text-emerald-600" />
                                  <span>Export Dossier</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuCardId(null);
                                    handleArchive(emp);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center space-x-2 border-t border-slate-100 pt-1"
                                >
                                  <Archive size={13} />
                                  <span>Archive Record</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: TABLE LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Employee Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Bank Status</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Official Mobile</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const empPhoto = emp.photo || emp.profilePhoto || emp.profilePhotoUrl || emp.avatar;
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-teal-700">
                        <div className="flex items-center space-x-1.5">
                          <span>{emp.employeeId || emp.employeeCode}</span>
                          {emp.isNonTechnical || emp.staffCategory === 'NON_TECHNICAL' ? (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Non-Tech
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 border border-teal-200">
                              Tech
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-3">
                          {empPhoto ? (
                            <img
                              src={empPhoto}
                              alt={emp.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs cursor-pointer hover:ring-2 hover:ring-teal-400 transition-all"
                              onClick={() => setSelectedQuickViewEmployee(emp)}
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs cursor-pointer"
                              onClick={() => setSelectedQuickViewEmployee(emp)}
                            >
                              {(emp.fullName || 'E').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div
                              className="hover:text-teal-600 cursor-pointer line-clamp-1"
                              onClick={() => setSelectedQuickViewEmployee(emp)}
                            >
                              {emp.fullName}
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                    <td className="p-3.5 text-slate-700 font-medium">{emp.departmentName}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{emp.designationTitle}</td>
                    <td className="p-3.5">
                      {(() => {
                        const b = bankStatusMap[emp._id] || bankStatusMap[emp.employeeId] || bankStatusMap[emp.employeeCode];
                        const vStatus = b?.verificationStatus || 'Not Submitted';
                        return (
                          <button
                            type="button"
                            onClick={() => navigate(`/hr/employees/${emp._id}?tab=bank`)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-opacity hover:opacity-80 ${
                              vStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              vStatus === 'Submitted' || vStatus === 'Under Review' || vStatus === 'Needs Re-Verification' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              vStatus === 'Needs Correction' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                            title="Click to view bank details"
                          >
                            {vStatus}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="p-3.5 text-slate-600">{emp.branch}</td>
                    <td className="p-3.5">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{emp.phone}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedQuickViewEmployee(emp)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Quick View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/hr/employees/${emp._id}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Full Profile"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleExportSingleExcel(emp)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Export Dossier"
                        >
                          <FileSpreadsheet size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONNECTED POPUP MODALS */}
      {/* ========================================================================= */}

      {/* 1. Employee Quick View Modal */}
      <EmployeeQuickViewModal
        isOpen={!!selectedQuickViewEmployee}
        onClose={() => setSelectedQuickViewEmployee(null)}
        employee={selectedQuickViewEmployee}
        onOpenIdCard={(emp) => setSelectedIdCardEmployee(emp)}
        onOpenBusinessCard={(emp) => setSelectedBusinessCardEmployee(emp)}
      />

      {/* 2. Employee Identity Card Generator Modal */}
      <EmployeeIdCardModal
        isOpen={!!selectedIdCardEmployee}
        onClose={() => setSelectedIdCardEmployee(null)}
        employee={selectedIdCardEmployee}
        onCardUpdated={() => fetchEmployees(pagination.page)}
      />

      {/* 3. Employee Digital Business Card Modal */}
      <EmployeeBusinessCardModal
        isOpen={!!selectedBusinessCardEmployee}
        onClose={() => setSelectedBusinessCardEmployee(null)}
        employee={selectedBusinessCardEmployee}
      />

      {/* 4. Bulk Upload & Excel Import/Export Modal */}
      <EmployeeBulkImportExportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        initialMode={bulkModalInitialMode}
        onImportComplete={() => fetchEmployees(1)}
      />

      {/* 5. Classification Modal for Unclassified Records (Requirement 28 & 29) */}
      {showClassificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Employees Requiring Classification</h3>
                  <p className="text-xs text-slate-400">Classify unassigned records into Technical or Non-Technical workforce</p>
                </div>
              </div>
              <button
                onClick={() => setShowClassificationModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              {unclassifiedEmployees.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-sm text-slate-800">All Employees Are Classified!</p>
                  <p className="text-xs text-slate-400 mt-1">No unclassified records found in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Employee ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Designation</th>
                        <th className="p-3">Current Category</th>
                        <th className="p-3 text-right">Required Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unclassifiedEmployees.map((emp) => (
                        <tr key={emp._id || emp.employeeId} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-800">{emp.employeeId || emp.employeeCode}</td>
                          <td className="p-3 font-semibold text-slate-900">{emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}</td>
                          <td className="p-3 text-slate-600">{emp.departmentName || emp.department || 'General'}</td>
                          <td className="p-3 text-slate-600">{emp.designationTitle || emp.designation || 'Staff'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Unclassified
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleClassify(emp._id || emp.employeeId, 'TECHNICAL')}
                              disabled={classifyingId === (emp._id || emp.employeeId)}
                              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                            >
                              Technical
                            </button>
                            <button
                              onClick={() => handleClassify(emp._id || emp.employeeId, 'NON_TECHNICAL')}
                              disabled={classifyingId === (emp._id || emp.employeeId)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                            >
                              Non-Technical
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowClassificationModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
