import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit3,
  Calendar,
  Layers,
  Award,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const PolicyConfigView = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState(null);
  const [clarifications, setClarifications] = useState([]);
  const [selectedClarification, setSelectedClarification] = useState(null);
  const [expandedSection, setExpandedSection] = useState('ENTITLEMENTS');

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getPolicyConfig();
      if (res.data?.success) {
        setPolicyData(res.data.documentControl);
        setClarifications(res.data.clarifications || []);
      }
    } catch (err) {
      console.error('Failed to load policy configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleUpdateStatus = async (itemKey, newStatus) => {
    try {
      const res = await leaveAPI.updatePolicyClarification(itemKey, { reviewStatus: newStatus });
      if (res.data?.success) {
        showToast('Clarification review status updated.', 'success');
        fetchPolicy();
        setSelectedClarification(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update clarification', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-slate-500 font-medium text-sm">Loading Policy Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Control Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              Policy Ref: BJK-HR-POL-001
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              Version: 1.0 (Effective 01 April 2026)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              WHO GMP & US FDA 21 CFR Part 211 Compliant
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            BJK Healthcare Pvt. Ltd. — Master Leave Policy
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            A comprehensive framework for employee leave entitlements, Comp-Off crediting, GMP cleanroom continuity, and auditable ALCOA+ recordkeeping for pharmaceutical manufacturing.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Policy Owner</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{policyData?.policyOwner || 'Head – Human Resources'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Approval Authority</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{policyData?.approvedBy || 'Managing Director'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Prepared By</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{policyData?.preparedBy || 'Krutika Parmar (HR Manager)'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">MD Sanction</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">{policyData?.approvalSignatures?.managingDirector || 'Haresh Kimbhani (MD)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Tab Section: Rules & Entitlements */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Award className="text-teal-600" size={18} />
              <span>Official Policy Entitlements & Accrual Rules (BJK-HR-POL-001)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Authoritative internal policy source active for 2026</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpandedSection(expandedSection === 'ENTITLEMENTS' ? '' : 'ENTITLEMENTS')}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center space-x-1"
            >
              <span>{expandedSection === 'ENTITLEMENTS' ? 'Collapse' : 'Expand'} Rules</span>
              {expandedSection === 'ENTITLEMENTS' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {expandedSection === 'ENTITLEMENTS' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* EL Card */}
            <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-mono text-[11px] font-black">
                  EARNED LEAVE (EL/PL)
                </span>
                <span className="text-xs font-bold text-teal-800">7 Days / Year</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Accrual:</strong> 0.58 days/month credited on last day of month.</li>
                <li><strong>Eligibility:</strong> Confirmed employees after 1 year. Probationers accrue but cannot avail until confirmed.</li>
                <li><strong>Duration:</strong> Min block of <strong>3 working days</strong>. Normal max 15 days (&gt;15 requires MD approval).</li>
                <li><strong>Advance Notice:</strong> 7 days for 3–4 days; 15 days for 5+ days.</li>
                <li><strong>Carry Forward:</strong> 50% carried forward up to <strong>50 days max accumulation</strong>.</li>
                <li><strong>Encashment:</strong> Max 10 days in December (min 20 days balance retained).</li>
              </ul>
            </div>

            {/* CL Card */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono text-[11px] font-black">
                  CASUAL LEAVE (CL)
                </span>
                <span className="text-xs font-bold text-blue-800">7 Days / Year</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Credit:</strong> 0.58 on monthly basis.</li>
                <li><strong>Probation:</strong> <strong>No entitlement</strong> during probation period.</li>
                <li><strong>Duration:</strong> Max <strong>2 consecutive working days</strong> at a time. (3 days exception routes to HOD).</li>
                <li><strong>Notice:</strong> 24 hours advance. Emergency: inform RM/HR within 2 hours of shift start.</li>
                <li><strong>Carry Forward:</strong> Lapses Dec 31. No encashment under any circumstances.</li>
                <li><strong>Clubbing:</strong> Cannot be sandwiched adjacent to weekly off / holiday without manager approval.</li>
              </ul>
            </div>

            {/* SL Card */}
            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-mono text-[11px] font-black">
                  SICK LEAVE (SL)
                </span>
                <span className="text-xs font-bold text-purple-800">4 Days / Year</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Credit:</strong> Credited in full on <strong>January 1</strong>. Confirmed &amp; probation staff eligible.</li>
                <li><strong>Documentation:</strong> 1–2 days self-declaration; 3–4 days MBBS doctor certificate mandatory.</li>
                <li><strong>Sudden Illness:</strong> Inform RM and HR within <strong>2 hours</strong> of shift start time.</li>
                <li><strong>GMP Cleanroom Fitness:</strong> Returning after 4+ days in PRD/QC requires <strong>Fitness-to-Resume certificate</strong>.</li>
                <li><strong>Expiry:</strong> Unused balance lapses on Dec 31. Non-encashable.</li>
              </ul>
            </div>

            {/* Comp-Off Card */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-mono text-[11px] font-black">
                  COMP-OFF (SECTION 8)
                </span>
                <span className="text-xs font-bold text-amber-800">1:1 or 0.5 Day</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Calculation:</strong> 1 qualifying day extra work = 1 day Comp-Off; 4 hours extra work = 0.5 day.</li>
                <li><strong>Pre-Approval:</strong> Advance authorization by Reporting Manager &amp; HR mandatory before work.</li>
                <li><strong>Validity:</strong> Must be availed within <strong>90 days</strong> of earned date.</li>
                <li><strong>Application:</strong> Requires min 3 working days advance notice.</li>
                <li><strong>Expiry:</strong> Unused credits lapse after 90 days. Non-encashable; lapses on separation.</li>
              </ul>
            </div>

            {/* Special Leaves Card */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono text-[11px] font-black">
                  SPECIAL LEAVES (SEC 9)
                </span>
                <span className="text-xs font-bold text-rose-800">Statutory / Paid</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Bereavement:</strong> 2 days for immediate family; 1 day for extended family.</li>
                <li><strong>Marriage Leave:</strong> 5 paid days for own wedding (30 days notice + invite; once in tenure).</li>
                <li><strong>Birthday/Anniversary:</strong> 1 paid day (15 days notice + proof).</li>
                <li><strong>Election &amp; Court:</strong> Paid leave for authorized duty period with duty order / summons.</li>
              </ul>
            </div>

            {/* Loss of Pay (LOP) Card */}
            <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-mono text-[11px] font-black">
                  LOSS OF PAY (LOP)
                </span>
                <span className="text-xs font-bold text-slate-800">Pro-Rata Deduction</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Sanction:</strong> Granted in exceptional cases after exhausting leaves with Head–HR approval.</li>
                <li><strong>Deduction Formula:</strong> <code>(Monthly Gross / Calendar Days in Month) × LOP Days</code>.</li>
                <li><strong>Benefits:</strong> PF, ESI, gratuity accrue during LOP up to 30 days.</li>
                <li><strong>Regularization:</strong> Genuine emergency absence regularized by Head–HR as SL or Special Leave.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Section 13: Policy Exception & Clarification Register */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                <AlertTriangle size={16} />
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Policy Exception &amp; Clarification Register (Section 13)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tracks the 7 specific ambiguities identified in BJK-HR-POL-001 with documented interim handling and review status.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
            {clarifications.length} Registered Items
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {clarifications.map((item, idx) => (
            <div key={item.itemKey} className="py-4 hover:bg-slate-50/60 transition-colors rounded-2xl px-3">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1} [{item.itemKey}]</span>
                    <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.reviewStatus === 'FORMALLY_AMENDED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.reviewStatus === 'PENDING_LEGAL_CONFIRMATION'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.reviewStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-2">
                    <span className="font-medium">Source: {item.sourceSection}</span>
                    <span>&bull;</span>
                    <span className="font-medium">Reviewer: {item.responsibleReviewer}</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <strong>Issue:</strong> {item.issueDescription}
                  </p>
                  <p className="text-xs text-teal-900 bg-teal-50/60 p-2.5 rounded-xl border border-teal-200">
                    <strong>Active Interim Handling:</strong> {item.interimRule}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                  <select
                    value={item.reviewStatus}
                    onChange={(e) => handleUpdateStatus(item.itemKey, e.target.value)}
                    className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-2xs focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="INTERIM_CONFIGURED">Interim Configured</option>
                    <option value="PENDING_LEGAL_CONFIRMATION">Pending Legal Review</option>
                    <option value="FORMALLY_AMENDED">Formally Amended</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
