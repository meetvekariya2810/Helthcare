require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Department = require('../models/hrms/Department');
const Designation = require('../models/hrms/Designation');
const Employee = require('../models/hrms/Employee');
const Shift = require('../models/hrms/Shift');
const Attendance = require('../models/hrms/Attendance');
const Roster = require('../models/hrms/Roster');
const { LeaveType, LeaveBalance, LeaveRequest } = require('../models/hrms/Leave');
const { Payroll, PayrollRule } = require('../models/hrms/Payroll');
const { JobRequisition, Candidate } = require('../models/hrms/Recruitment');
const Onboarding = require('../models/hrms/Onboarding');
const { TrainingProgram, TrainingEnrollment } = require('../models/hrms/Training');
const Credential = require('../models/hrms/Credential');
const Document = require('../models/hrms/Document');
const Asset = require('../models/hrms/Asset');
const Expense = require('../models/hrms/Expense');
const HRAutomationRule = require('../models/hrms/HRAutomationRule');
const HRCompliance = require('../models/hrms/HRCompliance');
const HRNotification = require('../models/hrms/HRNotification');
const { seedAuthUsers } = require('./authSeed');
const { seedPoliciesAndRules } = require('./policySeed');
const { connectDB } = require('../config/db');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB via BJK db config...');
      await connectDB();
      console.log('MongoDB Connected successfully for Seeding.');
    }

    console.log('Clearing existing demo records (isDemo: true)...');
    await User.deleteMany({ isDemo: true });
    await Department.deleteMany({ isDemo: true });
    await Designation.deleteMany({ isDemo: true });
    await Employee.deleteMany({ isDemo: true });

    console.log('Seeding Development Authentication Users...');
    await seedAuthUsers();
    await Shift.deleteMany({ isDemo: true });
    await Attendance.deleteMany({ isDemo: true });
    await Roster.deleteMany({ isDemo: true });
    await LeaveType.deleteMany({ isDemo: true });
    await LeaveBalance.deleteMany({ isDemo: true });
    await LeaveRequest.deleteMany({ isDemo: true });
    await Payroll.deleteMany({ isDemo: true });
    await PayrollRule.deleteMany({ isDemo: true });
    await JobRequisition.deleteMany({ isDemo: true });
    await Candidate.deleteMany({ isDemo: true });
    await Onboarding.deleteMany({ isDemo: true });
    await TrainingProgram.deleteMany({ isDemo: true });
    await TrainingEnrollment.deleteMany({ isDemo: true });
    await Credential.deleteMany({ isDemo: true });
    await Document.deleteMany({ isDemo: true });
    await Asset.deleteMany({ isDemo: true });
    await Expense.deleteMany({ isDemo: true });
    await HRAutomationRule.deleteMany({ isDemo: true });
    await HRCompliance.deleteMany({ isDemo: true });
    await HRNotification.deleteMany({ isDemo: true });

    console.log('Seeding BJK Healthcare 11 Departments & Sub-departments (Ahmedabad Branch)...');
    const depts = await Department.create([
      {
        name: 'HR & Admin',
        code: 'HRA',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Corporate Administration',
        order: 0,
        description: 'Human resources, talent acquisition, payroll, and facility administration.',
        complianceRequirements: ['Labor Law', 'Statutory Compliance'],
        subDepartments: [
          { name: 'HR', code: 'HR', description: 'Talent & Operations' },
          { name: 'Admin', code: 'ADM', description: 'Office Administration & Facilities' }
        ],
        isDemo: true
      },
      {
        name: 'Engineering',
        code: 'ENG',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Engineering & Maintenance',
        order: 1,
        description: 'Facility engineering, HVAC calibration, electrical systems and equipment maintenance.',
        complianceRequirements: ['HVAC Validation', 'Electrical Safety'],
        subDepartments: [
          { name: 'Electrical', code: 'ELEC', description: 'Electrical installations & power backup' },
          { name: 'Mechanical Maintenance', code: 'MECH', description: 'Plant machines & utility maintenance' }
        ],
        isDemo: true
      },
      {
        name: 'Production',
        code: 'PROD',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Manufacturing Operations',
        order: 2,
        description: 'Solid oral dosage, tablet compression, liquid filling and primary packaging.',
        complianceRequirements: ['GMP', 'Cleanroom Protocols', 'Safety EHS'],
        subDepartments: [
          { name: 'Manufacturing', code: 'MFG', description: 'Active pharmaceutical granulation & compression' },
          { name: 'Manufacturing / Packing', code: 'MFG-PCK', description: 'Blister packaging & strip sealing lines' }
        ],
        isDemo: true
      },
      {
        name: 'Purchase & SCM',
        code: 'PSCM',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Supply Chain',
        order: 3,
        description: 'Procurement of APIs, excipients, packaging materials, and vendor management.',
        complianceRequirements: ['Vendor Audit', 'GDP'],
        subDepartments: [],
        isDemo: true
      },
      {
        name: 'QC Micro',
        code: 'QCM',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Quality & Regulatory',
        order: 4,
        description: 'Microbial bioburden testing, sterility assurance, environmental monitoring, water testing.',
        complianceRequirements: ['GLP', 'Cleanroom Microbiological Monitoring'],
        subDepartments: [
          { name: 'Microbiology', code: 'MICRO', description: 'Sterility & Bioburden Lab' }
        ],
        isDemo: true
      },
      {
        name: 'Quality Assurance',
        code: 'QA',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Quality & Regulatory',
        order: 5,
        description: 'Quality systems oversight, deviation management, CAPA, change controls and batch release.',
        complianceRequirements: ['GMP', 'Data Integrity', 'ISO 9001', '21 CFR Part 11'],
        subDepartments: [],
        isDemo: true
      },
      {
        name: 'Quality Control',
        code: 'QC',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Quality & Regulatory',
        order: 6,
        description: 'Analytical testing, HPLC/GC analysis, dissolution studies, raw material and finished goods release.',
        complianceRequirements: ['GLP', 'GMP', 'Data Integrity'],
        subDepartments: [],
        isDemo: true
      },
      {
        name: 'Warehouse',
        code: 'WHS',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Supply Chain',
        order: 7,
        description: 'Raw material inventory, temperature-controlled storage, cold-chain monitoring and dispatch.',
        complianceRequirements: ['GDP', 'Cold-Chain Storage'],
        subDepartments: [],
        isDemo: true
      },
      {
        name: 'Finance & Accounts',
        code: 'FNA',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Finance',
        order: 8,
        description: 'Corporate accounting, cost management, payroll disbursements, GST and statutory filings.',
        complianceRequirements: ['Statutory Tax Laws', 'Audit Compliance'],
        subDepartments: [
          { name: 'Accounts', code: 'ACC', description: 'Ledgers, Payables & Receivables' }
        ],
        isDemo: true
      },
      {
        name: 'Management',
        code: 'MGMT',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Executive',
        order: 9,
        description: 'Executive leadership, corporate strategy, board governance and operational compliance.',
        complianceRequirements: ['Corporate Governance'],
        subDepartments: [],
        isDemo: true
      },
      {
        name: 'Business Development',
        code: 'BD',
        branch: 'Ahmedabad Branch',
        facility: 'Ahmedabad Branch',
        division: 'Commercial Operations',
        order: 10,
        description: 'Institutional tenders, domestic distribution, pharmaceutical exports and client contracts.',
        complianceRequirements: ['Commercial Compliance'],
        subDepartments: [],
        isDemo: true
      }
    ]);

    console.log('Seeding Designations...');
    const desigs = await Designation.create([
      {
        title: 'Lead QA Manager',
        code: 'QA-MGR',
        department: depts[0]._id,
        departmentName: depts[0].name,
        level: 'Manager',
        requiredQualifications: ['M.Pharm', 'M.Sc Chemistry'],
        requiredCertifications: ['GMP Level 3', 'Data Integrity Auditor'],
        isDemo: true
      },
      {
        title: 'Senior QC Analyst',
        code: 'QC-SR-ANL',
        department: depts[1]._id,
        departmentName: depts[1].name,
        level: 'Senior Executive',
        requiredQualifications: ['B.Pharm', 'M.Sc Analytical Chemistry'],
        requiredCertifications: ['GLP Certified', 'HPLC/GC Instrument Sign-off'],
        isDemo: true
      },
      {
        title: 'Production Line Operator',
        code: 'PROD-OPR',
        department: depts[2]._id,
        departmentName: depts[2].name,
        level: 'Associate',
        requiredQualifications: ['Diploma in Pharmacy', 'B.Sc'],
        requiredCertifications: ['GMP Basic', 'Cleanroom Area B Certification'],
        isDemo: true
      },
      {
        title: 'Regulatory Affairs Associate',
        code: 'RA-ASC',
        department: depts[3]._id,
        departmentName: depts[3].name,
        level: 'Executive',
        requiredQualifications: ['B.Pharm', 'M.Pharm Regulatory'],
        requiredCertifications: ['eCTD Dossier Filing'],
        isDemo: true
      },
      {
        title: 'HR Generalist',
        code: 'HR-GEN',
        department: depts[5]._id,
        departmentName: depts[5].name,
        level: 'Executive',
        requiredQualifications: ['MBA HR', 'Any Graduate'],
        requiredCertifications: ['Indian Payroll & Statutory Compliance'],
        isDemo: true
      }
    ]);

    console.log('Seeding Shifts & Overtime Rules...');
    const shifts = await Shift.create([
      {
        name: 'General Shift (09:00 - 18:00)',
        code: 'SHIFT-GEN',
        type: 'General',
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMinutes: 15,
        breakDurationMinutes: 60,
        overtimeRule: { eligible: true, minimumExtraMinutes: 30, multiplier: 1.5, requiresApproval: true },
        nightRule: { isNightShift: false },
        isDemo: true
      },
      {
        name: 'Morning Production Shift (06:00 - 14:30)',
        code: 'SHIFT-MORN',
        type: 'Morning',
        startTime: '06:00',
        endTime: '14:30',
        gracePeriodMinutes: 10,
        breakDurationMinutes: 30,
        overtimeRule: { eligible: true, minimumExtraMinutes: 30, multiplier: 1.5, requiresApproval: true },
        nightRule: { isNightShift: false },
        isDemo: true
      },
      {
        name: 'Evening Production Shift (14:00 - 22:30)',
        code: 'SHIFT-EVE',
        type: 'Evening',
        startTime: '14:00',
        endTime: '22:30',
        gracePeriodMinutes: 10,
        breakDurationMinutes: 30,
        overtimeRule: { eligible: true, minimumExtraMinutes: 30, multiplier: 1.5, requiresApproval: true },
        nightRule: { isNightShift: false },
        isDemo: true
      },
      {
        name: 'Pharma Night Shift (22:00 - 06:30)',
        code: 'SHIFT-NIGHT',
        type: 'Night',
        startTime: '22:00',
        endTime: '06:30',
        gracePeriodMinutes: 10,
        breakDurationMinutes: 30,
        overtimeRule: { eligible: true, minimumExtraMinutes: 30, multiplier: 2.0, requiresApproval: true },
        nightRule: { isNightShift: true, nightHoursStart: '22:00', nightHoursEnd: '06:00', differentialAllowanceRate: 350 },
        isDemo: true
      }
    ]);

    console.log('Seeding Employees & User Accounts...');
    const employees = await Employee.create([
      {
        employeeId: 'BJK-00101',
        firstName: 'Dr. Vikram',
        lastName: 'Mehta',
        email: 'vikram.mehta@bjkhealthcare.com',
        phone: '+91 98250 11223',
        department: depts[0]._id,
        departmentName: depts[0].name,
        designation: desigs[0]._id,
        designationTitle: desigs[0].title,
        facility: 'BJK Unit 1 - Formulations Facility',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        assignedShift: shifts[0]._id,
        shiftName: shifts[0].name,
        joiningDate: new Date('2021-03-15'),
        dateOfBirth: new Date('1984-06-20'),
        gender: 'Male',
        bloodGroup: 'B+',
        currentAddress: '402, Shivalik Heights, Bodakdev, Ahmedabad, Gujarat',
        emergencyContact: { name: 'Sunita Mehta', relation: 'Spouse', phone: '+91 98250 99887' },
        sensitiveData: {
          aadhaarNumber: '7894 1234 5678',
          panNumber: 'ABCDE1234F',
          bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100234567890', ifscCode: 'HDFC0000006', branch: 'Vastrapur' },
          salaryDetails: { basicPay: 65000, hra: 26000, specialAllowance: 15000, transportAllowance: 5000, medicalAllowance: 2500, grossSalary: 114500, ctc: 1450000 },
          medicalFitness: { fitnessCertificateStatus: 'FIT', fitForCleanroom: true }
        },
        skills: ['GMP', 'Quality Systems', 'USFDA Inspection Prep', 'Data Integrity'],
        isDemo: true
      },
      {
        employeeId: 'BJK-00102',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@bjkhealthcare.com',
        phone: '+91 98790 33445',
        department: depts[1]._id,
        departmentName: depts[1].name,
        designation: desigs[1]._id,
        designationTitle: desigs[1].title,
        facility: 'BJK Unit 1 - Formulations Facility',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        assignedShift: shifts[1]._id,
        shiftName: shifts[1].name,
        joiningDate: new Date('2022-07-01'),
        dateOfBirth: new Date('1992-09-14'),
        gender: 'Female',
        bloodGroup: 'O+',
        currentAddress: 'B-14, Swagat Residency, Prahlad Nagar, Ahmedabad, Gujarat',
        emergencyContact: { name: 'Ramesh Sharma', relation: 'Father', phone: '+91 98790 11111' },
        sensitiveData: {
          aadhaarNumber: '6543 9876 1234',
          panNumber: 'FGHIJ5678K',
          bankDetails: { bankName: 'ICICI Bank', accountNumber: '002401567890', ifscCode: 'ICIC0000024', branch: 'Prahlad Nagar' },
          salaryDetails: { basicPay: 35000, hra: 14000, specialAllowance: 8000, transportAllowance: 3000, medicalAllowance: 1500, grossSalary: 61500, ctc: 780000 },
          medicalFitness: { fitnessCertificateStatus: 'FIT', fitForCleanroom: true }
        },
        skills: ['GLP', 'HPLC', 'GC', 'Method Validation', 'Dissolution Testing'],
        isDemo: true
      },
      {
        employeeId: 'BJK-00103',
        firstName: 'Rajesh',
        lastName: 'Patel',
        email: 'rajesh.patel@bjkhealthcare.com',
        phone: '+91 97230 55667',
        department: depts[2]._id,
        departmentName: depts[2].name,
        designation: desigs[2]._id,
        designationTitle: desigs[2].title,
        facility: 'BJK Unit 1 - Formulations Facility',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        assignedShift: shifts[3]._id, // Night shift
        shiftName: shifts[3].name,
        joiningDate: new Date('2023-01-10'),
        dateOfBirth: new Date('1995-11-28'),
        gender: 'Male',
        bloodGroup: 'A+',
        currentAddress: 'Plot 45, GIDC Colony, Sanand, Gujarat',
        emergencyContact: { name: 'Kavita Patel', relation: 'Spouse', phone: '+91 97230 44332' },
        sensitiveData: {
          aadhaarNumber: '3210 4567 8901',
          panNumber: 'KLMNO9012P',
          bankDetails: { bankName: 'State Bank of India', accountNumber: '20345678901', ifscCode: 'SBIN0001234', branch: 'Sanand' },
          salaryDetails: { basicPay: 22000, hra: 8800, specialAllowance: 4000, transportAllowance: 2000, medicalAllowance: 1200, grossSalary: 38000, ctc: 480000 },
          medicalFitness: { fitnessCertificateStatus: 'FIT', fitForCleanroom: true }
        },
        skills: ['GMP', 'Cleanroom Operation', 'Tablet Compression Fette', 'Safety SOP'],
        isDemo: true
      },
      {
        employeeId: 'BJK-00104',
        firstName: 'Sneha',
        lastName: 'Desai',
        email: 'sneha.desai@bjkhealthcare.com',
        phone: '+91 98980 77889',
        department: depts[5]._id,
        departmentName: depts[5].name,
        designation: desigs[4]._id,
        designationTitle: desigs[4].title,
        facility: 'BJK Corporate Headquarters',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        assignedShift: shifts[0]._id,
        shiftName: shifts[0].name,
        joiningDate: new Date('2023-05-15'),
        dateOfBirth: new Date('1994-04-12'),
        gender: 'Female',
        bloodGroup: 'AB+',
        currentAddress: 'C-702, Iscon Elegance, SG Highway, Ahmedabad',
        emergencyContact: { name: 'Anand Desai', relation: 'Brother', phone: '+91 98980 22334' },
        sensitiveData: {
          aadhaarNumber: '4567 8901 2345',
          panNumber: 'QRSTU3456V',
          bankDetails: { bankName: 'Axis Bank', accountNumber: '915010023456789', ifscCode: 'UTIB0000015', branch: 'SG Highway' },
          salaryDetails: { basicPay: 30000, hra: 12000, specialAllowance: 6000, transportAllowance: 2500, medicalAllowance: 1500, grossSalary: 52000, ctc: 650000 },
          medicalFitness: { fitnessCertificateStatus: 'FIT', fitForCleanroom: false }
        },
        skills: ['Workforce Management', 'Talent Acquisition', 'Statutory Payroll', 'Employee Relations'],
        isDemo: true
      }
    ]);


    console.log('Seeding Credentials & Regulatory Authorizations...');
    const today = new Date();
    const credExpiryFuture = new Date(today);
    credExpiryFuture.setMonth(credExpiryFuture.getMonth() + 8);

    const credExpiringSoon = new Date(today);
    credExpiringSoon.setDate(credExpiringSoon.getDate() + 14); // 14 days left!

    const credExpired = new Date(today);
    credExpired.setDate(credExpired.getDate() - 10); // 10 days expired!

    await Credential.create([
      {
        employee: employees[0]._id,
        employeeId: employees[0].employeeId,
        employeeName: employees[0].fullName,
        departmentName: employees[0].departmentName,
        credentialName: 'USFDA Lead Quality Auditor Certification',
        credentialCode: 'CRED-USFDA-AUD',
        category: 'GMP_CERTIFICATION',
        issuingAuthority: 'American Society for Quality (ASQ)',
        certificateNumber: 'ASQ-QA-99482',
        issueDate: new Date('2023-01-15'),
        expiryDate: credExpiryFuture,
        isMandatoryForRole: true,
        blocksRosterAssignmentOnExpiry: true,
        status: 'VALID',
        isDemo: true
      },
      {
        employee: employees[1]._id,
        employeeId: employees[1].employeeId,
        employeeName: employees[1].fullName,
        departmentName: employees[1].departmentName,
        credentialName: 'HPLC Analytical Method Sign-Off & GLP Authorization',
        credentialCode: 'CRED-HPLC-GLP',
        category: 'GLP_CERTIFICATION',
        issuingAuthority: 'BJK Quality Council',
        certificateNumber: 'BJK-GLP-2024-08',
        issueDate: new Date('2024-02-10'),
        expiryDate: credExpiringSoon, // Expiring in 14 days
        isMandatoryForRole: true,
        blocksRosterAssignmentOnExpiry: true,
        status: 'EXPIRING',
        notes: 'Annual recalibration retraining due.',
        isDemo: true
      },
      {
        employee: employees[2]._id,
        employeeId: employees[2].employeeId,
        employeeName: employees[2].fullName,
        departmentName: employees[2].departmentName,
        credentialName: 'Cleanroom Grade B Operator Authorization',
        credentialCode: 'CRED-CLEANROOM-B',
        category: 'CLEANROOM_AUTHORIZATION',
        issuingAuthority: 'BJK EHS & Cleanroom Oversight Board',
        certificateNumber: 'CR-OPR-4421',
        issueDate: new Date('2023-08-01'),
        expiryDate: credExpired, // Expired 10 days ago!
        isMandatoryForRole: true,
        blocksRosterAssignmentOnExpiry: true,
        status: 'EXPIRED',
        notes: 'MANDATORY RETRAINING REQUIRED: Operator cannot enter sterile zone.',
        isDemo: true
      }
    ]);

    console.log('Seeding Training Programs & LMS Enrollments...');
    const trainings = await TrainingProgram.create([
      {
        title: 'Current Good Manufacturing Practice (cGMP) Annual Recertification',
        code: 'TRN-GMP-2026',
        category: 'GMP',
        description: 'Mandatory annual cGMP compliance refresher covering cross-contamination controls and cleanroom gowning.',
        isMandatory: true,
        mandatoryForDepartments: ['Production Operations', 'Quality Control', 'Quality Assurance'],
        validityPeriodMonths: 12,
        passingScorePercentage: 85,
        durationHours: 6,
        isDemo: true
      },
      {
        title: 'Data Integrity & 21 CFR Part 11 Electronic Records Compliance',
        code: 'TRN-DI-21CFR',
        category: 'DATA_INTEGRITY',
        description: 'Audit trail review, ALCOA+ principles, and electronic batch manufacturing record compliance.',
        isMandatory: true,
        validityPeriodMonths: 12,
        passingScorePercentage: 90,
        durationHours: 4,
        isDemo: true
      }
    ]);

    await TrainingEnrollment.create([
      {
        program: trainings[0]._id,
        programCode: trainings[0].code,
        programTitle: trainings[0].title,
        category: trainings[0].category,
        employee: employees[0]._id,
        employeeId: employees[0].employeeId,
        employeeName: employees[0].fullName,
        departmentName: employees[0].departmentName,
        status: 'COMPLETED',
        scorePercentage: 96,
        completionDate: new Date(),
        certificateNumber: 'CERT-GMP-9901',
        isDemo: true
      },
      {
        program: trainings[1]._id,
        programCode: trainings[1].code,
        programTitle: trainings[1].title,
        category: trainings[1].category,
        employee: employees[1]._id,
        employeeId: employees[1].employeeId,
        employeeName: employees[1].fullName,
        departmentName: employees[1].departmentName,
        status: 'IN_PROGRESS',
        isDemo: true
      },
      {
        program: trainings[0]._id,
        programCode: trainings[0].code,
        programTitle: trainings[0].title,
        category: trainings[0].category,
        employee: employees[2]._id,
        employeeId: employees[2].employeeId,
        employeeName: employees[2].fullName,
        departmentName: employees[2].departmentName,
        status: 'OVERDUE',
        isDemo: true
      }
    ]);

    console.log('Seeding Leave Types & Quotas...');
    await LeaveType.create([
      { name: 'Casual Leave', code: 'CL', annualQuotaDays: 12, isPaid: true, isDemo: true },
      { name: 'Sick Leave', code: 'SL', annualQuotaDays: 10, isPaid: true, isDemo: true },
      { name: 'Earned Leave (Privileged)', code: 'EL', annualQuotaDays: 18, isPaid: true, carryForwardAllowed: true, isDemo: true },
      { name: 'Compensatory Off', code: 'CO', annualQuotaDays: 6, isPaid: true, isDemo: true }
    ]);

    console.log('Seeding Sample Attendance Records...');
    const todayStr = today.toISOString().split('T')[0];
    await Attendance.create([
      {
        employee: employees[0]._id,
        employeeId: employees[0].employeeId,
        employeeName: employees[0].fullName,
        departmentName: employees[0].departmentName,
        date: today,
        dateString: todayStr,
        shift: shifts[0]._id,
        shiftName: shifts[0].name,
        checkIn: new Date(today.setHours(8, 55, 0, 0)),
        checkOut: null,
        status: 'PRESENT',
        source: 'WEB',
        isDemo: true
      },
      {
        employee: employees[1]._id,
        employeeId: employees[1].employeeId,
        employeeName: employees[1].fullName,
        departmentName: employees[1].departmentName,
        date: today,
        dateString: todayStr,
        shift: shifts[1]._id,
        shiftName: shifts[1].name,
        checkIn: new Date(today.setHours(6, 18, 0, 0)),
        checkOut: new Date(today.setHours(14, 45, 0, 0)),
        status: 'LATE',
        lateMinutes: 18,
        workingHours: 8.0,
        regularHours: 8.0,
        overtimeHours: 0.25,
        source: 'BIOMETRIC',
        isDemo: true
      },
      {
        employee: employees[2]._id,
        employeeId: employees[2].employeeId,
        employeeName: employees[2].fullName,
        departmentName: employees[2].departmentName,
        date: today,
        dateString: todayStr,
        shift: shifts[3]._id, // Night shift
        shiftName: shifts[3].name,
        checkIn: new Date(today.setHours(21, 50, 0, 0)),
        checkOut: null,
        status: 'PRESENT',
        nightHours: 6.0,
        source: 'BIOMETRIC',
        isDemo: true
      }
    ]);

    console.log('Seeding Intelligent Rosters...');
    await Roster.create([
      {
        dateString: todayStr,
        date: today,
        employee: employees[0]._id,
        employeeId: employees[0].employeeId,
        employeeName: employees[0].fullName,
        departmentName: employees[0].departmentName,
        facility: employees[0].facility,
        shift: shifts[0]._id,
        shiftName: shifts[0].name,
        startTime: shifts[0].startTime,
        endTime: shifts[0].endTime,
        productionLine: 'Quality Assurance Office',
        validationStatus: 'VALID',
        isDemo: true
      },
      {
        dateString: todayStr,
        date: today,
        employee: employees[1]._id,
        employeeId: employees[1].employeeId,
        employeeName: employees[1].fullName,
        departmentName: employees[1].departmentName,
        facility: employees[1].facility,
        shift: shifts[1]._id,
        shiftName: shifts[1].name,
        startTime: shifts[1].startTime,
        endTime: shifts[1].endTime,
        productionLine: 'Analytical Testing Lab 2',
        validationStatus: 'WARNING',
        warnings: ['HPLC GLP certification expiring in 14 days'],
        isDemo: true
      },
      {
        dateString: todayStr,
        date: today,
        employee: employees[2]._id,
        employeeId: employees[2].employeeId,
        employeeName: employees[2].fullName,
        departmentName: employees[2].departmentName,
        facility: employees[2].facility,
        shift: shifts[3]._id, // Night shift
        shiftName: shifts[3].name,
        startTime: shifts[3].startTime,
        endTime: shifts[3].endTime,
        productionLine: 'Solid Oral Compression Line A',
        validationStatus: 'BLOCKED',
        blockingIssues: ['BLOCKING ISSUE: Cleanroom Grade B Operator Authorization expired on ' + credExpired.toLocaleDateString()],
        isDemo: true
      }
    ]);

    console.log('Seeding HR Automation Rules...');
    await HRAutomationRule.create([
      {
        name: 'Auto-Alert on Expiring Mandatory Credentials (30 Days)',
        code: 'AUTO-CRED-EXP-30',
        category: 'CREDENTIAL_EXPIRY',
        triggerCondition: { event: 'CREDENTIAL_DAYS_LEFT_LEQ', thresholdValue: 30, unit: 'DAYS' },
        actions: [{ actionType: 'SEND_NOTIFICATION', targetRoles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'], messageTemplate: 'Mandatory credential expiring in 30 days.' }],
        severity: 'WARNING',
        isEnabled: true,
        executionCount: 12,
        isDemo: true
      },
      {
        name: 'Automatic Roster Block on Expired Pharma Certifications',
        code: 'AUTO-BLOCK-EXPIRED-CERT',
        category: 'CREDENTIAL_EXPIRY',
        triggerCondition: { event: 'CREDENTIAL_STATUS_EQUALS_EXPIRED', thresholdValue: 0, unit: 'DAYS' },
        actions: [{ actionType: 'BLOCK_ROSTER', targetRoles: ['HR_ADMIN', 'PRODUCTION_MANAGER'], messageTemplate: 'Cleanroom access and shift assignment blocked.' }],
        severity: 'BLOCKING',
        isEnabled: true,
        executionCount: 4,
        isDemo: true
      },
      {
        name: 'Flag Overtime Exceeding 10 Hours Weekly',
        code: 'AUTO-OT-THRESHOLD-10H',
        category: 'OVERTIME_THRESHOLD',
        triggerCondition: { event: 'OVERTIME_HOURS_GEQ', thresholdValue: 10, unit: 'HOURS' },
        actions: [{ actionType: 'CREATE_WORKFORCE_ALERT', targetRoles: ['DEPARTMENT_MANAGER', 'HR_ADMIN'] }],
        severity: 'WARNING',
        isEnabled: true,
        executionCount: 7,
        isDemo: true
      }
    ]);

    console.log('Seeding Compliance Standards...');
    await HRCompliance.create([
      {
        ruleTitle: 'WHO-GMP Schedule M Workforce Training Mandate',
        code: 'COMPL-WHO-GMP',
        standard: 'SCHEDULE_M',
        departmentApplicability: ['Production Operations', 'Quality Control', 'Quality Assurance'],
        description: 'Mandates 100% completion of annual cGMP retraining and cleanroom gowning qualification for all operators.',
        complianceAuditStatus: 'COMPLIANT',
        isDemo: true
      },
      {
        ruleTitle: 'USFDA 21 CFR Part 211 Credential & Training Verification',
        code: 'COMPL-USFDA-211',
        standard: 'USFDA_21CFR',
        departmentApplicability: ['Quality Assurance', 'Regulatory Affairs'],
        description: 'Requires qualified supervisory personnel with verified educational degrees and continuous retraining files.',
        complianceAuditStatus: 'COMPLIANT',
        isDemo: true
      }
    ]);

    console.log('Seeding 13 BJK HR Policies and Policy Rules Engine...');
    await seedPoliciesAndRules();

    console.log('====================================================');
    console.log('BJK Healthcare HRMS Seed Completed Successfully!');
    console.log('Realistic test accounts created:');
    console.log('1. Super Admin: admin@bjkhealthcare.com / Password123!');
    console.log('2. HR Manager:  hr.manager@bjkhealthcare.com / Password123!');
    console.log('3. QA Manager:  vikram.mehta@bjkhealthcare.com / Password123!');
    console.log('4. Employee:    rajesh.patel@bjkhealthcare.com / Password123!');
    console.log('All records marked with isDemo: true (Data Truth Principle)');
    console.log('====================================================');
    return true;
  } catch (error) {
    console.error('Seeding Error:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('[BJK Seed CLI] Seed complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[BJK Seed CLI] Error:', err);
      process.exit(1);
    });
}

module.exports = { seedData };
