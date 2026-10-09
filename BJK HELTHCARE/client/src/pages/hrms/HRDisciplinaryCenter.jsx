import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  AlertTriangle,
  Scale,
  FileWarning,
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  Lock,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export const HRDisciplinaryCenter = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases', 'logCase', 'whistleblower'
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    departmentName: 'Production Operations',
    misconductCategory: 'MINOR',
    description: '',
    currentStep: 1,
    isStepBypassed: false,
    bypassJustification: '',
    isGMPViolation: false
  });

  // Whistleblower Form
  const [wbForm, setWbForm] = useState({
    concernType: 'BRIBERY_CORRUPTION',
    allegationDetails: '',
    isAnonymous: true,
    reporterName: '',
    reporterContact: ''
  });
  const [wbResult, setWbResult] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hr/policies/disciplinary');
      setCases(res.data.data || []);
    } catch (err) {
      console.error('Error fetching disciplinary cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCase = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr/policies/disciplinary', formData);
      alert('Disciplinary case registered under BJK-HR-POL-004.');
      setFormData({
        employeeId: '',
        employeeName: '',
        departmentName: 'Production Operations',
        misconductCategory: 'MINOR',
        description: '',
        currentStep: 1,
        isStepBypassed: false,
        bypassJustification: '',
        isGMPViolation: false
      });
      setActiveTab('cases');
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create case');
    }
  };

  const handleWhistleblowerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/hr/policies/whistleblower', wbForm);
      setWbResult(res.data.data);
      setWbForm({
        concernType: 'BRIBERY_CORRUPTION',
        allegationDetails: '',
        isAnonymous: true,
        reporterName: '',
        reporterContact: ''
      });
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Policy BJK-HR-POL-004 & POL-003
              </span>
              <span className="text-xs text-slate-400">
                Progressive 6-Step Discipline & Whistleblower System
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <Scale className="mr-3 text-bjk-teal" size={26} />
              Disciplinary Action & Ethics Administration
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Strict natural justice framework ensuring impartial inquiry, progressive corrective action, step-bypass for gross GMP misconduct, and zero-retaliation whistleblower protections.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('logCase')}
              className="px-4 py-2 bg-bjk-teal text-white rounded-xl text-xs font-bold hover:bg-bjk-teal/90 transition-all flex items-center shadow-lg shadow-bjk-teal/20"
            >
              <Plus size={14} className="mr-1.5" />
              Log Disciplinary Case
            </button>
            <button
              onClick={() => setActiveTab('whistleblower')}
              className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all flex items-center"
            >
              <ShieldAlert size={14} className="mr-1.5 text-amber-400" />
              Whistleblower Portal
            </button>
          </div>
        </div>

        {/* 6-Step Visual Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/60">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Progressive 6-Step Disciplinary Ladder (Handbook Pages 20-21)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="block text-[10px] text-slate-400 font-bold">Step 1 (30 Days)</span>
              <span className="font-bold text-white text-[11px]">Verbal Warning</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="block text-[10px] text-slate-400 font-bold">Step 2 (6 Months)</span>
              <span className="font-bold text-amber-300 text-[11px]">Written Warning</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="block text-[10px] text-slate-400 font-bold">Step 3 (12 Months)</span>
              <span className="font-bold text-amber-400 text-[11px]">Final Written</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="block text-[10px] text-slate-400 font-bold">Step 4 (Per Case)</span>
              <span className="font-bold text-rose-300 text-[11px]">Suspension (3-7d)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="block text-[10px] text-slate-400 font-bold">Step 5 (Permanent)</span>
              <span className="font-bold text-rose-400 text-[11px]">Demotion/Transfer</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200">
              <span className="block text-[10px] text-rose-400 font-bold">Step 6 (Managing Director)</span>
              <span className="font-black text-rose-300 text-[11px]">Termination</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === 'cases' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center">
              <FileWarning size={18} className="mr-2 text-rose-400" />
              Active Disciplinary Cases ({cases.length})
            </h3>
            <span className="text-xs text-slate-400">Strict Need-to-Know Privilege</span>
          </div>

          {cases.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">Zero active disciplinary cases on record.</p>
              <p className="text-xs text-slate-500 mt-0.5">All workforce conduct parameters comply with BJK-HR-POL-003.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Case #</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Misconduct Level</th>
                    <th className="py-3 px-4">Progressive Step</th>
                    <th className="py-3 px-4">GMP Impact</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cases.map((c) => (
                    <tr key={c.caseNumber} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-bjk-teal">{c.caseNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.employeeName} ({c.employeeId})</td>
                      <td className="py-3 px-4 text-slate-400">{c.departmentName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.misconductCategory === 'GROSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          c.misconductCategory === 'MAJOR' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {c.misconductCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">Step {c.currentStep}</span>: {c.stepLabel}
                        {c.isStepBypassed && <span className="block text-[10px] text-rose-400 font-bold">Bypassed (Gross)</span>}
                      </td>
                      <td className="py-3 px-4">
                        {c.isGMPViolation ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            CAPA Required
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-amber-400">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Log Case Form */}
      {activeTab === 'logCase' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Initiate Disciplinary Proceeding (BJK-HR-POL-004)</h3>
            <button onClick={() => setActiveTab('cases')} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <form onSubmit={handleSubmitCase} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Employee ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BJK-EMP-003"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Employee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Patel"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Misconduct Category</label>
                <select
                  value={formData.misconductCategory}
                  onChange={(e) => setFormData({ ...formData, misconductCategory: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="MINOR">Minor (Lateness, minor SOP deviation)</option>
                  <option value="MAJOR">Major (Insubordination, repeated absence)</option>
                  <option value="GROSS">Gross (Fraud, violence, GMP falsification)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Department</label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Detailed Incident Narrative</label>
              <textarea
                required
                rows={3}
                placeholder="Factual description of misconduct with dates, witnesses, and immediate actions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isGMPViolation}
                  onChange={(e) => setFormData({ ...formData, isGMPViolation: e.target.checked })}
                  className="rounded border-slate-700 text-bjk-teal"
                />
                <span>Involves GMP manufacturing / cleanroom compliance violation</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isStepBypassed}
                  onChange={(e) => setFormData({ ...formData, isStepBypassed: e.target.checked })}
                  className="rounded border-slate-700 text-rose-500"
                />
                <span className="text-rose-400 font-semibold">Bypass progressive steps directly to termination (Gross Misconduct)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-all shadow-lg"
            >
              Issue Disciplinary Case Record
            </button>
          </form>
        </div>
      )}

      {/* Whistleblower Portal */}
      {activeTab === 'whistleblower' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <ShieldCheck size={18} className="mr-2 text-emerald-400" />
                Confidential Whistleblower Intake (Policy BJK-HR-POL-003)
              </h3>
              <p className="text-[11px] text-slate-400">Strict Anti-Retaliation Protection Enforced</p>
            </div>
            <button onClick={() => setActiveTab('cases')} className="text-xs text-slate-400 hover:text-white">Close</button>
          </div>

          {wbResult ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-xl text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
              <h4 className="text-base font-bold text-white">Confidential Report Successfully Submitted</h4>
              <p className="text-xs text-slate-300">
                Your report has been logged under case identifier: <strong className="text-bjk-teal font-mono text-sm">{wbResult.caseId}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Zero retaliation is guaranteed by the BJK Healthcare Managing Director. An independent compliance investigator will review this case.
              </p>
              <button
                onClick={() => setWbResult(null)}
                className="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleWhistleblowerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Allegation Category</label>
                <select
                  value={wbForm.concernType}
                  onChange={(e) => setWbForm({ ...wbForm, concernType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="BRIBERY_CORRUPTION">Bribery, Kickback, or Corruption</option>
                  <option value="GMP_DATA_FALSIFICATION">GMP Cleanroom Data Integrity Falsification</option>
                  <option value="THEFT_FRAUD">Theft or Financial Fraud</option>
                  <option value="HARASSMENT_DISCRIMINATION">Severe Workplace Harassment / Discrimination</option>
                  <option value="SAFETY_VIOLATION">Major Health & Safety Violation</option>
                  <option value="CONFLICT_OF_INTEREST">Undisclosed Conflict of Interest</option>
                  <option value="UNAUTHORIZED_DISCLOSURE">Formulation or Trade Secret Disclosure</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Factual Allegation & Evidence Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide precise details, names, locations, and batch or document references..."
                  value={wbForm.allegationDetails}
                  onChange={(e) => setWbForm({ ...wbForm, allegationDetails: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={wbForm.isAnonymous}
                    onChange={(e) => setWbForm({ ...wbForm, isAnonymous: e.target.checked })}
                    className="rounded border-slate-700 text-bjk-teal"
                  />
                  <strong>Submit this report 100% Anonymously</strong>
                </label>
                <p className="text-[11px] text-slate-400">
                  If selected, no name or identifying metadata will be stamped to the investigation record.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-bjk-teal text-white font-bold rounded-xl hover:bg-bjk-teal/90 transition-all shadow-lg"
              >
                Submit Protected Whistleblower Report
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default HRDisciplinaryCenter;
