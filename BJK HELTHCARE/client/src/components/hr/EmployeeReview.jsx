import React from 'react';
import {
  CheckCircle as FiCheckCircle,
  AlertTriangle as FiAlertTriangle,
  User as FiUser,
  Briefcase as FiBriefcase,
  MapPin as FiMapPin,
  Award as FiAward,
  CreditCard as FiCreditCard,
  Shield as FiShield,
  Heart as FiHeart,
  Folder as FiFolder,
  CheckSquare as FiCheckSquare,
  Save as FiSave,
  Send as FiSend,
  Edit3 as FiEdit3
} from 'lucide-react';

export default function EmployeeReview({ data = {}, onJumpToStep, onSubmitForVerification, onSaveDraft, isSubmitting = false }) {
  const getMasked = (str, keepEnd = 4) => {
    if (!str) return 'Not Provided';
    if (str.length <= keepEnd) return '••••' + str;
    return '•••• •••• ' + str.slice(-keepEnd);
  };

  // Validation checks for checklist
  const checks = [
    {
      id: 1,
      title: 'Personal & Contact Information',
      step: 1,
      valid: !!(data.firstName && data.lastName && data.officialEmail && data.mobileNumber && data.dateOfBirth),
      summary: `${data.firstName || ''} ${data.lastName || ''} | ${data.officialEmail || 'No email'}`
    },
    {
      id: 2,
      title: 'Job & Organizational Details',
      step: 2,
      valid: !!(data.department && data.designation && data.reportingManager && data.joiningDate),
      summary: `${data.designation || 'No designation'} in ${data.department || 'No department'}`
    },
    {
      id: 3,
      title: 'Previous Employment History',
      step: 3,
      valid: (data.previousEmployment && data.previousEmployment.length > 0) || data.employmentType === 'Intern',
      summary: `${(data.previousEmployment || []).length} past company record(s) logged`
    },
    {
      id: 4,
      title: 'Family & Statutory Nominee',
      step: 4,
      valid: !!(data.familyDetails && data.familyDetails.nomineeName && data.familyDetails.nomineeRelationship),
      summary: data.familyDetails?.nomineeName ? `Nominee: ${data.familyDetails.nomineeName} (${data.familyDetails.nomineeRelationship})` : 'Nominee pending'
    },
    {
      id: 5,
      title: 'Residential & Permanent Address',
      step: 5,
      valid: !!(data.addressDetails && data.addressDetails.permanentAddress?.addressLine1 && data.addressDetails.permanentAddress?.pinCode),
      summary: data.addressDetails?.permanentAddress?.city ? `${data.addressDetails.permanentAddress.city}, ${data.addressDetails.permanentAddress.state}` : 'Address incomplete'
    },
    {
      id: 6,
      title: 'Education & Professional Qualifications',
      step: 6,
      valid: !!(data.educationDetails && data.educationDetails.length > 0),
      summary: `${(data.educationDetails || []).length} academic qualification(s) attached`
    },
    {
      id: 7,
      title: 'Bank & Financial Information',
      step: 7,
      valid: !!(data.bankDetails && data.bankDetails.accountNumber && data.bankDetails.ifscCode && data.bankDetails.bankName),
      summary: data.bankDetails?.bankName ? `${data.bankDetails.bankName} (A/C: ${getMasked(data.bankDetails.accountNumber)})` : 'Bank pending'
    },
    {
      id: 8,
      title: 'Identity & Government Documents',
      step: 8,
      valid: !!(data.identityDocuments && data.identityDocuments.panNumber && data.identityDocuments.aadhaarNumber),
      summary: `PAN: ${getMasked(data.identityDocuments?.panNumber, 4)} | Aadhaar: ${getMasked(data.identityDocuments?.aadhaarNumber, 4)}`
    },
    {
      id: 9,
      title: 'Healthcare & Pharma GxP Compliance',
      step: 9,
      valid: !!(data.complianceTraining && data.complianceTraining.length > 0),
      summary: `${(data.complianceTraining || []).length} compliance module(s) tracked`
    },
    {
      id: 10,
      title: 'Occupational Health & Fitness',
      step: 10,
      valid: !!(data.occupationalHealth && data.occupationalHealth.medicalFitnessStatus),
      summary: `Status: ${data.occupationalHealth?.medicalFitnessStatus || 'Fit for duty'}`
    },
    {
      id: 11,
      title: 'Document Center & Verification Proofs',
      step: 11,
      valid: !!(data.documents && data.documents.some((d) => d.fileUrl)),
      summary: `${(data.documents || []).filter((d) => d.fileUrl).length} document(s) uploaded`
    }
  ];

  const passedCount = checks.filter((c) => c.valid).length;
  const scorePercent = Math.round((passedCount / checks.length) * 100);
  const isReadyForSubmission = scorePercent >= 70 && !!data.firstName && !!data.officialEmail;

  return (
    <div className="space-y-8">
      {/* Header & Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-lg border border-teal-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
              <FiCheckCircle size={13} /> Final Step 12: Application Review & HR Submission
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {data.firstName ? `${data.firstName} ${data.lastName || ''}` : 'Employee Onboarding Dossier'}
            </h2>
            <p className="text-xs text-slate-300">
              ID: <span className="font-mono font-bold text-teal-300">{data.employeeId || 'BJK-EMP-000124'}</span> • Role:{' '}
              <span className="font-medium text-white">{data.designation || 'Specialist'}</span> ({data.department || 'Operations'})
            </p>
          </div>

          {/* Completion Score Ring/Bar */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center min-w-[180px]">
            <span className="text-xs text-slate-400 font-medium">Profile Completion</span>
            <div className="text-3xl font-extrabold text-teal-400 mt-1">{scorePercent}%</div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  scorePercent >= 90 ? 'bg-emerald-400' : scorePercent >= 60 ? 'bg-teal-400' : 'bg-amber-400'
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5 font-medium">
              {passedCount} of {checks.length} Sections Complete
            </span>
          </div>
        </div>
      </div>

      {/* Validation Checklist Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Section-by-Section Readiness Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                c.valid
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {c.valid ? (
                    <FiCheckCircle className="text-emerald-500" size={18} />
                  ) : (
                    <FiAlertTriangle className="text-amber-500" size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{c.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {c.summary}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onJumpToStep(c.step)}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
              >
                <FiEdit3 size={11} /> Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 360 Dossier Summary Box */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Onboarding Dossier Summary Preview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <FiUser size={14} /> Basic & Personal
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <div><strong>Name:</strong> {data.firstName} {data.middleName} {data.lastName}</div>
              <div><strong>Gender:</strong> {data.gender || 'Not specified'}</div>
              <div><strong>DOB:</strong> {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : '—'}</div>
              <div><strong>Blood Group:</strong> {data.bloodGroup || '—'}</div>
              <div><strong>Official Email:</strong> {data.officialEmail || '—'}</div>
              <div><strong>Mobile:</strong> {data.mobileNumber || '—'}</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <FiBriefcase size={14} /> Employment & Organization
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <div><strong>Department:</strong> {data.department || '—'}</div>
              <div><strong>Designation:</strong> {data.designation || '—'}</div>
              <div><strong>Reporting Manager:</strong> {data.reportingManager || '—'}</div>
              <div><strong>Work Location:</strong> {data.workLocation || 'Ahmedabad Facility'}</div>
              <div><strong>Employment Type:</strong> {data.employmentType || 'Full Time'}</div>
              <div><strong>Joining Date:</strong> {data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : '—'}</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <FiCreditCard size={14} /> Bank & Compliance
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1">
              <div><strong>Bank Name:</strong> {data.bankDetails?.bankName || '—'}</div>
              <div><strong>Account No:</strong> {getMasked(data.bankDetails?.accountNumber)}</div>
              <div><strong>IFSC Code:</strong> {data.bankDetails?.ifscCode || '—'}</div>
              <div><strong>PAN:</strong> {getMasked(data.identityDocuments?.panNumber)}</div>
              <div><strong>Aadhaar:</strong> {getMasked(data.identityDocuments?.aadhaarNumber)}</div>
              <div><strong>Medical Clearance:</strong> {data.occupationalHealth?.medicalFitnessStatus || 'Fit'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Footer Actions */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ready for Enterprise Verification?</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Submitting initiates the formal document, bank, and department approval pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all"
          >
            <FiSave size={14} /> Save Incomplete Draft
          </button>

          <button
            type="button"
            disabled={!isReadyForSubmission || isSubmitting}
            onClick={onSubmitForVerification}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
              isReadyForSubmission && !isSubmitting
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <FiSend size={14} /> {isSubmitting ? 'Submitting Dossier...' : 'Submit for HR Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
