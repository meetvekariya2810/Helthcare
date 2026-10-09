const { connectDB } = require('../config/db');
const mongoose = require('mongoose');

const Employee = require('../models/Employee');
const Attendance = require('../models/hrms/Attendance');

const sampleNonTechStaff = [
  {
    employeeId: 'BJK-NT-001',
    employeeCode: 'BJK-NT-001',
    firstName: 'Ramesh',
    middleName: 'K',
    lastName: 'Patel',
    fullName: 'Ramesh Patel',
    gender: 'Male',
    department: 'Administration',
    departmentName: 'Administration',
    designation: 'Senior Office Assistant',
    employmentType: 'Full Time',
    mobile: '9825011223',
    phone: '9825011223',
    email: 'ramesh.p@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-03-15'),
    address: {
      addressLine1: 'B-104, Shrinand Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382443'
    }
  },
  {
    employeeId: 'BJK-NT-002',
    employeeCode: 'BJK-NT-002',
    firstName: 'Priya',
    middleName: 'M',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    gender: 'Female',
    department: 'Reception',
    departmentName: 'Reception',
    designation: 'Front Desk Receptionist',
    employmentType: 'Full Time',
    mobile: '9879022334',
    phone: '9879022334',
    email: 'priya.s@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-06-01'),
    address: {
      addressLine1: '12, Sarjan Society',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '380015'
    }
  },
  {
    employeeId: 'BJK-NT-003',
    employeeCode: 'BJK-NT-003',
    firstName: 'Jagdish',
    middleName: 'B',
    lastName: 'Vaghela',
    fullName: 'Jagdish Vaghela',
    gender: 'Male',
    department: 'Security',
    departmentName: 'Security',
    designation: 'Security Supervisor',
    employmentType: 'Full Time',
    mobile: '9426033445',
    phone: '9426033445',
    email: 'jagdish.v@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2023-11-10'),
    address: {
      addressLine1: '45, Shivam Tenements',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382481'
    }
  },
  {
    employeeId: 'BJK-NT-004',
    employeeCode: 'BJK-NT-004',
    firstName: 'Mukesh',
    middleName: 'H',
    lastName: 'Solanki',
    fullName: 'Mukesh Solanki',
    gender: 'Male',
    department: 'Security',
    departmentName: 'Security',
    designation: 'Security Guard',
    employmentType: 'Full Time',
    mobile: '9898044556',
    phone: '9898044556',
    email: 'mukesh.s@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-01-20'),
    address: {
      addressLine1: 'C-22, Maruti Complex',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382480'
    }
  },
  {
    employeeId: 'BJK-NT-005',
    employeeCode: 'BJK-NT-005',
    firstName: 'Kantaben',
    middleName: 'D',
    lastName: 'Parmar',
    fullName: 'Kantaben Parmar',
    gender: 'Female',
    department: 'Housekeeping',
    departmentName: 'Housekeeping',
    designation: 'Housekeeping Lead',
    employmentType: 'Full Time',
    mobile: '9727055667',
    phone: '9727055667',
    email: 'kantaben.p@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2023-08-15'),
    address: {
      addressLine1: 'Block 4, Vasant Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '380061'
    }
  },
  {
    employeeId: 'BJK-NT-006',
    employeeCode: 'BJK-NT-006',
    firstName: 'Rekhaben',
    middleName: 'S',
    lastName: 'Chavda',
    fullName: 'Rekhaben Chavda',
    gender: 'Female',
    department: 'Housekeeping',
    departmentName: 'Housekeeping',
    designation: 'Housekeeping Staff',
    employmentType: 'Full Time',
    mobile: '9909066778',
    phone: '9909066778',
    email: 'rekhaben.c@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-04-10'),
    address: {
      addressLine1: '18, Umiya Park',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382440'
    }
  },
  {
    employeeId: 'BJK-NT-007',
    employeeCode: 'BJK-NT-007',
    firstName: 'Bharat',
    middleName: 'N',
    lastName: 'Prajapati',
    fullName: 'Bharat Prajapati',
    gender: 'Male',
    department: 'Maintenance',
    departmentName: 'Maintenance',
    designation: 'Facility Maintenance Electrician',
    employmentType: 'Full Time',
    mobile: '9824077889',
    phone: '9824077889',
    email: 'bharat.p@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2023-05-12'),
    address: {
      addressLine1: '56, Radhe Krishna Row House',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382350'
    }
  },
  {
    employeeId: 'BJK-NT-008',
    employeeCode: 'BJK-NT-008',
    firstName: 'Suresh',
    middleName: 'L',
    lastName: 'Rathod',
    fullName: 'Suresh Rathod',
    gender: 'Male',
    department: 'Maintenance',
    departmentName: 'Maintenance',
    designation: 'Plumber & Support Worker',
    employmentType: 'Full Time',
    mobile: '9876088990',
    phone: '9876088990',
    email: 'suresh.r@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-02-01'),
    address: {
      addressLine1: 'Plot 31, Sharda Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '380007'
    }
  },
  {
    employeeId: 'BJK-NT-009',
    employeeCode: 'BJK-NT-009',
    firstName: 'Dinesh',
    middleName: 'R',
    lastName: 'Makwana',
    fullName: 'Dinesh Makwana',
    gender: 'Male',
    department: 'Logistics',
    departmentName: 'Logistics',
    designation: 'Senior Driver & Vehicle In-Charge',
    employmentType: 'Full Time',
    mobile: '9428099001',
    phone: '9428099001',
    email: 'dinesh.m@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2022-09-20'),
    address: {
      addressLine1: '7, Jai Ambe Society',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382445'
    }
  },
  {
    employeeId: 'BJK-NT-010',
    employeeCode: 'BJK-NT-010',
    firstName: 'Hasmukh',
    middleName: 'P',
    lastName: 'Dabhi',
    fullName: 'Hasmukh Dabhi',
    gender: 'Male',
    department: 'Dispatch',
    departmentName: 'Dispatch',
    designation: 'Dispatch & Store Helper',
    employmentType: 'Full Time',
    mobile: '9825100112',
    phone: '9825100112',
    email: 'hasmukh.d@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-05-18'),
    address: {
      addressLine1: 'A-302, Gokul Heights',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '382424'
    }
  }
];

async function seed() {
  console.log('Connecting to MongoDB via connectDB...');
  await connectDB(0, 3, true);
  console.log('MongoDB connected.');

  const todayStr = new Date().toISOString().split('T')[0];
  const initialStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'ABSENT', 'LEAVE'];

  let count = 0;
  for (let i = 0; i < sampleNonTechStaff.length; i++) {
    const staffData = sampleNonTechStaff[i];
    const status = initialStatuses[i];

    let emp = await Employee.findOne({ employeeId: staffData.employeeId });
    if (!emp) {
      emp = new Employee(staffData);
    } else {
      Object.assign(emp, staffData);
    }
    await emp.save();
    count++;

    // Seed today's attendance for instant HR management
    let att = await Attendance.findOne({
      $or: [
        { employeeId: emp.employeeId, dateString: todayStr },
        { employeeCode: emp.employeeId, attendanceDate: todayStr }
      ]
    });
    if (!att) {
      att = new Attendance({
        employee: emp._id,
        employeeId: emp.employeeId,
        employeeCode: emp.employeeId,
        attendanceDate: todayStr,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        branchName: 'Ahmedabad Branch',
        date: new Date(todayStr),
        dateString: todayStr,
        source: 'MANUAL'
      });
    } else {
      att.employeeCode = emp.employeeId;
      att.attendanceDate = todayStr;
      att.employeeName = emp.fullName;
      att.departmentName = emp.departmentName;
    }

    att.status = status;
    att.remarks = `Reference seed: ${status}`;
    att.workingHours = status === 'PRESENT' ? 8 : 0;
    await att.save();

    console.log(`[+] Seeded Non-Technical Staff: ${emp.employeeId} - ${emp.fullName} (${emp.departmentName}) -> Today: ${status}`);
  }

  console.log(`\nSuccessfully seeded ${count} reference Non-Technical Staff records with today's attendance!`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
