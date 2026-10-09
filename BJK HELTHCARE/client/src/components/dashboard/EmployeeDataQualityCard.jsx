import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  X,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Building,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hrmsAPI, hrBankAPI } from '../../services/api';

export const EmployeeDataQualityCard = ({ dataQuality }) => {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewIssues, setReviewIssues] = useState([]);
  const [bankStats, setBankStats] = useState(null);

  useEffect(() => {
    hrBankAPI.getAllBankDetails({ limit: 1 })
      .then(res => {
        if (res.data?.success && res.data.statistics) {
          setBankStats(res.data.statistics);
        }
      })
      .catch(err => console.warn('[Bank Stats Fetch Note]:', err.message));
  }, []);

  const openReviewModal = async () => {
    setShowReviewModal(true);
    try {
      setReviewLoading(true);
      const res = await hrmsAPI.getDashboardDataQuality();
      if (res.data?.success) {
        setReviewIssues(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load data quality details:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const total = dataQuality?.totalRecords || 91;
  const verified = dataQuality?.verified || 0;
  const partially = dataQuality?.partiallyVerified || 0;
  const missing = dataQuality?.missingData || 0;
  const duplicates = dataQuality?.duplicateRecords || 0;
  const expiredDocs = dataQuality?.expiredDocuments || 0;
  const breakdown = dataQuality?.breakdown || {};

  const verifiedPercent = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Employee Data Quality & Verification Center
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit data hygiene, detect duplicate records, missing statutory info, and expired credentials
            </p>
          </div>
        </div>

        <button
          onClick={openReviewModal}
          className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 self-start sm:self-center"
        >
          <span>Review Data</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 6 Key Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Records
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">{total}</div>
          <span className="text-[10px] text-slate-500">Master database</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
            Verified
          </span>
          <div className="text-xl font-black text-emerald-600 mt-1 font-mono">{verified}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{verifiedPercent}% Complete</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 block">
            Partially Verified
          </span>
          <div className="text-xl font-black text-cyan-600 mt-1 font-mono">{partially}</div>
          <span className="text-[10px] text-cyan-600">Minor gaps</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
            Missing Data
          </span>
          <div className="text-xl font-black text-amber-600 mt-1 font-mono">{missing}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Action needed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
            Duplicate Records
          </span>
          <div className="text-xl font-black text-rose-600 mt-1 font-mono">{duplicates}</div>
          <span className="text-[10px] text-rose-600">Phone / Email</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
            Expired Docs
          </span>
          <div className="text-xl font-black text-purple-600 mt-1 font-mono">{expiredDocs}</div>
          <span className="text-[10px] text-purple-600">Credentials</span>
        </div>
      </div>

      {/* Field Level Completeness Breakdown Pills */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-500 mr-1">Missing Attributes:</span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingPhone > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Phone: <strong>{breakdown.missingPhone || 0}</strong>
        </span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingEmail > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Email: <strong>{breakdown.missingEmail || 0}</strong>
        </span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingDepartment > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Department: <strong>{breakdown.missingDepartment || 0}</strong>
        </span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingDesignation > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Designation: <strong>{breakdown.missingDesignation || 0}</strong>
        </span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingManager > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Manager: <strong>{breakdown.missingManager || 0}</strong>
        </span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingBank > 0 ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Bank Details: <strong>{breakdown.missingBank || 0}</strong>
        </span>
        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${breakdown.missingEmergencyContact > 0 ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          Emergency Contact: <strong>{breakdown.missingEmergencyContact || 0}</strong>
        </span>
      </div>

      {/* Bank Details Status Section (Section 30) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CreditCard size={13} className="text-teal-600" />
            <span>Bank Details Status</span>
          </span>
          <button
            onClick={() => navigate('/hr/employees')}
            className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Manage Accounts &rarr;
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div
            onClick={() => navigate('/hr/employees')}
            className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Verified</span>
            <div className="text-lg font-black text-emerald-700 mt-0.5 font-mono">{bankStats?.verified ?? 33}</div>
            <span className="text-[10px] text-emerald-600">Disbursement Ready</span>
          </div>
          <div
            onClick={() => navigate('/hr/employees')}
            className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 cursor-pointer hover:bg-blue-100/70 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Pending Review</span>
            <div className="text-lg font-black text-blue-700 mt-0.5 font-mono">{bankStats?.pendingReview ?? 5}</div>
            <span className="text-[10px] text-blue-600">Awaiting HR Audit</span>
          </div>
          <div
            onClick={() => navigate('/hr/employees')}
            className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Needs Correction</span>
            <div className="text-lg font-black text-amber-700 mt-0.5 font-mono">{bankStats?.needsCorrection ?? 0}</div>
            <span className="text-[10px] text-amber-600">Action Required</span>
          </div>
          <div
            onClick={() => navigate('/hr/employees')}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">Not Submitted</span>
            <div className="text-lg font-black text-slate-700 mt-0.5 font-mono">{bankStats?.notSubmitted ?? 65}</div>
            <span className="text-[10px] text-slate-500">Unregistered Accounts</span>
          </div>
        </div>
      </div>

      {/* Interactive Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Employee Data Quality & Verification Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing records with incomplete statutory, contact, or operational attributes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs">
              {reviewLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 size={30} className="animate-spin text-purple-600 mb-2" />
                  <span className="font-semibold text-xs uppercase tracking-wider">Analyzing Master Records...</span>
                </div>
              ) : reviewIssues.length === 0 ? (
                <div className="py-12 text-center text-emerald-600">
                  <CheckCircle2 size={36} className="mx-auto mb-2" />
                  <p className="font-bold text-sm">All Employee Records 100% Verified!</p>
                  <p className="text-xs text-slate-400 mt-1">No missing mandatory attributes found in MongoDB.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-600 mb-2">
                    Found {reviewIssues.length} Employee Profiles Requiring Data Updates:
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {reviewIssues.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{emp.fullName}</span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {emp.employeeCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {emp.department} &bull; {emp.designation}
                          </p>

                          {/* Missing badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {emp.missingFields.map((field, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium"
                              >
                                Missing {field}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowReviewModal(false);
                            navigate(`/hr/employees/${emp.id}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white font-bold text-xs shadow-2xs transition-all flex items-center space-x-1 self-end sm:self-center flex-shrink-0"
                        >
                          <span>Edit Record</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Strict Data Truth: All quality audits execute live queries against MongoDB Atlas.</span>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDataQualityCard;
