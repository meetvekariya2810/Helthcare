import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrmsAPI, employeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Download,
  UploadCloud,
  Building2,
  ChevronRight,
  Eye,
  Trash2,
  Power,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  X,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

export const NonTechnicalEmployees = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [newStaff, setNewStaff] = useState({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    mobile: '',
    email: '',
    department: 'Administration',
    designation: 'Office Assistant',
    employmentType: 'Full Time',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pinCode: ''
  });

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
        showToast('success', res.data.message || `Classified as ${targetCategory}`);
        fetchUnclassified();
        fetchEmployees();
      }
    } catch (err) {
      showToast('error', err.normalizedMessage || err.message);
    } finally {
      setClassifyingId(null);
    }
  };

  const fetchEmployees = async () => {
    try {
      setRefreshing(true);
      const res = await hrmsAPI.getNonTechnicalStaff();
      if (res.data?.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load non-technical staff:', err);
      showToast('error', 'Failed to load non-technical staff directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchUnclassified();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.employeeId.trim() || !newStaff.firstName.trim()) {
      showToast('warning', 'Employee ID and First Name are required');
      return;
    }

    try {
      setSavingEmployee(true);
      const res = await hrmsAPI.createNonTechnicalStaff(newStaff);
      if (res.data?.success) {
        showToast('success', res.data.message || 'Non-Technical Staff created successfully');
        setIsAddModalOpen(false);
        setNewStaff({
          employeeId: '',
          firstName: '',
          middleName: '',
          lastName: '',
          gender: 'Male',
          mobile: '',
          email: '',
          department: 'Administration',
          designation: 'Office Assistant',
          employmentType: 'Full Time',
          joiningDate: new Date().toISOString().split('T')[0],
          address: '',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pinCode: ''
        });
        fetchEmployees();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create non-technical employee');
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleDeleteStaff = async (empId) => {
    if (!window.confirm(`Are you sure you want to delete non-technical staff record ${empId}?`)) {
      return;
    }
    try {
      const res = await hrmsAPI.deleteNonTechnicalStaff(empId);
      if (res.data?.success) {
        showToast('success', res.data.message || 'Staff record deleted');
        fetchEmployees();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete record');
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.departmentName || e.department).filter(Boolean)));

  const filteredEmployees = employees.filter(emp => {
    const dept = emp.departmentName || emp.department || 'General';
    const status = emp.status || 'ACTIVE';
    const matchesDept = departmentFilter === 'ALL' || dept === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.mobile?.includes(searchQuery);
    return matchesDept && matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    if (filteredEmployees.length === 0) {
      showToast('warning', 'No non-technical staff to export');
      return;
    }
    const headers = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Employment Type', 'Joining Date', 'Mobile', 'Status'];
    const rows = filteredEmployees.map(e => [
      e.employeeId,
      `"${e.fullName || `${e.firstName || ''} ${e.lastName || ''}`.trim()}"`,
      `"${e.departmentName || e.department || 'General'}"`,
      `"${e.designation || 'Staff'}"`,
      `"${e.employmentType || 'Full Time'}"`,
      e.joiningDate ? new Date(e.joiningDate).toISOString().split('T')[0] : '--',
      `"${e.mobile || '--'}"`,
      e.status || 'ACTIVE'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BJK_Non_Technical_Staff_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider text-[10px]">
                  NON-TECHNICAL WORKFORCE
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Non-Technical Staff</h1>
              <p className="text-xs text-slate-500 font-medium">Isolated management of non-technical workers (Administration, Housekeeping, Security, Drivers, Helpers, Support)</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchEmployees}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009383] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus size={14} />
            <span>+ Add Non-Technical Staff</span>
          </button>
        </div>
      </div>

      {/* Unclassified Employee Classification Alert (Requirement 28 & 29) */}
      {unclassifiedEmployees.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, ID, mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Non-Technical Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Non-Technical Staff: <span className="text-slate-900 font-extrabold">{filteredEmployees.length}</span> records
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Employee ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Designation</th>
                <th className="py-2.5 px-4">Joining Date</th>
                <th className="py-2.5 px-4">Mobile</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    Loading non-technical staff directory...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No Non-Technical Staff Added Yet</p>
                    <p className="text-xs text-slate-400 mt-1">General technical employees are erased from this isolated view. Click below to add non-technical staff.</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#00A896] text-white text-xs font-bold"
                    >
                      + Add First Non-Technical Employee
                    </button>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id || emp.employeeId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800 font-mono">{emp.employeeId}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{emp.departmentName || emp.department || 'Administration'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{emp.designation || 'Staff'}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                      {emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '--'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">{emp.mobile || '--'}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {emp.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <Link
                          to={`/hrms/employees/${emp.employeeId || emp._id}`}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="View Profile"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => handleDeleteStaff(emp.employeeId)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
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

      {/* Add Non-Technical Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Add Non-Technical Staff</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NT-101"
                    value={newStaff.employeeId}
                    onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newStaff.lastName}
                    onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Accounts Support">Accounts Support</option>
                    <option value="Reception">Reception</option>
                    <option value="Security">Security</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Dispatch">Dispatch</option>
                    <option value="Drivers">Drivers</option>
                    <option value="Helpers">Helpers</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Store Support">Store Support</option>
                    <option value="Facility Management">Facility Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Security Guard / Driver"
                    value={newStaff.designation}
                    onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Employment Type</label>
                  <select
                    value={newStaff.employmentType}
                    onChange={(e) => setNewStaff({ ...newStaff, employmentType: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Trainee">Trainee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={newStaff.mobile}
                    onChange={(e) => setNewStaff({ ...newStaff, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender</label>
                  <select
                    value={newStaff.gender}
                    onChange={(e) => setNewStaff({ ...newStaff, gender: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={newStaff.joiningDate}
                    onChange={(e) => setNewStaff({ ...newStaff, joiningDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={savingEmployee}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEmployee}
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009383] text-white text-xs font-bold shadow-xs disabled:opacity-40"
                >
                  {savingEmployee ? 'Creating...' : 'Save Non-Technical Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Classification Modal for Unclassified Records (Requirement 28 & 29) */}
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

export default NonTechnicalEmployees;
