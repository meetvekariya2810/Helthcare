import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldCheck,
  BookOpen,
  Plus,
  X,
  Clock,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  Info,
  Check,
  UploadCloud,
  FileWarning
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeDocumentAPI } from '../../services/employeeApi';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';

export const EmployeeDocumentsPage = () => {
  const { employeeUser } = useEmployeeAuth();

  const [checklist, setChecklist] = useState([]);
  const [stats, setStats] = useState({
    totalSlots: 12,
    uploadedCount: 0,
    verifiedCount: 0,
    pendingCount: 0,
    mandatoryTotal: 3,
    mandatoryUploadedCount: 0,
    mandatoryCompleted: false,
    completionPercentage: 0
  });
  const [personalDocs, setPersonalDocs] = useState([]);
  const [companyPolicies, setCompanyPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'policies' | 'all'

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const fileInputRef = useRef(null);

  // PDF Viewer Modal State
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    docTitle: '',
    slotNo: null,
    isMandatory: false,
    verificationStatus: 'PENDING',
    remarks: ''
  });

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await employeeDocumentAPI.getDocuments();
      if (res.data?.success) {
        setChecklist(res.data.checklist || res.data.documents?.checklist || []);
        if (res.data.stats) setStats(res.data.stats);
        setPersonalDocs(res.data.documents?.personalDocuments || []);
        setCompanyPolicies(res.data.documents?.companyPolicies || []);
      }
    } catch (err) {
      console.error('[Load Documents Error]:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load employee documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const openUploadForSlot = (slotNo) => {
    setSelectedSlot(slotNo);
    setSelectedFile(null);
    setFileBase64('');
    setUploadRemarks('');
    setErrorMessage('');
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Strict client-side PDF verification
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Strict Format Restriction: Only PDF documents (.pdf) can be uploaded. Images and other file types are not allowed.');
      setSelectedFile(null);
      setFileBase64('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 20MB limit. Please upload an optimized PDF.');
      setSelectedFile(null);
      setFileBase64('');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFileBase64(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMessage('');

    try {
      const slotDef = checklist.find((s) => s.slotNo === selectedSlot) || {};

      const payload = {
        slotNo: selectedSlot,
        docSlot: selectedSlot,
        docCode: slotDef.docCode,
        documentName: slotDef.title,
        documentType: slotDef.category || 'EMPLOYEE_RECORD',
        remarks: uploadRemarks,
        fileBase64: fileBase64,
        fileName: selectedFile?.name || `${slotDef.docCode || 'DOCUMENT'}.pdf`
      };

      const res = await employeeDocumentAPI.upload(payload);
      if (res.data?.success) {
        setMessage(res.data.message || `Slot #${selectedSlot} PDF uploaded successfully.`);
        setShowUploadModal(false);
        setSelectedFile(null);
        setFileBase64('');
        setUploadRemarks('');
        loadDocuments();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload PDF document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotNo, docId) => {
    if (!window.confirm(`Are you sure you want to remove the uploaded document for Slot #${slotNo}?`)) return;
    try {
      const res = await employeeDocumentAPI.delete(slotNo);
      if (res.data?.success) {
        setMessage(res.data.message || `Slot #${slotNo} document removed.`);
        loadDocuments();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to remove document.');
    }
  };

  const handleResetAllDocuments = async () => {
    if (!window.confirm('Are you sure you want to delete and reset ALL uploaded documents? You will need to upload your documents again.')) return;
    try {
      const res = await employeeDocumentAPI.resetAll();
      if (res.data?.success) {
        setMessage(res.data.message || 'All documents reset successfully. You can now upload fresh copies.');
        loadDocuments();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to reset documents.');
    }
  };

  const openPdfPreview = (item) => {
    if (!item.fileUrl) {
      setErrorMessage('No document file has been uploaded for this slot yet.');
      return;
    }
    setPreviewModal({
      isOpen: true,
      fileUrl: item.fileUrl,
      docTitle: item.title,
      slotNo: item.slotNo,
      isMandatory: item.isMandatory,
      verificationStatus: item.verificationStatus,
      remarks: item.remarks || '',
      employeeName: employeeUser?.fullName || employeeUser?.name,
      employeeId: employeeUser?.employeeId
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500 text-slate-950">
                12-DOCUMENT SAFE
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-teal-300 border border-teal-500/30">
                PDF FORMAT ONLY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Employee Document Safe & Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Upload your 12 official verification records. All documents must be uploaded strictly in <strong className="text-teal-300">PDF format</strong>. Uploaded files are immediately accessible to HR & Admin for verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openUploadForSlot(1)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>UPLOAD DOCUMENT (PDF)</span>
            </button>
            <button
              type="button"
              onClick={handleResetAllDocuments}
              className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
              title="Clear all uploaded documents"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">RESET ALL DOCS</span>
            </button>
            <button
              type="button"
              onClick={loadDocuments}
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Compliance Progress & Statistics Grid */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandatory Status</p>
            <div className="flex items-center gap-2 mt-1.5">
              {stats.mandatoryCompleted ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-base sm:text-lg font-black text-white">
                {stats.mandatoryUploadedCount} / {stats.mandatoryTotal} Uploaded
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {stats.mandatoryCompleted ? 'All mandatory proofs uploaded' : 'Aadhar, PAN & Bank proofs required'}
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Uploads</p>
            <div className="flex items-center gap-2 mt-1.5">
              <FileCheck2 className="w-5 h-5 text-teal-400" />
              <span className="text-base sm:text-lg font-black text-white">
                {stats.uploadedCount} / {stats.totalSlots} Slots
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HR Verification</p>
            <div className="flex items-center gap-2 mt-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-base sm:text-lg font-black text-emerald-400">
                {stats.verifiedCount} Verified
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {stats.pendingCount} Pending Review
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vault Integrity</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-base sm:text-lg font-black text-white">256-Bit</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">21 CFR Part 11 Electronic Vault</p>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between text-xs text-rose-900 font-semibold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`py-3 px-5 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'checklist'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>12 Mandatory & Educational Document Checklist ({checklist.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`py-3 px-5 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Company Standard Policies ({companyPolicies.length})</span>
        </button>
      </div>

      {/* TAB 1: 12-DOCUMENT FLOW CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Official 12-Slot Verification Flow (Slots 1 to 12)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Only PDF format allowed &bull; Direct in-app preview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklist.map((item) => {
              const isUploaded = item.isUploaded;
              const isVerified = item.verificationStatus === 'VERIFIED';
              const isRejected = item.verificationStatus === 'REJECTED';
              const isPending = item.verificationStatus === 'PENDING' && isUploaded;

              return (
                <div
                  key={item.slotNo}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                    item.isMandatory && !isUploaded
                      ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400 shadow-sm'
                      : isVerified
                      ? 'bg-white border-emerald-200 hover:border-emerald-400 shadow-sm'
                      : isUploaded
                      ? 'bg-white border-slate-200 hover:border-teal-400 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header: Slot Badge + Mandatory Tag + Status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            item.isMandatory
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-teal-300'
                          }`}
                        >
                          {String(item.slotNo).padStart(2, '0')}
                        </span>
                        {item.isMandatory ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-700 border border-rose-200">
                            MANDATORY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-500 bg-slate-100">
                            OPTIONAL
                          </span>
                        )}
                      </div>

                      {/* Verification Badge */}
                      {isVerified && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>VERIFIED</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>UNDER REVIEW</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>REJECTED</span>
                        </span>
                      )}
                      {!isUploaded && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 text-slate-600">
                          NOT UPLOADED
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.slotNo}. {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* File Meta if uploaded */}
                    {isUploaded && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                          <span className="truncate max-w-[180px] font-mono text-[10px] text-teal-700">
                            {item.fileName || `${item.docCode}.pdf`}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            PDF ONLY
                          </span>
                        </div>
                        {item.uploadedAt && (
                          <p className="text-[10px] text-slate-400">
                            Uploaded on: {new Date(item.uploadedAt).toLocaleDateString('en-GB')}
                          </p>
                        )}
                        {item.remarks && (
                          <p className="text-[10px] text-amber-700 font-medium">
                            Note: {item.remarks}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isUploaded ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openPdfPreview(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors border border-teal-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>View PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openUploadForSlot(item.slotNo)}
                          className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
                          title="Replace PDF"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(item.slotNo, item.documentId)}
                          className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 text-xs transition-colors"
                          title="Remove Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUploadForSlot(item.slotNo)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm ${
                          item.isMandatory
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>UPLOAD PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY COMPLIANCE POLICIES */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Standard Corporate Policies & SOPs</h3>
            <p className="text-xs text-slate-500">Official pharmaceutical compliance manuals, leave rules, and safety regulations</p>
          </div>

          <div className="space-y-3">
            {companyPolicies.map((pol) => (
              <div
                key={pol.documentId}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{pol.documentName}</h4>
                    <p className="text-xs text-slate-500">Category: {pol.category} &bull; PDF Format</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModal({
                        isOpen: true,
                        fileUrl: pol.fileUrl,
                        docTitle: pol.documentName,
                        slotNo: null,
                        isMandatory: false,
                        verificationStatus: 'VERIFIED',
                        remarks: 'Official BJK Healthcare Standard Policy'
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    <span>Preview</span>
                  </button>

                  <a
                    href={pol.fileUrl}
                    download
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL (PDF ENFORCED) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Upload Document (PDF Only)
                  </h3>
                  <p className="text-[11px] text-slate-400">Strictly PDF format (.pdf) supported</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Slot Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Document Slot (1 to 12) *
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50"
                >
                  {checklist.map((s) => (
                    <option key={s.slotNo} value={s.slotNo}>
                      Slot #{s.slotNo}: {s.title} {s.isMandatory ? '— [MANDATORY]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Dropzone Area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Upload PDF File *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-teal-500 bg-teal-50/50'
                      : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-1">
                      <FileCheck2 className="w-8 h-8 text-teal-600 mx-auto" />
                      <p className="font-bold text-slate-900 text-xs">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; Verified PDF
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFileBase64('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-[11px] text-rose-600 hover:underline font-semibold pt-1"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                      <p className="font-bold text-slate-800 text-xs">
                        Click here to select or drag & drop PDF
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Only genuine <strong className="text-teal-700">.pdf</strong> files up to 20MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Employee Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Self-attested copy of Aadhar card"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Submit Document PDF</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REUSABLE IN-APP PDF VIEWER MODAL */}
      <PdfViewerModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
        fileUrl={previewModal.fileUrl}
        docTitle={previewModal.docTitle}
        slotNo={previewModal.slotNo}
        isMandatory={previewModal.isMandatory}
        verificationStatus={previewModal.verificationStatus}
        remarks={previewModal.remarks}
        employeeName={previewModal.employeeName}
        employeeId={previewModal.employeeId}
      />
    </div>
  );
};
