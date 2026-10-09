require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

function buildAttendanceFilter(filters = {}) {
  const query = {};

  // 1. Date Filtering
  if (filters.dateFrom && filters.dateTo) {
    query.$or = [
      { dateString: { $gte: filters.dateFrom, $lte: filters.dateTo } },
      { attendanceDate: { $gte: filters.dateFrom, $lte: filters.dateTo } }
    ];
  } else if (filters.dateFrom) {
    query.$or = [
      { dateString: { $gte: filters.dateFrom } },
      { attendanceDate: { $gte: filters.dateFrom } }
    ];
  } else if (filters.date) {
    query.$or = [
      { dateString: filters.date },
      { attendanceDate: filters.date }
    ];
  }

  // 2. Branch Filtering
  if (filters.branches && filters.branches.length > 0 && !filters.branches.includes('ALL')) {
    const branchRegexes = filters.branches.map(b => new RegExp(b.replace(/Plant|Branch/gi, '').trim(), 'i'));
    query.branchName = { $in: branchRegexes };
  }

  // 3. Department Filtering
  if (filters.departments && filters.departments.length > 0 && !filters.departments.includes('ALL')) {
    const deptRegexes = filters.departments.map(d => {
      const clean = d.trim();
      if (/Quality Control|QC/i.test(clean)) return /Quality Control|^QC$/i;
      if (/Quality Assurance|QA/i.test(clean)) return /Quality Assurance|^QA$/i;
      if (/QC Micro/i.test(clean)) return /QC Micro/i;
      if (/Engineering|Engg/i.test(clean)) return /Engineering|^Engg/i;
      if (/HR|Human Resource|Admin/i.test(clean)) return /HR|Admin/i;
      if (/Accounts|Finance/i.test(clean)) return /Accounts|Finance/i;
      return new RegExp(clean, 'i');
    });
    const deptCondition = [
      { sourceDepartment: { $in: deptRegexes } },
      { departmentName: { $in: deptRegexes } }
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: deptCondition }];
      delete query.$or;
    } else {
      query.$or = deptCondition;
    }
  }

  // 4. Status Filtering
  if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes('ALL')) {
    const statusCodes = new Set();
    filters.statuses.forEach(s => {
      const u = String(s).toUpperCase().trim();
      if (u === 'PRESENT' || u === 'P') {
        statusCodes.add('P'); statusCodes.add('p'); statusCodes.add('PRESENT'); statusCodes.add('M'); statusCodes.add('P1/2');
      } else if (u === 'ABSENT' || u === 'AB') {
        statusCodes.add('AB'); statusCodes.add('ABSENT'); statusCodes.add('A');
      } else if (u === 'WEEK_OFF' || u === 'WEEKOFF' || u === 'WO') {
        statusCodes.add('WO'); statusCodes.add('WEEK_OFF'); statusCodes.add('WEEKOFF');
      } else if (u === 'HOLIDAY' || u === 'PH' || u === 'PUBLIC_HOLIDAY') {
        statusCodes.add('PH'); statusCodes.add('HOLIDAY'); statusCodes.add('PUBLIC_HOLIDAY');
      } else if (u === 'LEAVE' || u === 'ON_LEAVE' || u === 'CL' || u === 'SL' || u === 'CO' || u === 'LWP') {
        statusCodes.add('CL'); statusCodes.add('SL'); statusCodes.add('CO'); statusCodes.add('LWP');
        statusCodes.add('E'); statusCodes.add('CL1/2'); statusCodes.add('SL1/2'); statusCodes.add('ON_LEAVE'); statusCodes.add('LEAVE');
      } else if (u === 'HALF_DAY' || u === 'P1/2') {
        statusCodes.add('P1/2'); statusCodes.add('HALF_DAY'); statusCodes.add('CL1/2'); statusCodes.add('SL1/2');
      } else if (u === 'LATE' || u === 'LATE_IN') {
        statusCodes.add('LATE');
      } else {
        statusCodes.add(u);
      }
    });

    const codeArray = Array.from(statusCodes);
    if (codeArray.length > 0) {
      const statusCondition = [
        { status: { $in: codeArray } },
        { attendanceStatus: { $in: codeArray } }
      ];
      if (query.$and) {
        query.$and.push({ $or: statusCondition });
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: statusCondition }];
        delete query.$or;
      } else {
        query.$or = statusCondition;
      }
    }
  }

  return query;
}

async function runTest() {
  await connectDB();
  const Attendance = require('../models/hrms/Attendance');

  // Test Case 1: Aug 2026, All Departments, Ahmedabad, All Statuses
  console.log('--- Test Case 1: Aug 2026, All Depts, Ahmedabad, All Statuses ---');
  const q1 = buildAttendanceFilter({
    dateFrom: '2026-08-01',
    dateTo: '2026-08-31',
    branches: ['Ahmedabad Plant'],
    departments: ['ALL'],
    statuses: ['ALL']
  });
  const count1 = await Attendance.countDocuments(q1);
  const emps1 = await Attendance.distinct('employeeCode', q1);
  console.log(`Matching Records: ${count1}, Distinct Staff: ${emps1.length}`);

  // Test Case 2: Aug 2026, Production Dept, Ahmedabad, Present+Late+HalfDay
  console.log('\n--- Test Case 2: Aug 2026, Production, Present/HalfDay ---');
  const q2 = buildAttendanceFilter({
    dateFrom: '2026-08-01',
    dateTo: '2026-08-31',
    branches: ['Ahmedabad'],
    departments: ['Production'],
    statuses: ['PRESENT', 'LATE', 'HALF_DAY']
  });
  const count2 = await Attendance.countDocuments(q2);
  const emps2 = await Attendance.distinct('employeeCode', q2);
  console.log(`Matching Records: ${count2}, Distinct Staff: ${emps2.length}`);

  // Test Case 3: Aug 2026, All Depts, Present Status
  console.log('\n--- Test Case 3: Aug 2026, All Depts, Present Status ---');
  const q3 = buildAttendanceFilter({
    dateFrom: '2026-08-01',
    dateTo: '2026-08-31',
    branches: ['Ahmedabad'],
    departments: ['ALL'],
    statuses: ['PRESENT']
  });
  const count3 = await Attendance.countDocuments(q3);
  const emps3 = await Attendance.distinct('employeeCode', q3);
  console.log(`Matching Records: ${count3}, Distinct Staff: ${emps3.length}`);

  await mongoose.disconnect();
}

runTest().catch(console.error);
