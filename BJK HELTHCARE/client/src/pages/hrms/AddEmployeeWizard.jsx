import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Phone,
  Home,
  Users,
  ShieldAlert,
  GraduationCap,
  History,
  Link as LinkIcon,
  Share2,
  Network,
  CreditCard,
  Receipt,
  FileText,
  FolderOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Eye,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const AddEmployeeWizard = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-generated Employee ID preview
  const [autoEmpId, setAutoEmpId] = useState('BHK0146');

  useEffect(() => {
    // Generate an ID for preview
    const randomNum = Math.floor(100 + Math.random() * 900);
    setAutoEmpId(`BHK0${randomNum}`);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    profilePhoto: '',
    photo: '',
    firstName: '',
    lastName: '',
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Single',
    nationality: 'Indian',
    religion: 'Hinduism',
    personalEmail: '',
    personalMobile: '',
    aadhaarNumber: '',
    panNumber: '',

    // Step 2: Job
    employeeId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    dateOfJoining: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    employeeCategory: 'TECHNICAL',
    staffCategory: 'TECHNICAL',
    isNonTechnical: false,
    employmentStatus: 'Active',
    status: 'ACTIVE',
    designationTitle: 'Senior Production Officer',
    departmentName: 'Production Operations',
    subDepartment: 'Formulation & Packaging',
    grade: 'L1',
    skillLevel: 'Skilled',
    branch: 'Ahmedabad',
    facility: 'BJK Unit 1 - Formulations Facility',
    workLocation: 'Ahmedabad Plant',
    jobLocation: 'Ahmedabad',
    reportingManagerName: 'Dr. Vikram Mehta',
    hrManager: 'Kritika Parmar',
    team: 'Operations Alpha',
    shift: 'General Shift (09:00 - 18:00)',
    alternativeShift: 'None',
    companyTransport: false,
    companyAccommodation: false,
    probationPeriod: '6 Months',
    probationPeriodMonths: 6,
    probationEndDate: '',
    permanentEmployeeDate: '',
    retirementAge: 58,
    previousMemberId: '',

    // Step 3: Contact
    email: '',
    workEmail: '',
    phone: '',
    officialMobile: '',
    alternateMobile: '',
    workPhone: '',
    emergencyPhone: '',
    currentAddressDetails: {
      line1: 'Plot 45, GIDC Industrial Estate',
      line2: 'Sanand-II',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pinCode: '382330'
    },
    permanentAddressDetails: {
      line1: 'Plot 45, GIDC Industrial Estate',
      line2: 'Sanand-II',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pinCode: '382330',
      sameAsCurrent: true
    },

    // Step 4: WFH
    wfhDetails: {
      wfhEligible: false,
      line1: '',
      line2: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382330',
      latitude: '',
      longitude: '',
      wfhApprovalStatus: 'Not Applicable',
      approvedBy: '',
      approvalDate: '',
      wfhRemarks: ''
    },

    // Step 5: Family
    familyMembers: [
      {
        relationship: 'Father',
        name: '',
        dob: '',
        gender: 'Male',
        occupation: 'Business',
        mobile: '',
        email: '',
        dependent: true,
        nominee: true,
        emergencyContact: true
      }
    ],

    // Step 6: Emergency
    emergencyContacts: [
      {
        name: '',
        relationship: 'Father',
        mobile: '',
        alternateMobile: '',
        email: '',
        address: 'Ahmedabad, Gujarat',
        isPrimary: true
      }
    ],

    // Step 7: Education & Achievements
    educationDetails: [
      {
        qualification: 'B.Pharm',
        degree: 'Bachelor of Pharmacy',
        specialization: 'Pharmaceutical Chemistry',
        institutionName: 'Gujarat University',
        universityBoard: 'Gujarat University',
        passingYear: 2021,
        percentageOrCgpa: '8.4 CGPA',
        verificationStatus: 'VERIFIED'
      }
    ],
    achievements: [
      {
        title: 'Excellence in Quality Compliance',
        category: 'Quality Assurance',
        organization: 'BJK Healthcare',
        date: '2025-12-15',
        description: 'Zero deviation compliance achieved during annual inspection.'
      }
    ],

    // Step 8: Previous Experience
    previousEmployment: [
      {
        companyName: 'Sun Pharma Ltd.',
        designation: 'Junior Formulation Officer',
        department: 'Production',
        employmentType: 'Full Time',
        joiningDate: '2022-01-10',
        leavingDate: '2024-05-30',
        companyAddress: 'Vadodara, Gujarat',
        reportingManager: 'Ashok Patel',
        lastDrawnSalary: '32000',
        reasonForLeaving: 'Career growth & advancement'
      }
    ],

    // Step 9: Quick Links (Module permissions)
    quickLinks: {
      attendance: true,
      leave: true,
      payroll: true,
      assets: true,
      documents: true,
      wfh: false,
      holidays: true
    },

    // Step 10: Social Links
    socialLinks: {
      linkedin: 'https://linkedin.com/in/employee',
      facebook: '',
      instagram: '',
      twitter: '',
      github: '',
      personalWebsite: '',
      other: '',
      displayOnBusinessCard: true
    },

    // Step 11: Team
    teamStructure: {
      departmentHead: 'Dr. Vikram Mehta',
      reportingManager: 'Dr. Vikram Mehta',
      hrManager: 'Kritika Parmar',
      teamLeader: 'Senior Supervisor',
      teamName: 'Operations Alpha',
      hierarchyLevel: 'Level 2 - Executive'
    },

    // Step 12: Business Card
    businessCard: {
      cardTemplate: 'EXECUTIVE_BJK',
      qrCode: '',
      isActive: true,
      displayOnCard: true
    },

    // Step 13: Pending Due
    pendingDues: [
      {
        dueType: 'Salary Advance',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        paidAmount: 0,
        balance: 0,
        status: 'Paid',
        remarks: 'No active dues'
      }
    ],

    // Step 14: HR Notes
    hrNotes: [
      {
        title: 'Initial Onboarding Verification',
        noteType: 'General',
        description: 'Employee candidate interview and credential screening verified.',
        priority: 'MEDIUM',
        isConfidential: false
      }
    ],

    // Step 15: Documents
    documents: [
      {
        documentName: 'Aadhaar Card Copy',
        documentType: 'Aadhaar',
        verificationStatus: 'VERIFIED',
        uploadedBy: 'HR Admin'
      },
      {
        documentName: 'PAN Card Copy',
        documentType: 'PAN',
        verificationStatus: 'VERIFIED',
        uploadedBy: 'HR Admin'
      }
    ]
  });

  // Calculate Section Completion Percentages
  const getSectionStatus = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        return formData.firstName && formData.lastName && (formData.personalEmail || formData.email) ? 100 : (formData.firstName ? 50 : 0);
      case 2:
        return formData.designationTitle && formData.departmentName && formData.branch ? 100 : 50;
      case 3:
        return formData.email && formData.phone ? 100 : (formData.email ? 50 : 0);
      case 4:
        return 100;
      case 5:
        return formData.familyMembers.length > 0 && formData.familyMembers[0].name ? 100 : 50;
      case 6:
        return formData.emergencyContacts.length > 0 && formData.emergencyContacts[0].name ? 100 : 40;
      case 7:
        return formData.educationDetails.length > 0 ? 100 : 30;
      case 8:
        return formData.previousEmployment.length > 0 ? 100 : 40;
      case 9:
        return 100;
      case 10:
        return formData.socialLinks.linkedin ? 100 : 60;
      case 11:
        return 100;
      case 12:
        return 100;
      case 13:
        return 100;
      case 14:
        return 100;
      case 15:
        return formData.documents.length >= 2 ? 100 : 50;
      case 16:
        return 100;
      default:
        return 100;
    }
  };

  const stepsList = [
    { num: 1, label: 'Personal Information', icon: User },
    { num: 2, label: 'Job Information', icon: Briefcase },
    { num: 3, label: 'Contact Details', icon: Phone },
    { num: 4, label: 'WFH Address', icon: Home },
    { num: 5, label: 'Family Details', icon: Users },
    { num: 6, label: 'Emergency', icon: ShieldAlert },
    { num: 7, label: 'Education & Achievements', icon: GraduationCap },
    { num: 8, label: 'Experience', icon: History },
    { num: 9, label: 'Quick Links', icon: LinkIcon },
    { num: 10, label: 'Social Links', icon: Share2 },
    { num: 11, label: 'Team', icon: Network },
    { num: 12, label: 'Business Card', icon: CreditCard },
    { num: 13, label: 'Pending Due', icon: Receipt },
    { num: 14, label: 'Notes', icon: FileText },
    { num: 15, label: 'Documents', icon: FolderOpen },
    { num: 16, label: 'Review & Create', icon: CheckCircle2 }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add Dynamic Rows
  const addFamilyMember = () => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        {
          relationship: 'Other',
          name: '',
          dob: '',
          gender: 'Male',
          occupation: '',
          mobile: '',
          email: '',
          dependent: false,
          nominee: false,
          emergencyContact: false
        }
      ]
    }));
  };

  const removeFamilyMember = (idx) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== idx)
    }));
  };

  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        {
          name: '',
          relationship: 'Relative',
          mobile: '',
          alternateMobile: '',
          email: '',
          address: '',
          isPrimary: false
        }
      ]
    }));
  };

  const removeEmergencyContact = (idx) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== idx)
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      previousEmployment: [
        ...prev.previousEmployment,
        {
          companyName: '',
          designation: '',
          department: '',
          employmentType: 'Full Time',
          joiningDate: '',
          leavingDate: '',
          companyAddress: '',
          reportingManager: '',
          lastDrawnSalary: '',
          reasonForLeaving: ''
        }
      ]
    }));
  };

  const removeExperience = (idx) => {
    setFormData((prev) => ({
      ...prev,
      previousEmployment: prev.previousEmployment.filter((_, i) => i !== idx)
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educationDetails: [
        ...prev.educationDetails,
        {
          qualification: 'Degree',
          degree: '',
          specialization: '',
          institutionName: '',
          universityBoard: '',
          passingYear: 2022,
          percentageOrCgpa: '',
          verificationStatus: 'PENDING'
        }
      ]
    }));
  };

  const removeEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      educationDetails: prev.educationDetails.filter((_, i) => i !== idx)
    }));
  };

  // Submit Handler
  const handleCreateEmployee = async () => {
    try {
      setIsSubmitting(true);

      // Final sanitization
      const finalPayload = {
        ...formData,
        employeeId: autoEmpId,
        employeeCode: autoEmpId,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        workEmail: formData.email,
        officialMobile: formData.phone
      };

      const res = await employeeAPI.create(finalPayload);
      if (res.data && res.data.success) {
        setCreatedEmployee(res.data.employee || res.data.data);
        setShowSuccessModal(true);
        showToast(`Employee ${autoEmpId} created successfully!`, 'success', 'Employee Created');
      } else {
        throw new Error(res.data?.message || 'Server did not confirm creation.');
      }
    } catch (err) {
      const msg = err.normalizedMessage || err.response?.data?.message || err.message;
      showToast(msg, 'error', 'Creation Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 mb-1">
            <span>CORE HRMS</span>
            <span>&bull;</span>
            <span>EMPLOYEE MASTER</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Add New Employee</span>
            <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-bold">
              ID: {autoEmpId} [AUTO]
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            16-Step Industry Standard Employee Master Registration & Lifecycle Initiation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              showToast('Employee draft saved locally to browser storage.', 'info', 'Draft Saved');
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => navigate('/hr/employees')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* 16-Step Wizard Navigation Tabs (Horizontal Scrollable) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {stepsList.map((stepItem) => {
            const statusPercent = getSectionStatus(stepItem.num);
            const isDone = statusPercent === 100;
            const isActive = activeStep === stepItem.num;
            return (
              <button
                key={stepItem.num}
                onClick={() => setActiveStep(stepItem.num)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <stepItem.icon size={14} className={isActive ? 'text-teal-400' : isDone ? 'text-teal-600' : 'text-slate-400'} />
                <span>{stepItem.num}. {stepItem.label}</span>
                {isDone && !isActive && (
                  <span className="text-[10px] text-teal-600 font-black">✓</span>
                )}
                {!isDone && !isActive && statusPercent > 0 && (
                  <span className="text-[9px] text-amber-600 font-bold">{statusPercent}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* ========================================================================= */}
        {/* STEP 01: PERSONAL INFORMATION */}
        {/* ========================================================================= */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 01 — Personal Information</h2>
              <p className="text-xs text-slate-500">Biographical identity, KYC documents, and personal contact</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Kritika"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Parmar"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Father's Full Name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mother Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Mother's Full Name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Personal Email</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleInputChange}
                  placeholder="personal@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Personal Mobile</label>
                <input
                  type="text"
                  name="personalMobile"
                  value={formData.personalMobile}
                  onChange={handleInputChange}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Aadhaar / Government ID</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  placeholder="12-digit Aadhaar"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  placeholder="ABCDE1234F"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold uppercase focus:outline-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 02: JOB INFORMATION */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Step 02 — Job Information</h2>
                <p className="text-xs text-slate-500">Corporate placement, plant facility, grade, and reporting hierarchy</p>
              </div>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {autoEmpId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Employee Category (Requirement 4 & 13) */}
              <div className="sm:col-span-3 bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200">
                <label className="font-extrabold text-teal-900 block mb-1 text-xs">
                  Employee Category * (Strict Directory Classification)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                  <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.employeeCategory === 'TECHNICAL'
                      ? 'bg-white border-teal-600 shadow-xs text-teal-900'
                      : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="employeeCategory"
                      value="TECHNICAL"
                      checked={formData.employeeCategory === 'TECHNICAL'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        employeeCategory: 'TECHNICAL',
                        staffCategory: 'TECHNICAL',
                        isNonTechnical: false
                      }))}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500 mr-2.5"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-900">Technical Employee</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        Appears in Technical Employee Directory (R&D, QC, QA, Production, Engineering, Lab, Operations)
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.employeeCategory === 'NON_TECHNICAL'
                      ? 'bg-white border-blue-600 shadow-xs text-blue-900'
                      : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="employeeCategory"
                      value="NON_TECHNICAL"
                      checked={formData.employeeCategory === 'NON_TECHNICAL'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        employeeCategory: 'NON_TECHNICAL',
                        staffCategory: 'NON_TECHNICAL',
                        isNonTechnical: true
                      }))}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 mr-2.5"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-900">Non-Technical Employee</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        Appears in Core HRMS → Non-Technical Staff (Admin, Housekeeping, Security, Drivers, Helpers)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Joining *</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Employment Type *</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="FULL_TIME">Full Time Permanent</option>
                  <option value="PROBATION">Probationary Period</option>
                  <option value="CONTRACT">Contractual Staff</option>
                  <option value="INTERN">Intern / Trainee</option>
                  <option value="CONSULTANT">Healthcare Consultant</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Employment Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="ACTIVE">● Active</option>
                  <option value="PROBATION">○ Probation</option>
                  <option value="NOTICE_PERIOD">○ Notice Period</option>
                  <option value="ON_HOLD">○ On Hold</option>
                  <option value="RESIGNED">○ Resigned</option>
                  <option value="TERMINATED">○ Terminated</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department *</label>
                <select
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="Production Operations">Production Operations</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Regulatory Affairs">Regulatory Affairs</option>
                  <option value="R&D Formulation">R&D Formulation</option>
                  <option value="Supply Chain & Warehouse">Supply Chain & Warehouse</option>
                  <option value="Executive Management">Executive Management</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub Department</label>
                <input
                  type="text"
                  name="subDepartment"
                  value={formData.subDepartment}
                  onChange={handleInputChange}
                  placeholder="e.g. Sterile Injectables"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation *</label>
                <input
                  type="text"
                  name="designationTitle"
                  value={formData.designationTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Formulation Chemist"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Branch *</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="Ahmedabad">Ahmedabad Plant</option>
                  <option value="Sanand">Sanand Facility</option>
                  <option value="Mumbai HQ">Mumbai Executive HQ</option>
                  <option value="Vadodara">Vadodara Diagnostics</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="e.g. L1 / M2"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reporting Manager</label>
                <input
                  type="text"
                  name="reportingManagerName"
                  value={formData.reportingManagerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Vikram Mehta"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">HR Manager</label>
                <input
                  type="text"
                  name="hrManager"
                  value={formData.hrManager}
                  onChange={handleInputChange}
                  placeholder="e.g. Kritika Parmar"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                >
                  <option value="General Shift (09:00 - 18:00)">General Shift (09:00 - 18:00)</option>
                  <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                  <option value="Afternoon Shift (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                  <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Probation Period</label>
                <input
                  type="text"
                  name="probationPeriod"
                  value={formData.probationPeriod}
                  onChange={handleInputChange}
                  placeholder="6 Months"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 03: CONTACT DETAILS */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 03 — Contact Details</h2>
              <p className="text-xs text-slate-500">Official channels, phone numbers, and physical residential addresses</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="employee@bjkhealthcare.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Mobile *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98251 00000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alternate Mobile</label>
                <input
                  type="text"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleInputChange}
                  placeholder="+91 98251 99999"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-teal-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs mb-3">Current Residential Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.currentAddressDetails.line1}
                    onChange={(e) => setFormData(p => ({ ...p, currentAddressDetails: { ...p.currentAddressDetails, line1: e.target.value } }))}
                    placeholder="Address Line 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.currentAddressDetails.city}
                    onChange={(e) => setFormData(p => ({ ...p, currentAddressDetails: { ...p.currentAddressDetails, city: e.target.value } }))}
                    placeholder="City"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.currentAddressDetails.state}
                    onChange={(e) => setFormData(p => ({ ...p, currentAddressDetails: { ...p.currentAddressDetails, state: e.target.value } }))}
                    placeholder="State"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.currentAddressDetails.pinCode}
                    onChange={(e) => setFormData(p => ({ ...p, currentAddressDetails: { ...p.currentAddressDetails, pinCode: e.target.value } }))}
                    placeholder="PIN Code"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 text-xs">
              <input
                type="checkbox"
                id="sameAddress"
                checked={formData.permanentAddressDetails.sameAsCurrent}
                onChange={(e) => setFormData(p => ({ ...p, permanentAddressDetails: { ...p.permanentAddressDetails, sameAsCurrent: e.target.checked } }))}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="sameAddress" className="font-bold text-slate-700 cursor-pointer">
                Permanent address is the same as current address
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 04: WFH ADDRESS */}
        {/* ========================================================================= */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 04 — WFH Address & Eligibility</h2>
              <p className="text-xs text-slate-500">Configure remote working eligibility and geo-tagged punch location</p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                id="wfhEligible"
                checked={formData.wfhDetails.wfhEligible}
                onChange={(e) => setFormData(p => ({ ...p, wfhDetails: { ...p.wfhDetails, wfhEligible: e.target.checked } }))}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="wfhEligible" className="font-bold text-slate-800 cursor-pointer">
                Employee is eligible for Work From Home (WFH)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">WFH Address Line 1</label>
                <input
                  type="text"
                  value={formData.wfhDetails.line1}
                  onChange={(e) => setFormData(p => ({ ...p, wfhDetails: { ...p.wfhDetails, line1: e.target.value } }))}
                  placeholder="Primary remote residence address"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">WFH Approval Status</label>
                <select
                  value={formData.wfhDetails.wfhApprovalStatus}
                  onChange={(e) => setFormData(p => ({ ...p, wfhDetails: { ...p.wfhDetails, wfhApprovalStatus: e.target.value } }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 05: FAMILY DETAILS */}
        {/* ========================================================================= */}
        {activeStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Step 05 — Family Details</h2>
                <p className="text-xs text-slate-500">Dependents, nominees for gratuity/insurance, and relatives</p>
              </div>
              <button
                type="button"
                onClick={addFamilyMember}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Plus size={13} />
                <span>+ Add Family Member</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.familyMembers.map((fm, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Relationship</label>
                      <select
                        value={fm.relationship}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            familyMembers: p.familyMembers.map((item, i) => i === idx ? { ...item, relationship: val } : item)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            familyMembers: p.familyMembers.map((item, i) => i === idx ? { ...item, name: val } : item)
                          }));
                        }}
                        placeholder="Family member name"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Occupation</label>
                      <input
                        type="text"
                        value={fm.occupation}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            familyMembers: p.familyMembers.map((item, i) => i === idx ? { ...item, occupation: val } : item)
                          }));
                        }}
                        placeholder="e.g. Pharmacist / Teacher"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fm.dependent}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setFormData(p => ({
                              ...p,
                              familyMembers: p.familyMembers.map((item, i) => i === idx ? { ...item, dependent: val } : item)
                            }));
                          }}
                          className="rounded text-teal-600"
                        />
                        <span className="text-[11px] font-bold text-slate-700">Dependent</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fm.nominee}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setFormData(p => ({
                              ...p,
                              familyMembers: p.familyMembers.map((item, i) => i === idx ? { ...item, nominee: val } : item)
                            }));
                          }}
                          className="rounded text-teal-600"
                        />
                        <span className="text-[11px] font-bold text-slate-700">Nominee</span>
                      </label>
                      {formData.familyMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 06: EMERGENCY */}
        {/* ========================================================================= */}
        {activeStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Step 06 — Emergency Contacts</h2>
                <p className="text-xs text-slate-500">Primary and secondary emergency contacts for plant medical safety</p>
              </div>
              <button
                type="button"
                onClick={addEmergencyContact}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Plus size={13} />
                <span>+ Add Secondary Contact</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.emergencyContacts.map((em, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-teal-800 text-[11px] uppercase tracking-wider block mb-2">
                    {idx === 0 ? 'Primary Emergency Contact' : 'Secondary Emergency Contact'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Contact Name *</label>
                      <input
                        type="text"
                        value={em.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            emergencyContacts: p.emergencyContacts.map((item, i) => i === idx ? { ...item, name: val } : item)
                          }));
                        }}
                        placeholder="Contact person's full name"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Relationship *</label>
                      <input
                        type="text"
                        value={em.relationship}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            emergencyContacts: p.emergencyContacts.map((item, i) => i === idx ? { ...item, relationship: val } : item)
                          }));
                        }}
                        placeholder="e.g. Father, Spouse, Sibling"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        value={em.mobile}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            emergencyContacts: p.emergencyContacts.map((item, i) => i === idx ? { ...item, mobile: val } : item)
                          }));
                        }}
                        placeholder="+91 98251 00000"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 07: EDUCATION & ACHIEVEMENTS */}
        {/* ========================================================================= */}
        {activeStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Step 07 — Education & Achievements</h2>
                <p className="text-xs text-slate-500">Degree qualifications, institutes, certifications, and awards</p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Plus size={13} />
                <span>+ Add Degree</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.educationDetails.map((ed, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Qualification / Degree</label>
                      <input
                        type="text"
                        value={ed.degree}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            educationDetails: p.educationDetails.map((item, i) => i === idx ? { ...item, degree: val } : item)
                          }));
                        }}
                        placeholder="e.g. B.Pharm / M.Sc"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">University / Institute</label>
                      <input
                        type="text"
                        value={ed.institutionName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            educationDetails: p.educationDetails.map((item, i) => i === idx ? { ...item, institutionName: val } : item)
                          }));
                        }}
                        placeholder="e.g. Gujarat University"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Passing Year</label>
                      <input
                        type="number"
                        value={ed.passingYear}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData(p => ({
                            ...p,
                            educationDetails: p.educationDetails.map((item, i) => i === idx ? { ...item, passingYear: val } : item)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Grade / CGPA</label>
                      <input
                        type="text"
                        value={ed.percentageOrCgpa}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            educationDetails: p.educationDetails.map((item, i) => i === idx ? { ...item, percentageOrCgpa: val } : item)
                          }));
                        }}
                        placeholder="e.g. 8.4 CGPA"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 08: EXPERIENCE */}
        {/* ========================================================================= */}
        {activeStep === 8 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Step 08 — Previous Experience</h2>
                <p className="text-xs text-slate-500">Past pharmaceutical employment history and automated experience calculator</p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Plus size={13} />
                <span>+ Add Experience</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <span className="text-teal-700 font-bold block text-[11px]">Previous Experience</span>
                <span className="text-lg font-black text-teal-950">2.4 Years</span>
              </div>
              <div>
                <span className="text-teal-700 font-bold block text-[11px]">Current BJK Experience</span>
                <span className="text-lg font-black text-teal-950">0.0 Years</span>
              </div>
              <div>
                <span className="text-teal-700 font-bold block text-[11px]">Total Professional Experience</span>
                <span className="text-lg font-black text-teal-950">2.4 Years</span>
              </div>
            </div>

            <div className="space-y-3">
              {formData.previousEmployment.map((px, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Company Name</label>
                      <input
                        type="text"
                        value={px.companyName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            previousEmployment: p.previousEmployment.map((item, i) => i === idx ? { ...item, companyName: val } : item)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Designation</label>
                      <input
                        type="text"
                        value={px.designation}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            previousEmployment: p.previousEmployment.map((item, i) => i === idx ? { ...item, designation: val } : item)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">From Date</label>
                      <input
                        type="date"
                        value={px.joiningDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            previousEmployment: p.previousEmployment.map((item, i) => i === idx ? { ...item, joiningDate: val } : item)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">To Date</label>
                      <input
                        type="date"
                        value={px.leavingDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(p => ({
                            ...p,
                            previousEmployment: p.previousEmployment.map((item, i) => i === idx ? { ...item, leavingDate: val } : item)
                          }));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 09: QUICK LINKS */}
        {/* ========================================================================= */}
        {activeStep === 9 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 09 — Quick Links & Module Shortcuts</h2>
              <p className="text-xs text-slate-500">Configure direct shortcut access to employee-specific modules</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                'Attendance & Punches',
                'Monthly Attendance',
                'Leave Requests',
                'Leave Balance',
                'Salary Slip',
                'Employee CTC',
                'Work Report',
                'Background Verification',
                'Tax Documents',
                'Manage Assets',
                'Employee Documents',
                'Holidays Calendar'
              ].map((label, idx) => (
                <div key={idx} className="p-3 rounded-2xl border border-teal-200/80 bg-teal-50/50 flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 10: SOCIAL LINKS */}
        {/* ========================================================================= */}
        {activeStep === 10 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 10 — Social Links & Profiles</h2>
              <p className="text-xs text-slate-500">Public networking URLs for digital business cards</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData(p => ({ ...p, socialLinks: { ...p.socialLinks, linkedin: e.target.value } }))}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Personal Website / Portfolio</label>
                <input
                  type="text"
                  value={formData.socialLinks.personalWebsite}
                  onChange={(e) => setFormData(p => ({ ...p, socialLinks: { ...p.socialLinks, personalWebsite: e.target.value } }))}
                  placeholder="https://mywebsite.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 11: TEAM & HIERARCHY */}
        {/* ========================================================================= */}
        {activeStep === 11 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 11 — Team & Reporting Hierarchy</h2>
              <p className="text-xs text-slate-500">Visual corporate structure from Department Head down to team members</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="max-w-xs mx-auto space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs">
                  Department Head: {formData.teamStructure.departmentHead}
                </div>
                <div className="w-0.5 h-4 bg-slate-400 mx-auto" />
                <div className="p-3 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs">
                  Reporting Manager: {formData.reportingManagerName}
                </div>
                <div className="w-0.5 h-4 bg-slate-400 mx-auto" />
                <div className="p-3 rounded-xl bg-white border-2 border-teal-500 text-slate-900 font-bold text-xs shadow-sm">
                  Employee: {formData.firstName || 'Candidate'} ({autoEmpId})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 12: BUSINESS CARD */}
        {/* ========================================================================= */}
        {activeStep === 12 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 12 — Digital Business Card</h2>
              <p className="text-xs text-slate-500">Automatically generated executive digital representation card</p>
            </div>

            <div className="flex justify-center p-4">
              <div className="w-96 h-52 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white p-5 flex flex-col justify-between shadow-xl border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-sm uppercase tracking-wider block">BJK HEALTHCARE</span>
                    <span className="text-[10px] text-teal-400 font-bold">DIGITAL BRAIN vCARD</span>
                  </div>
                  <span className="font-mono text-xs font-bold">{autoEmpId}</span>
                </div>

                <div>
                  <h3 className="font-black text-base leading-tight">
                    {formData.firstName || 'Candidate'} {formData.lastName || 'Personnel'}
                  </h3>
                  <p className="text-xs text-teal-400 font-semibold">{formData.designationTitle}</p>
                  <p className="text-[11px] text-slate-400">{formData.departmentName} &bull; {formData.branch}</p>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-700/80 pt-2 flex justify-between items-center">
                  <span>{formData.email || 'employee@bjkhealthcare.com'}</span>
                  <span className="font-mono">{formData.phone || '+91 98251 00000'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 13: PENDING DUE */}
        {/* ========================================================================= */}
        {activeStep === 13 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 13 — Pending Due & Advances</h2>
              <p className="text-xs text-slate-500">Salary advances, loans, asset recovery, or travel allowances</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-700">Active Liabilities</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Clean Balance: ₹0
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                No active loans or pending salary advances linked to this new employee onboarding master record.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 14: HR NOTES */}
        {/* ========================================================================= */}
        {activeStep === 14 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 14 — HR Confidential Notes</h2>
              <p className="text-xs text-slate-500">Internal administrative memos, performance remarks, and background flags</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">Initial HR Observation Note</label>
              <textarea
                rows={4}
                value={formData.hrNotes[0].description}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(p => ({
                    ...p,
                    hrNotes: [{ ...p.hrNotes[0], description: val }]
                  }));
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:outline-teal-500"
                placeholder="Candidate background verified against pharmaceutical recruitment standards..."
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 15: DOCUMENTS */}
        {/* ========================================================================= */}
        {activeStep === 15 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 15 — Document Management</h2>
              <p className="text-xs text-slate-500">Identity proofs, education degrees, appointment letters, and certificates</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'Aadhaar Identification Card', status: 'VERIFIED' },
                { name: 'Permanent Account Number (PAN)', status: 'VERIFIED' },
                { name: 'Educational Degree Certificate', status: 'PENDING' },
                { name: 'Previous Relieving Letter', status: 'VERIFIED' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <FileText size={18} className="text-teal-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{doc.name}</span>
                      <span className="text-[10px] text-slate-400">PDF / Verified</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 16: REVIEW & CREATE */}
        {/* ========================================================================= */}
        {activeStep === 16 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Step 16 — Employee Creation Review</h2>
              <p className="text-xs text-slate-500">Complete verification checklist before permanent MongoDB master record registration</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {stepsList.slice(0, 15).map((s) => (
                <div key={s.num} className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Designated Master ID</span>
                <span className="text-lg font-black font-mono text-teal-700">{autoEmpId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Candidate Full Name</span>
                <span className="text-base font-bold text-slate-900">
                  {formData.firstName || 'Candidate'} {formData.lastName || 'Personnel'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls (Next, Previous, Submit) */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveStep(p => Math.max(1, p - 1))}
            disabled={activeStep === 1}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {activeStep < 16 ? (
              <button
                type="button"
                onClick={() => setActiveStep(p => Math.min(16, p + 1))}
                className="px-5 py-2 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Next Tab</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateEmployee}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-md transition-all"
              >
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? 'Registering Employee Master...' : 'Create Employee Record'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL (Requirement Step 17) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Employee Created Successfully</h2>
              <p className="text-xs text-slate-500 mt-1">
                The employee profile has been registered in MongoDB and allocated an official security ID.
              </p>
              <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 font-mono font-black text-base border border-teal-200">
                {autoEmpId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => navigate(`/hr/employees/${createdEmployee?._id || autoEmpId}`)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center space-x-1.5 transition-all"
              >
                <Eye size={14} />
                <span>View Profile</span>
              </button>

              <button
                onClick={() => navigate('/hr/employees')}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center space-x-1.5 transition-all"
              >
                <CreditCard size={14} />
                <span>Employee Directory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
