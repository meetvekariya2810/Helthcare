require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { LeaveBalance } = require('../models/hrms/Leave');
const Attendance = require('../models/hrms/Attendance');
const EmployeeTask = require('../models/EmployeeTask');
const EmployeeFaceAttendance = require('../models/EmployeeFaceAttendance');

const seedEmployeePortalUsers = async () => {
  const commonPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(commonPassword, salt);

  const testAccounts = [
    {
      employeeId: 'BJK-EMP-003',
      employeeCode: 'BJK-EMP-003',
      firstName: 'Rajesh',
      lastName: 'Patel',
      fullName: 'Rajesh Patel',
      email: 'employee@bjkhealthcare.com',
      workEmail: 'employee@bjkhealthcare.com',
      personalEmail: 'rajesh.patel.personal@gmail.com',
      phone: '9876543219',
      officialMobile: '9876543219',
      personalMobile: '9876543219',
      systemRole: 'EMPLOYEE',
      userRole: 'EMPLOYEE',
      department: 'Quality Control',
      departmentName: 'Quality Control',
      designation: 'Senior QC Analytical Chemist',
      designationTitle: 'Senior QC Analytical Chemist',
      reportingManager: 'Dr. Vikram Mehta',
      branch: 'Ahmedabad Plant',
      workLocation: 'Plant / Unit 1 - Analytical Testing Lab',
      shift: 'Morning Shift (07:00 - 15:30)',
      gmpAuthorization: 'GMP Grade B Authorized'
    },
    {
      employeeId: 'EMP001',
      employeeCode: 'EMP001',
      firstName: 'Aarav',
      lastName: 'Sharma',
      fullName: 'Aarav Sharma',
      email: 'emp001@bjkhealthcare.com',
      workEmail: 'emp001@bjkhealthcare.com',
      phone: '9876543210',
      officialMobile: '9876543210',
      systemRole: 'EMPLOYEE',
      userRole: 'EMPLOYEE',
      department: 'Production & Manufacturing',
      designation: 'Formulation Machine Operator',
      reportingManager: 'Dr. Sunita Rao',
      branch: 'Ahmedabad Plant',
      workLocation: 'BJK Unit 1 - Formulations Facility',
      shift: 'General Shift (09:00 - 18:00)'
    },
    {
      employeeId: 'EMP002',
      employeeCode: 'EMP002',
      firstName: 'Neha',
      lastName: 'Patel',
      fullName: 'Neha Patel',
      email: 'emp002@bjkhealthcare.com',
      workEmail: 'emp002@bjkhealthcare.com',
      phone: '9876543211',
      officialMobile: '9876543211',
      systemRole: 'SENIOR_EMPLOYEE',
      userRole: 'SENIOR_EMPLOYEE',
      department: 'Quality Control',
      designation: 'Senior QC Analyst (HPLC / Dissolution)',
      reportingManager: 'Dr. Sunita Rao',
      branch: 'Ahmedabad Plant',
      workLocation: 'BJK Central Analytical Testing Lab',
      shift: 'Morning Shift (07:00 - 15:30)'
    },
    {
      employeeId: 'TL001',
      employeeCode: 'TL001',
      firstName: 'Karan',
      lastName: 'Verma',
      fullName: 'Karan Verma',
      email: 'tl001@bjkhealthcare.com',
      workEmail: 'tl001@bjkhealthcare.com',
      phone: '9876543212',
      officialMobile: '9876543212',
      systemRole: 'TEAM_LEAD',
      userRole: 'TEAM_LEAD',
      department: 'Production Operations',
      designation: 'Shift Team Leader - Solid Orals',
      reportingManager: 'Dr. Sunita Rao',
      branch: 'Ahmedabad Plant',
      workLocation: 'BJK Unit 1 - Formulations Facility',
      shift: 'General Shift (09:00 - 18:00)',
      teamMembers: ['EMP001', 'BH1046']
    },
    {
      employeeId: 'MGR001',
      employeeCode: 'MGR001',
      firstName: 'Sunita',
      lastName: 'Rao',
      fullName: 'Dr. Sunita Rao',
      email: 'mgr001@bjkhealthcare.com',
      workEmail: 'mgr001@bjkhealthcare.com',
      phone: '9876543213',
      officialMobile: '9876543213',
      systemRole: 'MANAGER',
      userRole: 'MANAGER',
      department: 'Plant Operations & Technical Directorate',
      designation: 'General Manager - Manufacturing Operations',
      reportingManager: 'Director Technical',
      branch: 'Ahmedabad Plant',
      workLocation: 'BJK Unit 1 - Formulations Facility',
      shift: 'Executive Shift (09:00 - 18:30)',
      directReports: ['TL001', 'EMP001', 'EMP002', 'BH1046']
    },
    {
      employeeId: 'BH1046',
      employeeCode: 'BH1046',
      firstName: 'Rohan',
      lastName: 'Joshi',
      fullName: 'Rohan Joshi',
      email: 'bh1046@bjkhealthcare.com',
      workEmail: 'bh1046@bjkhealthcare.com',
      personalEmail: 'rohan.joshi.personal@gmail.com',
      phone: '9876543214',
      officialMobile: '9876543214',
      personalMobile: '9825102941',
      alternateMobile: '9825102942',
      systemRole: 'EMPLOYEE',
      userRole: 'EMPLOYEE',
      department: 'Production & Generics',
      designation: 'Pharmaceutical Production Specialist',
      reportingManager: 'Dr. Sunita Rao',
      branch: 'Ahmedabad Plant',
      workLocation: 'BJK Unit 1 - Formulations Facility',
      shift: 'General Shift (09:00 - 18:00)'
    }
  ];

  for (const acc of testAccounts) {
    // 1. Create / Update User Account
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = new User({
        name: acc.fullName,
        email: acc.email,
        phone: acc.phone,
        password: passwordHash,
        passwordHash: passwordHash,
        role: acc.userRole,
        department: acc.department,
        employeeId: acc.employeeId,
        isActive: true,
        dataScope: 'SELF'
      });
      await user.save();
    } else {
      user.role = acc.userRole;
      user.employeeId = acc.employeeId;
      user.password = passwordHash;
      user.passwordHash = passwordHash;
      await user.save();
    }

    // 2. Create / Update Employee Document
    let emp = await Employee.findOne({ employeeId: acc.employeeId });
    if (!emp) {
      emp = new Employee({
        employeeId: acc.employeeId,
        employeeCode: acc.employeeCode,
        firstName: acc.firstName,
        lastName: acc.lastName,
        fullName: acc.fullName,
        email: acc.email,
        personalEmail: acc.personalEmail || `${acc.employeeId.toLowerCase()}.personal@gmail.com`,
        phone: acc.phone,
        officialMobile: acc.officialMobile,
        personalMobile: acc.personalMobile || acc.phone,
        department: acc.department,
        departmentName: acc.department,
        designation: acc.designation,
        designationTitle: acc.designation,
        reportingManagerName: acc.reportingManager,
        branch: acc.branch,
        workLocation: acc.workLocation,
        shift: acc.shift,
        shiftName: acc.shift,
        joiningDate: new Date('2024-03-15'),
        user: user._id,
        systemRole: acc.systemRole,
        employmentStatus: 'Active',
        gmpAuthorization: acc.gmpAuthorization || 'GMP Grade B Authorized',
        bloodGroup: 'B+',
        maritalStatus: 'Married',
        nationality: 'Indian',
        basicSalary: 52000,
        currentAddress: 'A-402, Shivalik Platinum, S.G. Highway, Ahmedabad, Gujarat 380054',
        currentAddressDetails: {
          line1: 'A-402, Shivalik Platinum',
          line2: 'S.G. Highway',
          city: 'Ahmedabad',
          state: 'Gujarat',
          country: 'India',
          pinCode: '380054'
        },
        teamStructure: {
          reportingManager: acc.reportingManager,
          teamLeader: 'Karan Verma',
          teamMembers: acc.teamMembers || [],
          directReports: acc.directReports || []
        },
        emergencyContacts: [
          {
            name: 'Pooja Joshi',
            relationship: 'Spouse',
            mobile: '9825102949',
            alternateMobile: '079-26859102',
            email: 'pooja.joshi@gmail.com',
            address: 'A-402, Shivalik Platinum, S.G. Highway, Ahmedabad',
            isPrimary: true
          }
        ],
        familyMembers: [
          {
            relationship: 'Spouse',
            name: 'Pooja Joshi',
            dob: new Date('1994-08-14'),
            occupation: 'Software Engineer',
            mobile: '9825102949'
          },
          {
            relationship: 'Father',
            name: 'Mahesh Joshi',
            dob: new Date('1965-04-10'),
            occupation: 'Retired',
            mobile: '9825000000'
          }
        ],
        educationDetails: [
          {
            qualification: 'B.Pharm',
            degree: 'Bachelor of Pharmacy',
            institutionName: 'L.M. College of Pharmacy',
            universityBoard: 'Gujarat Technological University',
            passingYear: 2018,
            percentageOrCgpa: '8.4 CGPA',
            specialization: 'Pharmaceutics & Formulation Science'
          }
        ],
        previousEmployment: [
          {
            companyName: 'Cadila Healthcare Ltd.',
            designation: 'Junior Production Officer',
            joiningDate: new Date('2019-01-01'),
            leavingDate: new Date('2024-02-28'),
            totalExperience: '5 Years 2 Months',
            majorResponsibilities: 'Granulation and compression machine operation according to GMP norms.'
          }
        ],
        familyDetails: {
          nomineeName: 'Pooja Joshi',
          nomineeRelationship: 'Spouse',
          nomineeDateOfBirth: new Date('1994-08-14'),
          nomineeContact: '9825102949',
          nomineeAddress: 'A-402, Shivalik Platinum, Ahmedabad'
        },
        bankDetails: {
          accountHolderName: acc.fullName,
          bankName: 'HDFC Bank Ltd.',
          branchName: 'Bodakdev Branch, Ahmedabad',
          accountNumber: '50100492817291',
          ifscCode: 'HDFC0001248',
          accountType: 'SALARY'
        }
      });
      await emp.save();
    } else {
      emp.user = user._id;
      emp.systemRole = acc.systemRole;
      emp.employmentStatus = 'Active';
      if (acc.gmpAuthorization) emp.gmpAuthorization = acc.gmpAuthorization;
      if (acc.department) {
        emp.department = acc.department;
        emp.departmentName = acc.department;
      }
      if (acc.designation) {
        emp.designation = acc.designation;
        emp.designationTitle = acc.designation;
      }
      if (acc.workLocation) emp.workLocation = acc.workLocation;
      if (acc.shift) {
        emp.shift = acc.shift;
        emp.shiftName = acc.shift;
      }
      if (acc.teamMembers && emp.teamStructure) emp.teamStructure.teamMembers = acc.teamMembers;
      if (acc.directReports && emp.teamStructure) emp.teamStructure.directReports = acc.directReports;
      await emp.save();
    }

    // 3. Seed Leave Balance
    const balanceExists = await LeaveBalance.findOne({ employeeId: acc.employeeId, leaveYear: 2026 });
    if (!balanceExists) {
      await LeaveBalance.create({
        employee: emp._id,
        user: user._id,
        employeeId: acc.employeeId,
        employeeName: acc.fullName,
        department: acc.department,
        leaveYear: 2026,
        balances: [
          { leaveType: 'CASUAL_LEAVE', leaveTypeName: 'Casual Leave (CL)', openingBalance: 12, allocated: 12, used: 2, pending: 0, available: 10 },
          { leaveType: 'SICK_LEAVE', leaveTypeName: 'Sick Leave (SL)', openingBalance: 10, allocated: 10, used: 1, pending: 0, available: 9 },
          { leaveType: 'EARNED_LEAVE', leaveTypeName: 'Earned / Privilege Leave (EL)', openingBalance: 15, allocated: 15, used: 3, pending: 1, available: 11 },
          { leaveType: 'COMP_OFF', leaveTypeName: 'Compensatory Off', openingBalance: 2, allocated: 2, used: 0, pending: 0, available: 2 }
        ]
      });
    }

    // 4. Seed Face Attendance Record
    await EmployeeFaceAttendance.findOneAndUpdate(
      { employeeId: acc.employeeId },
      {
        employeeId: acc.employeeId,
        employee: emp._id,
        faceRegistered: true,
        registrationDate: new Date('2024-03-20'),
        lastVerificationDate: new Date(),
        lastVerificationStatus: 'VERIFIED_SUCCESS',
        deviceStatus: 'AUTHORIZED_OFFICE_TERMINAL',
        verificationConfidence: 0.98
      },
      { upsert: true }
    );
  }

  console.log(`[BJK Employee Portal Seed] Successfully initialized ${testAccounts.length} employee accounts.`);
};

// Auto-run if executed directly
if (require.main === module) {
  (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bjk_healthcare';
      console.log(`[BJK Employee Portal Seed] Connecting to MongoDB: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      await seedEmployeePortalUsers();
      await mongoose.disconnect();
      console.log('[BJK Employee Portal Seed] Complete.');
      process.exit(0);
    } catch (err) {
      console.error('[BJK Employee Portal Seed Error]:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedEmployeePortalUsers };
