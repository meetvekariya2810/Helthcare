import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUpDown,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SetupSubDepartments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('Ahmedabad');

  // Modals
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showMultiAddModal, setShowMultiAddModal] = useState(false);
  const [targetDept, setTargetDept] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [deleteConfirmSub, setDeleteConfirmSub] = useState(null);

  // Form State
  const [subForm, setSubForm] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [multiSubText, setMultiSubText] = useState('');
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
        const sorted = data.departments.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setDepartments(sorted);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      showToast('Failed to load sub-departments', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSaveSubDepartment = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !targetDept) return;

    try {
      const isEdit = Boolean(editingSub);
      const url = isEdit
        ? `/api/hrms/organization/departments/${targetDept._id}/sub-departments/${editingSub._id}`
        : `/api/hrms/organization/departments/${targetDept._id}/sub-departments`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: subForm.name.trim(),
          code: subForm.code.trim() || subForm.name.substring(0, 4).toUpperCase(),
          description: subForm.description.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Sub-department "${subForm.name}" ${isEdit ? 'updated' : 'added'} successfully.`);
        setShowAddSubModal(false);
        setEditingSub(null);
        setSubForm({ name: '', code: '', description: '' });
        fetchDepartments();
      } else {
        showToast(data.message || 'Error saving sub-department', true);
      }
    } catch (err) {
      showToast('Network error saving sub-department', true);
    }
  };

  const handleDeleteSubDepartment = async () => {
    if (!deleteConfirmSub || !deleteConfirmSub.deptId || !deleteConfirmSub.subId) return;

    try {
      const res = await fetch(
        `/api/hrms/organization/departments/${deleteConfirmSub.deptId}/sub-departments/${deleteConfirmSub.subId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast('Sub-department deleted successfully.');
        setDeleteConfirmSub(null);
        fetchDepartments();
      } else {
        showToast(data.message || 'Error deleting sub-department', true);
      }
    } catch (err) {
      showToast('Network error deleting sub-department', true);
    }
  };

  const handleMultiAddSub = async (e) => {
    e.preventDefault();
    if (!targetDept) return;
    const lines = multiSubText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    try {
      let count = 0;
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const code = parts[1] || name.substring(0, 4).toUpperCase();
        if (!name) continue;

        await fetch(`/api/hrms/organization/departments/${targetDept._id}/sub-departments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, code })
        });
        count++;
      }

      showToast(`Added ${count} sub-departments to ${targetDept.name}.`);
      setShowMultiAddModal(false);
      setMultiSubText('');
      fetchDepartments();
    } catch (err) {
      showToast('Error adding multiple sub-departments', true);
    }
  };

  const branchDepartments = departments.filter(d => {
    if (!selectedBranch) return true;
    return (d.branch || d.facility || 'Ahmedabad').toLowerCase().includes('ahmedabad');
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

      {/* Top Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sub-department</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure sub-units, functional teams, and specialized divisions under each department.
          </p>
        </div>

        <button
          onClick={() => {
            if (departments.length > 0) {
              setTargetDept(departments[0]);
              setShowMultiAddModal(true);
            } else {
              showToast('Please add departments first', true);
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>+ ADD MULTIPLE SUBJECT DEPARTMENTS</span>
        </button>
      </div>

      {/* Branch Indicator Header matching Screenshot 3 */}
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide px-1">
        <span>Ahmedabad ({branchDepartments.length})</span>
      </div>

      {/* Responsive Grid of Department Cards matching Screenshot 3 */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading sub-departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {branchDepartments.map((dept) => {
            const subDepts = dept.subDepartments || [];
            return (
              <div
                key={dept._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col transition-all hover:border-slate-300"
              >
                {/* Card Header matching Screenshot 3 */}
                <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
                      {dept.name}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-800 text-white">
                      {subDepts.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Orange sort/reorder button */}
                    <button
                      className="w-7 h-7 rounded-lg bg-[#F77F00] hover:bg-[#E57200] text-white flex items-center justify-center transition-all shadow-2xs"
                      title="Reorder"
                    >
                      <ArrowUpDown size={13} />
                    </button>

                    {/* Add sub-department button */}
                    <button
                      onClick={() => {
                        setTargetDept(dept);
                        setEditingSub(null);
                        setSubForm({ name: '', code: '', description: '' });
                        setShowAddSubModal(true);
                      }}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition-all shadow-2xs"
                      title="Add Sub-department"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Body: List of Sub-departments or Empty State */}
                <div className="p-3 flex-1 flex flex-col justify-center divide-y divide-slate-100 min-h-[90px]">
                  {subDepts.length === 0 ? (
                    <div className="py-4 text-center text-xs font-medium text-slate-400">
                      No sub-department added
                    </div>
                  ) : (
                    subDepts.map((sub) => (
                      <div
                        key={sub._id}
                        className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-800">
                            {sub.name}
                          </span>
                          {sub.code && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              {sub.code}
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons matching Screenshot 3 */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setTargetDept(dept);
                              setEditingSub(sub);
                              setSubForm({
                                name: sub.name,
                                code: sub.code || '',
                                description: sub.description || ''
                              });
                              setShowAddSubModal(true);
                            }}
                            className="w-7 h-7 rounded-md bg-[#00A896] hover:bg-[#009B8D] text-white flex items-center justify-center transition-all shadow-2xs"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteConfirmSub({
                                deptId: dept._id,
                                subId: sub._id,
                                name: sub.name,
                                deptName: dept.name
                              });
                            }}
                            className="w-7 h-7 rounded-md bg-white hover:bg-rose-50 border border-rose-300 text-rose-600 flex items-center justify-center transition-all shadow-2xs"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Sub-department Modal */}
      {showAddSubModal && targetDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bjk-teal">
                  Department: {targetDept.name}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {editingSub ? 'Edit Sub-department' : 'Add Sub-department'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddSubModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubDepartment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sub-department Name *
                </label>
                <input
                  type="text"
                  required
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  placeholder="e.g. Electrical / HR / Microbiology"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sub-department Code
                </label>
                <input
                  type="text"
                  value={subForm.code}
                  onChange={(e) => setSubForm({ ...subForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ELEC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium uppercase focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={subForm.description}
                  onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                  placeholder="Optional operational details"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white text-xs font-bold shadow-md shadow-bjk-teal/20"
                >
                  {editingSub ? 'Update Sub-department' : 'Add Sub-department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Multiple Sub-departments Modal */}
      {showMultiAddModal && targetDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add Multiple Sub-departments
              </h3>
              <button
                onClick={() => setShowMultiAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMultiAddSub} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Department
                </label>
                <select
                  value={targetDept._id}
                  onChange={(e) => {
                    const found = departments.find(d => d._id === e.target.value);
                    if (found) setTargetDept(found);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-bjk-teal/40"
                >
                  {branchDepartments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-slate-500">
                Enter one sub-department per line: <br />
                <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Sub-department Name, CODE</code>
              </p>

              <textarea
                rows={5}
                required
                value={multiSubText}
                onChange={(e) => setMultiSubText(e.target.value)}
                placeholder={"HR, HR\nAdmin, ADM"}
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
                  Add Sub-departments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Sub-department</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{deleteConfirmSub.name}</strong> from {deleteConfirmSub.deptName}?
            </p>
            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                onClick={() => setDeleteConfirmSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubDepartment}
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

export default SetupSubDepartments;
