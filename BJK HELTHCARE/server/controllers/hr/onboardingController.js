const mongoose = require('mongoose');
const Employee = require('../../models/Employee');
const User = require('../../models/User');
const OnboardingApplication = require('../../models/hrms/OnboardingApplication');
const AuditLog = require('../../models/AuditLog');
const { getOrInitLeaveBalance } = require('../../services/hrms/leaveService');

/**
 * Helper to generate sequential next BJK Employee ID
 */
const generateNextEmployeeId = async () => {
  const latestEmp = await Employee.findOne({ employeeId: { $regex: /^BJK-EMP-/ } }).sort({ employeeId: -1 });
  let nextNum = 101;
  if (latestEmp && latestEmp.employeeId) {
    const match = latestEmp.employeeId.match(/\d+/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }
  return `BJK-EMP-${String(nextNum).padStart(6, '0')}`;
};

/**
 * Helper to compute completeness percentage
 */
const calculateCompletion = (data = {}) => {
  let score = 0;
  const total = 10;
  if (data.firstName && data.lastName) score += 1; // 1. Basic
  if (data.department && data.designation) score += 1; // 2. Job
  if (data.previousEmployment?.length > 0 || data.hasNoPreviousExperience) score += 1; // 3. Prev Exp
  if (data.personalEmail || data.fatherName) score += 1; // 4. Family
  if (data.currentAddress || data.city) score += 1; // 5. Address
  if (data.educationDetails?.length > 0 || data.highestDegree) score += 1; // 6. Education
  if (data.bankDetails?.accountNumber || data.accountNumber) score += 1; // 7. Bank
  if (data.identityDocuments?.length > 0 || data.panNumber || data.aadhaarNumber) score += 1; // 8. Identity
  if (data.complianceTraining?.length > 0 || data.gmpTrainingCompleted) score += 1; // 9. Compliance
  if (data.occupationalHealth?.medicalFitnessStatus || data.fitnessStatus) score += 1; // 10. Health
  return Math.min(100, Math.round((score / total) * 100));
};

// 1. POST /api/hr/onboarding - Save / Start New Onboarding Draft
const createOrSaveDraft = async (req, res) => {
  try {
    const { applicationId, currentStep = 1, formData = {} } = req.body;

    let appDoc = null;
    if (applicationId) {
      appDoc = await OnboardingApplication.findOne({ applicationId });
    }

    let employeeId = formData.employeeId;
    if (!employeeId) {
      employeeId = await generateNextEmployeeId();
      formData.employeeId = employeeId;
    }

    const completion = calculateCompletion(formData);

    if (appDoc) {
      appDoc.currentStep = currentStep;
      appDoc.formData = { ...appDoc.formData, ...formData };
      appDoc.completionPercentage = completion;
      appDoc.lastAutoSavedAt = new Date();
      await appDoc.save();
    } else {
      appDoc = await OnboardingApplication.create({
        employeeId,
        currentStep,
        completionPercentage: completion,
        status: 'DRAFT',
        formData,
        createdBy: req.user?.name || 'HR Administrator',
        assignedHR: req.user?._id || null,
        assignedHRName: req.user?.name || 'HR Master Admin',
        lastAutoSavedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Onboarding draft auto-saved successfully.',
      application: appDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/hr/onboarding - Get all onboarding pipeline applications
const getOnboardingList = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { 'formData.firstName': { $regex: search, $options: 'i' } },
        { 'formData.lastName': { $regex: search, $options: 'i' } },
        { 'formData.department': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await OnboardingApplication.countDocuments(query);
    const applications = await OnboardingApplication.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/hr/onboarding/:id - Get Onboarding Details
const getOnboardingById = async (req, res) => {
  try {
    const appDoc = await OnboardingApplication.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { applicationId: req.params.id },
        { employeeId: req.params.id }
      ]
    });

    if (!appDoc) {
      return res.status(404).json({ success: false, message: 'Onboarding application not found.' });
    }

    res.json({ success: true, application: appDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. PUT /api/hr/onboarding/:id - Auto-save / Update Onboarding Step
const updateOnboardingStep = async (req, res) => {
  try {
    const { currentStep, formData } = req.body;
    const appDoc = await OnboardingApplication.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { applicationId: req.params.id }
      ]
    });

    if (!appDoc) {
      return res.status(404).json({ success: false, message: 'Onboarding application not found.' });
    }

    if (currentStep) appDoc.currentStep = currentStep;
    if (formData) {
      appDoc.formData = { ...appDoc.formData, ...formData };
      appDoc.completionPercentage = calculateCompletion(appDoc.formData);
    }
    appDoc.lastAutoSavedAt = new Date();

    await appDoc.save();

    res.json({
      success: true,
      message: 'Step saved successfully.',
      application: appDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to validate statutory compliance & regex formats in candidate dossier
 */
const validateDossier = (data = {}) => {
  const errors = [];

  // 1. Aadhaar Validation (12 numeric digits)
  const rawAadhaar = data.aadhaarNumber || data.identityDocuments?.aadhaarNumber ||
    (Array.isArray(data.identityDocuments) ? data.identityDocuments.find(d => d.documentType === 'AADHAAR')?.documentNumber : null);
  if (rawAadhaar) {
    const cleanAadhaar = String(rawAadhaar).replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      errors.push('Aadhaar number must contain exactly 12 numeric digits.');
    }
  }

  // 2. PAN Validation (5 uppercase letters, 4 digits, 1 uppercase letter)
  const rawPan = data.panNumber || data.identityDocuments?.panNumber ||
    (Array.isArray(data.identityDocuments) ? data.identityDocuments.find(d => d.documentType === 'PAN')?.documentNumber : null);
  if (rawPan) {
    const cleanPan = String(rawPan).trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      errors.push('PAN number must follow standard format (5 uppercase letters, 4 digits, 1 uppercase letter, e.g. ABCDE1234F).');
    }
  }

  // 3. Bank IFSC Validation (4 letters, 0, 6 alphanumeric)
  const rawIfsc = data.bankDetails?.ifscCode || data.ifscCode;
  if (rawIfsc) {
    const cleanIfsc = String(rawIfsc).trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      errors.push('Bank IFSC code must follow statutory format: 4 uppercase letters, a zero, and 6 alphanumeric characters.');
    }
  }

  // 4. Age Check & Joining Date > DOB
  if (data.dateOfBirth && data.joiningDate) {
    const dob = new Date(data.dateOfBirth);
    const joining = new Date(data.joiningDate);
    if (!isNaN(dob.getTime()) && !isNaN(joining.getTime())) {
      if (joining <= dob) {
        errors.push('Joining date must be strictly after the date of birth.');
      }
      const ageYears = (joining.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (ageYears < 18) {
        errors.push('Statutory Labor Compliance: Candidate must be at least 18 years of age at the time of joining.');
      }
    }
  }

  // 5. Non-overlapping & valid previous employment dates
  if (Array.isArray(data.previousEmployment) && data.previousEmployment.length > 0) {
    for (let i = 0; i < data.previousEmployment.length; i++) {
      const exp = data.previousEmployment[i];
      if (exp.joiningDate && exp.leavingDate) {
        const jDate = new Date(exp.joiningDate).getTime();
        const lDate = new Date(exp.leavingDate).getTime();
        if (lDate < jDate) {
          errors.push(`Previous employer "${exp.companyName || i + 1}" leaving date cannot precede joining date.`);
        }
      }
    }
  }

  return errors;
};

// 5. POST /api/hr/onboarding/:id/submit - Submit for HR Verification
const submitOnboarding = async (req, res) => {
  try {
    const appDoc = await OnboardingApplication.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { applicationId: req.params.id }
      ]
    });

    if (!appDoc) {
      return res.status(404).json({ success: false, message: 'Onboarding application not found.' });
    }

    // Run dossier validations
    const validationErrors = validateDossier(appDoc.formData || {});
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Statutory onboarding dossier validation failed.',
        errors: validationErrors
      });
    }

    appDoc.status = 'HR_REVIEW';
    appDoc.submittedAt = new Date();
    await appDoc.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'ONBOARDING_SUBMITTED',
      module: 'HRMS_ONBOARDING',
      resource: 'OnboardingApplication',
      resourceId: appDoc.applicationId,
      newData: { status: 'HR_REVIEW', employeeId: appDoc.employeeId },
      details: `Onboarding application [${appDoc.applicationId}] submitted for HR verification (${appDoc.formData?.firstName} ${appDoc.formData?.lastName})`
    });

    res.json({
      success: true,
      message: 'Onboarding application submitted for HR Verification.',
      application: appDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. POST /api/hr/onboarding/:id/verify-step - Checkpoint verification
const verifyOnboardingStep = async (req, res) => {
  try {
    const { stepType, verified = true, remarks = '' } = req.body;
    const appDoc = await OnboardingApplication.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { applicationId: req.params.id }
      ]
    });

    if (!appDoc) {
      return res.status(404).json({ success: false, message: 'Onboarding application not found.' });
    }

    if (!appDoc.verifications) appDoc.verifications = {};

    const hrName = req.user?.name || 'HR Compliance Officer';
    const now = new Date();

    if (stepType === 'DOCUMENTS') {
      appDoc.verifications.documentsVerified = verified;
      appDoc.verifications.documentsVerifiedBy = hrName;
      appDoc.verifications.documentsVerifiedAt = now;
      appDoc.status = 'BANK_VERIFICATION';
    } else if (stepType === 'BANK') {
      appDoc.verifications.bankVerified = verified;
      appDoc.verifications.bankVerifiedBy = hrName;
      appDoc.verifications.bankVerifiedAt = now;
      appDoc.status = 'IDENTITY_VERIFICATION';
    } else if (stepType === 'IDENTITY') {
      appDoc.verifications.identityVerified = verified;
      appDoc.verifications.identityVerifiedBy = hrName;
      appDoc.verifications.identityVerifiedAt = now;
      appDoc.status = 'DEPARTMENT_APPROVAL';
    } else if (stepType === 'DEPARTMENT') {
      appDoc.verifications.departmentApproved = verified;
      appDoc.verifications.departmentApprovedBy = hrName;
      appDoc.verifications.departmentApprovedAt = now;
      appDoc.status = 'HR_APPROVAL';
    }

    if (remarks) appDoc.hrNotes = (appDoc.hrNotes ? appDoc.hrNotes + '\n' : '') + `[${stepType}] ${remarks}`;

    await appDoc.save();

    await AuditLog.logAction({
      user: req.user,
      action: `ONBOARDING_VERIFY_${stepType}`,
      module: 'HRMS_ONBOARDING',
      resource: 'OnboardingApplication',
      resourceId: appDoc.applicationId,
      newData: { stepType, verified, remarks },
      details: `HR Officer ${hrName} verified [${stepType}] for Onboarding [${appDoc.applicationId}]`
    });

    res.json({
      success: true,
      message: `${stepType} verification recorded successfully.`,
      application: appDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. POST /api/hr/onboarding/:id/approve - Final HR Approval & Employee Activation
const approveOnboarding = async (req, res) => {
  try {
    const { hrNotes = '' } = req.body;
    const appDoc = await OnboardingApplication.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { applicationId: req.params.id }
      ]
    });

    if (!appDoc) {
      return res.status(404).json({ success: false, message: 'Onboarding application not found.' });
    }

    const data = appDoc.formData || {};
    const empId = data.employeeId || appDoc.employeeId || (await generateNextEmployeeId());
    const workEmail = (data.workEmail || data.email || `${data.firstName?.toLowerCase()}.${data.lastName?.toLowerCase()}@bjkhealthcare.com`).toLowerCase().trim();

    // 1. Create or Update Employee Record
    let employee = await Employee.findOne({ $or: [{ employeeId: empId }, { email: workEmail }] });

    const employeePayload = {
      employeeId: empId,
      employeeCode: empId,
      firstName: data.firstName || 'Employee',
      middleName: data.middleName || '',
      lastName: data.lastName || 'Staff',
      gender: data.gender || 'Male',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      maritalStatus: data.maritalStatus || 'Single',
      bloodGroup: data.bloodGroup || 'O+',
      nationality: data.nationality || 'Indian',
      email: workEmail,
      workEmail: workEmail,
      personalEmail: data.personalEmail || '',
      phone: data.phone || data.personalPhone || '9876543210',
      personalPhone: data.personalPhone || '',
      currentAddress: data.currentAddress || data.addressDetails?.currentAddress?.line1 || 'Ahmedabad',
      permanentAddress: data.permanentAddress || data.addressDetails?.permanentAddress?.line1 || 'Ahmedabad',
      city: data.city || 'Ahmedabad',
      state: data.state || 'Gujarat',
      postalCode: data.postalCode || '382330',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactRelation: data.emergencyContactRelation || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      department: data.department || 'Quality Assurance',
      departmentName: data.department || 'Quality Assurance',
      subDepartment: data.subDepartment || '',
      designation: data.designation || 'Officer',
      designationTitle: data.designation || 'Officer',
      reportingManager: data.reportingManager || null,
      facility: data.facility || 'BJK Unit 1 - Formulations Facility',
      location: data.location || 'Ahmedabad Plant',
      employmentType: data.employmentType || 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      onboardingStatus: 'COMPLETED',
      onboardingStep: 12,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      basicSalary: Number(data.basicSalary) || 35000,
      previousEmployment: data.previousEmployment || [],
      familyDetails: data.familyDetails || {},
      addressDetails: data.addressDetails || {},
      educationDetails: data.educationDetails || [],
      bankDetails: {
        accountHolderName: data.bankDetails?.accountHolderName || `${data.firstName} ${data.lastName}`,
        bankName: data.bankDetails?.bankName || data.bankName || 'State Bank of India',
        branchName: data.bankDetails?.branchName || 'Ahmedabad Main Branch',
        accountNumber: data.bankDetails?.accountNumber || data.accountNumber || '123456789012',
        ifscCode: data.bankDetails?.ifscCode || data.ifscCode || 'SBIN0001234',
        accountType: data.bankDetails?.accountType || 'SALARY',
        verificationStatus: 'VERIFIED',
        verificationDate: new Date(),
        verifiedBy: req.user?.name || 'HR Master'
      },
      sensitiveData: {
        aadhaarNumber: data.aadhaarNumber || data.identityDocuments?.find(d => d.documentType === 'AADHAAR')?.documentNumber || '999988881234',
        panNumber: data.panNumber || data.identityDocuments?.find(d => d.documentType === 'PAN')?.documentNumber || 'ABCDE1234F',
        bankDetails: {
          bankName: data.bankDetails?.bankName || 'State Bank of India',
          accountNumber: data.bankDetails?.accountNumber || '123456789012',
          ifscCode: data.bankDetails?.ifscCode || 'SBIN0001234'
        },
        salaryDetails: {
          basicPay: Number(data.basicSalary) || 35000,
          grossSalary: (Number(data.basicSalary) || 35000) * 1.4 + 5000
        }
      },
      identityDocuments: data.identityDocuments || [],
      complianceTraining: data.complianceTraining || [
        {
          trainingType: 'GMP_TRAINING',
          title: 'Good Manufacturing Practices (GMP) Induction',
          trainingDate: new Date(),
          trainer: 'Quality Assurance Lead',
          validityMonths: 12,
          status: 'COMPLETED',
          isMandatory: true,
          complianceStatus: 'COMPLIANT'
        }
      ],
      occupationalHealth: data.occupationalHealth || {
        medicalFitnessStatus: 'FIT',
        fitForCleanroom: true
      },
      lifecycleEvents: [
        {
          event: 'ONBOARDING_SUBMITTED',
          effectiveDate: appDoc.submittedAt || new Date(),
          reason: 'Initial Onboarding Application',
          changedBy: appDoc.createdBy
        },
        {
          event: 'HR_VERIFIED',
          effectiveDate: new Date(),
          reason: hrNotes || 'HR Verification Approved',
          changedBy: req.user?.name || 'HR Master Admin'
        },
        {
          event: 'JOINED',
          effectiveDate: new Date(),
          reason: 'Active Employment Sanctioned',
          changedBy: req.user?.name || 'HR Master Admin'
        }
      ]
    };

    if (employee) {
      Object.assign(employee, employeePayload);
      await employee.save();
    } else {
      employee = await Employee.create(employeePayload);
    }

    // 2. Automatically Provision or Link User Account for Login
    let user = await User.findOne({ email: workEmail });
    const tempPassword = data.temporaryPassword || 'Bjk@2026';

    if (!user) {
      user = await User.create({
        name: employee.fullName,
        email: workEmail,
        password: tempPassword,
        role: data.role || 'EMPLOYEE',
        department: employee.departmentName,
        employeeId: employee.employeeId,
        facilityName: employee.facility,
        firstLogin: true,
        mustChangePassword: true,
        isActive: true,
        dataScope: data.role === 'QA_MANAGER' || data.role === 'DEPARTMENT_MANAGER' ? 'DEPARTMENT' : 'SELF'
      });
    }

    employee.user = user._id;
    await employee.save();

    // 3. Initialize Statutory Leave Quota Balance
    await getOrInitLeaveBalance(employee.employeeId, 2026);

    // 4. Update Application Status
    appDoc.status = 'ACTIVE';
    appDoc.approvedAt = new Date();
    appDoc.employee = employee._id;
    appDoc.verifications.hrApproved = true;
    appDoc.verifications.hrApprovedBy = req.user?.name || 'HR Admin';
    appDoc.verifications.hrApprovedAt = new Date();
    await appDoc.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'ONBOARDING_APPROVED_ACTIVATED',
      module: 'HRMS_ONBOARDING',
      resource: 'Employee',
      resourceId: employee.employeeId,
      newData: { employeeId: employee.employeeId, email: employee.email, role: user.role },
      details: `HR approved onboarding and activated employee account for ${employee.fullName} (${employee.employeeId}). Linked login user created.`
    });

    res.json({
      success: true,
      message: `Employee [${employee.employeeId}] onboarded and active in BJK Digital Brain!`,
      employee,
      credentials: {
        employeeId: employee.employeeId,
        workEmail: employee.email,
        temporaryPassword: tempPassword,
        role: user.role,
        department: employee.departmentName,
        firstLogin: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. POST /api/hr/onboarding/:id/reject - Reject Application
const rejectOnboarding = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    if (!reason.trim()) {
      return res.status(400).json({ success: false, message: 'Documented rejection reason is mandatory.' });
    }

    const appDoc = await OnboardingApplication.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { applicationId: req.params.id }
      ]
    });

    if (!appDoc) {
      return res.status(404).json({ success: false, message: 'Onboarding application not found.' });
    }

    appDoc.status = 'REJECTED';
    appDoc.rejectedAt = new Date();
    appDoc.rejectionReason = reason;
    await appDoc.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'ONBOARDING_REJECTED',
      module: 'HRMS_ONBOARDING',
      resource: 'OnboardingApplication',
      resourceId: appDoc.applicationId,
      newData: { reason },
      details: `HR rejected onboarding application [${appDoc.applicationId}]. Reason: ${reason}`
    });

    res.json({
      success: true,
      message: `Onboarding application [${appDoc.applicationId}] rejected.`,
      application: appDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrSaveDraft,
  getOnboardingList,
  getOnboardingById,
  updateOnboardingStep,
  submitOnboarding,
  verifyOnboardingStep,
  approveOnboarding,
  rejectOnboarding
};
