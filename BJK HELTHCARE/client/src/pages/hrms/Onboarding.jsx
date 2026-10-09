import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus as FiUserPlus,
  Clock as FiClock,
  CheckCircle as FiCheckCircle,
  AlertCircle as FiAlertCircle,
  ArrowLeft as FiArrowLeft,
  ArrowRight as FiArrowRight,
  Save as FiSave,
  Send as FiSend,
  RefreshCw as FiRefreshCw,
  Copy as FiCopy,
  Key as FiKey,
  Shield as FiShield,
  FileText as FiFileText,
  Check as FiCheck,
  X as FiX,
  Eye as FiEye,
  ExternalLink as FiExternalLink
} from 'lucide-react';

import OnboardingStepper from '../../components/hr/OnboardingStepper';
import EmployeeBasicForm from '../../components/hr/EmployeeBasicForm';
import EmploymentForm from '../../components/hr/EmploymentForm';
import PreviousEmploymentForm from '../../components/hr/PreviousEmploymentForm';
import FamilyNomineeForm from '../../components/hr/FamilyNomineeForm';
import AddressForm from '../../components/hr/AddressForm';
import EducationForm from '../../components/hr/EducationForm';
import BankDetailsForm from '../../components/hr/BankDetailsForm';
import IdentityDocumentsForm from '../../components/hr/IdentityDocumentsForm';
import ComplianceTrainingForm from '../../components/hr/ComplianceTrainingForm';
import OccupationalHealthForm from '../../components/hr/OccupationalHealthForm';
import DocumentCenterForm from '../../components/hr/DocumentCenterForm';
import EmployeeReview from '../../components/hr/EmployeeReview';
import { onboardingAPI } from '../../services/api';

const DEFAULT_FORM_DATA = {
  employeeId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  preferredName: '',
  gender: 'Male',
  dateOfBirth: '',
  maritalStatus: 'Single',
  bloodGroup: 'O+',
  nationality: 'Indian',
  profilePhoto: '',
  officialEmail: '',
  personalEmail: '',
  mobileNumber: '',
  alternateMobile: '',
  emergencyContact: {
    name: '',
    relationship: 'Spouse',
    phone: '',
    email: ''
  },
  department: 'Quality Assurance',
  designation: 'Quality Assurance Executive',
  jobTitle: 'QA Executive',
  reportingManager: '',
  departmentHead: '',
  employmentType: 'Full Time',
  workLocation: 'Ahmedabad Plant',
  facility: 'BJK Unit 1 - Formulations Facility',
  businessUnit: 'Formulations & Oral Solid Dosage',
  shift: 'General Day Shift (09:00 - 17:30)',
  grade: 'L2',
  employeeLevel: 'Executive',
  joiningDate: new Date().toISOString().slice(0, 10),
  probationPeriodMonths: 6,
  noticePeriodDays: 60,
  workingHoursPerWeek: 48,
  role: 'EMPLOYEE',
  systemAccessLevel: 'STANDARD_USER',
  previousEmployment: [],
  familyDetails: {
    fatherName: '',
    motherName: '',
    spouseName: '',
    childrenCount: 0,
    dependentsCount: 0,
    nomineeName: '',
    nomineeRelationship: 'Spouse',
    nomineeDob: '',
    nomineeContact: '',
    nomineeAddress: ''
  },
  addressDetails: {
    permanentAddress: {
      addressLine1: '',
      addressLine2: '',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pinCode: '382330',
      policeStation: '',
      landmark: ''
    },
    currentAddress: {
      addressLine1: '',
      addressLine2: '',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pinCode: '382330',
      policeStation: '',
      landmark: ''
    },
    sameAsPermanent: true,
    proofType: 'Aadhaar Card',
    proofNumber: ''
  },
  educationDetails: [],
  bankDetails: {
    accountHolderName: '',
    bankName: 'HDFC Bank',
    branchName: 'Ahmedabad Branch',
    accountNumber: '',
    ifscCode: '',
    accountType: 'Salary',
    upiId: ''
  },
  identityDocuments: {
    aadhaarNumber: '',
    panNumber: '',
    passportNumber: '',
    passportExpiry: '',
    drivingLicenseNumber: '',
    voterIdNumber: ''
  },
  complianceTraining: [],
  occupationalHealth: {
    medicalFitnessStatus: 'Fit for Duty',
    medicalExamDate: '',
    fitnessExpiryDate: '',
    cleanroomSuitability: true,
    allergies: '',
    occupationalRestrictions: '',
    emergencyMedicalContact: ''
  },
  documents: []
};

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'pipeline'

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [applicationId, setApplicationId] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving' | 'saved' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(new Date());

  const [pipelineList, setPipelineList] = useState([]);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const autoSaveTimerRef = useRef(null);

  // Generate initial auto employee ID if not set
  useEffect(() => {
    if (!formData.employeeId) {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      setFormData((prev) => ({
        ...prev,
        employeeId: `BJK-EMP-${randomSuffix}`
      }));
    }
  }, []);

  // Fetch Pipeline / Drafts
  const fetchPipeline = async () => {
    setIsLoadingPipeline(true);
    try {
      const res = await onboardingAPI.getAll();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPipelineList(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load onboarding pipeline:', err);
    } finally {
      setIsLoadingPipeline(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pipeline') {
      fetchPipeline();
    }
  }, [activeTab]);

  // Update form data helper
  const updateData = (patch) => {
    setFormData((prev) => {
      const updated = { ...prev, ...patch };
      // Schedule background auto-save
      scheduleAutoSave(updated);
      return updated;
    });
  };

  // Debounced auto-save function
  const scheduleAutoSave = (dataToSave) => {
    setAutoSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const payload = {
          ...dataToSave,
          currentStep,
          applicationId
        };
        const res = await onboardingAPI.saveDraft(payload);
        if (res.data?.success) {
          setAutoSaveStatus('saved');
          setLastSavedTime(new Date());
          if (res.data.application?._id && !applicationId) {
            setApplicationId(res.data.application._id);
          }
        }
      } catch (err) {
        setAutoSaveStatus('error');
      }
    }, 1500);
  };

  // Explicit Save Draft Button
  const handleManualSaveDraft = async () => {
    setAutoSaveStatus('saving');
    try {
      const res = await onboardingAPI.saveDraft({
        ...formData,
        currentStep,
        applicationId
      });
      if (res.data?.success) {
        setAutoSaveStatus('saved');
        setLastSavedTime(new Date());
        if (res.data.application?._id) {
          setApplicationId(res.data.application._id);
        }
        alert('Draft progress successfully saved to MongoDB Atlas!');
      }
    } catch (err) {
      setAutoSaveStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to save draft.');
    }
  };

  // Resume Draft from Pipeline Table
  const handleResumeDraft = (app) => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...app,
      employeeId: app.employeeId || `BJK-EMP-${Math.floor(100000 + Math.random() * 900000)}`
    });
    setApplicationId(app._id);
    setCurrentStep(app.currentStep || 1);
    setActiveTab('wizard');
    setSuccessResult(null);
  };

  // Step Navigations
  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.officialEmail.trim() || !formData.mobileNumber.trim()) {
        setErrorMessage('First Name, Last Name, Official Email, and Mobile Number are required for Step 1.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.department || !formData.designation.trim() || !formData.joiningDate) {
        setErrorMessage('Department, Designation, and Joining Date are required for Step 2.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 12));
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submit for HR Verification
  const handleSubmitForVerification = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // First ensure latest data is saved as draft
      const saveRes = await onboardingAPI.saveDraft({
        ...formData,
        currentStep: 12,
        applicationId
      });

      const activeAppId = saveRes.data?.application?._id || applicationId;

      if (!activeAppId) {
        throw new Error('Application record ID missing. Please save draft first.');
      }

      const submitRes = await onboardingAPI.submit(activeAppId);
      if (submitRes.data?.success) {
        setSuccessResult({
          type: 'SUBMITTED',
          title: 'Onboarding Dossier Submitted for HR Verification',
          message: 'The application is now in the HR Review & Document Verification pipeline.',
          applicationId: activeAppId,
          employeeId: formData.employeeId,
          name: `${formData.firstName} ${formData.lastName}`
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit onboarding application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct HR Approval Action (from review or pipeline)
  const handleHRApprove = async (appId) => {
    if (!window.confirm('Are you sure you want to approve this onboarding application and create the active Employee & login User records?')) {
      return;
    }

    try {
      const res = await onboardingAPI.approve(appId || applicationId, { remarks: 'Approved by HR Administrator' });
      if (res.data?.success) {
        setSuccessResult({
          type: 'APPROVED',
          title: 'Employee Successfully Onboarded & Provisioned!',
          message: 'Employee master record created, login user provisioned with temporary password, and 2026 leave balance initialized.',
          employee: res.data.employee,
          credentials: res.data.credentials
        });
        fetchPipeline();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve onboarding application.');
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const resetForNewOnboarding = () => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      employeeId: `BJK-EMP-${Math.floor(100000 + Math.random() * 900000)}`
    });
    setApplicationId(null);
    setCurrentStep(1);
    setSuccessResult(null);
    setActiveTab('wizard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* 1. Header & Navigation Modes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-500/20">
            <FiUserPlus size={26} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                BJK Healthcare HR Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-[10px] font-bold border border-teal-200 dark:border-teal-800">
                12-Step Guided Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive employee lifecycle master: personal KYC, GxP pharma compliance, bank encryption, document repository, and RBAC provisioning.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('wizard'); setSuccessResult(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'wizard'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiUserPlus size={14} />
            <span>Onboarding Wizard</span>
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'pipeline'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiClock size={14} />
            <span>Drafts & Pipeline ({pipelineList.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODE 1: 12-STEP GUIDED ONBOARDING WIZARD */}
      {/* ==================================================== */}
      {activeTab === 'wizard' && (
        <>
          {/* SUCCESS MODAL / PROVISIONING SLIP */}
          {successResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-500/40 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <FiCheckCircle size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {successResult.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {successResult.message}
                  </p>
                </div>
              </div>

              {/* Handover slip if Approved */}
              {successResult.credentials && (
                <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <FiKey size={18} className="text-teal-400" />
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Enterprise Credential & Access Slip
                      </span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      Status: ACTIVE EMPLOYEE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Employee Name</span>
                      <span className="text-sm font-bold text-white">{formData.firstName} {formData.middleName} {formData.lastName}</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Employee ID</span>
                        <span className="text-sm font-bold font-mono text-teal-300">{successResult.credentials.employeeId}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(successResult.credentials.employeeId, 'empId')}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                        title="Copy ID"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Login Email</span>
                        <span className="text-sm font-bold text-white">{successResult.credentials.email}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(successResult.credentials.email, 'email')}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                        title="Copy Email"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Temporary Initial Password</span>
                        <span className="text-sm font-bold font-mono text-amber-300">{successResult.credentials.temporaryPassword}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(successResult.credentials.temporaryPassword, 'pwd')}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                        title="Copy Password"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center space-x-2">
                    <FiShield size={16} className="shrink-0" />
                    <span>
                      <strong>First Login Mandate:</strong> The employee is prompted to update their initial temporary password on first sign-in.
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <button
                  onClick={resetForNewOnboarding}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all"
                >
                  <FiUserPlus size={14} />
                  <span>Onboard Another Employee</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/hr/employees')}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-teal-600/20 transition-all"
                  >
                    <span>View Employee Directory</span>
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6">
              {/* Stepper Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <OnboardingStepper
                  currentStep={currentStep}
                  onStepClick={(step) => setCurrentStep(step)}
                  formData={formData}
                  autoSaveStatus={autoSaveStatus}
                  lastSavedTime={lastSavedTime}
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mx-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 rounded-2xl flex items-center space-x-2 animate-in fade-in">
                  <FiAlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Active Step Content */}
              <div className="p-6 sm:p-8">
                {currentStep === 1 && <EmployeeBasicForm data={formData} updateData={updateData} />}
                {currentStep === 2 && <EmploymentForm data={formData} updateData={updateData} />}
                {currentStep === 3 && <PreviousEmploymentForm data={formData} updateData={updateData} />}
                {currentStep === 4 && <FamilyNomineeForm data={formData} updateData={updateData} />}
                {currentStep === 5 && <AddressForm data={formData} updateData={updateData} />}
                {currentStep === 6 && <EducationForm data={formData} updateData={updateData} />}
                {currentStep === 7 && <BankDetailsForm data={formData} updateData={updateData} />}
                {currentStep === 8 && <IdentityDocumentsForm data={formData} updateData={updateData} />}
                {currentStep === 9 && <ComplianceTrainingForm data={formData} updateData={updateData} />}
                {currentStep === 10 && <OccupationalHealthForm data={formData} updateData={updateData} />}
                {currentStep === 11 && <DocumentCenterForm data={formData} updateData={updateData} />}
                {currentStep === 12 && (
                  <EmployeeReview
                    data={formData}
                    onJumpToStep={(step) => setCurrentStep(step)}
                    onSubmitForVerification={handleSubmitForVerification}
                    onSaveDraft={handleManualSaveDraft}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>

              {/* Step Footer Navigation */}
              {currentStep < 12 && (
                <div className="p-6 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={currentStep === 1}
                      onClick={handlePrev}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        currentStep === 1
                          ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <FiArrowLeft size={14} /> Back
                    </button>

                    <button
                      type="button"
                      onClick={handleManualSaveDraft}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-sm transition-all"
                    >
                      <FiSave size={14} /> Save Draft
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <FiArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* MODE 2: PIPELINE & DRAFTS MANAGEMENT */}
      {/* ==================================================== */}
      {activeTab === 'pipeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                HR Onboarding & Verification Pipeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track pending drafts, submitted verification dossiers, bank validations, and final approvals.
              </p>
            </div>
            <button
              onClick={fetchPipeline}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <FiRefreshCw size={13} className={isLoadingPipeline ? 'animate-spin' : ''} /> Refresh List
            </button>
          </div>

          {isLoadingPipeline ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading pipeline records from MongoDB...</div>
          ) : pipelineList.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No active onboarding drafts or submissions found. Click "Onboarding Wizard" to start a new profile.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">Employee ID</th>
                    <th className="py-3 px-4 font-semibold">Candidate / Name</th>
                    <th className="py-3 px-4 font-semibold">Department & Role</th>
                    <th className="py-3 px-4 font-semibold">Progress</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Last Updated</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pipelineList.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {app.employeeId || 'DRAFT'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {app.firstName} {app.lastName}
                        <div className="text-[11px] font-normal text-slate-400">{app.officialEmail || app.personalEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{app.designation || 'Specialist'}</div>
                        <div className="text-[11px] text-slate-400">{app.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-500 h-full rounded-full"
                              style={{ width: `${app.profileCompletion || 20}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                            Step {app.currentStep || 1}/12
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            app.onboardingStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : app.onboardingStatus === 'SUBMITTED' || app.onboardingStatus === 'HR_REVIEW'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {app.onboardingStatus || 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(app.updatedAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleResumeDraft(app)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-[11px] transition-colors"
                          >
                            Resume
                          </button>

                          {(app.onboardingStatus === 'SUBMITTED' || app.onboardingStatus === 'HR_REVIEW') && (
                            <button
                              onClick={() => handleHRApprove(app._id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Onboarding;
