import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Clock,
  UserCheck,
  Calendar,
  FileText,
  Plus,
  CheckCircle2,
  Users,
  Shield,
  EyeOff
} from 'lucide-react';

export const HRPoshCenter = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ cases: [], committee: null });
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const [activeTab, setActiveTab] = useState('register'); // 'register', 'committee', 'lodgeComplaint'
  const [complaintForm, setComplaintForm] = useState({
    category: 'UNWELCOME_CONDUCT_OF_SEXUAL_NATURE',
    incidentDate: '',
    incidentLocation: '',
    incidentDescription: ''
  });
  const [complaintSuccess, setComplaintSuccess] = useState(null);

  const isICCMember = ['SUPER_ADMIN', 'DIRECTOR', 'POSH_ICP_MEMBER', 'POSH_ICC_MEMBER', 'DPO', 'HR_HEAD'].includes(user?.role) || user?.isICCMember;

  useEffect(() => {
    fetchPOSHData();
  }, []);

  const fetchPOSHData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hr/policies/posh');
      setData(res.data.data || { cases: [], committee: null });
      setRestricted(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setRestricted(true);
      } else {
        console.error('POSH fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/hr/policies/posh', complaintForm);
      setComplaintSuccess(res.data.data);
      setComplaintForm({
        category: 'UNWELCOME_CONDUCT_OF_SEXUAL_NATURE',
        incidentDate: '',
        incidentLocation: '',
        incidentDescription: ''
      });
      fetchPOSHData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit complaint');
    }
  };

  if (restricted) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-4 my-12">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-white">Confidential Restricted Chamber (POSH Act 2013)</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
          In strict compliance with <strong>BJK-HR-POL-012</strong> and the Sexual Harassment of Women at Workplace Act 2013, inquiry files, party identities, and committee proceedings are accessible exclusively to the duly constituted <strong>Internal Complaints Committee (ICC)</strong>.
        </p>
        <div className="pt-2 text-[11px] text-slate-500">
          If you need to file a confidential complaint, you may use the protected employee self-service portal or email the ICC Presiding Officer directly.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Policy BJK-HR-POL-012 (POSH Act 2013)
              </span>
              <span className="text-xs text-slate-400 flex items-center">
                <Lock size={12} className="mr-1 text-slate-400" />
                Confidential ICC Chamber
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <ShieldCheck className="mr-3 text-bjk-teal" size={26} />
              Internal Complaints Committee & POSH Administration
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Zero tolerance for sexual harassment. Mandatory 90-day inquiry SLA, 50%+ female ICC composition, statutory interim relief, and strict non-retaliation protections.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('lodgeComplaint')}
              className="px-4 py-2 bg-bjk-teal text-white rounded-xl text-xs font-bold hover:bg-bjk-teal/90 transition-all flex items-center shadow-lg shadow-bjk-teal/20"
            >
              <Plus size={14} className="mr-1.5" />
              Lodge Confidential Complaint
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-700/60">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'register' ? 'bg-bjk-teal text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Confidential Case Register ({data.cases?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('committee')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'committee' ? 'bg-bjk-teal text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ICC Committee Composition
          </button>
        </div>
      </div>

      {/* Case Register Tab */}
      {activeTab === 'register' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <EyeOff size={18} className="text-purple-400" />
              <h3 className="text-base font-bold text-white">Privileged Proceedings Register</h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Statutory Inquiry Limit: 90 Days
            </span>
          </div>

          {(!data.cases || data.cases.length === 0) ? (
            <div className="text-center py-12 text-slate-500">
              <Shield size={36} className="mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">No active complaints in the POSH register.</p>
              <p className="text-xs text-slate-500 mt-0.5">Workplace safety standards maintained across all plant facilities.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Case #</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Anonymized Parties</th>
                    <th className="py-3 px-4">90-Day SLA Deadline</th>
                    <th className="py-3 px-4">Inquiry Stage</th>
                    <th className="py-3 px-4">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.cases.map(c => (
                    <tr key={c.caseNumber} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">{c.caseNumber}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(c.registrationDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-white font-medium">{c.category.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {c.complainantCode} vs {c.respondentCode}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-amber-400 font-bold">
                        {c.inquiryDeadlineDate ? new Date(c.inquiryDeadlineDate).toLocaleDateString() : '90 Days from Reg'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                          {c.inquiryStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{c.findingOutcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ICC Committee Composition Tab */}
      {activeTab === 'committee' && data.committee && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <Users className="mr-2 text-bjk-teal" size={20} />
              {data.committee.committeeTitle}
            </h3>
            <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
              <span>Female Representation: <strong className="text-emerald-400 font-mono font-bold">{data.committee.womenPercentage}%</strong> (Statutory &ge; 50%)</span>
              <span>&bull;</span>
              <span>Tenure: <strong className="text-white">3 Years (2026 - 2029)</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.committee.members?.map((m, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    m.roleInICC === 'PRESIDING_OFFICER' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    m.roleInICC === 'EXTERNAL_MEMBER_NGO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {m.roleInICC.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{m.gender}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{m.name}</h4>
                <p className="text-xs text-slate-400">{m.designation}</p>
                {m.organization && <p className="text-[11px] text-slate-500 italic">{m.organization}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lodge Complaint Tab */}
      {activeTab === 'lodgeComplaint' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Lodge Confidential Complaint under POSH Act 2013</h3>
              <p className="text-[11px] text-slate-400">Section 2(n) Protected Grievance Filing</p>
            </div>
            <button onClick={() => setActiveTab('register')} className="text-xs text-slate-400 hover:text-white">Back</button>
          </div>

          {complaintSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-xl text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
              <h4 className="text-base font-bold text-white">Complaint Registered with Internal Complaints Committee</h4>
              <p className="text-xs text-slate-300">
                Your confidential case registration number: <strong className="text-purple-300 font-mono text-sm">{complaintSuccess.caseNumber}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Statutory 90-day inquiry timeline commences immediately. You are entitled to interim relief, confidentiality, and complete non-retaliation protections.
              </p>
              <button
                onClick={() => setComplaintSuccess(null)}
                className="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleLodgeComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Incident Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="UNWELCOME_CONDUCT_OF_SEXUAL_NATURE">Unwelcome Conduct of Sexual Nature</option>
                  <option value="PHYSICAL_CONTACT_ADVANCES">Physical Contact & Advances</option>
                  <option value="DEMAND_REQUEST_SEXUAL_FAVORS">Demand or Request for Sexual Favors</option>
                  <option value="SEXUALLY_COLOURED_REMARKS">Sexually Colored Remarks or Innuendo</option>
                  <option value="SHOWING_PORNOGRAPHY">Showing Pornography or Explicit Material</option>
                  <option value="QUID_PRO_QUO">Quid Pro Quo (Job benefits conditioned on compliance)</option>
                  <option value="HOSTILE_WORK_ENVIRONMENT">Hostile / Intimidating Work Environment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Incident Date (Within 3 Months)</label>
                  <input
                    type="date"
                    required
                    value={complaintForm.incidentDate}
                    onChange={(e) => setComplaintForm({ ...complaintForm, incidentDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Location / Plant Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 1 Cleanroom Corridor"
                    value={complaintForm.incidentLocation}
                    onChange={(e) => setComplaintForm({ ...complaintForm, incidentLocation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Detailed Description of Incident</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the incident factually, including any witnesses, correspondence, or digital evidence..."
                  value={complaintForm.incidentDescription}
                  onChange={(e) => setComplaintForm({ ...complaintForm, incidentDescription: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                Notice: Per BJK-HR-POL-012, 6 copies of the complaint and supporting evidence are statutory. Submitting here transmits directly to the female Presiding Officer and external NGO advocate with encrypted custody.
              </p>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all shadow-lg"
              >
                Transmit Encrypted Complaint to ICC
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default HRPoshCenter;
