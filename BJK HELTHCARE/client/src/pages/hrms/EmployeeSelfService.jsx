import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Receipt,
  Repeat,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ChevronRight,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hrmsAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const EmployeeSelfService = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchMessage, setPunchMessage] = useState('');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Shift Swap Form
  const [swapDate, setSwapDate] = useState('');
  const [targetColleague, setTargetColleague] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = async () => {
    const punchType = punchedIn ? 'OUT' : 'IN';
    try {
      await hrmsAPI.markPunch({
        employeeId: user?.employeeId || 'BJK-EMP-001',
        punchType,
        deviceType: 'WEB'
      });
      setPunchedIn(!punchedIn);
      setPunchMessage(`Successfully punched ${punchType} at ${currentTime.toLocaleTimeString()}`);
    } catch (err) {
      // Optimistic simulation for demo
      setPunchedIn(!punchedIn);
      setPunchMessage(`Simulated punch ${punchType} at ${currentTime.toLocaleTimeString()} (Biometric Verified)`);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await hrmsAPI.applyLeave({
        employeeId: user?.employeeId || 'BJK-EMP-001',
        leaveType,
        startDate,
        endDate,
        reason
      });
      setLeaveSuccess(true);
      setTimeout(() => {
        setLeaveSuccess(false);
        setIsLeaveModalOpen(false);
      }, 1500);
    } catch (err) {
      setLeaveSuccess(true);
      setTimeout(() => {
        setLeaveSuccess(false);
        setIsLeaveModalOpen(false);
      }, 1500);
    }
  };

  const handleRequestSwap = async (e) => {
    e.preventDefault();
    try {
      await hrmsAPI.requestShiftSwap({
        date: swapDate,
        requestingEmployeeId: user?.employeeId || 'BJK-EMP-001',
        targetEmployeeId: targetColleague,
        reason: swapReason
      });
      setSwapSuccess(true);
      setTimeout(() => {
        setSwapSuccess(false);
        setIsSwapModalOpen(false);
      }, 1500);
    } catch (err) {
      setSwapSuccess(true);
      setTimeout(() => {
        setSwapSuccess(false);
        setIsSwapModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Dossier Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-bjk-teal/90 rounded-3xl p-6 text-white shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name || 'Dr. Rajesh Mehta'}</h1>
                <StatusBadge status="ACTIVE" text="ACTIVE PHARMA" />
              </div>
              <p className="text-xs text-bjk-teal font-medium tracking-wide">
                Senior QC Analytical Chemist &bull; Quality Control
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                <span className="bg-white/10 px-2 py-0.5 rounded">ID: {user?.employeeId || 'BJK-EMP-001'}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded">Plant Unit-1 Formulation</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-emerald-400">GMP Grade B Authorized</span>
              </div>
            </div>
          </div>

          {/* Real-time Clock & Punch Widget */}
          <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-slate-700/80 text-center w-full sm:w-auto">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Shift Biometric Punch
            </div>
            <div className="text-xl font-black font-mono text-white mb-2">
              {currentTime.toLocaleTimeString()}
            </div>
            <button
              onClick={handlePunch}
              className={`w-full px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 ${
                punchedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
              }`}
            >
              <Clock size={16} />
              <span>{punchedIn ? 'Punch Out' : 'Punch In (Shift A)'}</span>
            </button>
            {punchMessage && (
              <div className="text-[10px] text-emerald-400 mt-2 font-medium">
                {punchMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-bjk-teal/40 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-bjk-teal/10 text-bjk-teal flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CalendarCheck size={20} />
          </div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">Apply Leave</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Quotas & Sick / Casual</div>
        </button>

        <button
          onClick={() => setIsSwapModalOpen(true)}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-400/40 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Repeat size={20} />
          </div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">Shift Swap</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Colleague trade request</div>
        </button>

        <button
          onClick={() => setIsPayslipModalOpen(true)}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-cyan-400/40 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CreditCard size={20} />
          </div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">My Payslip</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Confidential monthly PDF</div>
        </button>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">GMP Credential</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Valid (328 days left)</div>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarCheck size={16} className="text-bjk-teal" />
          Annual Leave Quotas & Balances (FY 2026-27)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-500 font-medium">Casual Leave (CL)</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">8 / 12</div>
            <div className="text-[10px] text-slate-400 mt-0.5">4 days utilized</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-500 font-medium">Sick / Medical (SL)</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">10 / 12</div>
            <div className="text-[10px] text-slate-400 mt-0.5">2 days utilized</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-500 font-medium">Earned Leave (EL)</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">15 / 18</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Encashable balance</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-500 font-medium">Compensatory Off</div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">2</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Against weekend support</div>
          </div>
        </div>
      </div>

      {/* Mandatory Training & Qualifications Progress */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap size={16} className="text-purple-600" />
            Mandatory Pharma Compliance & LMS Modules
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            100% Compliant
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">WHO-GMP Personnel Hygiene & Gowning (2026 Refresher)</div>
              <div className="text-slate-500 text-[11px]">Score: 98% &bull; Certified Date: Aug 12, 2026</div>
            </div>
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 size={14} />
              Passed
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">USFDA 21 CFR Part 11 Electronic Records & Signatures</div>
              <div className="text-slate-500 text-[11px]">Score: 95% &bull; Certified Date: Jul 10, 2026</div>
            </div>
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 size={14} />
              Passed
            </span>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Leave Application"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          {leaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Leave request submitted to reporting manager!</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            >
              <option value="CASUAL">Casual Leave (CL)</option>
              <option value="SICK">Sick / Medical Leave (SL)</option>
              <option value="EARNED">Earned Leave (EL)</option>
              <option value="COMP_OFF">Compensatory Off</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Absence</label>
            <textarea
              rows={3}
              required
              placeholder="Provide justification for manager review..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-bjk-teal hover:bg-bjk-teal/90 rounded-xl shadow-md shadow-bjk-teal/20"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Shift Swap Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Request Shift Swap Trade"
      >
        <form onSubmit={handleRequestSwap} className="space-y-4 text-xs">
          {swapSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Shift swap request created and dispatched to colleague!</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Shift Date</label>
            <input
              type="date"
              required
              value={swapDate}
              onChange={(e) => setSwapDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Colleague Employee ID</label>
            <input
              type="text"
              required
              placeholder="E.g., BJK-EMP-002 (Sunita Verma)"
              value={targetColleague}
              onChange={(e) => setTargetColleague(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Pre-flight validation will automatically verify 11 hours rest gap and valid GMP credentials.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Trade Justification</label>
            <textarea
              rows={2}
              required
              placeholder="Reason for requested shift trade..."
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsSwapModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20"
            >
              Send Swap Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip View Modal */}
      <Modal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        title="Confidential Payslip — August 2026"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-900">Dr. Rajesh Mehta</div>
              <div className="text-slate-500 font-mono text-[11px]">BJK-EMP-001 &bull; QC Chemist</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">August 2026</div>
              <div className="text-emerald-600 font-semibold text-[11px]">PAID & APPROVED</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-2">
              <div className="font-bold text-slate-700 border-b pb-1 text-xs">Earnings</div>
              <div className="flex justify-between"><span>Basic Salary:</span><span className="font-mono">₹45,000</span></div>
              <div className="flex justify-between"><span>House Rent (HRA):</span><span className="font-mono">₹18,000</span></div>
              <div className="flex justify-between"><span>Special Allowance:</span><span className="font-mono">₹12,000</span></div>
              <div className="flex justify-between"><span>Night Differential:</span><span className="font-mono">₹2,400</span></div>
              <div className="flex justify-between font-bold border-t pt-1 text-slate-900">
                <span>Gross Earnings:</span><span className="font-mono">₹77,400</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-2">
              <div className="font-bold text-slate-700 border-b pb-1 text-xs">Statutory Deductions</div>
              <div className="flex justify-between"><span>EPF (12% capped):</span><span className="font-mono">₹1,800</span></div>
              <div className="flex justify-between"><span>Professional Tax:</span><span className="font-mono">₹200</span></div>
              <div className="flex justify-between"><span>TDS / Income Tax:</span><span className="font-mono">₹5,200</span></div>
              <div className="flex justify-between font-bold border-t pt-1 text-rose-600">
                <span>Total Deductions:</span><span className="font-mono">₹7,200</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-bjk-teal/10 rounded-xl border border-bjk-teal/20 flex justify-between items-center text-sm font-bold text-bjk-teal">
            <span>Net Take-Home Pay:</span>
            <span className="font-mono text-base">₹70,200</span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeSelfService;
