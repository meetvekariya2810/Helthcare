import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Network,
  Building2,
  Users,
  ShieldCheck,
  Plus,
  ChevronRight,
  FolderTree,
  Building
} from 'lucide-react';

export const Organization = () => {
  const { showToast } = useNotification();
  const [departments, setDepartments] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [activeView, setActiveView] = useState('departments'); // 'departments' | 'tree'
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    facility: 'BJK Unit 1 - Formulations Facility',
    division: 'Manufacturing Operations',
    description: '',
    complianceRequirements: 'GMP, Cleanroom'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [deptRes, hierRes] = await Promise.all([
        hrmsAPI.getDepartments(),
        hrmsAPI.getHierarchyTree()
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
      if (hierRes.data.success) setHierarchy(hierRes.data.tree);
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback departments:', err.message);
      setDepartments([
        {
          _id: 'd-1',
          name: 'Quality Assurance',
          code: 'QA',
          facility: 'BJK Unit 1 - Formulations Facility',
          division: 'Quality & Regulatory',
          employeeCount: 6,
          complianceRequirements: ['GMP', 'Data Integrity', 'ISO 9001'],
          description: 'Quality systems oversight, validation, documentation & audit compliance.'
        },
        {
          _id: 'd-2',
          name: 'Quality Control',
          code: 'QC',
          facility: 'BJK Unit 1 - Formulations Facility',
          division: 'Quality & Regulatory',
          employeeCount: 12,
          complianceRequirements: ['GLP', 'GMP', 'Data Integrity'],
          description: 'Analytical testing, microbial evaluation, HPLC and raw material release.'
        },
        {
          _id: 'd-3',
          name: 'Production Operations',
          code: 'PROD',
          facility: 'BJK Unit 1 - Formulations Facility',
          division: 'Manufacturing Operations',
          employeeCount: 28,
          complianceRequirements: ['GMP', 'Cleanroom Protocols', 'Safety EHS'],
          description: 'Solid oral dosage, tablet compression, coating & liquid filling lines.'
        },
        {
          _id: 'd-4',
          name: 'Regulatory Affairs',
          code: 'RA',
          facility: 'BJK Corporate Headquarters',
          division: 'Compliance',
          employeeCount: 4,
          complianceRequirements: ['Regulatory Submissions', 'ICH Guidelines'],
          description: 'Dossier preparation, WHO-GMP, USFDA filings and pharmacovigilance.'
        },
        {
          _id: 'd-5',
          name: 'Human Resources',
          code: 'HR',
          facility: 'BJK Corporate Headquarters',
          division: 'Corporate Administration',
          employeeCount: 5,
          complianceRequirements: ['Labor Law', 'Statutory Compliance'],
          description: 'Workforce intelligence, talent acquisition, payroll, training academy.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDept,
        complianceRequirements: newDept.complianceRequirements.split(',').map(s => s.trim())
      };
      const res = await hrmsAPI.createDepartment(payload);
      if (res.data.success) {
        showToast('Department registered successfully', 'success', 'Success');
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Organizational Structure</h1>
            <span className="text-xs font-bold text-bjk-teal bg-bjk-teal/10 px-2.5 py-0.5 rounded-full">
              {departments.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise structural hierarchy: Company &rarr; Facility &rarr; Department &rarr; Division &rarr; Team &rarr; Designation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveView('departments')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'departments' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveView('tree')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'tree' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Hierarchy Tree
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Plus size={15} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Content View */}
      {activeView === 'departments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm bjk-card-glow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-bjk-teal bg-bjk-teal/10 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400 text-xs">
                    <Users size={14} />
                    <span className="font-bold text-slate-700">{dept.employeeCount || 0}</span>
                    <span>Staff</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{dept.division}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {dept.description || 'Core pharmaceutical operational unit.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Mandatory Compliance
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.complianceRequirements?.map((req, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[180px]">{dept.facility.split(' - ')[0]}</span>
                <span className="text-bjk-teal font-semibold text-[11px]">Active Unit</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
            <FolderTree size={20} className="text-bjk-teal" />
            <h3 className="text-sm font-bold text-slate-900">Organizational Placement Graph</h3>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-black text-slate-900">
              <Building size={18} className="text-bjk-teal" />
              <span>BJK Healthcare Digital Brain (Holding Group)</span>
            </div>

            <div className="pl-6 border-l-2 border-slate-200 space-y-3">
              {[
                'BJK Unit 1 - Formulations Facility',
                'BJK Unit 2 - API Manufacturing Facility',
                'BJK Unit 3 - R&D Center of Excellence',
                'BJK Corporate Headquarters',
                'BJK Central Warehouse & Logistics Hub'
              ].map((fac, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <Building2 size={14} className="text-slate-400" />
                    <span>{fac}</span>
                  </div>
                  <div className="pl-5 text-xs text-slate-500">
                    &bull; Allocated operational personnel, certified cleanrooms & quality oversight teams
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Operational Department"
        subtitle="Expand the organizational hierarchy of BJK Healthcare Digital Brain"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                placeholder="e.g. Microbiology Lab"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
              <input
                type="text"
                required
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MICRO"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facility *</label>
              <select
                value={newDept.facility}
                onChange={(e) => setNewDept({ ...newDept, facility: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              >
                <option value="BJK Unit 1 - Formulations Facility">BJK Unit 1 - Formulations Facility</option>
                <option value="BJK Unit 2 - API Manufacturing Facility">BJK Unit 2 - API Manufacturing Facility</option>
                <option value="BJK Unit 3 - R&D Center of Excellence">BJK Unit 3 - R&D Center of Excellence</option>
                <option value="BJK Corporate Headquarters">BJK Corporate Headquarters</option>
                <option value="BJK Central Warehouse & Logistics Hub">BJK Central Warehouse & Logistics Hub</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
              <input
                type="text"
                value={newDept.division}
                onChange={(e) => setNewDept({ ...newDept, division: e.target.value })}
                placeholder="Operations / Compliance / QA"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Compliance Requirements (comma separated)</label>
            <input
              type="text"
              value={newDept.complianceRequirements}
              onChange={(e) => setNewDept({ ...newDept, complianceRequirements: e.target.value })}
              placeholder="GMP, GLP, Cleanroom B"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              placeholder="Scope of work and responsibilities..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
