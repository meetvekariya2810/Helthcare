import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Baby,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  Activity,
  FileText
} from 'lucide-react';

export const HRMaternityCenter = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'apply'

  const [form, setForm] = useState({
    employeeId: user?.employeeId || 'BJK-EMP-003',
    employeeName: user?.name || 'Employee',
    departmentName: user?.department || 'Production Operations',
    gender: 'Female',
    leaveType: 'MATERNITY',
    scenario: 'NATURAL_BIRTH_FIRST_OR_SECOND_CHILD',
    childrenCountPrior: 0,
    startDate: '',
    isGMPPersonnel: true
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hr/policies/maternity');
      setCases(res.data.data || []);
    } catch (err) {
      console.error('Error fetching maternity cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr/policies/maternity', form);
      alert('Parental leave application submitted successfully.');
      setActiveTab('list');
      fetchCases();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to apply');
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
                Policy BJK-HR-POL-016 (Source Ref: POL-011)
              </span>
              <span className="text-xs text-slate-400">
                Maternity & Paternity Benefit Framework
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <Baby className="mr-3 text-bjk-teal" size={26} />
              Parental Leave & GMP Occupational Protection Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              26 weeks paid maternity, 15 days paternity, mandatory pharmaceutical hazard reassignment away from active chemicals, nursing break provisions, and statutory job protection.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('apply')}
            className="px-4 py-2 bg-bjk-teal text-white rounded-xl text-xs font-bold hover:bg-bjk-teal/90 transition-all flex items-center shadow-lg shadow-bjk-teal/20"
          >
            <Plus size={14} className="mr-1.5" />
            Apply Parental Leave
          </button>
        </div>

        {/* Source Conflict Notification */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
            <span>
              <strong>Handbook Source Conflict Note:</strong> Policy title identified as <strong>BJK-HR-POL-016</strong> in agenda/cover, while detailed pages (Slide 30-31) print <strong>BJK-HR-POL-011</strong>. Both tracked under BJK policy engine.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold ml-2">
            Status: HR Review Flagged
          </span>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center">
              <Heart size={18} className="mr-2 text-rose-400" />
              Active Parental Leave Records ({cases.length})
            </h3>
            <span className="text-xs text-slate-400">Statutory Eligibility: Minimum 80 Days Active Service</span>
          </div>

          {cases.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Baby size={36} className="mx-auto mb-2 text-bjk-teal opacity-60" />
              <p className="text-sm font-semibold text-slate-300">No active parental leaves in this period.</p>
              <p className="text-xs text-slate-500 mt-0.5">Employees may submit applications with advance medical certification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Case #</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Type & Scenario</th>
                    <th className="py-3 px-4">Entitled Paid Duration</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">GMP Reassignment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cases.map((c) => (
                    <tr key={c.caseNumber} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-rose-300">{c.caseNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.employeeName} ({c.employeeId})</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">{c.leaveType}</span>
                        <span className="block text-[10px] text-slate-400">{c.scenario.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-bjk-teal">
                        {c.entitledDays} Calendar Days ({Math.round(c.entitledDays / 7)} Weeks)
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {new Date(c.startDate).toLocaleDateString()} &rarr; {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {c.isGMPPersonnel ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Protected / Reassigned
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Standard Office</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-emerald-400">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Apply Form */}
      {activeTab === 'apply' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Apply for Maternity or Paternity Leave</h3>
            <button onClick={() => setActiveTab('list')} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => {
                    const lt = e.target.value;
                    setForm({
                      ...form,
                      leaveType: lt,
                      gender: lt === 'PATERNITY' ? 'Male' : 'Female',
                      scenario: lt === 'PATERNITY' ? 'PATERNITY_LEAVE' : 'NATURAL_BIRTH_FIRST_OR_SECOND_CHILD'
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="MATERNITY">Maternity Leave (Female Employee)</option>
                  <option value="PATERNITY">Paternity Leave (Male Employee - 15 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Scenario</label>
                {form.leaveType === 'MATERNITY' ? (
                  <select
                    value={form.scenario}
                    onChange={(e) => setForm({ ...form, scenario: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="NATURAL_BIRTH_FIRST_OR_SECOND_CHILD">1st & 2nd Child (26 Weeks / 182 Days)</option>
                    <option value="NATURAL_BIRTH_THIRD_CHILD_ONWARDS">3rd Child Onwards (12 Weeks / 84 Days)</option>
                    <option value="LEGAL_ADOPTION_UNDER_3_MONTHS">Adoption &lt;3 Months (12 Weeks)</option>
                    <option value="SURROGACY_COMMISSIONING_MOTHER">Surrogacy (12 Weeks)</option>
                    <option value="MISCARRIAGE_MEDICAL_TERMINATION">Miscarriage / MTP (6 Weeks / 42 Days)</option>
                    <option value="STILLBIRTH_POST_20_WEEKS">Stillbirth &gt;20 Weeks (12 Weeks + EAP)</option>
                    <option value="PREGNANCY_RELATED_ILLNESS">Pregnancy Illness (+1 Month)</option>
                    <option value="TUBECTOMY_PROCEDURE">Tubectomy (2 Weeks / 14 Days)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value="Paternity Leave (15 consecutive days within 60 days)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-400"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Commencement Date</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Prior Children Count</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={form.childrenCountPrior}
                  onChange={(e) => setForm({ ...form, childrenCountPrior: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={form.isGMPPersonnel}
                  onChange={(e) => setForm({ ...form, isGMPPersonnel: e.target.checked })}
                  className="rounded border-slate-700 text-bjk-teal"
                />
                <strong>Employee works in GMP manufacturing / QC cleanrooms</strong>
              </label>
              <p className="text-[11px] text-slate-400">
                Enables immediate occupational risk assessment, reassignment away from hazardous APIs/solvents, and mandatory doctor clearance prior to cleanroom return.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-bjk-teal text-white font-bold rounded-xl hover:bg-bjk-teal/90 transition-all shadow-lg"
            >
              Submit Application under Policy BJK-HR-POL-016
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRMaternityCenter;
