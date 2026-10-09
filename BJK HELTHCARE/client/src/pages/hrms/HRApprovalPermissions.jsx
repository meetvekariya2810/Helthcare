import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { credentialsAPI } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Sliders,
  Check,
  X,
  Lock,
  RefreshCw,
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export const HRApprovalPermissions = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotification();

  const [templates, setTemplates] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApprovalKey, setSelectedApprovalKey] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [tRes, cRes] = await Promise.all([
        credentialsAPI.getTemplates(),
        credentialsAPI.getAll({ limit: 100 })
      ]);

      if (tRes.data?.success) setTemplates(tRes.data);
      if (cRes.data?.success) setEmployees(cRes.data.data || []);
      if (tRes.data?.approvals?.length > 0) {
        setSelectedApprovalKey(tRes.data.approvals[0].key);
      }
    } catch (err) {
      console.error('[HR Approval Permissions] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const approvals = templates?.approvals || [];
  const filteredApprovals = approvals.filter(a => {
    if (activeModule !== 'ALL' && a.module !== activeModule) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.key.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedApprovalObj = approvals.find(a => a.key === selectedApprovalKey);

  // List of employees who currently have this approval
  const authorizedEmployees = employees.filter(emp =>
    emp.approvalPermissions?.includes(selectedApprovalKey)
  );

  // Toggle approval for an employee
  const handleToggleApproval = async (emp, shouldGrant) => {
    try {
      setIsUpdating(true);
      const currentApprovals = emp.approvalPermissions || [];
      const updatedApprovals = shouldGrant
        ? [...currentApprovals, selectedApprovalKey]
        : currentApprovals.filter(k => k !== selectedApprovalKey);

      // Get full user detail to preserve accessConfig
      const detailRes = await credentialsAPI.getById(emp._id || emp.id);
      if (detailRes.data?.success) {
        const fullDetail = detailRes.data;
        const cfg = fullDetail.accessConfig || {};
        cfg.approvalPermissions = updatedApprovals;

        await credentialsAPI.updatePermissions(emp._id || emp.id, {
          accessConfig: cfg,
          approvalPermissions: updatedApprovals,
          reason: `HR ${shouldGrant ? 'granted' : 'revoked'} approval [${selectedApprovalKey}] for ${emp.name}`
        });

        showToast(
          `Approval ${shouldGrant ? 'granted to' : 'revoked from'} ${emp.name}.`,
          'success'
        );

        // Update local state
        setEmployees(prev =>
          prev.map(item =>
            item._id === emp._id
              ? { ...item, approvalPermissions: updatedApprovals, approvalCount: updatedApprovals.length }
              : item
          )
        );
      }
    } catch (err) {
      showToast('Failed to update approval responsibility.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300 text-xs">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Governance & Sign-Offs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">BJK-APPR-2026</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Approval Permissions Matrix
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              HR central configuration for designated sign-off responsibilities across Production, QC, QA, Regulatory, Finance, and HR.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInitialData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            title="Refresh Approvals"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid: Approvals List & Authorized Approvers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Module Filter & Approval Types List */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center space-x-2">
              <ShieldCheck size={16} className="text-amber-600" />
              <span>Approval Responsibilities ({filteredApprovals.length})</span>
            </h2>
          </div>

          {/* Module Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
            {['ALL', 'production', 'qc', 'qa', 'regulatory', 'finance', 'hrms'].map(mod => (
              <button
                key={mod}
                onClick={() => setActiveModule(mod)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors ${
                  activeModule === mod
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mod === 'hrms' ? 'HR' : mod}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search approval responsibilities..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Approvals List */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredApprovals.map(appr => {
              const isSelected = selectedApprovalKey === appr.key;
              const count = employees.filter(e => e.approvalPermissions?.includes(appr.key)).length;

              return (
                <button
                  key={appr.key}
                  onClick={() => setSelectedApprovalKey(appr.key)}
                  className={`w-full p-3 text-left rounded-2xl border transition-all space-y-1 ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs leading-tight">{appr.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {appr.module}
                    </span>
                  </div>
                  <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                    {appr.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[9px] font-mono ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                      {appr.key}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {count} Approvers
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Authorized Approvers & Assign Approver */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          {selectedApprovalObj ? (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {selectedApprovalObj.key}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                    Module: {selectedApprovalObj.module}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{selectedApprovalObj.label}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedApprovalObj.description}</p>
              </div>

              {/* Authorized Personnel Roster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
                    Designated Approvers ({authorizedEmployees.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Personnel with authority to execute this sign-off
                  </span>
                </div>

                {authorizedEmployees.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400 space-y-1">
                    <AlertCircle size={24} className="mx-auto text-amber-500 mb-1" />
                    <p className="font-bold text-slate-700">No personnel assigned to this approval.</p>
                    <p className="text-[11px]">Select employees below to grant approval authority.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                    {authorizedEmployees.map(emp => (
                      <div key={emp._id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {emp.employeeId} • {emp.designation} ({emp.department})
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={isUpdating}
                          onClick={() => handleToggleApproval(emp, false)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Revoke Approval
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roster of Other Personnel (Grant Authority) */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
                    Grant Approval to Employees / Managers
                  </h4>
                  <span className="text-[10px] text-slate-400">Available candidate employees</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                  {employees
                    .filter(emp => !emp.approvalPermissions?.includes(selectedApprovalKey))
                    .slice(0, 15)
                    .map(emp => (
                      <div key={emp._id} className="p-2.5 bg-white flex items-center justify-between hover:bg-slate-50">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-slate-800 truncate block">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {emp.employeeId} • {emp.role} • {emp.department}
                          </span>
                        </div>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleToggleApproval(emp, true)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] transition-colors flex-shrink-0"
                        >
                          + Grant Approval
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12">Select an approval responsibility to manage.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRApprovalPermissions;
