import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Search,
  Filter,
  CheckSquare,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  Sparkles,
  Sliders
} from 'lucide-react';

export const PolicyCenter = () => {
  const { user, can } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [myAcks, setMyAcks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('library'); // 'library', 'rules', 'myAcks', 'adminStats'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [acknowledging, setAcknowledging] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isHRAdmin = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'].includes(user?.role);

  useEffect(() => {
    fetchPolicyData();
  }, []);

  const fetchPolicyData = async () => {
    setLoading(true);
    try {
      const [polRes, rulesRes, statsRes, myAcksRes] = await Promise.all([
        axios.get('/api/hr/policies'),
        axios.get('/api/hr/policies/rules'),
        axios.get('/api/hr/policies/acknowledgments/stats'),
        axios.get('/api/hr/policies/acknowledgments/my')
      ]);

      setPolicies(polRes.data.data || []);
      setRules(rulesRes.data.data || []);
      setStats(statsRes.data.data || null);
      setMyAcks(myAcksRes.data.data || []);
      if (polRes.data.data?.length > 0 && !selectedPolicy) {
        setSelectedPolicy(polRes.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching policy center data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (policy) => {
    if (!declarationChecked) return;
    setAcknowledging(true);
    try {
      const res = await axios.post(`/api/hr/policies/${policy.policyId}/acknowledge`, {
        declarationAccepted: true
      });
      setSuccessMessage(res.data.message || `Successfully acknowledged ${policy.policyNumber}`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeclarationChecked(false);
      await fetchPolicyData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit acknowledgment.');
    } finally {
      setAcknowledging(false);
    }
  };

  const isPolicyAcknowledgedByMe = (policyNumber) => {
    return myAcks.some(a => a.policyNumber === policyNumber && a.status === 'ACKNOWLEDGED');
  };

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Official BJK Brand & Effective Date */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-bjk-teal/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-bjk-teal/20 text-bjk-teal border border-bjk-teal/30">
                Authoritative Source of Truth
              </span>
              <span className="text-xs text-slate-400 flex items-center">
                <Calendar size={13} className="mr-1 text-slate-400" />
                All Policies Effective: <strong className="text-white ml-1">01 April 2026</strong>
              </span>
              <span className="text-xs text-slate-400">
                Review Cycle: <strong className="text-slate-300">Every 2 Years</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <BookOpen className="mr-3 text-bjk-teal" size={26} />
              BJK Healthcare HR Policy Compliance Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              13 official corporate and pharmaceutical regulatory policies codified into executable system workflows, progressive approvals, automated validation gates, and immutable 21 CFR Part 11 audit trails.
            </p>
          </div>

          {/* Compliance Stats Chip */}
          {stats && (
            <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700 p-3 rounded-xl shadow-inner">
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workforce Acknowledgment</p>
                <p className="text-xl font-black text-bjk-teal">{stats.complianceRatePercent}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-bjk-teal/20 flex items-center justify-center text-bjk-teal">
                <ShieldCheck size={22} />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-700/60">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${
              activeTab === 'library'
                ? 'bg-bjk-teal text-white shadow-lg shadow-bjk-teal/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen size={14} className="mr-2" />
            13 Policy Master Library
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${
              activeTab === 'rules'
                ? 'bg-bjk-teal text-white shadow-lg shadow-bjk-teal/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders size={14} className="mr-2" />
            Policy Rule Engine Builder
          </button>
          <button
            onClick={() => setActiveTab('myAcks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${
              activeTab === 'myAcks'
                ? 'bg-bjk-teal text-white shadow-lg shadow-bjk-teal/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare size={14} className="mr-2" />
            My Sign-Off Declarations ({myAcks.length}/13)
          </button>
          {isHRAdmin && (
            <button
              onClick={() => setActiveTab('adminStats')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${
                activeTab === 'adminStats'
                  ? 'bg-bjk-teal text-white shadow-lg shadow-bjk-teal/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale size={14} className="mr-2" />
              HR Compliance Oversight
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: 13 POLICY MASTER LIBRARY & VIEWER */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Filterable Policy List */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search policies or rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-bjk-teal"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px]">
              {['ALL', 'LEAVE_ATTENDANCE', 'ETHICS_CONDUCT', 'EMPLOYMENT', 'SAFETY_HEALTH', 'COMPLIANCE_PRIVACY', 'SECURITY', 'DEVELOPMENT'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredPolicies.map((pol) => {
                const isSelected = selectedPolicy?.policyId === pol.policyId;
                const isAcked = isPolicyAcknowledgedByMe(pol.policyNumber);
                return (
                  <div
                    key={pol.policyId}
                    onClick={() => setSelectedPolicy(pol)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-bjk-teal shadow-md shadow-bjk-teal/10'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-bjk-teal">
                        {pol.policyNumber}
                      </span>
                      {isAcked ? (
                        <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={11} className="mr-1" /> Acknowledged
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Clock size={11} className="mr-1" /> Sign-off Pending
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{pol.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{pol.summary}</p>
                    
                    {pol.hasSourceConflict && (
                      <div className="mt-2 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded flex items-center">
                        <AlertTriangle size={11} className="mr-1 flex-shrink-0" />
                        Conflict: Title POL-016 vs Detail POL-011
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Policy Reading Pane & Acknowledgment Form */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {selectedPolicy ? (
              <>
                {/* Header with Source Conflict Warning if present */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-bjk-teal border border-slate-700">
                      {selectedPolicy.policyNumber} (Version {selectedPolicy.currentVersion})
                    </span>
                    <span className="text-xs text-slate-400">
                      Source: <span className="text-white font-medium">{selectedPolicy.sourceDocument}</span> ({selectedPolicy.sourcePages})
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedPolicy.title}</h2>
                  <p className="text-xs text-slate-300 mt-2 bg-slate-800/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {selectedPolicy.summary}
                  </p>
                </div>

                {/* Explicit Source Conflict Banner for BJK-HR-POL-016 / POL-011 */}
                {selectedPolicy.hasSourceConflict && (
                  <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 text-amber-200 text-xs space-y-1">
                    <div className="flex items-center font-bold text-amber-400">
                      <AlertTriangle size={16} className="mr-2" />
                      HR POLICY CONFIGURATION REVIEW REQUIRED: SOURCE POLICY NUMBER DISCREPANCY
                    </div>
                    <p className="text-slate-300">
                      {selectedPolicy.conflictDetails?.notes}
                    </p>
                    <div className="pt-2 flex items-center space-x-2 text-[11px]">
                      <span className="font-semibold text-slate-400">HR Verification Status:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                        {selectedPolicy.conflictDetails?.hrVerificationStatus}
                      </span>
                    </div>
                  </div>
                )}

                {/* Policy Detailed Sections */}
                <div className="space-y-4">
                  {selectedPolicy.detailedSections?.map((sec, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-bjk-teal uppercase tracking-wider flex items-center">
                        <ChevronRight size={14} className="mr-1 text-bjk-teal" />
                        {sec.sectionTitle}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{sec.content}</p>
                      {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                        <ul className="space-y-1 mt-2 pl-4 list-disc text-xs text-slate-400">
                          {sec.bulletPoints.map((bp, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">{bp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Statutory Digital Acknowledgment Section */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck size={20} className="text-bjk-teal" />
                      <h4 className="text-sm font-bold text-white">Employee Digital Policy Declaration</h4>
                    </div>
                    {isPolicyAcknowledgedByMe(selectedPolicy.policyNumber) ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
                        <CheckCircle2 size={13} className="mr-1.5" /> Acknowledged for Version {selectedPolicy.currentVersion}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center">
                        <Clock size={13} className="mr-1.5" /> Acknowledgment Required
                      </span>
                    )}
                  </div>

                  {isPolicyAcknowledgedByMe(selectedPolicy.policyNumber) ? (
                    <p className="text-xs text-slate-300">
                      You signed the digital compliance declaration for <strong className="text-white">{selectedPolicy.policyNumber}</strong> on record. A cryptographically verifiable audit log entry has been archived under your employee profile.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        In accordance with the BJK Healthcare HR Policy Handbook effective 01 April 2026, every employee must read, understand, and digitally acknowledge all 13 policies as a mandatory condition of employment.
                      </p>

                      <label className="flex items-start space-x-3 cursor-pointer bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 hover:border-bjk-teal transition-colors">
                        <input
                          type="checkbox"
                          checked={declarationChecked}
                          onChange={(e) => setDeclarationChecked(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-bjk-teal focus:ring-bjk-teal"
                        />
                        <span className="text-xs text-slate-200 select-none">
                          <strong>I confirm that I have read and understood this policy ({selectedPolicy.policyNumber})</strong>, agree to strictly abide by its provisions, and understand that compliance is an enforceable condition of my employment.
                        </span>
                      </label>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500">
                          IP & device metadata will be stamped to 21 CFR Part 11 Audit Log
                        </span>
                        <button
                          disabled={!declarationChecked || acknowledging}
                          onClick={() => handleAcknowledge(selectedPolicy)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                            declarationChecked && !acknowledging
                              ? 'bg-bjk-teal text-white hover:bg-bjk-teal/90 shadow-lg shadow-bjk-teal/20 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          {acknowledging ? 'Recording Signature...' : 'Submit Digital Acknowledgment'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                <p>Select a policy from the catalog to inspect its clauses and rules.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POLICY RULES ENGINE BUILDER (Section 52) */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <Sliders className="mr-2 text-bjk-teal" size={20} />
                Central Policy Rule Builder (Executable Configurations)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Policy parameters are evaluated dynamically by the backend Policy Engine. Rules are never hardcoded into frontend components.
              </p>
            </div>
            {!isHRAdmin && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center">
                <Lock size={12} className="mr-1.5" /> Read-Only Mode (HR Admin Authorization Required to Edit)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Rule Code</th>
                  <th className="py-3 px-4">Policy</th>
                  <th className="py-3 px-4">Configured Value</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Handbook Page</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {rules.map((rule) => (
                  <tr key={rule.ruleCode} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-bjk-teal">{rule.ruleCode}</td>
                    <td className="py-3 px-4 text-white font-sans">{rule.policyNumber} ({rule.policyTitle})</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-bjk-teal/20 text-white font-bold border border-bjk-teal/30">
                        {String(rule.value)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{rule.unit}</td>
                    <td className="py-3 px-4 text-slate-400">{rule.condition}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{rule.sourcePage || 'Page 5'}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans max-w-xs truncate">{rule.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY ACKNOWLEDGMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'myAcks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <CheckSquare className="mr-2 text-bjk-teal" size={20} />
                My Policy Sign-Off History
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your legally binding employee read-and-understood declarations archived under BJK Compliance Center.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-bjk-teal/20 text-bjk-teal border border-bjk-teal/30">
              {myAcks.length} / 13 Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map(p => {
              const ack = myAcks.find(a => a.policyNumber === p.policyNumber);
              return (
                <div key={p.policyId} className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-bjk-teal">{p.policyNumber}</span>
                      {ack ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center">
                          <CheckCircle2 size={11} className="mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center">
                          <Clock size={11} className="mr-1" /> Pending
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{p.summary.slice(0, 80)}...</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Effective: 01 Apr 2026</span>
                    {ack ? (
                      <span className="text-emerald-400">Signed: {new Date(ack.acknowledgedAt).toLocaleDateString()}</span>
                    ) : (
                      <button
                        onClick={() => { setSelectedPolicy(p); setActiveTab('library'); }}
                        className="text-bjk-teal font-bold hover:underline"
                      >
                        Read & Sign &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HR COMPLIANCE OVERSIGHT (ADMIN STATS) */}
      {/* ========================================================================= */}
      {activeTab === 'adminStats' && isHRAdmin && stats && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Scale className="mr-2 text-bjk-teal" size={20} />
              Company-Wide Policy Compliance Monitoring
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Real-time synchronization with active employee rosters and statutory acknowledgment audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Total Active Employees</p>
              <p className="text-2xl font-black text-white mt-1">{stats.totalEmployees}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Total Published Policies</p>
              <p className="text-2xl font-black text-white mt-1">{stats.totalPolicies}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
              <p className="text-[11px] text-emerald-400 font-bold uppercase">Total Signed Declarations</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.acknowledgedCount}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
              <p className="text-[11px] text-amber-400 font-bold uppercase">Pending Declarations</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{stats.pendingCount}</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Automated Compliance Reminder Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Per Section 7 of the BJK Architecture Specification, HR Administrators are prohibited from manually marking employees as acknowledged without a direct employee digital submission. System automated triggers send notifications 7 days and 2 days prior to the 30-day compliance deadline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyCenter;
