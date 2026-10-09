import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SetupDepartments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('Ahmedabad Branch');
  const [isReordering, setIsReordering] = useState(false);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMultiAddModal, setShowMultiAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState(null);

  // Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    facility: 'Ahmedabad Branch',
    branch: 'Ahmedabad Branch',
    division: 'Operations',
    description: ''
  });

  const [multiDeptText, setMultiDeptText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

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

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/hrms/organization/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.departments)) {
        // Sort by order or name
        const sorted = data.departments.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setDepartments(sorted);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      showToast('Failed to load departments from database', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;

    try {
      const isEdit = Boolean(editingDept);
      const url = isEdit
        ? `/api/hrms/organization/departments/${editingDept._id}`
        : '/api/hrms/organization/departments';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...deptForm,
          code: deptForm.code.trim() || deptForm.name.substring(0, 4).toUpperCase(),
          facility: selectedBranch,
          branch: selectedBranch
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Department "${deptForm.name}" ${isEdit ? 'updated' : 'added'} successfully.`);
        setShowAddModal(false);
        setEditingDept(null);
        setDeptForm({ name: '', code: '', facility: selectedBranch, branch: selectedBranch, division: 'Operations', description: '' });
        fetchDepartments();
      } else {
        showToast(data.message || 'Error saving department', true);
      }
    } catch (err) {
      showToast('Network error saving department', true);
    }
  };

  const handleMultiAdd = async (e) => {
    e.preventDefault();
    const lines = multiDeptText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    try {
      let added = 0;
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const code = parts[1] || name.substring(0, 4).toUpperCase();
        if (!name) continue;

        await fetch('/api/hrms/organization/departments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            code,
            facility: selectedBranch,
            branch: selectedBranch,
            order: departments.length + added
          })
        });
        added++;
      }

      showToast(`Added ${added} departments successfully.`);
      setShowMultiAddModal(false);
      setMultiDeptText('');
      fetchDepartments();
    } catch (err) {
      showToast('Error adding multiple departments', true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmDept) return;
    try {
      const res = await fetch(`/api/hrms/organization/departments/${deleteConfirmDept._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Department "${deleteConfirmDept.name}" deleted.`);
        setDeleteConfirmDept(null);
        fetchDepartments();
      } else {
        showToast(data.message || 'Error deleting department', true);
      }
    } catch (err) {
      showToast('Network error deleting department', true);
    }
  };

  const moveDepartment = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= departments.length) return;
    const updated = [...departments];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setDepartments(updated);
  };

  const saveOrder = async () => {
    try {
      const orderedIds = departments.map(d => d._id);
      const res = await fetch('/api/hrms/organization/departments/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderedIds })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Department order updated successfully.');
        setIsReordering(false);
      }
    } catch (err) {
      showToast('Error saving order', true);
    }
  };

  const branchDepartments = departments.filter(d => {
    if (!selectedBranch) return true;
    return (d.branch || d.facility || 'Ahmedabad Branch').toLowerCase().includes('ahmedabad');
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-semibold transition-all ${
            toastMessage.isError ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toastMessage.isError ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise organizational hierarchy, facility departments, and sub-units.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (isReordering) {
                saveOrder();
              } else {
                setIsReordering(true);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-sm ${
              isReordering
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <ArrowUpDown size={14} />
            <span>{isReordering ? 'SAVE ORDER' : 'CHANGE ORDER'}</span>
          </button>

          <button
            onClick={() => setShowMultiAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>+ ADD MULTIPLE DEPARTMENTS</span>
          </button>
        </div>
      </div>

      {/* Branch Accordion Card matching Screenshot 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Branch Title Bar */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AHMEDABAD BRANCH
            </span>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-800 text-white">
              {branchDepartments.length}
            </span>
          </div>

          <button
            onClick={() => {
              setEditingDept(null);
              setDeptForm({
                name: '',
                code: '',
                facility: selectedBranch,
                branch: selectedBranch,
                division: 'Operations',
                description: ''
              });
              setShowAddModal(true);
            }}
            className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-2xs flex items-center space-x-1"
          >
            <Plus size={13} className="text-bjk-teal" />
            <span>+ ADD</span>
          </button>
        </div>

        {/* Departments List matching Screenshot 2 */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading departments...</div>
          ) : branchDepartments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No departments configured for this branch.</div>
          ) : (
            branchDepartments.map((dept, idx) => (
              <div
                key={dept._id || idx}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  {isReordering && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveDepartment(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveDepartment(idx, 1)}
                        disabled={idx === branchDepartments.length - 1}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  )}

                  <span className="text-xs font-semibold text-slate-800">
                    {dept.name}
                  </span>

                  {dept.code && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {dept.code}
                    </span>
                  )}

                  {dept.subDepartments?.length > 0 && (
                    <span className="text-[10px] font-medium text-slate-400">
                      ({dept.subDepartments.length} sub-depts)
                    </span>
                  )}
                </div>

                {/* Edit & Delete Action Buttons matching Screenshot 2 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingDept(dept);
                      setDeptForm({
                        name: dept.name,
                        code: dept.code || '',
                        facility: dept.facility || selectedBranch,
                        branch: dept.branch || selectedBranch,
                        division: dept.division || 'Operations',
                        description: dept.description || ''
                      });
                      setShowAddModal(true);
                    }}
                    className="w-8 h-8 rounded-lg bg-[#00A896] hover:bg-[#009B8D] text-white flex items-center justify-center transition-all shadow-xs"
                    title="Edit Department"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmDept(dept)}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center transition-all shadow-xs"
                    title="Delete Department"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Quality Assurance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. QA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium uppercase focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facility / Branch
                </label>
                <select
                  value={deptForm.branch}
                  onChange={(e) => setDeptForm({ ...deptForm, branch: e.target.value, facility: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                >
                  <option value="Ahmedabad Branch">Ahmedabad Branch</option>
                  <option value="Survey No. 1248 Lavad Plant">Survey No. 1248 Lavad Plant</option>
                  <option value="BJK Corporate Headquarters">BJK Corporate Headquarters</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Optional notes or scope"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white text-xs font-bold shadow-md shadow-bjk-teal/20"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Multiple Departments Modal */}
      {showMultiAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Multiple Departments</h3>
              <button
                onClick={() => setShowMultiAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMultiAdd} className="space-y-4 mt-4">
              <p className="text-xs text-slate-500">
                Enter one department per line. Optionally append code with a comma: <br />
                <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Department Name, CODE</code>
              </p>

              <textarea
                rows={6}
                required
                value={multiDeptText}
                onChange={(e) => setMultiDeptText(e.target.value)}
                placeholder={"HR & Admin, HRA\nEngineering, ENG\nProduction, PROD\nPurchase & SCM, PSCM"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
              />

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMultiAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white text-xs font-bold shadow-md shadow-bjk-teal/20"
                >
                  Add All Departments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Department</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate <strong className="text-slate-900">{deleteConfirmDept.name}</strong>?
              Employees in this department will remain intact.
            </p>
            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                onClick={() => setDeleteConfirmDept(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupDepartments;
