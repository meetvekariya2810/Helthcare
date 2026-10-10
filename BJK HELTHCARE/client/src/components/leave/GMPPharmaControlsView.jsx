import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle,
  FileCheck,
  Activity,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const GMPPharmaControlsView = () => {
  const { showToast } = useNotification();
  const [activeSubTab, setActiveSubTab] = useState('STAFFING');
  const [thresholds, setThresholds] = useState([]);
  const [blackouts, setBlackouts] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Blackout Modal
  const [isBlackoutModalOpen, setIsBlackoutModalOpen] = useState(false);
  const [newBlackout, setNewBlackout] = useState({
    title: '',
    department: 'ALL',
    startDate: '',
    endDate: '',
    reason: '',
    notificationDaysInAdvance: 30
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, bRes, trRes, mRes] = await Promise.all([
        leaveAPI.getStaffingThresholds(),
        leaveAPI.getBlackoutPeriods(),
        leaveAPI.getRefresherTrainings(),
        leaveAPI.getMedicalFitnessRecords()
      ]);
      if (tRes.data?.success) setThresholds(tRes.data.thresholds || []);
      if (bRes.data?.success) setBlackouts(bRes.data.blackouts || []);
      if (trRes.data?.success) setTrainings(trRes.data.trainings || []);
      if (mRes.data?.success) setMedicalRecords(mRes.data.records || []);
    } catch (err) {
      console.error('Failed to load GMP controls data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBlackout = async (e) => {
    e.preventDefault();
    try {
      const res = await leaveAPI.createBlackoutPeriod(newBlackout);
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setIsBlackoutModalOpen(false);
        setNewBlackout({ title: '', department: 'ALL', startDate: '', endDate: '', reason: '', notificationDaysInAdvance: 30 });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to declare blackout period', 'error');
    }
  };

  const handleDeleteBlackout = async (id) => {
    if (!window.confirm('Are you sure you want to remove this blackout period?')) return;
    try {
      const res = await leaveAPI.deleteBlackoutPeriod(id);
      if (res.data?.success) {
        showToast('Blackout period removed.', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to delete blackout period', 'error');
    }
  };

  const handleVerifyTraining = async (id) => {
    try {
      const res = await leaveAPI.verifyRefresherTraining(id, {
        remarks: 'QA confirmed employee completed WHO GMP TRS 986 & 21 CFR 211.25 refresher syllabus.'
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Verification failed', 'error');
    }
  };

  const handleVerifyFitness = async (id, approved) => {
    try {
      const res = await leaveAPI.verifyMedicalFitnessRecord(id, {
        approved,
        remarks: approved ? 'Medical doctor certificate confirmed fit for cleanroom entry.' : 'Certificate rejected.'
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl shadow-sm border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold uppercase border border-teal-500/30">
              WHO GMP TRS 986 &bull; US FDA 21 CFR 211
            </span>
            <span className="text-slate-400 text-xs font-semibold">Pharma Workforce Compliance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            GMP &amp; Regulated Manufacturing Workforce Controls
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Operational continuity, cleanroom staffing thresholds, blackout notices, and medical re-qualification.
          </p>
        </div>

        <button
          onClick={() => setIsBlackoutModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-all shrink-0"
        >
          <Plus size={16} />
          <span>Declare Blackout Period</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('STAFFING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'STAFFING' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Department Staffing Thresholds ({thresholds.length})
        </button>
        <button
          onClick={() => setActiveSubTab('BLACKOUTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'BLACKOUTS' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leave Blackout Periods ({blackouts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('TRAINING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'TRAINING' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          30+ Day Leave GMP Refresher Queue ({trainings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('FITNESS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'FITNESS' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sick Leave Fitness-to-Resume Verifications ({medicalRecords.length})
        </button>
      </div>

      {/* SUBTAB 1: STAFFING THRESHOLDS */}
      {activeSubTab === 'STAFFING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thresholds.map((dt) => (
            <div key={dt._id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                  {dt.department}
                </span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Min {dt.minStaffPercentage}% Present
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">{dt.departmentName}</h4>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Min Headcount</span>
                  <span className="font-bold text-slate-900">{dt.minStaffCount} Members</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Max Concurrent Leaves</span>
                  <span className="font-bold text-slate-900">{dt.maxSimultaneousLeaves} Staff</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Designated Critical Roles</span>
                <div className="flex flex-wrap gap-1">
                  {(dt.criticalRoles || []).map((role, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: BLACKOUT PERIODS */}
      {activeSubTab === 'BLACKOUTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Declared Blackout Periods (Section 14.2 &bull; 30-Day Notice Enforced)</span>
            <span className="text-[11px] text-slate-500">Emergency &amp; Sick Leaves Remain Permitted</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Period ID</th>
                  <th className="py-3 px-4">Title / Reason</th>
                  <th className="py-3 px-4">Department / Facility</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Notification Notice</th>
                  <th className="py-3 px-4">Declared By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {blackouts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No active blackout periods declared.
                    </td>
                  </tr>
                ) : (
                  blackouts.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.periodId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.title}</div>
                        <div className="text-[10px] text-slate-500 max-w-xs truncate">{b.reason}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{b.department}</span>
                        <span className="text-[10px] text-slate-500 block">({b.facility})</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {b.startDateString} &rarr; {b.endDateString}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {b.notificationDaysInAdvance} Days Advance Notice
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{b.declaredBy}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteBlackout(b._id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remove Blackout Period"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REFRESHER TRAINING QUEUE */}
      {activeSubTab === 'TRAINING' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">GMP Re-Qualification After Extended Leave (Section 14.3)</span>
            <span className="text-[11px] text-slate-500">WHO GMP TRS 986 &bull; 21 CFR 211.25</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Training ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Duration</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Syllabus Topic</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">QA Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {trainings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No employees currently require extended absence GMP refresher training.
                    </td>
                  </tr>
                ) : (
                  trainings.map((tr) => (
                    <tr key={tr._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{tr.trainingId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tr.employeeName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tr.employeeCode} &bull; {tr.department}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-800">{tr.leaveDurationDays} Days Leave</td>
                      <td className="py-3 px-4 font-medium">{new Date(tr.returnDate).toISOString().split('T')[0]}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{tr.trainingTopic}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tr.status === 'VERIFIED_BY_QA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tr.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tr.status !== 'VERIFIED_BY_QA' ? (
                          <button
                            onClick={() => handleVerifyTraining(tr._id)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-2xs"
                          >
                            QA Verify &amp; Re-Qualify
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end space-x-1">
                            <CheckCircle size={13} />
                            <span>Qualified for Cleanroom</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: MEDICAL FITNESS VERIFICATIONS */}
      {activeSubTab === 'FITNESS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Fitness-to-Resume Duties Verification (Section 7.7)</span>
            <span className="text-[11px] text-slate-500">Mandatory for Sick Leave &ge; 4 Days in GMP Cleanrooms &amp; QC</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Sick Days</th>
                  <th className="py-3 px-4">Treating Doctor / Clinic</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">HR Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {medicalRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No pending medical fitness certificates awaiting review.
                    </td>
                  </tr>
                ) : (
                  medicalRecords.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.recordId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{m.employeeName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{m.employeeCode} &bull; {m.department}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-900">{m.sickLeaveDays} Days SL</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{m.doctorName || 'Registered Medical Practitioner'}</div>
                        <div className="text-[10px] text-slate-500">{m.clinicOrHospital || 'MBBS / MD Certified'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {m.documentUrl ? (
                          <a
                            href={m.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-teal-600 hover:text-teal-800 font-bold"
                          >
                            <ExternalLink size={12} />
                            <span>View Medical Cert</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No attachment</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          m.status === 'VERIFIED_BY_HR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {m.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {m.status === 'SUBMITTED' ? (
                          <>
                            <button
                              onClick={() => handleVerifyFitness(m._id, true)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-200"
                            >
                              Approve Fitness
                            </button>
                            <button
                              onClick={() => handleVerifyFitness(m._id, false)}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Verified by HR</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Declare Blackout Modal */}
      {isBlackoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateBlackout} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Declare Official Leave Blackout Period
            </h3>
            <p className="text-xs text-slate-500">
              In compliance with BJK-HR-POL-001 Section 14.2, employees must be notified at least 30 days in advance. Emergency and Sick leaves remain available.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Blackout Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US FDA Pre-Approval Inspection Campaign"
                  value={newBlackout.title}
                  onChange={(e) => setNewBlackout({ ...newBlackout, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newBlackout.startDate}
                    onChange={(e) => setNewBlackout({ ...newBlackout, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newBlackout.endDate}
                    onChange={(e) => setNewBlackout({ ...newBlackout, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department Scope</label>
                  <select
                    value={newBlackout.department}
                    onChange={(e) => setNewBlackout({ ...newBlackout, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="ALL">All Departments (Plant-Wide)</option>
                    <option value="PRD">PRD (Production)</option>
                    <option value="QC">QC (Quality Control)</option>
                    <option value="QA">QA (Quality Assurance)</option>
                    <option value="WAREHOUSE">Warehouse &amp; Stores</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Advance Notice (Days)</label>
                  <input
                    type="number"
                    min="30"
                    value={newBlackout.notificationDaysInAdvance}
                    onChange={(e) => setNewBlackout({ ...newBlackout, notificationDaysInAdvance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Audit Justification &amp; Operational Rationale</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Explain why operational presence is mandatory (e.g. Regulatory inspection, critical batch manufacturing campaign)."
                  value={newBlackout.reason}
                  onChange={(e) => setNewBlackout({ ...newBlackout, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBlackoutModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                Declare Blackout Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
