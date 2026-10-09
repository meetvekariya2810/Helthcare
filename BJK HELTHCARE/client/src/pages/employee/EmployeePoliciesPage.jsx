import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  Building,
  Download,
  X,
  AlertCircle,
  FileCheck,
  Lock
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeePolicyAPI } from '../../services/employeeApi';

export const EmployeePoliciesPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await employeePolicyAPI.getPolicies();
      if (res.data?.success) {
        setPolicies(res.data.policies || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('[Load Policies Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleOpenPolicy = (policy) => {
    setSelectedPolicy(policy);
    setDeclarationAgreed(false);
    setShowViewModal(true);
    setActionMessage('');
    setErrorMessage('');
  };

  const handleAcknowledge = async () => {
    if (!selectedPolicy || !declarationAgreed) return;
    setIsAcknowledging(true);
    setErrorMessage('');
    setActionMessage('');

    try {
      const res = await employeePolicyAPI.acknowledge(selectedPolicy.policyNumber, {
        signatureDeclaration: true
      });
      if (res.data?.success) {
        setActionMessage(res.data.message);
        setShowViewModal(false);
        loadPolicies();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit acknowledgement.');
    } finally {
      setIsAcknowledging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Policies & Standard Operating Procedures (SOP)</h1>
        <p className="text-xs text-slate-500">
          Official BJK Healthcare employee handbook, statutory GMP protocols, environmental safety rules, and electronic compliance acknowledgements
        </p>
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:underline">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center justify-between text-xs text-rose-800 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Required Policies</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {stats?.total || policies.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Plant & statutory compliance handbook</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Acknowledged by Me</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {stats?.acknowledged || policies.filter(p => p.isAcknowledged).length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">21 CFR Part 11 timestamp verified</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Action</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {stats?.pending != null ? stats.pending : policies.filter(p => !p.isAcknowledged).length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires reading and declaration</span>
        </div>
      </div>

      {/* Policies List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Policies & Department SOP Documents</h3>
            <p className="text-[11px] text-slate-500">Read the policies and complete mandatory electronic acknowledgement</p>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            Handbook Effective 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Policy Code & Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4 text-center">My Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((p) => {
                return (
                  <tr key={p.policyNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-bold text-teal-700">
                          {p.policyNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5">
                          {p.title}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {p.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      v{p.version}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {p.effectiveDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.isAcknowledged ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Acknowledged
                          </span>
                          {p.acknowledgedAt && (
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              {new Date(p.acknowledgedAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenPolicy(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          p.isAcknowledged
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                        }`}
                      >
                        {p.isAcknowledged ? 'View Document' : 'Read & Acknowledge'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Reader & Acknowledgment Modal */}
      {showViewModal && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedPolicy.policyNumber} • Version {selectedPolicy.version}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedPolicy.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">Policy Scope & Applicability:</p>
                <p className="text-slate-600 mt-0.5">{selectedPolicy.description}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Department: <strong>{selectedPolicy.department}</strong> • Effective Date: <strong>{selectedPolicy.effectiveDate}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  1. Statutory Compliance Requirements
                </h4>
                <p>
                  All personnel of BJK Healthcare must adhere strictly to current Good Manufacturing Practices (cGMP), USFDA guidelines, and Indian Pharmacopoeia standards. All operations conducted within plant boundaries are subject to regulatory oversight.
                </p>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  2. Quality, Cleanroom & Personnel Hygiene Protocols
                </h4>
                <p>
                  Cleanroom gowning procedures must be followed in strict accordance with Grade B/C specifications. Any illness, open wounds, or contamination risk must be immediately reported to the area supervisor before entering the sterile formulation area.
                </p>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  3. Electronic Signatures & 21 CFR Part 11 Compliance
                </h4>
                <p>
                  Any electronic record generated, attendance punch verified, or document signed through this system is legally binding and equivalent to a handwritten signature.
                </p>
              </div>

              {selectedPolicy.isAcknowledged ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    You acknowledged this policy on {new Date(selectedPolicy.acknowledgedAt).toLocaleString('en-IN')} (Version {selectedPolicy.acknowledgedVersion || selectedPolicy.version}).
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-[11px] text-slate-700 leading-snug">
                      I, <strong>{employeeUser?.name || 'Employee'}</strong> (ID: {employeeUser?.employeeId}), hereby confirm that I have thoroughly read, understood, and agree to adhere strictly to <strong>{selectedPolicy.policyNumber} ({selectedPolicy.title})</strong>. I acknowledge this under USFDA 21 CFR Part 11 electronic compliance standards.
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              {!selectedPolicy.isAcknowledged && (
                <button
                  type="button"
                  disabled={!declarationAgreed || isAcknowledging}
                  onClick={handleAcknowledge}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAcknowledging ? 'Recording Acknowledgement...' : 'Officially Sign & Acknowledge'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePoliciesPage;
