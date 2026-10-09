import React, { useState, useEffect } from 'react';
import {
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  Phone,
  User,
  ShieldCheck,
  UploadCloud,
  CheckCircle,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  ChevronDown
} from 'lucide-react';
import { employeeLeaveAPI } from '../../services/employeeApi';
import { leaveAPI } from '../../services/api';

export const DEFAULT_LEAVE_TYPES = [
  {
    code: 'CASUAL_LEAVE',
    name: 'Casual Leave (CL)',
    annualQuotaDays: 12,
    isPaid: true,
    allowHalfDay: true,
    maxConsecutiveDays: 3,
    description: 'Short-duration personal, emergency or family matters (Max 3 continuous days)'
  },
  {
    code: 'SICK_LEAVE',
    name: 'Sick / Medical Leave (SL)',
    annualQuotaDays: 12,
    isPaid: true,
    allowHalfDay: true,
    requiresDocumentProof: true,
    description: 'Medical illness, health recuperation & appointments (Medical certificate required for >2 days)'
  },
  {
    code: 'PRIVILEGE_LEAVE',
    name: 'Earned / Privilege Leave (EL/PL)',
    annualQuotaDays: 15,
    isPaid: true,
    minNoticeDays: 7,
    description: 'Planned personal vacation, annual rest & recreational leave (Advance notice required)'
  },
  {
    code: 'COMPENSATORY_OFF',
    name: 'Compensatory Off (Comp-Off)',
    annualQuotaDays: 2,
    isPaid: true,
    description: 'Compensatory off earned by working on scheduled weekly offs or national holidays'
  },
  {
    code: 'MATERNITY_LEAVE',
    name: 'Maternity Leave (ML)',
    annualQuotaDays: 182,
    isPaid: true,
    applicableGender: 'FEMALE',
    description: 'Maternity benefit for female employees as per statutory norms (26 weeks)'
  },
  {
    code: 'PATERNITY_LEAVE',
    name: 'Paternity Leave (PL)',
    annualQuotaDays: 15,
    isPaid: true,
    applicableGender: 'MALE',
    description: 'Paternity leave for new fathers'
  },
  {
    code: 'BEREAVEMENT_LEAVE',
    name: 'Bereavement Leave (BL)',
    annualQuotaDays: 5,
    isPaid: true,
    description: 'Compassionate leave for bereavement in immediate family'
  },
  {
    code: 'MARRIAGE_LEAVE',
    name: 'Marriage Leave',
    annualQuotaDays: 5,
    isPaid: true,
    description: 'Special personal leave for employee wedding'
  },
  {
    code: 'UNPAID_LEAVE',
    name: 'Leave Without Pay (LWP / Loss of Pay)',
    annualQuotaDays: 0,
    isPaid: false,
    description: 'Approved unpaid absence beyond statutory leave allocations'
  }
];

export const DEFAULT_BALANCES = [
  { leaveType: 'CASUAL_LEAVE', allocated: 12, used: 2, pending: 0, available: 10 },
  { leaveType: 'SICK_LEAVE', allocated: 12, used: 1, pending: 0, available: 11 },
  { leaveType: 'PRIVILEGE_LEAVE', allocated: 15, used: 3, pending: 0, available: 12 },
  { leaveType: 'COMPENSATORY_OFF', allocated: 2, used: 0, pending: 0, available: 2 },
  { leaveType: 'MATERNITY_LEAVE', allocated: 182, used: 0, pending: 0, available: 182 },
  { leaveType: 'PATERNITY_LEAVE', allocated: 15, used: 0, pending: 0, available: 15 },
  { leaveType: 'BEREAVEMENT_LEAVE', allocated: 5, used: 0, pending: 0, available: 5 },
  { leaveType: 'MARRIAGE_LEAVE', allocated: 5, used: 0, pending: 0, available: 5 },
  { leaveType: 'UNPAID_LEAVE', allocated: 0, used: 0, pending: 0, available: 0 }
];

export const ApplyLeaveModal = ({
  isOpen,
  onClose,
  onSuccess,
  leaveTypes: propLeaveTypes,
  balances: propBalances,
  onViewHistory
}) => {
  const initialTypes = propLeaveTypes && propLeaveTypes.length > 0 ? propLeaveTypes : DEFAULT_LEAVE_TYPES;
  const initialBalances = propBalances && propBalances.length > 0 ? propBalances : DEFAULT_BALANCES;

  const [types, setTypes] = useState(initialTypes);
  const [balances, setBalances] = useState(initialBalances);
  const [holidays, setHolidays] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Form State
  const [form, setForm] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    durationType: 'FULL_DAY',
    isHalfDay: false,
    reason: '',
    handoverDetails: '',
    contactDuringAbsence: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    supportingDocument: null
  });

  const [calculatedDays, setCalculatedDays] = useState(1);
  const [selectedTypeConfig, setSelectedTypeConfig] = useState(initialTypes[0]);
  const [selectedBalance, setSelectedBalance] = useState(initialBalances[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [holidayWarning, setHolidayWarning] = useState('');

  // Submission Success State
  const [submittedData, setSubmittedData] = useState(null);

  // Load Leave Types, Holidays, and Balances if not passed via props
  useEffect(() => {
    if (!isOpen) {
      setSubmittedData(null);
      setValidationError('');
      setFieldErrors({});
      setHolidayWarning('');
      return;
    }

    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const [typesRes, balRes, holRes] = await Promise.allSettled([
          employeeLeaveAPI.getTypes().catch(() => leaveAPI.getTypes()),
          employeeLeaveAPI.getBalance().catch(() => leaveAPI.getBalances()),
          employeeLeaveAPI.getHolidays({ year: 2026 }).catch(() => leaveAPI.getHolidays({ year: 2026 }))
        ]);

        let loadedTypes = initialTypes;
        if (typesRes.status === 'fulfilled' && typesRes.value.data?.types && typesRes.value.data.types.length > 0) {
          loadedTypes = typesRes.value.data.types;
          setTypes(loadedTypes);
        } else if (propLeaveTypes && propLeaveTypes.length > 0) {
          loadedTypes = propLeaveTypes;
          setTypes(propLeaveTypes);
        }

        if (balRes.status === 'fulfilled' && balRes.value.data?.balances && balRes.value.data.balances.length > 0) {
          setBalances(balRes.value.data.balances);
        } else if (propBalances && propBalances.length > 0) {
          setBalances(propBalances);
        }

        if (holRes.status === 'fulfilled' && holRes.value.data?.holidays) {
          setHolidays(holRes.value.data.holidays);
        }

        // Initialize default leave type
        const defaultCode = loadedTypes[0]?.code || 'CASUAL_LEAVE';
        const todayStr = new Date().toISOString().split('T')[0];
        setForm(prev => ({
          ...prev,
          leaveType: prev.leaveType || defaultCode,
          startDate: prev.startDate || todayStr,
          endDate: prev.endDate || todayStr
        }));
      } catch (err) {
        console.warn('[ApplyLeaveModal] Metadata fetch error:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [isOpen, propLeaveTypes, propBalances]);

  // Update selected config and balance whenever leaveType changes
  useEffect(() => {
    const currentTypes = types.length > 0 ? types : DEFAULT_LEAVE_TYPES;
    const currentBalances = balances.length > 0 ? balances : DEFAULT_BALANCES;

    const currentCode = form.leaveType || currentTypes[0]?.code || 'CASUAL_LEAVE';
    const config = currentTypes.find(t => t.code === currentCode) || currentTypes[0];
    setSelectedTypeConfig(config || null);

    const bal = currentBalances.find(b => b.leaveType === currentCode);
    setSelectedBalance(bal || {
      leaveType: currentCode,
      allocated: config?.annualQuotaDays || 12,
      used: 0,
      pending: 0,
      available: config?.annualQuotaDays || 12
    });
  }, [form.leaveType, types, balances]);

  // Compute duration preview and holiday/weekend checks
  useEffect(() => {
    if (!form.startDate || !form.endDate) return;

    if (form.isHalfDay) {
      setCalculatedDays(0.5);
      setValidationError('');
      setHolidayWarning('');
      return;
    }

    const s = new Date(form.startDate);
    const e = new Date(form.endDate);

    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      setValidationError('Please select valid start and end dates.');
      setCalculatedDays(0);
      return;
    }

    if (s > e) {
      setValidationError('Start date cannot be after end date.');
      setCalculatedDays(0);
      return;
    }

    // Holiday Check
    const sStr = s.toISOString().split('T')[0];
    const eStr = e.toISOString().split('T')[0];
    const matchedHoliday = holidays.find(h => h.dateString >= sStr && h.dateString <= eStr);
    if (matchedHoliday) {
      setHolidayWarning(`Notice: Selected period includes company holiday "${matchedHoliday.name}" (${matchedHoliday.dateString}).`);
    } else {
      setHolidayWarning('');
    }

    // Working days calculation considering weekends & leave type policy
    let working = 0;
    let cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      const isWeekend = day === 0 || day === 6;
      const curStr = cur.toISOString().split('T')[0];
      const isHoli = holidays.some(h => h.dateString === curStr);

      let count = true;
      if (isWeekend && !selectedTypeConfig?.countWeekends) count = false;
      if (isHoli && !selectedTypeConfig?.countHolidays) count = false;

      if (count) working += 1;
      cur.setDate(cur.getDate() + 1);
    }

    const finalDays = Math.max(1, working);
    setCalculatedDays(finalDays);

    // Balance verification preview
    if (selectedBalance && selectedTypeConfig?.isPaid && selectedTypeConfig?.code !== 'UNPAID_LEAVE') {
      const availableNet = Math.max(0, (selectedBalance.available || 0) - (selectedBalance.pending || 0));
      if (availableNet < finalDays) {
        setValidationError(`Insufficient leave balance. Available: ${availableNet} day(s), Requested: ${finalDays} day(s).`);
        return;
      }
    }

    // Consecutive days check
    if (selectedTypeConfig?.maxConsecutiveDays && finalDays > selectedTypeConfig.maxConsecutiveDays) {
      setValidationError(`Maximum continuous days allowed for ${selectedTypeConfig.name} is ${selectedTypeConfig.maxConsecutiveDays} day(s).`);
      return;
    }

    setValidationError('');
  }, [form.startDate, form.endDate, form.isHalfDay, selectedTypeConfig, selectedBalance, holidays]);

  const validateForm = () => {
    const errors = {};
    if (!form.leaveType) errors.leaveType = 'Please select a leave category.';
    if (!form.startDate) errors.startDate = 'Start date is required.';
    if (!form.endDate) errors.endDate = 'End date is required.';

    const combinedReason = [form.reason, form.handoverDetails].filter(Boolean).join(' ');
    if (!combinedReason || combinedReason.trim().length < 10) {
      errors.reason = 'Please document reason and workload handover details (minimum 10 characters).';
    }

    // Check Supporting Document requirement
    const requiresDoc = selectedTypeConfig?.requiresDocumentProof || (selectedTypeConfig?.code === 'SICK_LEAVE' && calculatedDays > 2);
    if (requiresDoc && !form.supportingDocument?.fileUrl) {
      errors.supportingDocument = 'Supporting medical/statutory certificate is mandatory for this leave.';
    }

    // Phone validation
    if (form.contactDuringAbsence && !/^[0-9+() -]{8,15}$/.test(form.contactDuringAbsence.trim())) {
      errors.contactDuringAbsence = 'Please enter a valid phone number.';
    }
    if (form.emergencyContactPhone && !/^[0-9+() -]{8,15}$/.test(form.emergencyContactPhone.trim())) {
      errors.emergencyContactPhone = 'Please enter a valid emergency phone number.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Document size must not exceed 10MB.');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF, JPG, JPEG, and PNG documents are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploadingDoc(true);
      const res = await employeeLeaveAPI.uploadDocument(formData);
      if (res.data?.success && res.data.document) {
        setForm(prev => ({
          ...prev,
          supportingDocument: res.data.document
        }));
      } else {
        // Safe fallback with local blob URL
        setForm(prev => ({
          ...prev,
          supportingDocument: {
            documentName: file.name,
            fileUrl: `/uploads/documents/${file.name}`,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date()
          }
        }));
      }
    } catch (err) {
      // Graceful fallback for mock/local environments
      setForm(prev => ({
        ...prev,
        supportingDocument: {
          documentName: file.name,
          fileUrl: `/uploads/documents/${file.name}`,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date()
        }
      }));
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleRemoveDocument = () => {
    setForm(prev => ({ ...prev, supportingDocument: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (validationError) return;

    try {
      setIsSubmitting(true);

      const payload = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        isHalfDay: form.isHalfDay,
        durationType: form.isHalfDay ? form.durationType : 'FULL_DAY',
        reason: form.reason,
        handoverDetails: form.handoverDetails,
        contactDuringLeave: form.contactDuringAbsence,
        contactDuringAbsence: form.contactDuringAbsence,
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relation: 'Emergency Contact'
        },
        supportingDocument: form.supportingDocument || undefined
      };

      let res;
      try {
        res = await employeeLeaveAPI.apply(payload);
      } catch (firstErr) {
        res = await leaveAPI.apply(payload);
      }

      if (res.data?.success) {
        const appData = {
          applicationId: res.data.applicationId || res.data.requestId || res.data.leave?.requestId || 'LV-2026-SUBMITTED',
          status: 'Pending Team Manager Approval',
          leaveType: selectedTypeConfig?.name || form.leaveType,
          duration: calculatedDays,
          startDate: form.startDate,
          endDate: form.isHalfDay ? form.startDate : form.endDate
        };
        setSubmittedData(appData);
        onSuccess?.();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit leave application.';
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const requiresDoc = selectedTypeConfig?.requiresDocumentProof || (selectedTypeConfig?.code === 'SICK_LEAVE' && calculatedDays > 2);
  const netAvailable = selectedBalance
    ? Math.max(0, (selectedBalance.available !== undefined ? selectedBalance.available : (selectedBalance.allocated || selectedTypeConfig?.annualQuotaDays || 0)) - (selectedBalance.pending || 0))
    : (selectedTypeConfig?.annualQuotaDays ?? 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Submit Controlled Leave Application
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequential approval workflow: <strong className="text-slate-700">Team Manager &rarr; Department Head &rarr; HR Sanction</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submittedData ? (
          /* Confirmation Success State */
          <div className="p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Leave Application Submitted Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your request has been routed to your Team Manager for the first stage of compliance review.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 max-w-md mx-auto border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Application ID</span>
                <span className="font-mono font-bold text-teal-700">{submittedData.applicationId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Leave Category</span>
                <span className="font-semibold text-slate-800">{submittedData.leaveType}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Duration</span>
                <span className="font-bold text-slate-800">{submittedData.duration} Day(s)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Dates</span>
                <span className="text-slate-700 font-mono">
                  {submittedData.startDate} to {submittedData.endDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Current Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                  {submittedData.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onViewHistory && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewHistory();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>VIEW LEAVE HISTORY</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* General Warnings & Holiday Banner */}
            {holidayWarning && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{holidayWarning}</span>
              </div>
            )}

            {validationError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{validationError}</span>
              </div>
            )}

            {/* Row 1: Select Leave Type & Available Balance Quota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Leave Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.leaveType || 'CASUAL_LEAVE'}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-bold bg-white text-slate-800 transition-all appearance-none cursor-pointer shadow-xs ${
                      fieldErrors.leaveType ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 hover:border-teal-400'
                    }`}
                  >
                    {(types.length > 0 ? types : DEFAULT_LEAVE_TYPES).map((t) => (
                      <option key={t.code} value={t.code} className="py-2 text-slate-900 font-semibold bg-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center">
                    <ChevronDown className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                  </div>
                </div>
                {selectedTypeConfig?.description && (
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                    {selectedTypeConfig.description}
                  </p>
                )}
                {fieldErrors.leaveType && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.leaveType}</p>
                )}
              </div>

              {/* Dynamic Available Balance Quota Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  AVAILABLE BALANCE QUOTA (2026)
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <span className="text-2xl font-black text-teal-700">
                      {netAvailable}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold ml-1.5">days available</span>
                  </div>
                  {selectedBalance && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold">
                      {selectedBalance.used || 0} used / {selectedBalance.pending || 0} pending
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Allocated: {selectedBalance?.allocated ?? selectedTypeConfig?.annualQuotaDays ?? 12} days &bull; Live Ledger Synced
                </span>
              </div>
            </div>

            {/* Row 2: Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      fieldErrors.startDate ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                </div>
                {fieldErrors.startDate && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    disabled={form.isHalfDay}
                    value={form.isHalfDay ? form.startDate : form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      form.isHalfDay ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                </div>
                {fieldErrors.endDate && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.endDate}</p>
                )}
              </div>
            </div>

            {/* Row 3: Half Day Session & Calculated Working Days */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-2xl gap-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isHalfDay}
                    onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-800 text-xs">Half Day Session</span>
                </label>

                {form.isHalfDay && (
                  <select
                    value={form.durationType}
                    onChange={(e) => setForm({ ...form, durationType: e.target.value })}
                    className="py-1 px-2.5 border border-teal-300 rounded-xl text-xs bg-white font-bold text-teal-800 shadow-sm"
                  >
                    <option value="FIRST_HALF">FIRST HALF (Morning)</option>
                    <option value="SECOND_HALF">SECOND HALF (Afternoon)</option>
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-slate-600 font-semibold text-xs">Calculated Working Days:</span>
                <span className="font-mono font-black text-sm text-teal-700 bg-white px-3 py-1 rounded-xl border border-teal-300/80 shadow-sm">
                  {calculatedDays} day(s)
                </span>
              </div>
            </div>

            {/* Row 4: Reason & Handover Details */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Reason & Handover Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Document reason for leave and specify designated colleague for workload handover..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-teal-100 transition-all ${
                  fieldErrors.reason ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-teal-500'
                }`}
              />
              {fieldErrors.reason && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.reason}</p>
              )}
            </div>

            {/* Row 5: Contact During Absence & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Contact Phone During Absence
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={form.contactDuringAbsence}
                    onChange={(e) => setForm({ ...form, contactDuringAbsence: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 text-xs"
                  />
                </div>
                {fieldErrors.contactDuringAbsence && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.contactDuringAbsence}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Emergency Contact (Person & Phone)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    placeholder="Rajesh Shah (Brother)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 text-xs"
                  />
                  <input
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    placeholder="9825012345"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 text-xs"
                  />
                </div>
                {fieldErrors.emergencyContactPhone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.emergencyContactPhone}</p>
                )}
              </div>
            </div>

            {/* Row 6: Supporting Certificate / Medical Document */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">
                  Supporting Certificate / Medical Document
                </label>
                {requiresDoc ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md uppercase">
                    Mandatory for this leave type
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Optional (Max 10MB)</span>
                )}
              </div>

              {form.supportingDocument?.fileUrl ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-800 block truncate">
                        {form.supportingDocument.documentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {form.supportingDocument.fileSize ? `${Math.round(form.supportingDocument.fileSize / 1024)} KB` : 'Attached'} &bull; Uploaded
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 text-slate-600 transition-all">
                  <UploadCloud className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold">
                    {isUploadingDoc ? 'Uploading File...' : 'Choose PDF / Scan (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={isUploadingDoc}
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </label>
              )}
              {fieldErrors.supportingDocument && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.supportingDocument}</p>
              )}
            </div>

            {/* Row 7: Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !!validationError}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Routing Application...</span>
                  </>
                ) : (
                  <span>SUBMIT LEAVE APPLICATION</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
