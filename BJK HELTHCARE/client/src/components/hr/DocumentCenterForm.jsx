import React from 'react';
import {
  Folder as FiFolder,
  UploadCloud as FiUploadCloud,
  FileText as FiFileText,
  CheckCircle as FiCheckCircle,
  AlertCircle as FiAlertCircle,
  Trash2 as FiTrash2,
  ExternalLink as FiExternalLink
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  { id: 'OFFER_LETTER', name: 'Signed Offer Letter', mandatory: true, group: 'Employment' },
  { id: 'APPOINTMENT_LETTER', name: 'Appointment & Terms Letter', mandatory: true, group: 'Employment' },
  { id: 'JOINING_REPORT', name: 'Joining Report / Acceptance', mandatory: true, group: 'Employment' },
  { id: 'AADHAAR_CARD', name: 'Aadhaar Card Copy', mandatory: true, group: 'Identity' },
  { id: 'PAN_CARD', name: 'PAN Card Copy', mandatory: true, group: 'Identity' },
  { id: 'PASSPORT_PHOTO', name: 'Passport Size Photographs', mandatory: true, group: 'Identity' },
  { id: 'DEGREE_CERTIFICATE', name: 'Highest Degree Certificate', mandatory: true, group: 'Education' },
  { id: 'ALL_MARK_SHEETS', name: 'Academic Transcripts / Marksheets', mandatory: false, group: 'Education' },
  { id: 'PHARMACY_REG_CERT', name: 'Pharmacy Council Registration', mandatory: false, group: 'Education' },
  { id: 'RELIEVING_LETTER', name: 'Previous Company Relieving Letter', mandatory: false, group: 'Experience' },
  { id: 'EXPERIENCE_LETTER', name: 'Previous Company Experience Letter', mandatory: false, group: 'Experience' },
  { id: 'LAST_3_PAYSLIPS', name: 'Last 3 Months Salary Slips', mandatory: false, group: 'Experience' },
  { id: 'CANCELLED_CHEQUE', name: 'Cancelled Cheque / Bank Passbook', mandatory: true, group: 'Financial' },
  { id: 'MEDICAL_FITNESS_CERT', name: 'Pre-Employment Medical Fitness Certificate', mandatory: true, group: 'Health & Compliance' },
  { id: 'GMP_TRAINING_CERT', name: 'GMP / GxP Training Attestation', mandatory: true, group: 'Health & Compliance' }
];

export default function DocumentCenterForm({ data = {}, updateData }) {
  const documents = data.documents || [];

  const handleDocumentChange = (catId, docName, field, value) => {
    const existingIndex = documents.findIndex((d) => d.documentType === catId);
    let updatedDocs = [...documents];

    if (existingIndex >= 0) {
      updatedDocs[existingIndex] = {
        ...updatedDocs[existingIndex],
        [field]: value
      };
    } else {
      updatedDocs.push({
        documentType: catId,
        documentName: docName,
        status: 'Uploaded',
        fileUrl: value,
        uploadedAt: new Date().toISOString(),
        verified: false,
        [field]: value
      });
    }

    updateData({ documents: updatedDocs });
  };

  const getDocForCategory = (catId) => {
    return documents.find((d) => d.documentType === catId) || {};
  };

  const handleSimulateUpload = (catId, docName) => {
    // Generate secure mock file storage key for demonstration/HR preview
    const fakeKey = `bjk-docs/${data.employeeId || 'EMP'}/${catId.toLowerCase()}_${Date.now()}.pdf`;
    handleDocumentChange(catId, docName, 'fileUrl', fakeKey);
    handleDocumentChange(catId, docName, 'status', 'Uploaded');
  };

  const handleRemoveDoc = (catId) => {
    const updatedDocs = documents.filter((d) => d.documentType !== catId);
    updateData({ documents: updatedDocs });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiFolder className="text-teal-600 dark:text-teal-400" />
            Step 11: Enterprise Document Center & Verification Vault
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Store and track mandatory compliance, employment, identity, and academic proofs. Files are indexed in secure object storage.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 rounded-full">
          {documents.filter((d) => d.fileUrl).length} of {DOCUMENT_CATEGORIES.length} Attached
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_CATEGORIES.map((cat) => {
          const doc = getDocForCategory(cat.id);
          const isUploaded = !!doc.fileUrl;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border transition-all ${
                isUploaded
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : cat.mandatory
                  ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                    {cat.mandatory ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 rounded">
                        REQUIRED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded">
                        OPTIONAL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Category: {cat.group}
                  </div>

                  {isUploaded ? (
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                      <FiCheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{doc.fileUrl}</span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <FiAlertCircle size={13} className="shrink-0" />
                      <span>Pending document upload</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isUploaded ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove attachment"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload(cat.id, cat.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      <FiUploadCloud size={14} className="text-teal-600 dark:text-teal-400" /> Attach File
                    </button>
                  )}
                </div>
              </div>

              {isUploaded && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Status: <strong className="text-slate-700 dark:text-slate-300">Ready for HR Verification</strong></span>
                  <span>Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
