import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Plus
} from 'lucide-react';

export const GrievanceRegisterView = ({ isHR = true }) => {
  const { showToast } = useNotification();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advance modal state
  const [advanceState, setAdvanceState] = useState({
    isOpen: false,
    grievance: null,
    nextStage: 'STEP_2_HR_INVESTIGATION',
    remarks: '',
    resolution: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getGrievances();
      if (res.data?.success) setGrievances(res.data.grievances || []);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdvance = async (e) => {
    e.preventDefault();
    if (!advanceState.grievance) return;
    try {
      const res = await leaveAPI.advanceGrievance(advanceState.grievance._id, {
        nextStage: advanceState.nextStage,
        remarks: advanceState.remarks,
        resolution: advanceState.resolution
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setAdvanceState({ isOpen: false, grievance: null, nextStage: 'STEP_2_HR_INVESTIGATION', remarks: '', resolution: '' });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update grievance stage', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 font-mono text-[11px] font-bold uppercase border border-rose-200">
              Policy Ref: Section 16
            </span>
            <span className="text-slate-500 text-xs font-semibold">21-Day Resolution SLA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Official Leave Grievance Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent dispute resolution: Step 1 (HR Submit 10d), Step 2 (HR Investigate 7d), Step 3 (MD Escalation 5d).
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-600 block">Total Active Grievances</span>
          <span className="text-2xl font-black text-slate-900">{grievances.length} Cases</span>
        </div>
      </div>

      {/* Grievances List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Fair Resolution Register (Zero Retaliation Policy Protected)</span>
          <span className="text-[11px] text-slate-500">ALCOA+ Traceability</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Grievance ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Incident Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Resolution Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {grievances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No leave grievances filed. All employee records in compliance.
                  </td>
                </tr>
              ) : (
                grievances.map((grv) => (
                  <tr key={grv._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{grv.grievanceId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{grv.employeeName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{grv.employeeCode} &bull; {grv.department}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{new Date(grv.incidentDate).toISOString().split('T')[0]}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{grv.subject}</div>
                      <div className="text-[10px] text-slate-500 max-w-xs truncate" title={grv.description}>{grv.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        grv.stage === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : grv.stage === 'STEP_3_MD_ESCALATION'
                          ? 'bg-rose-100 text-rose-800'
                          : grv.stage === 'STEP_2_HR_INVESTIGATION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {grv.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {grv.finalResolution || grv.investigationRemarks || grv.mdResolution || 'Under Review'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isHR && grv.stage !== 'RESOLVED' ? (
                        <button
                          onClick={() => setAdvanceState({
                            isOpen: true,
                            grievance: grv,
                            nextStage: grv.stage === 'STEP_1_HR_SUBMISSION' ? 'STEP_2_HR_INVESTIGATION' : grv.stage === 'STEP_2_HR_INVESTIGATION' ? 'STEP_3_MD_ESCALATION' : 'RESOLVED',
                            remarks: '',
                            resolution: ''
                          })}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold shadow-2xs"
                        >
                          Advance / Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle size={13} />
                          <span>Resolved</span>
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

      {/* Advance Modal */}
      {advanceState.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdvance} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Update Grievance Stage: {advanceState.grievance?.grievanceId}
            </h3>
            <p className="text-xs text-slate-500">
              Employee: <strong>{advanceState.grievance?.employeeName}</strong> &bull; Subject: {advanceState.grievance?.subject}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Action / Stage</label>
                <select
                  value={advanceState.nextStage}
                  onChange={(e) => setAdvanceState({ ...advanceState, nextStage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="STEP_2_HR_INVESTIGATION">Step 2: HR Investigation (Within 7 Working Days)</option>
                  <option value="STEP_3_MD_ESCALATION">Step 3: Escalate to Managing Director (Within 5 Working Days)</option>
                  <option value="RESOLVED">Final Resolution (Close Grievance)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Investigation Remarks / Rationale</label>
                <textarea
                  rows="2"
                  required
                  value={advanceState.remarks}
                  onChange={(e) => setAdvanceState({ ...advanceState, remarks: e.target.value })}
                  placeholder="Findings of HR inquiry or MD review"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {advanceState.nextStage === 'RESOLVED' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Final Resolution Outcome</label>
                  <textarea
                    rows="2"
                    required
                    value={advanceState.resolution}
                    onChange={(e) => setAdvanceState({ ...advanceState, resolution: e.target.value })}
                    placeholder="Documented corrective adjustment, balance restoration, or policy clarification given to employee"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdvanceState({ isOpen: false, grievance: null, nextStage: 'STEP_2_HR_INVESTIGATION', remarks: '', resolution: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                Update Grievance
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
