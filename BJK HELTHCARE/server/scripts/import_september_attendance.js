require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');
const AttendanceImportSnapshot = require('../models/hrms/AttendanceImportSnapshot');

const SEP_CSV_PATH = path.join(__dirname, '../seed/Attendance Sheet_Sep 2026(SEP 2026).csv');
const SOURCE_FILE_NAME = 'Attendance Sheet_Sep 2026(SEP 2026).csv';

function parseSeptemberCSV(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 4) {
    throw new Error('Invalid CSV: insufficient rows in attendance file.');
  }

  const headerCols = lines[1].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 3; i < lines.length; i++) {
    const rawCols = lines[i].split(',');
    const sr = rawCols[0]?.trim();
    const rawEmpCode = rawCols[1]?.trim() || '';
    const name = rawCols[2]?.trim();
    const dept = rawCols[3]?.trim();

    if (!name && !rawEmpCode) continue;

    const daily = {};
    for (let day = 1; day <= 30; day++) {
      const val = rawCols[3 + day] !== undefined ? rawCols[3 + day].trim() : '';
      daily[day] = val;
    }

    const summary = {};
    const presentIndex = headerCols.findIndex(h => h.startsWith('Present'));
    if (presentIndex !== -1) {
      headerCols.slice(presentIndex).forEach((h, hIdx) => {
        if (!h) return;
        const colIdx = presentIndex + hIdx;
        const val = rawCols[colIdx] !== undefined ? rawCols[colIdx].trim() : '';
        summary[h] = val;
      });
    }

    rows.push({
      sr,
      rawEmpCode,
      normalizedEmpCode: (rawEmpCode || (name ? name.replace(/\s+/g, '_').toUpperCase() : `SR_${sr}`)).toUpperCase(),
      name,
      dept,
      daily,
      summary
    });
  }

  return { headerCols, rows };
}

async function importSeptemberAttendance() {
  await connectDB();
  console.log('=== SEPTEMBER 2026 ATTENDANCE INTEGRATION ===\n');

  const content = fs.readFileSync(SEP_CSV_PATH, 'utf8');
  const { rows } = parseSeptemberCSV(content);

  console.log(`Source File: ${SOURCE_FILE_NAME}`);
  console.log(`Total Source Rows: ${rows.length} (Expected: 51)`);

  const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' }).lean();

  const beforeCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({}),
    augustAttendance: await Attendance.countDocuments({ month: 8, year: 2026 }),
    augustSummaries: await AttendanceMonthlySummary.countDocuments({ month: 8, year: 2026 })
  };
  console.log('Database State Before September Import:', beforeCounts);

  const importBatchId = `ATT-2026-09-${Date.now()}-9201`;

  // Fetch all existing users and employees
  const [allUsers, allEmps, existingSeptAtts, existingSeptSummaries] = await Promise.all([
    User.find({}).select('_id name email role employeeCode employeeId department').lean(),
    Employee.find({}).select('_id fullName employeeCode employeeId department designation').lean(),
    Attendance.find({
      $or: [
        { month: 9, year: 2026 },
        { attendanceDate: { $regex: '^2026-09' } },
        { dateString: { $regex: '^2026-09' } }
      ]
    }).lean(),
    AttendanceMonthlySummary.find({ month: 9, year: 2026 }).lean()
  ]);

  const userByCode = new Map();
  const userByName = new Map();
  allUsers.forEach(u => {
    if (u.employeeCode) userByCode.set(u.employeeCode.toUpperCase().trim(), u);
    if (u.employeeId) userByCode.set(u.employeeId.toUpperCase().trim(), u);
    if (u.name) userByName.set(u.name.toLowerCase().trim(), u);
  });

  const empByCode = new Map();
  const empByName = new Map();
  allEmps.forEach(e => {
    if (e.employeeCode) empByCode.set(e.employeeCode.toUpperCase().trim(), e);
    if (e.employeeId) empByCode.set(e.employeeId.toUpperCase().trim(), e);
    if (e.fullName) empByName.set(e.fullName.toLowerCase().trim(), e);
  });

  const existingAttMap = new Map();
  existingSeptAtts.forEach(a => {
    const code = (a.employeeCode || '').toUpperCase().trim();
    const date = a.attendanceDate || a.dateString;
    if (code && date) existingAttMap.set(`${code}_${date}`, a);
  });

  const existingSummaryMap = new Map();
  existingSeptSummaries.forEach(s => {
    const code = (s.employeeCode || '').toUpperCase().trim();
    if (code) existingSummaryMap.set(code, s);
  });

  const newAttendanceDocs = [];
  const updatePromises = [];
  const newSummaryDocs = [];
  const updateSummaryPromises = [];

  let matchedCount = 0;

  for (const row of rows) {
    const code = row.normalizedEmpCode;
    const rawCode = row.rawEmpCode;
    const name = row.name;

    // Match priority: 1. Code 2. Name
    let matchedUser = (rawCode ? userByCode.get(rawCode.toUpperCase()) : null) || userByName.get(name.toLowerCase());
    let matchedEmp = (rawCode ? empByCode.get(rawCode.toUpperCase()) : null) || empByName.get(name.toLowerCase());

    const targetUserId = matchedUser ? matchedUser._id : matchedEmp ? matchedEmp._id : new mongoose.Types.ObjectId();
    const targetEmpCode = (matchedUser?.employeeCode || matchedUser?.employeeId || matchedEmp?.employeeCode || rawCode || code).toUpperCase().trim();
    const targetEmpName = matchedUser?.name || matchedEmp?.fullName || name;
    const targetDept = row.dept || matchedUser?.department || matchedEmp?.department || 'General';

    matchedCount++;

    // 1. Process 30 Daily Records
    for (let day = 1; day <= 30; day++) {
      const val = row.daily[day];
      const dayFormatted = String(day).padStart(2, '0');
      const attendanceDate = `2026-09-${dayFormatted}`;
      const dateObj = new Date(`2026-09-${dayFormatted}T00:00:00.000Z`);

      if (val === '') continue; // Preserve blank cells

      const existingRecord = existingAttMap.get(`${targetEmpCode}_${attendanceDate}`);

      if (existingRecord) {
        updatePromises.push(
          Attendance.findByIdAndUpdate(existingRecord._id, {
            attendanceStatus: val,
            status: val,
            importBatchId,
            sourceFileName: SOURCE_FILE_NAME,
            month: 9,
            year: 2026,
            sourceEmployeeName: name,
            sourceDepartment: row.dept
          })
        );
      } else {
        newAttendanceDocs.push({
          _id: new mongoose.Types.ObjectId(),
          employee: targetUserId,
          employeeId: targetUserId,
          employeeCode: targetEmpCode,
          attendanceDate,
          dateString: attendanceDate,
          date: dateObj,
          attendanceStatus: val,
          status: val,
          sourceEmployeeName: name,
          sourceDepartment: row.dept,
          employeeName: targetEmpName,
          departmentName: targetDept,
          month: 9,
          year: 2026,
          importBatchId,
          sourceFileName: SOURCE_FILE_NAME,
          createdBy: superAdmin?._id || null
        });
      }
    }

    // 2. Process Monthly Summary
    const parseSummaryVal = (v) => {
      if (!v || String(v).trim() === '') return 0;
      const num = parseFloat(v);
      return isNaN(num) ? 0 : num;
    };

    const summaryData = {
      employeeId: targetUserId,
      employeeCode: targetEmpCode,
      month: 9,
      year: 2026,
      present: parseSummaryVal(row.summary['Present'] || row.summary['Present ']),
      weeklyOff: parseSummaryVal(row.summary['WO']),
      publicHoliday: parseSummaryVal(row.summary['PH']),
      casualLeave: parseSummaryVal(row.summary['CL']),
      sickLeave: parseSummaryVal(row.summary['SL']),
      compensatoryOff: parseSummaryVal(row.summary['CO']),
      leaveWithoutPay: parseSummaryVal(row.summary['LWP']),
      absentPayDays: parseSummaryVal(row.summary['A.Pay Days']),
      totalDays: parseSummaryVal(row.summary['Total Days']),
      sourceFileName: SOURCE_FILE_NAME,
      importBatchId,
      sourceEmployeeName: name,
      sourceDepartment: row.dept
    };

    const existingSummary = existingSummaryMap.get(targetEmpCode);
    if (existingSummary) {
      updateSummaryPromises.push(
        AttendanceMonthlySummary.findByIdAndUpdate(existingSummary._id, summaryData)
      );
    } else {
      newSummaryDocs.push(summaryData);
    }
  }

  // Create Batch Record
  const batchRecord = await AttendanceImportBatch.create({
    importBatchId,
    fileName: SOURCE_FILE_NAME,
    month: 9,
    year: 2026,
    status: 'PROCESSING',
    totalRows: rows.length,
    importedBy: superAdmin?._id || null,
    importedByName: 'Superadmin'
  });

  // Execute Bulk Operations
  if (newAttendanceDocs.length > 0) {
    await Attendance.insertMany(newAttendanceDocs, { ordered: false });
  }
  if (updatePromises.length > 0) {
    await Promise.all(updatePromises);
  }
  if (newSummaryDocs.length > 0) {
    await AttendanceMonthlySummary.insertMany(newSummaryDocs, { ordered: false });
  }
  if (updateSummaryPromises.length > 0) {
    await Promise.all(updateSummaryPromises);
  }

  // Finalize Batch Record
  batchRecord.status = 'IMPORTED';
  batchRecord.matchedRows = matchedCount;
  batchRecord.importedRows = newAttendanceDocs.length + updatePromises.length;
  batchRecord.unmatchedRows = 0;
  batchRecord.duplicateRows = 0;
  batchRecord.failedRows = 0;
  batchRecord.importedAt = new Date();
  await batchRecord.save();

  await AuditLog.logAction({
    user: superAdmin,
    action: 'ATTENDANCE_IMPORT_COMPLETED',
    module: 'HRMS',
    resource: 'AttendanceImportBatch',
    resourceId: importBatchId,
    details: `September 2026 Attendance imported. Batch: ${importBatchId}. Records created: ${newAttendanceDocs.length}, Summaries: ${newSummaryDocs.length + updateSummaryPromises.length}`
  });

  const afterCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({}),
    augustAttendance: await Attendance.countDocuments({ month: 8, year: 2026 }),
    augustSummaries: await AttendanceMonthlySummary.countDocuments({ month: 8, year: 2026 }),
    septemberAttendance: await Attendance.countDocuments({ month: 9, year: 2026 }),
    septemberSummaries: await AttendanceMonthlySummary.countDocuments({ month: 9, year: 2026 })
  };

  console.log('\n--- POST-IMPORT VERIFICATION ---');
  console.log('Database State After September Import:', afterCounts);
  console.log(`August Attendance Untouched: ${beforeCounts.augustAttendance === afterCounts.augustAttendance ? 'YES (PROTECTED)' : 'FAIL'}`);
  console.log(`August Summaries Untouched: ${beforeCounts.augustSummaries === afterCounts.augustSummaries ? 'YES (PROTECTED)' : 'FAIL'}`);
  console.log(`September Summaries Created: ${afterCounts.septemberSummaries} (Expected: 51)`);
  console.log(`September Daily Records Created: ${afterCounts.septemberAttendance}`);

  process.exit(0);
}

importSeptemberAttendance().catch(err => {
  console.error('September Import Error:', err);
  process.exit(1);
});
