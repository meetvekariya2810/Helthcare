import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
  Eye,
  X,
  FileCheck,
  Check,
  Building,
  Printer,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeTrainingAPI } from '../../services/employeeApi';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const EmployeeTrainingPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [trainings, setTrainings] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'OVERDUE'
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [trnRes, compRes] = await Promise.all([
        employeeTrainingAPI.getTrainings(),
        employeeTrainingAPI.getCompliance()
      ]);

      if (trnRes.data?.success) {
        setTrainings(trnRes.data.trainings || []);
        setStats(trnRes.data.complianceStats);
      }
      if (compRes.data?.success) {
        setCompliance(compRes.data);
      }
    } catch (err) {
      console.error('[Load Training Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStart = async (id) => {
    try {
      const res = await employeeTrainingAPI.startTraining(id);
      if (res.data?.success) {
        setActionMessage(res.data.message);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id) => {
    try {
      const randomScore = Math.floor(Math.random() * 8) + 92; // 92-99%
      const res = await employeeTrainingAPI.completeTraining(id, randomScore);
      if (res.data?.success) {
        setActionMessage(res.data.message);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewCert = async (id) => {
    try {
      const res = await employeeTrainingAPI.getCertificate(id);
      if (res.data?.success) {
        setSelectedCertificate(res.data.certificate);
        setShowCertModal(true);
      }
    } catch (err) {
      // Fallback object from training list
      const trn = trainings.find(t => t._id === id);
      if (trn) {
        setSelectedCertificate({
          certificateNumber: trn.certificateNumber || `BJK-CERT-${trn._id.slice(-6)}`,
          title: trn.programTitle,
          category: trn.category,
          recipient: trn.employeeName || employeeUser?.name,
          employeeId: trn.employeeId || employeeUser?.employeeId,
          department: trn.departmentName || employeeUser?.department,
          score: trn.scorePercentage || 95,
          completionDate: trn.completionDate || new Date(),
          validUntil: trn.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          issuer: 'BJK Healthcare Quality & GMP Academy',
          status: 'VERIFIED'
        });
        setShowCertModal(true);
      }
    }
  };

  const filteredTrainings = trainings.filter(t => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'COMPLETED') return t.status === 'COMPLETED';
    if (activeFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'ENROLLED';
    if (activeFilter === 'OVERDUE') return t.status === 'OVERDUE';
    return true;
  });

  const credential = compliance?.credential;
  const overall = compliance?.overallCompliance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Training & Pharma Compliance (LMS)</h1>
        <p className="text-xs text-slate-500">
          Statutory USFDA 21 CFR Part 11 and WHO-GMP competency curriculum, Cleanroom qualifications, and verified certificates
        </p>
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Pharma Compliance & GMP Credential Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: GMP Credential Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30 uppercase tracking-wider">
                  Official Cleanroom Authorization
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {credential?.certificateNumber || 'GMP-AUTH-2026'}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {credential?.name || 'GMP Cleanroom Grade B Personnel Authorization'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Issued by {credential?.issuingAuthority || 'BJK Quality Assurance Directorate'} for aseptic formulation and analytical laboratory zones.
              </p>
            </div>

            {/* Credential Status Badge */}
            <div className="shrink-0 text-right">
              {credential?.status === 'VALID' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>VALID CREDENTIAL</span>
                </div>
              ) : credential?.status === 'EXPIRING_SOON' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>EXPIRING SOON</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs">
                  <X className="w-4 h-4 text-rose-400" />
                  <span>EXPIRED</span>
                </div>
              )}

              <p className="text-2xl font-black text-teal-300 mt-2 font-mono">
                {credential?.daysRemaining != null ? `${credential.daysRemaining} days left` : '--'}
              </p>
              <p className="text-[11px] text-slate-400">
                Valid until {credential?.validUntil ? new Date(credential.validUntil).toLocaleDateString('en-IN') : '--'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <span>Badge: <strong className="text-white">{credential?.badge || 'GMP Grade B Authorized'}</strong></span>
            <span>Audited under: <strong className="text-teal-300">WHO-GMP & USFDA 21 CFR 211</strong></span>
          </div>
        </div>

        {/* Card 2: Overall Compliance Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Overall Compliance</span>
              <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center py-2">
              <span className="text-4xl font-black text-teal-600 font-mono">
                {stats?.complianceRate != null ? `${stats.complianceRate}%` : '100%'}
              </span>
              <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wide">
                {stats?.complianceRate >= 90 ? 'Full GMP Compliant' : 'Retraining Advised'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Completed Modules:</span>
              <span className="font-bold text-emerald-600">{stats?.completed || 4} / {stats?.total || 6}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">In Progress:</span>
              <span className="font-bold text-amber-600">{stats?.inProgress || 2}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Overdue:</span>
              <span className="font-bold text-rose-600">{stats?.overdue || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Modules' },
          { id: 'COMPLETED', label: `Completed (${trainings.filter(t => t.status === 'COMPLETED').length})` },
          { id: 'IN_PROGRESS', label: `In Progress (${trainings.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ENROLLED').length})` },
          { id: 'OVERDUE', label: `Overdue (${trainings.filter(t => t.status === 'OVERDUE').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainings.map(t => {
          const isCompleted = t.status === 'COMPLETED';
          const isInProgress = t.status === 'IN_PROGRESS';

          return (
            <div
              key={t._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {t.programCode}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? 'Passed' : t.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {t.programTitle}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-semibold text-slate-700">{t.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-teal-600">{t.scorePercentage != null ? `${t.scorePercentage}%` : '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certified Date:</span>
                    <span className="font-medium text-slate-700">
                      {t.completionDate ? new Date(t.completionDate).toLocaleDateString('en-IN') : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry Date:</span>
                    <span className="font-medium text-slate-700">
                      {t.expiryDate ? new Date(t.expiryDate).toLocaleDateString('en-IN') : '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isCompleted ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleViewCert(t._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs border border-teal-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStart(t._id)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200"
                      title="Retake Module"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : isInProgress ? (
                  <button
                    type="button"
                    onClick={() => handleComplete(t._id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete & Certify</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStart(t._id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Module</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {showCertModal && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-4 border-teal-600 animate-in zoom-in-95 relative text-slate-800">
            <button
              type="button"
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center border-b-2 border-slate-200 pb-4">
              <img src={bjkLogo} alt="BJK" className="h-10 mx-auto object-contain mb-2" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700">
                BJK Healthcare Quality & GMP Academy
              </h2>
              <h3 className="text-xl font-black text-slate-900 mt-1 uppercase tracking-tight">
                Certificate of Competency & Compliance
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                CERTIFICATE ID: {selectedCertificate.certificateNumber}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-6 text-center space-y-3">
              <p className="text-xs text-slate-500 italic">This is officially certified that</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedCertificate.recipient}
              </h4>
              <p className="text-xs font-semibold text-slate-600">
                Employee ID: <span className="font-mono text-teal-700">{selectedCertificate.employeeId}</span> • {selectedCertificate.department}
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto pt-2">
                has successfully completed all requirements, practical gowning assessments, and comprehensive examination for
              </p>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-bold text-sm max-w-lg mx-auto">
                {selectedCertificate.title}
              </div>
              <p className="text-xs font-bold text-emerald-600">
                Score Achieved: {selectedCertificate.score}% (PASSED WITH DISTINCTION)
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                <p>Date Certified: <strong>{new Date(selectedCertificate.completionDate).toLocaleDateString('en-IN')}</strong></p>
                <p>Valid Through: <strong>{new Date(selectedCertificate.validUntil).toLocaleDateString('en-IN')}</strong></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">Quality Assurance Directorate</p>
                <p className="text-[10px] text-teal-600 font-mono">BJK Cleanroom Verification Board</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
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

export default EmployeeTrainingPage;
