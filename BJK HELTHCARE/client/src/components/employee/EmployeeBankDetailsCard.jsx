import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X,
  UploadCloud,
  Eye,
  EyeOff,
  Search,
  AlertTriangle,
  RotateCcw,
  Check,
  Send
} from 'lucide-react';
import { employeeBankAPI } from '../../services/employeeApi';
import { hrBankAPI } from '../../services/api';

/**
 * Status badge styling utility
 */
const getStatusBadge = (status) => {
  switch (status) {
    case 'Verified':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        label: 'Verified by HR'
      };
    case 'Submitted':
    case 'Under Review':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: Clock,
        label: status === 'Submitted' ? 'Submitted (Pending Review)' : 'Under Review'
      };
    case 'Needs Correction':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: AlertTriangle,
        label: 'Correction Required'
      };
    case 'Needs Re-Verification':
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        icon: RotateCcw,
        label: 'Needs Re-Verification'
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: AlertCircle,
        label: 'Rejected'
      };
    case 'Draft':
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: Edit2,
        label: 'Draft'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: AlertCircle,
        label: 'Not Submitted'
      };
  }
};

/**
 * EmployeeBankDetailsCard
 * Can be rendered in Employee Self-Service or in HR Employee Profile.
 * Props:
 * - isHRView: boolean (default false)
 * - employeeId: string (required if isHRView is true)
 * - employeeData: object (optional fallback profile info)
 * - onUpdated: callback when bank data changes
 */
export const EmployeeBankDetailsCard = ({
  isHRView = false,
  employeeId = null,
  employeeData = null,
  onUpdated = null
}) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Account Number Confirmation (Client-side validation only, never sent to server)
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // IFSC Lookup State
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);
  const [ifscLookupResult, setIfscLookupResult] = useState(null);

  // HR Action Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [hrRemarks, setHrRemarks] = useState('');

  // Form State
  const [form, setForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    accountType: 'Salary',
    accountStatus: 'Pending Verification',
    bankName: '',
    branchName: '',
    branchAddress: '',
    city: '',
    state: '',
    ifscCode: '',
    micrCode: '',
    bankCode: '',
    branchCode: '',
    pan: '',
    uanNumber: '',
    pfNumber: '',
    esicNumber: '',
    insuranceNumber: '',
    customerId: '',
    crnNumber: '',
    bankCustomerId: '',
    documentType: 'Cancelled Cheque',
    documentNumber: '',
    bankProofReference: ''
  });

  const fetchBankDetails = async () => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      let res;
      if (isHRView && employeeId) {
        res = await hrBankAPI.getEmployeeBankDetails(employeeId);
      } else {
        res = await employeeBankAPI.getBankDetails();
      }

      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setBankDetails(d);
        setForm({
          accountHolderName: d.accountHolderName || employeeData?.fullName || '',
          accountNumber: d.accountNumber || '',
          accountType: d.accountType || 'Salary',
          accountStatus: d.accountStatus || 'Pending Verification',
          bankName: d.bankName || '',
          branchName: d.branchName || '',
          branchAddress: d.branchAddress || '',
          city: d.city || employeeData?.city || 'Ahmedabad',
          state: d.state || employeeData?.state || 'Gujarat',
          ifscCode: d.ifscCode || '',
          micrCode: d.micrCode || '',
          bankCode: d.bankCode || '',
          branchCode: d.branchCode || '',
          pan: d.pan || employeeData?.panNumber || '',
          uanNumber: d.uanNumber || employeeData?.uanNumber || '',
          pfNumber: d.pfNumber || employeeData?.pfNumber || '',
          esicNumber: d.esicNumber || employeeData?.esicNumber || '',
          insuranceNumber: d.insuranceNumber || employeeData?.insuranceNumber || '',
          customerId: d.customerId || '',
          crnNumber: d.crnNumber || '',
          bankCustomerId: d.bankCustomerId || '',
          documentType: d.documentType || 'Cancelled Cheque',
          documentNumber: d.documentNumber || '',
          bankProofReference: d.bankProofReference || ''
        });
        setConfirmAccountNumber(d.accountNumber || '');
      }
    } catch (err) {
      console.error('[Bank Details Load Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, [employeeId, isHRView]);

  const handleStartEditing = () => {
    setConfirmAccountNumber(form.accountNumber || '');
    setIsEditing(true);
    setFeedback({ type: '', message: '' });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setIfscLookupResult(null);
    if (bankDetails) {
      setForm({
        accountHolderName: bankDetails.accountHolderName || '',
        accountNumber: bankDetails.accountNumber || '',
        accountType: bankDetails.accountType || 'Salary',
        accountStatus: bankDetails.accountStatus || 'Pending Verification',
        bankName: bankDetails.bankName || '',
        branchName: bankDetails.branchName || '',
        branchAddress: bankDetails.branchAddress || '',
        city: bankDetails.city || '',
        state: bankDetails.state || '',
        ifscCode: bankDetails.ifscCode || '',
        micrCode: bankDetails.micrCode || '',
        bankCode: bankDetails.bankCode || '',
        branchCode: bankDetails.branchCode || '',
        pan: bankDetails.pan || '',
        uanNumber: bankDetails.uanNumber || '',
        pfNumber: bankDetails.pfNumber || '',
        esicNumber: bankDetails.esicNumber || '',
        insuranceNumber: bankDetails.insuranceNumber || '',
        customerId: bankDetails.customerId || '',
        crnNumber: bankDetails.crnNumber || '',
        bankCustomerId: bankDetails.bankCustomerId || '',
        documentType: bankDetails.documentType || 'Cancelled Cheque',
        documentNumber: bankDetails.documentNumber || '',
        bankProofReference: bankDetails.bankProofReference || ''
      });
      setConfirmAccountNumber(bankDetails.accountNumber || '');
    }
  };

  // Live IFSC lookup
  const handleLookupIFSC = async () => {
    const code = (form.ifscCode || '').trim().toUpperCase();
    if (!code) {
      setFeedback({ type: 'error', message: 'Please enter an IFSC code to search.' });
      return;
    }
    setIfscLookupLoading(true);
    setIfscLookupResult(null);
    try {
      const res = await employeeBankAPI.lookupIFSC(code);
      if (res.data?.success && res.data.data) {
        const lookup = res.data.data;
        setIfscLookupResult(lookup);
        if (lookup.valid && lookup.bankName) {
          setForm(prev => ({
            ...prev,
            bankName: lookup.bankName || prev.bankName,
            branchName: lookup.branchName || prev.branchName,
            branchAddress: lookup.branchAddress || prev.branchAddress,
            city: lookup.city || prev.city,
            state: lookup.state || prev.state,
            micrCode: lookup.micrCode || prev.micrCode,
            bankCode: lookup.bankCode || prev.bankCode
          }));
          setFeedback({ type: 'success', message: `Found ${lookup.bankName} - ${lookup.branchName}` });
        } else if (lookup.valid) {
          setFeedback({ type: 'info', message: 'IFSC format is valid. External lookup pending confirmation.' });
        } else {
          setFeedback({ type: 'error', message: lookup.message || 'Invalid IFSC format.' });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Unable to lookup IFSC. You may enter bank details manually.' });
    } finally {
      setIfscLookupLoading(false);
    }
  };

  // Save (Draft vs Submit)
  const handleSave = async (isSubmit = false) => {
    setFeedback({ type: '', message: '' });

    // Validate Account Number Confirmation
    if (form.accountNumber && confirmAccountNumber && form.accountNumber !== confirmAccountNumber) {
      setFeedback({ type: 'error', message: 'Account Number and Confirmation Account Number do not match.' });
      return;
    }

    if (isSubmit) {
      if (!form.accountHolderName.trim()) {
        setFeedback({ type: 'error', message: 'Account Holder Name is required for submission.' });
        return;
      }
      if (!form.accountNumber.trim()) {
        setFeedback({ type: 'error', message: 'Account Number is required for submission.' });
        return;
      }
      if (!form.bankName.trim()) {
        setFeedback({ type: 'error', message: 'Bank Name is required for submission.' });
        return;
      }
      if (!form.branchName.trim()) {
        setFeedback({ type: 'error', message: 'Branch Name is required for submission.' });
        return;
      }
      if (!form.ifscCode.trim()) {
        setFeedback({ type: 'error', message: 'IFSC Code is required for submission.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = { ...form, action: isSubmit ? 'SUBMIT' : 'SAVE_DRAFT' };
      let res;
      if (isHRView && employeeId) {
        res = await hrBankAPI.updateEmployeeBankDetails(employeeId, payload);
      } else {
        if (isSubmit) {
          res = await employeeBankAPI.submitBankDetails(payload);
        } else {
          res = await employeeBankAPI.saveBankDetails(payload);
        }
      }

      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: isSubmit
            ? 'Bank details submitted successfully. Verification status is now Pending HR Review.'
            : 'Bank details saved successfully as draft.'
        });
        setIsEditing(false);
        fetchBankDetails();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save bank details.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // HR Verification Actions
  const handleHRVerify = async () => {
    setIsSaving(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await hrBankAPI.verifyBankDetails(employeeId, { remarks: hrRemarks || 'Verified by HR' });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Bank details verified successfully.' });
        setHrRemarks('');
        fetchBankDetails();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Verification failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHRReject = async () => {
    if (!hrRemarks.trim()) {
      setFeedback({ type: 'error', message: 'Please provide rejection remarks.' });
      return;
    }
    setIsSaving(true);
    try {
      const res = await hrBankAPI.rejectBankDetails(employeeId, { remarks: hrRemarks });
      if (res.data?.success) {
        setShowRejectModal(false);
        setFeedback({ type: 'success', message: 'Bank details rejected.' });
        setHrRemarks('');
        fetchBankDetails();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Action failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHRRequestCorrection = async () => {
    if (!hrRemarks.trim()) {
      setFeedback({ type: 'error', message: 'Please provide correction instructions.' });
      return;
    }
    setIsSaving(true);
    try {
      const res = await hrBankAPI.requestCorrection(employeeId, { remarks: hrRemarks });
      if (res.data?.success) {
        setShowCorrectionModal(false);
        setFeedback({ type: 'success', message: 'Correction requested from employee.' });
        setHrRemarks('');
        fetchBankDetails();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Action failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-slate-100 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const vStatus = bankDetails?.verificationStatus || 'Not Submitted';
  const badge = getStatusBadge(vStatus);
  const StatusIcon = badge.icon;
  const isBlank = !bankDetails || bankDetails.verificationStatus === 'Not Submitted' || (!bankDetails.accountNumber && !isEditing);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header & Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">Bank Details</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center space-x-1 ${badge.bg}`}>
                <StatusIcon size={12} />
                <span>{badge.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Official salary disbursement account, statutory credentials & verification</p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2">
          {!isEditing && !isBlank && (
            <button
              type="button"
              onClick={handleStartEditing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
            >
              <Edit2 size={13} className="text-teal-600" />
              <span>{isHRView ? 'Edit Bank Records' : 'Edit Details'}</span>
            </button>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEditing}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Alerts & Feedback */}
      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          feedback.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* HR Remarks Alert (if rejected or needs correction) */}
      {bankDetails?.remarks && (vStatus === 'Rejected' || vStatus === 'Needs Correction') && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block">HR Review Remarks:</span>
            <p className="mt-0.5">{bankDetails.remarks}</p>
          </div>
        </div>
      )}

      {/* Initial Blank State (Section 2) */}
      {isBlank && !isEditing ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
            <Building size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No bank details have been added yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add your official bank account information for monthly payroll disbursement and statutory processing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartEditing}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            Add Bank Details
          </button>
        </div>
      ) : (
        /* Form / Display Deck */
        <div className="space-y-6">
          {/* 1. Account Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700 flex items-center space-x-1.5">
              <span>1. Account Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium mb-1">Account Holder Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.accountHolderName}
                    onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                    placeholder="As printed on bank passbook"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.accountHolderName || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1 flex items-center justify-between">
                  <span>Account Number *</span>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="text-[10px] text-teal-600 hover:text-teal-700 font-bold flex items-center space-x-0.5"
                    >
                      {showAccountNumber ? <EyeOff size={11} /> : <Eye size={11} />}
                      <span>{showAccountNumber ? 'Hide' : 'Reveal'}</span>
                    </button>
                  )}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {showAccountNumber
                      ? bankDetails?.accountNumber
                      : (bankDetails?.maskedAccountNumber || bankDetails?.getMaskedAccountNumber?.() || 'XXXX XXXX ' + (bankDetails?.accountNumber?.slice(-4) || ''))}
                  </p>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className="text-slate-400 block font-medium mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                    placeholder="Re-enter to confirm"
                    className={`w-full p-2.5 rounded-xl border font-mono text-xs font-bold focus:ring-2 focus:outline-none ${
                      form.accountNumber && confirmAccountNumber && form.accountNumber !== confirmAccountNumber
                        ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-teal-500'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block font-medium mb-1">Account Type</label>
                {isEditing ? (
                  <select
                    value={form.accountType}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.accountType || 'Salary'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Account Status</label>
                {isEditing && isHRView ? (
                  <select
                    value={form.accountStatus}
                    onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Closed">Closed</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.accountStatus || 'Pending Verification'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Bank Information */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700 flex items-center space-x-1.5">
              <span>2. Bank Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium mb-1">IFSC Code *</label>
                {isEditing ? (
                  <div className="flex space-x-1.5">
                    <input
                      type="text"
                      value={form.ifscCode}
                      onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. SBIN0003044"
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleLookupIFSC}
                      disabled={ifscLookupLoading}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      title="Validate & Lookup IFSC"
                    >
                      <Search size={14} className={ifscLookupLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.ifscCode || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Bank Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.bankName || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Branch Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.branchName}
                    onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                    placeholder="e.g. Sahijpur Bogha"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.branchName || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">MICR Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.micrCode}
                    onChange={(e) => setForm({ ...form, micrCode: e.target.value })}
                    placeholder="9-digit MICR"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.micrCode || '--'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block font-medium mb-1">Branch Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.branchAddress}
                    onChange={(e) => setForm({ ...form, branchAddress: e.target.value })}
                    placeholder="Branch location & street address"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-slate-800 text-xs">{bankDetails?.branchAddress || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.city || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="State"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.state || '--'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Employee / Government References */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700 flex items-center space-x-1.5">
              <span>3. Employee / Government References</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium mb-1">PAN</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.pan}
                    onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.pan || employeeData?.panNumber || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">UAN (Universal Account Number)</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.uanNumber}
                    onChange={(e) => setForm({ ...form, uanNumber: e.target.value })}
                    placeholder="12-digit UAN"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.uanNumber || employeeData?.uanNumber || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">PF Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.pfNumber}
                    onChange={(e) => setForm({ ...form, pfNumber: e.target.value })}
                    placeholder="EPFO Number"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.pfNumber || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">ESIC Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.esicNumber}
                    onChange={(e) => setForm({ ...form, esicNumber: e.target.value })}
                    placeholder="ESIC IP Number"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.esicNumber || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Insurance Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.insuranceNumber}
                    onChange={(e) => setForm({ ...form, insuranceNumber: e.target.value })}
                    placeholder="Policy / Card ID"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.insuranceNumber || '--'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Customer References */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700 flex items-center space-x-1.5">
              <span>4. Customer References (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium mb-1">Customer ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    placeholder="Bank Customer ID"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.customerId || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">CRN Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.crnNumber}
                    onChange={(e) => setForm({ ...form, crnNumber: e.target.value })}
                    placeholder="Customer Relationship Number"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.crnNumber || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Bank Customer ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.bankCustomerId}
                    onChange={(e) => setForm({ ...form, bankCustomerId: e.target.value })}
                    placeholder="Secondary Customer Reference"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.bankCustomerId || '--'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 5. Bank Proof & Documents */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-teal-700 flex items-center space-x-1.5">
              <span>5. Bank Proof Documentation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium mb-1">Proof Document Type</label>
                {isEditing ? (
                  <select
                    value={form.documentType}
                    onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Cancelled Cheque">Cancelled Cheque</option>
                    <option value="Bank Passbook">Bank Passbook</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Bank Letter">Bank Letter</option>
                    <option value="Salary Account Proof">Salary Account Proof</option>
                    <option value="Other Approved Proof">Other Approved Proof</option>
                  </select>
                ) : (
                  <p className="font-bold text-slate-900 text-sm">{bankDetails?.documentType || 'Cancelled Cheque'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Document Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.documentNumber}
                    onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    placeholder="e.g. Cheque / Reference No"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono font-bold text-slate-900 text-sm">{bankDetails?.documentNumber || '--'}</p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block font-medium mb-1">Document Reference / URL</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.bankProofReference}
                    onChange={(e) => setForm({ ...form, bankProofReference: e.target.value })}
                    placeholder="Uploaded document link or file path"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-mono text-slate-800 text-xs truncate">
                    {bankDetails?.bankProofReference ? (
                      <a href={bankDetails.bankProofReference} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                        View Attached Proof &rarr;
                      </a>
                    ) : (
                      'No file reference attached'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 6. Verification Audit Metadata */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Verification Audit & Telemetry
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
              <div>
                <span className="text-slate-400 block">Status:</span>
                <span className="font-bold text-slate-800">{vStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Verification Date:</span>
                <span className="font-semibold text-slate-800">
                  {bankDetails?.verificationDate ? new Date(bankDetails.verificationDate).toLocaleDateString() : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Verified By:</span>
                <span className="font-semibold text-slate-800">{bankDetails?.verifiedByName || 'HR Administrator'}</span>
              </div>
            </div>
          </div>

          {/* Save / Submit Action Buttons (Employee & Edit Modes) */}
          {isEditing && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelEditing}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Save size={13} />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Send size={13} />
                <span>Save & Submit for HR Verification</span>
              </button>
            </div>
          )}

          {/* HR Decision Control Deck (Section 14) */}
          {isHRView && !isEditing && (
            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
              <div>
                <h4 className="text-xs font-bold text-slate-900">HR Verification Actions</h4>
                <p className="text-[11px] text-slate-500">Review submitted employee bank data and approve for payroll disbursement</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleHRVerify}
                  disabled={isSaving || vStatus === 'Verified'}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all ${
                    vStatus === 'Verified'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Check size={13} />
                  <span>Verify Bank Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(true)}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                >
                  <AlertTriangle size={13} />
                  <span>Request Correction</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                >
                  <X size={13} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HR Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-rose-900 flex items-center space-x-2">
              <AlertCircle size={18} className="text-rose-600" />
              <span>Reject Employee Bank Details</span>
            </h3>
            <p className="text-xs text-slate-600">
              Please enter the specific reason for rejecting this bank account. The employee will receive this feedback.
            </p>
            <textarea
              value={hrRemarks}
              onChange={(e) => setHrRemarks(e.target.value)}
              placeholder="e.g. Name mismatch on cancelled cheque, incorrect IFSC..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleHRReject}
                disabled={isSaving || !hrRemarks.trim()}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR Request Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <span>Request Bank Information Correction</span>
            </h3>
            <p className="text-xs text-slate-600">
              Describe what details the employee needs to update before HR verification.
            </p>
            <textarea
              value={hrRemarks}
              onChange={(e) => setHrRemarks(e.target.value)}
              placeholder="e.g. Please re-upload a clear copy of the passbook showing branch IFSC..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleHRRequestCorrection}
                disabled={isSaving || !hrRemarks.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
              >
                Send Correction Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeBankDetailsCard;
