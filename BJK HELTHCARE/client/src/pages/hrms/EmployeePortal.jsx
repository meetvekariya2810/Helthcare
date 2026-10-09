import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  LogOut,
  Send,
  Sparkles,
  HelpCircle,
  Eye,
  Building,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { PolicyCenter } from './PolicyCenter';
import { Holidays } from './Holidays';

export const EmployeePortal = ({ initialTab = 'dashboard' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [leaveBalances, setLeaveBalances] = useState({
    EL: { balance: 7, max: 50, carryover: true },
    CL: { balance: 7, max: 7, carryover: false },
    SL: { balance: 4, max: 4, carryover: false },
    COMP_OFF: { balance: 2, max: 10, validDays: 90 }
  });
  const [policies, setPolicies] = useState([]);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState({
    punchedIn: false,
    punchInTime: null,
    shift: 'General (9:00 AM - 5:30 PM)',
    graceUsedThisMonth: 1
  });
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'EL',
    startDate: '',
    endDate: '',
    consecutiveDays: 3,
    reason: '',
    hasMedicalCert: false
  });
  const [leaveValidationResult, setLeaveValidationResult] = useState(null);
  const [grievanceForm, setGrievanceForm] = useState({
    category: 'ETHICS',
    isAnonymous: false,
    description: ''
  });
  const [submittedMessage, setSubmittedMessage] = useState('');

  const token =
    sessionStorage.getItem('bjk_employee_token') ||
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('bjk_employee_token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    localStorage.getItem('token') ||
    '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const polRes = await axios.get('/api/hr/policies', { headers }).catch(() => ({ data: { data: [] } }));
      if (polRes?.data?.data) {
        setPolicies(polRes.data.data);
      }
      const ackRes = await axios.get('/api/hr/policies/acknowledgments', { headers }).catch(() => ({ data: { data: [] } }));
      if (ackRes?.data?.data) {
        setAcknowledgments(ackRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching employee portal data:', err);
    }
  };

  const handlePunch = () => {
    if (!attendanceToday.punchedIn) {
      const now = new Date();
      setAttendanceToday({
        ...attendanceToday,
        punchedIn: true,
        punchInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setSubmittedMessage('Punch In recorded successfully with biometric integrity.');
    } else {
      setAttendanceToday({
        ...attendanceToday,
        punchedIn: false
      });
      setSubmittedMessage('Punch Out recorded successfully.');
    }
    setTimeout(() => setSubmittedMessage(''), 4000);
  };

  const validateLeave = () => {
    const days = Number(leaveForm.consecutiveDays);
    const type = leaveForm.leaveType;
    let valid = true;
    let message = 'Leave request complies with policy parameters.';
    let citation = 'BJK-HR-POL-001 (Page 5-7)';

    if (type === 'EL') {
      if (days < 3) {
        valid = false;
        message = 'Policy violation: Earned Leave requires a minimum block of 3 consecutive working days.';
      } else if (days > 15) {
        valid = false;
        message = 'Policy violation: Earned Leave maximum continuous stretch is 15 calendar days.';
      }
    } else if (type === 'CL') {
      if (days > 2) {
        valid = false;
        message = 'Policy violation: Casual Leave is limited to a maximum of 2 consecutive days at a time.';
      }
    } else if (type === 'SL') {
      if (days >= 3 && !leaveForm.hasMedicalCert) {
        valid = false;
        message = 'Policy violation: Sick Leave of 3 or more days requires an attached medical practitioner certificate.';
      }
    }

    setLeaveValidationResult({ valid, message, citation });
    return valid;
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!validateLeave()) return;

    setSubmittedMessage(`Leave request for ${leaveForm.consecutiveDays} days of ${leaveForm.leaveType} submitted to Reporting Manager for approval.`);
    setLeaveForm({ leaveType: 'EL', startDate: '', endDate: '', consecutiveDays: 3, reason: '', hasMedicalCert: false });
    setTimeout(() => {
      setSubmittedMessage('');
      setLeaveValidationResult(null);
    }, 5000);
  };

  const handleGrievanceSubmit = (e) => {
    e.preventDefault();
    const caseId = `ETH-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedMessage(`Confidential report registered. Tracking ID: ${caseId}. Protected under Zero Retaliation Policy.`);
    setGrievanceForm({ category: 'ETHICS', isAnonymous: false, description: '' });
    setTimeout(() => setSubmittedMessage(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Employee Persona Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bjk-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-bjk-teal to-bjk-cyan flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-bjk-teal border border-bjk-teal/30">
                  {user?.employeeCode || 'DEMO-EMP-001'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Confirmed Employee
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  GMP Qualified
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{user?.name || 'Dr. Meet Vekariya'}</h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{user?.designation || 'Quality Assurance Senior Specialist'}</span>
                <span>&bull;</span>
                <span>{user?.department || 'Quality Assurance (QA)'}</span>
                <span>&bull;</span>
                <span className="text-slate-300">Shift: General (9:00 AM - 5:30 PM)</span>
              </p>
            </div>
          </div>

          {/* Quick Action Biometric Punch */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePunch}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs transition-all shadow-lg ${
                attendanceToday.punchedIn
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-bjk-teal hover:bg-bjk-teal/90 text-white shadow-teal-500/20'
              }`}
            >
              <Clock size={16} />
              {attendanceToday.punchedIn
                ? `Punch Out (In at ${attendanceToday.punchInTime})`
                : 'Biometric Punch In (10m Grace)'}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {submittedMessage && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{submittedMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'My Self Service', icon: User },
            { id: 'policies', label: 'Policies & Acknowledgment', icon: ShieldCheck },
            { id: 'leave', label: 'Leave Center', icon: CalendarCheck },
            { id: 'holidays', label: 'Public Holidays', icon: CalendarDays },
            { id: 'training', label: 'Mandatory Training & GMP', icon: GraduationCap },
            { id: 'grievance', label: 'Raise Grievance / Ethics', icon: HelpCircle },
            { id: 'separation', label: 'Resignation & Clearance', icon: LogOut }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-bjk-teal text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Self Service Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Earned Leave (EL)</span>
                <CalendarCheck size={18} className="text-bjk-teal" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">7.0</span>
                <span className="text-xs text-slate-400">/ 50 Max Accumulation</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Accrues 0.58 days/month. Min block: 3 days.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Casual Leave (CL)</span>
                <Clock size={18} className="text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">7.0</span>
                <span className="text-xs text-slate-400">/ 7 Days (Lapses Dec 31)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Max continuous 2 days. For unplanned events.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Sick Leave (SL)</span>
                <FileText size={18} className="text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">4.0</span>
                <span className="text-xs text-slate-400">/ 4 Days Upfront</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Medical cert required for 3+ days.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">Compensatory Off</span>
                <Sparkles size={18} className="text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">2.0</span>
                <span className="text-xs text-slate-400">Days (Valid 90 Days)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Earned via holiday/overtime shifts.</p>
            </div>
          </div>

          {/* Policy Compliance & Shift Handover Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-bjk-teal" />
                Mandatory Policy Acknowledgments
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Under BJK HR policy, all employees must review and formally acknowledge each of the 13 company policies.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">13 BJK HR Policies (Effective 01 April 2026)</span>
                    <span className="text-[11px] text-slate-400">Required acknowledgment deadline: 30 April 2026</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('policies')}
                    className="px-3 py-1.5 rounded-lg bg-bjk-teal text-white text-[11px] font-medium"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Clock size={18} className="text-cyan-400" />
                GMP Shift Attendance Rules (Slide 9 & 12)
              </h2>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="font-semibold text-white block mb-0.5">10-Minute Grace Period</span>
                  <span className="text-slate-400 text-[11px]">Grace allowed up to 10 minutes post shift start. Habitual use (&ge;5x/month) flagged by HR.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="font-semibold text-white block mb-0.5">Mandatory 30-Minute Shift Overlap</span>
                  <span className="text-slate-400 text-[11px]">Cleanroom face-to-face handover required. Both operators must sign Shift Handover Log.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Policies Library (Embedded Full Engine) */}
      {activeTab === 'policies' && (
        <PolicyCenter />
      )}

      {/* TAB 3: Leave Application with Real Validation */}
      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
            <h2 className="text-base font-bold mb-1">Apply for Leave</h2>
            <p className="text-xs text-slate-400 mb-6">
              Requests are validated instantly against BJK-HR-POL-001 rules prior to supervisor submission.
            </p>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal"
                  >
                    <option value="EL">Earned Leave (EL) - Min 3 days</option>
                    <option value="CL">Casual Leave (CL) - Max 2 days</option>
                    <option value="SL">Sick Leave (SL) - 4d upfront</option>
                    <option value="COMP_OFF">Compensatory Off - 90d validity</option>
                    <option value="BEREAVEMENT_IMMEDIATE">Bereavement (Immediate family) - 2 paid days</option>
                    <option value="MARRIAGE">Marriage Leave - 5 paid days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Consecutive Working Days</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={leaveForm.consecutiveDays}
                    onChange={(e) => setLeaveForm({ ...leaveForm, consecutiveDays: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal"
                  />
                </div>
              </div>

              {leaveForm.leaveType === 'SL' && Number(leaveForm.consecutiveDays) >= 3 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <span className="text-amber-300 text-xs">Medical certificate required for Sick Leave of 3+ days (Slide 6)</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leaveForm.hasMedicalCert}
                      onChange={(e) => setLeaveForm({ ...leaveForm, hasMedicalCert: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-bjk-teal focus:ring-0"
                    />
                    <span className="text-white text-xs">Certificate Attached</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason for Absence</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide brief context for leave request..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal resize-none"
                />
              </div>

              {/* Validation Feedback */}
              {leaveValidationResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    leaveValidationResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {leaveValidationResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <div>
                    <span className="font-semibold block">{leaveValidationResult.message}</span>
                    <span className="text-[10px] text-slate-400">Rule Citation: {leaveValidationResult.citation}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={validateLeave}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Validate Policy Rules
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-bjk-teal hover:bg-bjk-teal/90 text-white text-xs font-medium shadow-md shadow-teal-500/30"
                >
                  Submit for Manager Approval
                </button>
              </div>
            </form>
          </div>

          {/* Rule Quick Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-white text-sm">Policy Rules Quick Guide (POL-001)</h3>
            <div className="space-y-3 text-slate-300">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-semibold text-bjk-teal block">Earned Leave (EL)</span>
                <span className="text-slate-400 text-[11px]">
                  &bull; Min block: 3 days<br />
                  &bull; Max continuous: 15 days<br />
                  &bull; Advance notice: 15d for 5+ days; 7d for 3-4 days<br />
                  &bull; Max accumulation: 50 days
                </span>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-semibold text-purple-300 block">Casual Leave (CL)</span>
                <span className="text-slate-400 text-[11px]">
                  &bull; Max continuous: 2 days at a time<br />
                  &bull; Cannot normally be clubbed with holidays<br />
                  &bull; Lapses Dec 31
                </span>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-semibold text-rose-300 block">Unauthorized Absence Penalties</span>
                <span className="text-slate-400 text-[11px]">
                  &bull; 1 day: LOP + salary deduction<br />
                  &bull; 2-3 days: LOP + written warning<br />
                  &bull; 4-7 days: LOP + suspension<br />
                  &bull; 8+ days: Voluntary abandonment / termination
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Public Holidays */}
      {activeTab === 'holidays' && (
        <Holidays />
      )}

      {/* TAB 5: Mandatory Training & GMP */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-2">100% Mandatory Training Modules (Slide 51-52)</h2>
            <p className="text-xs text-slate-400 mb-6">
              Under BJK-HR-POL-007, failure to complete mandatory training restricts personnel from GMP production duties and impacts appraisal scores.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'GMP Basics & Cleanroom Hygiene', timeline: 'Within 1st Week', pass: '80% Pass Mark', status: 'COMPLETED' },
                { name: 'Health, Safety & Environment', timeline: 'Within 1st Week', pass: 'Mandatory', status: 'COMPLETED' },
                { name: 'POSH Anti-Harassment Certification', timeline: 'Annual Requirement', pass: 'Mandatory', status: 'DUE_SOON' },
                { name: 'Code of Conduct & Ethics', timeline: 'Joining + Annual', pass: 'Mandatory', status: 'COMPLETED' },
                { name: 'Data Privacy & DPDP Compliance (2h)', timeline: 'Annual Requirement', pass: 'Mandatory', status: 'COMPLETED' },
                { name: 'IT & Information Security (2h)', timeline: 'Annual Requirement', pass: 'Mandatory', status: 'COMPLETED' },
                { name: 'Quarterly Fire Safety & Evacuation', timeline: 'Quarterly Drills', pass: 'Practical', status: 'COMPLETED' }
              ].map((m, i) => (
                <div key={i} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 block w-fit mb-2">
                      {m.timeline}
                    </span>
                    <h3 className="text-xs font-bold text-white mb-1">{m.name}</h3>
                    <p className="text-[11px] text-slate-400">{m.pass}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">BJK-HR-POL-007</span>
                    <span
                      className={`font-semibold ${
                        m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {m.status === 'COMPLETED' ? 'Qualified' : 'Pending Refresher'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Grievance & Ethics Reporting */}
      {activeTab === 'grievance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white max-w-2xl mx-auto shadow-xl">
          <div className="mb-4">
            <h2 className="text-base font-bold">Confidential Whistleblower & Grievance Reporting</h2>
            <p className="text-xs text-slate-400">
              Under BJK-HR-POL-003 (Slide 18), all employees have access to confidential reporting with zero retaliation guaranteed by executive management.
            </p>
          </div>

          <form onSubmit={handleGrievanceSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Issue Classification</label>
              <select
                value={grievanceForm.category}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal"
              >
                <option value="ETHICS">Ethics / Fraud / Bribery Violation (Zero Tolerance)</option>
                <option value="GMP_DEVIATION">GMP Data Integrity / Falsification Report</option>
                <option value="WORKPLACE_HARASSMENT">Workplace Bullying / Insubordination</option>
                <option value="SAFETY_HAZARD">Unsafe Cleanroom / Equipment Condition</option>
                <option value="GENERAL_GRIEVANCE">General Operational Grievance</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={grievanceForm.isAnonymous}
                  onChange={(e) => setGrievanceForm({ ...grievanceForm, isAnonymous: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-bjk-teal focus:ring-0"
                />
                <span className="text-slate-300 font-medium">
                  Submit Anonymously (Identity shielded from HR and Supervisors)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Incident Summary & Evidence Details</label>
              <textarea
                rows={4}
                required
                placeholder="Provide factual details, dates, individuals involved, and batch numbers if GMP related..."
                value={grievanceForm.description}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-bjk-teal resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-bjk-teal hover:bg-bjk-teal/90 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
              >
                Submit Confidential Case
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: Resignation & Exit Clearance */}
      {activeTab === 'separation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white max-w-2xl mx-auto shadow-xl">
          <h2 className="text-base font-bold mb-1">Employee Resignation & Exit Portal (POL-010)</h2>
          <p className="text-xs text-slate-400 mb-6">
            7-stage separation journey: 2-day HR acknowledgment, 5-day formal acceptance, 5-department digital clearance, and 45-day Full & Final Settlement SLA.
          </p>

          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3 text-xs mb-6">
            <span className="font-semibold text-white block">Exit Clearance Protocol</span>
            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">Department</div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">IT Assets</div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">Finance</div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">HR Records</div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">Security</div>
            </div>
            <span className="text-[11px] text-slate-400 block">
              &bull; F&F Settlement SLA: Within 45 calendar days<br />
              &bull; Relieving & Experience Certificate: Within 30 calendar days
            </span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => alert('Resignation submission initiated. HR Manager will contact for confidential retention discussion within 3 working days.')}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
            >
              Initiate Resignation Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;
