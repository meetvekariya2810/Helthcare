import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, ShieldCheck, CheckCircle2, XCircle, Search, Filter, Edit3, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HRDepartments = () => {
  const { user: currentUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDeptEmployees, setSelectedDeptEmployees] = useState(null);
  const [deptEmployeesList, setDeptEmployeesList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    code: '',
    division: 'Operations',
    description: '',
    headOfDepartmentName: ''
  });

  const token =
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    sessionStorage.getItem('bjk_auth_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    localStorage.getItem('bjk_auth_token') ||
    localStorage.getItem('token') ||
    '';

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/hr/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const url = editingDept ? `/api/hr/departments/${editingDept._id}` : '/api/hr/departments';
      const method = editingDept ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingDept(null);
        setForm({ name: '', code: '', division: 'Operations', description: '', headOfDepartmentName: '' });
        setMessage(`Department ${editingDept ? 'updated' : 'created'} successfully.`);
        fetchDepartments();
      } else {
        setError(data.message || 'Failed to save department.');
      }
    } catch (err) {
      setError('Network error saving department.');
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      const res = await fetch(`/api/hr/departments/${dept._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !dept.isActive })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Department [${dept.name}] status updated.`);
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewEmployees = async (dept) => {
    setSelectedDeptEmployees(dept);
    try {
      const res = await fetch(`/api/hr/departments/${dept._id}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeptEmployeesList(data.employees || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isHR = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'].includes(currentUser?.role);

  const filtered = departments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.code.toLowerCase().includes(search.toLowerCase());
    const matchesDiv = divisionFilter === 'ALL' || d.division === divisionFilter;
    return matchesSearch && matchesDiv;
  });

  const divisions = Array.from(new Set(departments.map(d => d.division).filter(Boolean)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Building2 className="text-teal-600" />
            <span>Department Master & Organizational Hierarchy</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage enterprise operational divisions, department heads, designated managers, and workforce boundaries.
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => {
              setEditingDept(null);
              setForm({ name: '', code: '', division: 'Operations', description: '', headOfDepartmentName: '' });
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all flex-shrink-0"
          >
            <Plus size={15} />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-2xl flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-2xl flex items-center space-x-2">
          <XCircle size={16} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments or codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Divisions ({departments.length})</option>
            {divisions.map((div, idx) => (
              <option key={idx} value={div}>{div}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(dept => (
          <div key={dept._id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{dept.name}</h3>
                  <span className="text-[11px] text-teal-600 font-semibold">{dept.division || 'Operations'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dept.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                  {dept.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {dept.description || 'Enterprise department unit operating under BJK Healthcare cGMP governance.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Head of Dept:</span>
                <span className="font-bold text-slate-900">{dept.headOfDepartmentName || dept.headOfDepartment?.fullName || 'Directorate'}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Total Workforce:</span>
                <span className="font-bold text-teal-700">{dept.totalEmployees || 0} Employees</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Active Operators:</span>
                <span className="font-semibold text-emerald-600">{dept.activeEmployees || 0} Active</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleViewEmployees(dept)}
                  className="text-xs text-teal-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>View Staff</span>
                  <ArrowRight size={12} />
                </button>

                {isHR && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setForm({
                          name: dept.name,
                          code: dept.code,
                          division: dept.division || 'Operations',
                          description: dept.description || '',
                          headOfDepartmentName: dept.headOfDepartmentName || ''
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                      title="Edit Department"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(dept)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${dept.isActive ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'}`}
                    >
                      {dept.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingDept ? 'Edit Department' : 'Create New Department'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEPT-QA"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Division</label>
                <input
                  type="text"
                  placeholder="e.g. Quality & Compliance"
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Head of Department (Name / Title)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anita Desai"
                  value={form.headOfDepartmentName}
                  onChange={(e) => setForm({ ...form, headOfDepartmentName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Mandate</label>
                <textarea
                  rows={3}
                  placeholder="Department operational scope and compliance mandate..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff View Modal */}
      {selectedDeptEmployees && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedDeptEmployees.name} Workforce</h3>
                <p className="text-xs text-slate-500">{deptEmployeesList.length} assigned team members</p>
              </div>
              <button
                onClick={() => setSelectedDeptEmployees(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {deptEmployeesList.length > 0 ? (
                deptEmployeesList.map(emp => (
                  <div key={emp._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{emp.fullName}</h4>
                      <p className="text-[11px] text-slate-500">{emp.designationTitle} &bull; {emp.employeeId}</p>
                    </div>
                    <span className="font-semibold text-slate-700">{emp.workEmail || emp.email}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No employees assigned directly to this department yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDepartments;
