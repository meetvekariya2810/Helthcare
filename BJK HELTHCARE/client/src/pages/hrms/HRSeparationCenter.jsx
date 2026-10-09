import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  UserMinus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Plus,
  ShieldCheck,
  Send,
  Building,
  KeyRound,
  CreditCard,
  UserX
} from 'lucide-react';

export const HRSeparationCenter = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'submitResignation'
  const [selectedCase, setSelectedCase] = useState(null);

  const [form, setForm] = useState({
    employeeId: user?.employeeId || 'BJK-EMP-003',
    employeeName: user?.name || 'Rajesh Patel',
    departmentName: user?.department || 'Production Operations',
    separationType: 'VOLUNTARY_RESIGNATION',
    contractualNoticePeriodDays: 30,
    lastWorkingDayRequested: ''
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hr/policies/separation');
      setCases(res.data.data || []);
      if (res.data.data?.length > 0 && !selectedCase) {
        setSelectedCase(res.data.data[0]);
      }
    } catch (err) {
      console.error('Separation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr/policies/separation', form);
      alert('Separation application submitted under Policy BJK-HR-POL-010.');
      setActiveTab('list');
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit resignation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Policy BJK-HR-POL-010
              </span>
              <span className="text-xs text-slate-400">
                Resignation, 5-Department Exit Clearance &amp; 45-Day Settlement SLA
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <UserMinus className="mr-3 text-bjk-teal" size={26} />
              Employee Separation &amp; Full &amp; Final Settlement Suite
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Strict governance of 7 separation categories, mandatory 2-day HR acknowledgment, 5-day formal acceptance, 5-department digital clearance gates, 45-day final settlement, and 30-day relieving certificate delivery.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('submitResignation')}
            className="px-4 py-2 bg-bjk-teal text-white rounded-xl text-xs font-bold hover:bg-bjk-teal/90 transition-all flex items-center shadow-lg shadow-bjk-teal/20"
          >
            <Plus size={14} className="mr-1.5" />
            Submit Resignation Letter
          </button>
        </div>

        {/* Separation Milestones SLA bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-700/60 text-center">
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">HR Acknowledgment</span>
            <span className="text-sm font-black text-white">Within 2 Working Days</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Formal Acceptance</span>
            <span className="text-sm font-black text-white">Within 5 Working Days</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Full &amp; Final Settlement</span>
            <span className="text-sm font-black text-bjk-teal">Within 45 Days</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Relieving Certificate</span>
            <span className="text-sm font-black text-emerald-400">Within 30 Days</span>
          </div>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Cases List */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <UserX size={16} className="mr-2 text-rose-400" />
                Separation Pipeline ({cases.length})
              </h3>
            </div>

            {cases.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="text-xs font-semibold text-slate-300">Zero pending employee separations.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cases.map((c) => {
                  const isSelected = selectedCase?.caseNumber === c.caseNumber;
                  return (
                    <div
                      key={c.caseNumber}
                      onClick={() => setSelectedCase(c)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-bjk-teal shadow-md shadow-bjk-teal/10'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-bjk-teal">{c.caseNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {c.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{c.employeeName} ({c.employeeId})</h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{c.separationType.replace(/_/g, ' ')}</span>
                        <span>Notice: {c.contractualNoticePeriodDays}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Case Detail (5 Clearances & Settlement) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {selectedCase ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-bjk-teal font-bold">{selectedCase.caseNumber}</span>
                    <h3 className="text-base font-bold text-white">{selectedCase.employeeName} &bull; {selectedCase.departmentName}</h3>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Last Working Day</span>
                    <span className="font-mono text-white font-bold">
                      {selectedCase.lastWorkingDayApproved ? new Date(selectedCase.lastWorkingDayApproved).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* 5-Department Exit Clearance Status */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    5-Department Exit Clearance Status (Mandatory Gate)
                  </h4>
                  <div className="space-y-2">
                    {selectedCase.clearances?.map((cl, idx) => (
                      <div key={idx} className="bg-slate-800/60 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                            {cl.departmentType === 'IT_SYSTEMS' ? <KeyRound size={15} /> :
                             cl.departmentType === 'FINANCE_ACCOUNTS' ? <CreditCard size={15} /> :
                             cl.departmentType === 'SECURITY_ADMIN' ? <ShieldCheck size={15} /> :
                             <Building size={15} />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{cl.departmentLabel}</span>
                            <span className="text-[10px] text-slate-400">Department: {cl.departmentType.replace(/_/g, ' ')}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cl.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {cl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full & Final Settlement */}
                <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Full &amp; Final Settlement Schedule
                    </h4>
                    <span className="text-xs font-mono font-bold text-bjk-teal">
                      SLA: Within 45 Days ({selectedCase.settlement?.dueDate45Days ? new Date(selectedCase.settlement.dueDate45Days).toLocaleDateString() : 'Active'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Includes salary proration, EL encashment (up to 50 days), statutory gratuity (5+ years service), minus any notice shortfall or company property deductions.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <UserMinus size={40} className="mx-auto mb-2 opacity-40" />
                <p>Select a separation case to view clearance checklist and settlement progress.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Resignation Tab */}
      {activeTab === 'submitResignation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Submit Formal Resignation (BJK-HR-POL-010)</h3>
            <button onClick={() => setActiveTab('list')} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Separation Type</label>
              <select
                value={form.separationType}
                onChange={(e) => setForm({ ...form, separationType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="VOLUNTARY_RESIGNATION">Voluntary Resignation</option>
                <option value="RETIREMENT">Retirement (Age 58 Superannuation)</option>
                <option value="CONTRACT_EXPIRY">Contract Term Expiry</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notice Period (Days)</label>
                <input
                  type="number"
                  value={form.contractualNoticePeriodDays}
                  onChange={(e) => setForm({ ...form, contractualNoticePeriodDays: parseInt(e.target.value) || 30 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Requested Last Working Day</label>
                <input
                  type="date"
                  required
                  value={form.lastWorkingDayRequested}
                  onChange={(e) => setForm({ ...form, lastWorkingDayRequested: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-slate-400 text-[11px] leading-relaxed">
              Upon submission, HR acknowledgment is statutorily due within <strong>2 working days</strong>, retention meeting within <strong>3 days</strong>, and formal acceptance letter within <strong>5 days</strong>. Post-exit confidentiality obligations continue indefinitely.
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-bjk-teal text-white font-bold rounded-xl hover:bg-bjk-teal/90 transition-all shadow-lg"
            >
              Submit Written Resignation
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRSeparationCenter;
