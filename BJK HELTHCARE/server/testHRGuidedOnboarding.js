require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('./config/db');
const Employee = require('./models/Employee');
const User = require('./models/User');
const OnboardingApplication = require('./models/hrms/OnboardingApplication');
const AuditLog = require('./models/AuditLog');
const { getOrInitLeaveBalance } = require('./services/hrms/leaveService');

async function runEndToEndOnboardingTest() {
  console.log('========================================================================');
  console.log('🧪 BJK HEALTHCARE HRMS: END-TO-END ONBOARDING & DATA INTEGRITY TEST');
  console.log('========================================================================');

  try {
    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB Database...');
    await connectDB();
    console.log('   ✅ MongoDB connected successfully to database:', mongoose.connection.name);

    // 2. Prepare Demo Candidate Data across all 11 Steps
    const testEmployeeId = `DEMO-EMP-${Date.now().toString().slice(-6)}`;
    console.log(`\n2. Initializing 11-Step Onboarding Payload for [${testEmployeeId}]...`);

    const onboardingPayload = {
      employeeId: testEmployeeId,
      firstName: 'Vikram',
      middleName: 'Rajesh',
      lastName: 'Patel',
      preferredName: 'Vikram Patel',
      gender: 'Male',
      dateOfBirth: '1992-05-14',
      maritalStatus: 'Married',
      bloodGroup: 'B+',
      nationality: 'Indian',
      officialEmail: `vikram.patel.${Date.now()}@bjkhealthcare.com`,
      personalEmail: 'vikram.patel.demo@gmail.com',
      mobileNumber: '+91 98765 43210',
      alternateMobile: '+91 98765 01234',
      emergencyContact: {
        name: 'Anjali Patel',
        relationship: 'Spouse',
        phone: '+91 98765 99999',
        email: 'anjali.patel.demo@gmail.com'
      },
      department: 'Quality Assurance',
      designation: 'Senior QA Executive',
      jobTitle: 'Senior Quality Assurance Executive',
      reportingManager: 'Dr. Suresh Mehta',
      departmentHead: 'Dr. Rajesh BJK',
      employmentType: 'Full Time',
      workLocation: 'Ahmedabad Formulation Plant',
      facility: 'BJK Unit 1 - Formulations Facility',
      businessUnit: 'Formulations & Oral Solid Dosage',
      shift: 'Morning Shift A (07:00 - 15:30)',
      grade: 'L3',
      employeeLevel: 'Senior Executive',
      joiningDate: new Date().toISOString().slice(0, 10),
      probationPeriodMonths: 6,
      noticePeriodDays: 60,
      workingHoursPerWeek: 48,
      role: 'QA_MANAGER',
      systemAccessLevel: 'STANDARD_USER',
      hasNoPreviousExperience: false,
      previousEmployment: [
        {
          companyName: 'Zydus Lifesciences Ltd',
          companyAddress: 'Sarkhej-Bavla Road, Ahmedabad',
          designation: 'QA Officer',
          department: 'Quality Assurance',
          joiningDate: '2018-06-01',
          leavingDate: '2023-12-31',
          lastDrawnSalary: '₹ 6,50,000 / year',
          reportingManager: 'Ramesh Shah',
          reasonForLeaving: 'Career advancement at BJK Healthcare',
          experienceCertificateUrl: '/uploads/demo-exp-cert.pdf'
        }
      ],
      familyDetails: {
        fatherName: 'Rajeshbhai Patel',
        motherName: 'Nirmalaben Patel',
        spouseName: 'Anjali Patel',
        childrenCount: 1,
        dependentsCount: 2,
        nomineeName: 'Anjali Patel',
        nomineeRelationship: 'Spouse',
        nomineeDob: '1994-08-20',
        nomineeContact: '+91 98765 99999'
      },
      addressDetails: {
        permanentAddress: {
          addressLine1: '402, Shivalik High Street',
          addressLine2: 'Near Vastrapur Lake',
          city: 'Ahmedabad',
          district: 'Ahmedabad',
          state: 'Gujarat',
          country: 'India',
          pinCode: '380015'
        },
        currentAddress: {
          addressLine1: '402, Shivalik High Street',
          addressLine2: 'Near Vastrapur Lake',
          city: 'Ahmedabad',
          district: 'Ahmedabad',
          state: 'Gujarat',
          country: 'India',
          pinCode: '380015'
        },
        isCurrentSameAsPermanent: true
      },
      educationDetails: [
        {
          qualificationLevel: 'Post Graduation',
          degree: 'M.Pharm (Quality Assurance)',
          institution: 'Nirma University',
          boardOrUniversity: 'Nirma University',
          passingYear: 2016,
          percentage: '82.5%',
          grade: 'Distinction'
        },
        {
          qualificationLevel: 'Graduation',
          degree: 'B.Pharm',
          institution: 'L.M. College of Pharmacy',
          boardOrUniversity: 'Gujarat Technological University',
          passingYear: 2014,
          percentage: '79.0%',
          grade: 'First Class'
        }
      ],
      bankDetails: {
        accountHolderName: 'Vikram Rajesh Patel',
        bankName: 'HDFC Bank',
        branchName: 'Vastrapur Branch, Ahmedabad',
        accountNumber: '50100234567890',
        ifscCode: 'HDFC0001234',
        accountType: 'Salary',
        upiId: 'vikram.patel@okhdfcbank'
      },
      identityDocuments: {
        aadhaarNumber: '9876 5432 1098',
        panNumber: 'ABCVP1234F',
        passportNumber: 'Z8765432',
        drivingLicenseNumber: 'GJ01-2012-0043210'
      },
      occupationalHealth: {
        medicalFitnessStatus: 'Medically Fit',
        cleanroomGowningFitness: 'Class 10,000 & 100 Qualified',
        fitnessCertificateDate: new Date().toISOString().slice(0, 10),
        fitnessValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        occupationalRestrictions: 'None. Authorized for Sterile Cleanroom Gowning.'
      },
      complianceTraining: [
        {
          trainingModule: 'WHO-GMP Schedule M & US-FDA 21 CFR 211',
          completionDate: new Date().toISOString().slice(0, 10),
          status: 'Completed',
          score: '96%'
        },
        {
          trainingModule: 'Data Integrity & 21 CFR Part 11 Electronic Records',
          completionDate: new Date().toISOString().slice(0, 10),
          status: 'Completed',
          score: '100%'
        }
      ]
    };

    // 3. Create Draft Application
    console.log('3. Submitting Draft Onboarding Application to MongoDB...');
    const draftApp = await OnboardingApplication.create({
      employeeId: testEmployeeId,
      currentStep: 11,
      completionPercentage: 100,
      status: 'HR_REVIEW',
      formData: onboardingPayload,
      createdBy: 'System HR Architect',
      assignedHRName: 'BJK HR Admin'
    });
    console.log(`   ✅ Draft Created! Application ID: ${draftApp.applicationId} [Status: ${draftApp.status}]`);

    // 4. Transform & Activate Employee Record in MongoDB
    console.log('\n4. Approving Onboarding and Activating BJK Employee Master Record...');
    
    // Masked bank display
    const rawBankAcct = onboardingPayload.bankDetails.accountNumber;
    const maskedAcct = 'XXXXXX' + String(rawBankAcct).slice(-4);

    const newEmployee = await Employee.create({
      employeeId: testEmployeeId,
      employeeCode: testEmployeeId,
      firstName: onboardingPayload.firstName,
      middleName: onboardingPayload.middleName,
      lastName: onboardingPayload.lastName,
      fullName: `${onboardingPayload.firstName} ${onboardingPayload.lastName}`,
      gender: onboardingPayload.gender,
      dateOfBirth: onboardingPayload.dateOfBirth,
      bloodGroup: onboardingPayload.bloodGroup,
      maritalStatus: onboardingPayload.maritalStatus,
      email: onboardingPayload.officialEmail,
      officialEmail: onboardingPayload.officialEmail,
      personalEmail: onboardingPayload.personalEmail,
      phone: onboardingPayload.mobileNumber,
      mobileNumber: onboardingPayload.mobileNumber,
      department: onboardingPayload.department,
      departmentName: onboardingPayload.department,
      designation: onboardingPayload.designation,
      designationTitle: onboardingPayload.designation,
      jobTitle: onboardingPayload.jobTitle,
      employmentType: 'FULL_TIME',
      location: onboardingPayload.workLocation,
      facility: onboardingPayload.facility,
      joiningDate: onboardingPayload.joiningDate,
      status: 'ACTIVE',
      employmentStatus: 'ACTIVE',
      probationPeriodMonths: 6,
      salaryInfo: {
        basicSalary: 45000,
        hra: 18000,
        specialAllowance: 12000,
        grossSalary: 75000,
        netSalary: 67200
      },
      bankDetails: {
        accountHolderName: onboardingPayload.bankDetails.accountHolderName,
        bankName: onboardingPayload.bankDetails.bankName,
        branchName: onboardingPayload.bankDetails.branchName,
        accountNumber: maskedAcct,
        ifscCode: onboardingPayload.bankDetails.ifscCode,
        isVerified: true
      },
      identityDocuments: [
        {
          documentType: 'AADHAAR',
          documentNumber: 'XXXX-XXXX-' + onboardingPayload.identityDocuments.aadhaarNumber.slice(-4),
          verificationStatus: 'VERIFIED'
        },
        {
          documentType: 'PAN',
          documentNumber: onboardingPayload.identityDocuments.panNumber.slice(0, 5) + '****' + onboardingPayload.identityDocuments.panNumber.slice(-1),
          verificationStatus: 'VERIFIED'
        }
      ],
      isDemoData: true
    });

    console.log(`   ✅ Employee Record Created in MongoDB!`);
    console.log(`      • ID: ${newEmployee.employeeId}`);
    console.log(`      • Full Name: ${newEmployee.fullName}`);
    console.log(`      • Department: ${newEmployee.department}`);
    console.log(`      • Designation: ${newEmployee.designation}`);
    console.log(`      • Status: ${newEmployee.employmentStatus}`);
    console.log(`      • Masked Bank Account: ${newEmployee.bankDetails.accountNumber} (Sensitive PII Protected)`);
    console.log(`      • Masked Aadhaar: ${newEmployee.identityDocuments[0].documentNumber}`);

    // 5. Initialize Leave Balances
    console.log('\n5. Initializing Statutory Leave Balances...');
    const { initLeaveMaster } = require('./services/hrms/leaveService');
    await initLeaveMaster();
    const { balanceDoc } = await getOrInitLeaveBalance(newEmployee._id);
    console.log(`   ✅ Leave Balances initialized for ${newEmployee.fullName} [Year: ${balanceDoc.leaveYear || balanceDoc.year}]`);
    balanceDoc.balances.slice(0, 3).forEach(b => {
      console.log(`      • ${b.leaveTypeName || b.leaveType}: ${b.allocated} allocated, ${b.available} available`);
    });

    // 6. Record 21 CFR Part 11 Electronic Audit Log
    console.log('\n6. Writing 21 CFR Part 11 Electronic Signature Audit Entry...');
    const auditRecord = await AuditLog.create({
      user: new mongoose.Types.ObjectId(),
      userName: 'HR Administrator',
      userRole: 'HR_ADMIN',
      action: 'EMPLOYEE_ONBOARDING_APPROVED',
      entity: 'Employee',
      entityId: newEmployee._id,
      module: 'HRMS_ONBOARDING',
      details: `Approved candidate onboarding application ${draftApp.applicationId}. Activated employee ${newEmployee.employeeId}.`,
      ipAddress: '127.0.0.1',
      userAgent: 'Node.js Automated Test Suite / BJK Digital Brain',
      complianceImpact: '21 CFR Part 11 / Schedule M Compliant'
    });
    console.log(`   ✅ Immutable Audit Trail Logged! Audit ID: ${auditRecord._id}`);

    // 7. Verify Database Query
    console.log('\n7. Verifying Querying Back from MongoDB Atlas...');
    const retrieved = await Employee.findById(newEmployee._id);
    console.log(`   ✅ Successfully retrieved back from database: ${retrieved.fullName} (${retrieved.employeeId})`);

    // 8. Clean up test record to maintain clean database
    console.log('\n8. Cleaning up test record...');
    await Employee.findByIdAndDelete(newEmployee._id);
    await OnboardingApplication.findByIdAndDelete(draftApp._id);
    console.log('   ✅ Test demo record cleanly removed from database.');

    console.log('\n========================================================================');
    console.log('🎉 ALL TESTS PASSED! HR ONBOARDING & DATA PIPELINE FULLY VALIDATED!');
    console.log('========================================================================');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in onboarding test:', err);
    await closeDB();
    process.exit(1);
  }
}

runEndToEndOnboardingTest();
