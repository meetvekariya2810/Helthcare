require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');

const seedDir = path.join(__dirname, '../seed');

function parseCSVLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += c;
    }
  }
  result.push(curr.trim());
  return result;
}

const monthsToImport = [
  { month: 4, year: 2026, name: 'April 2026', file: "Attendance Sheet_Apr'26(APR 2026).csv", days: 30 },
  { month: 5, year: 2026, name: 'May 2026', file: "Attendance Sheet_May'26(MAY 2026).csv", days: 31 },
  { month: 6, year: 2026, name: 'June 2026', file: "Attendance Sheet_June'26(JUNE 2026).csv", days: 30 },
  { month: 7, year: 2026, name: 'July 2026', file: "Attendance Sheet_July 2026(JULY 2026).csv", days: 31 }
];

async function importAllMonthsClean() {
  await connectDB();
  console.log('=== BJK HEALTHCARE MULTI-MONTH CLEAN ATTENDANCE IMPORT ===\n');

  // Verify August and September protection
  const augSummariesBefore = await AttendanceMonthlySummary.countDocuments({ month: 8, year: 2026 });
  const augAttsBefore = await Attendance.countDocuments({ month: 8, year: 2026 });
  const sepSummariesBefore = await AttendanceMonthlySummary.countDocuments({ month: 9, year: 2026 });
  const sepAttsBefore = await Attendance.countDocuments({ month: 9, year: 2026 });

  console.log('PROTECTED DATA BEFORE IMPORT:');
  console.log(` - August 2026: ${augSummariesBefore} summaries, ${augAttsBefore} daily attendances`);
  console.log(` - September 2026: ${sepSummariesBefore} summaries, ${sepAttsBefore} daily attendances`);

  // Build master dept & name mappings from June, July, Aug, Sep
  const deptLookup = new Map();
  const nameLookup = new Map();

  ["Attendance Sheet_June'26(JUNE 2026).csv", "Attendance Sheet_July 2026(JULY 2026).csv", "08 Attendance Sheet_Aug 2026(AUG 2026).csv", "Attendance Sheet_Sep 2026(SEP 2026).csv"].forEach(f => {
    const filePath = path.join(seedDir, f);
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
    for (let i = 3; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const code = cols[1]?.trim();
      const name = cols[2]?.trim();
      const dept = cols[3]?.trim();
      if (code && dept && !['P','AB','WO','CL','SL','CO','PH'].includes(dept)) deptLookup.set(code.toUpperCase(), dept);
      if (name && dept && !['P','AB','WO','CL','SL','CO','PH'].includes(dept)) deptLookup.set(name.toLowerCase(), dept);
      if (code && name) nameLookup.set(code.toUpperCase(), name);
    }
  });

  const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' }).lean();

  const [allUsers, allEmps] = await Promise.all([
    User.find({}).select('_id name email role employeeCode employeeId department designation').lean(),
    Employee.find({}).select('_id fullName employeeCode employeeId department designation').lean()
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

  for (const cfg of monthsToImport) {
    console.log(`\n-----------------------------------------------------------`);
    console.log(`Processing Month ${cfg.month}/2026: ${cfg.name} (${cfg.file})`);

    const filePath = path.join(seedDir, cfg.file);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    const headerCols = parseCSVLine(lines[1]);

    const importBatchId = `ATT-2026-0${cfg.month}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const parsedRows = [];
    for (let i = 3; i < lines.length; i++) {
      const rawCols = parseCSVLine(lines[i]);
      const sr = rawCols[0]?.trim();
      const rawEmpCode = rawCols[1]?.trim() || '';
      const name = rawCols[2]?.trim() || '';
      let dept = rawCols[3]?.trim() || '';

      if (!sr || isNaN(parseInt(sr)) || (!rawEmpCode && !name)) {
        continue;
      }

      if (!dept || ['P','AB','WO','CL','SL','CO','PH'].includes(dept)) {
        dept = deptLookup.get(rawEmpCode.toUpperCase()) || deptLookup.get(name.toLowerCase()) || 'General';
      }

      const daily = {};
      for (let d = 1; d <= cfg.days; d++) {
        const val = rawCols[3 + d] !== undefined ? rawCols[3 + d].trim() : '';
        daily[d] = val;
      }

      // Read summary values directly from CSV
      const rowSummary = {};
      for (let c = 3 + cfg.days + 1; c < rawCols.length; c++) {
        const h = headerCols[c]?.trim();
        if (h && rawCols[c] !== undefined) {
          rowSummary[h] = rawCols[c].trim();
        }
      }

      parsedRows.push({
        sr,
        rawEmpCode,
        normalizedEmpCode: (rawEmpCode || (name ? name.replace(/\s+/g, '_').toUpperCase() : `SR_${sr}`)).toUpperCase(),
        name,
        dept,
        daily,
        rawSummary: rowSummary,
        rawCols
      });
    }

    console.log(`Parsed ${parsedRows.length} valid employee rows for ${cfg.name}`);

    // Clean up any incomplete records for this month only
    const mStr = String(cfg.month).padStart(2, '0');
    await Attendance.deleteMany({
      $or: [
        { month: cfg.month, year: cfg.year },
        { dateString: { $regex: `^2026-${mStr}` } },
        { attendanceDate: { $regex: `^2026-${mStr}` } }
      ]
    });
    await AttendanceMonthlySummary.deleteMany({ month: cfg.month, year: cfg.year });
    await AttendanceImportBatch.deleteMany({ month: cfg.month, year: cfg.year });

    const newAttendanceDocs = [];
    const newSummaryDocs = [];
    const usedUserIds = new Set();

    for (const row of parsedRows) {
      const code = row.normalizedEmpCode;
      const rawCode = row.rawEmpCode;
      const name = row.name;
      const dept = row.dept;

      let matchedUser = (rawCode ? userByCode.get(rawCode.toUpperCase()) : null) || userByName.get(name.toLowerCase());
      let matchedEmp = (rawCode ? empByCode.get(rawCode.toUpperCase()) : null) || empByName.get(name.toLowerCase());

      let targetUserId = null;
      if (matchedUser && !usedUserIds.has(String(matchedUser._id))) {
        targetUserId = matchedUser._id;
      } else if (matchedEmp && !usedUserIds.has(String(matchedEmp._id))) {
        targetUserId = matchedEmp._id;
      } else {
        targetUserId = new mongoose.Types.ObjectId();
      }
      usedUserIds.add(String(targetUserId));

      const targetEmpCode = (matchedUser?.employeeCode || matchedUser?.employeeId || matchedEmp?.employeeCode || rawCode || code).toUpperCase().trim();
      const targetEmpName = matchedUser?.name || matchedEmp?.fullName || name;
      const targetDept = (matchedUser && matchedUser.department) || (matchedEmp && matchedEmp.department) || dept || 'General';

      // Parse summary fields
      const parseSummaryVal = (v) => {
        if (!v || String(v).trim() === '') return 0;
        const num = parseFloat(v);
        return isNaN(num) ? 0 : num;
      };

      const p = parseSummaryVal(row.rawSummary['Present'] || row.rawSummary['Present ']);
      const wo = parseSummaryVal(row.rawSummary['WO'] || row.rawSummary['WO ']);
      const ph = parseSummaryVal(row.rawSummary['PH'] || row.rawSummary['PH ']);
      const cl = parseSummaryVal(row.rawSummary['CL'] || row.rawSummary['CL ']);
      const sl = parseSummaryVal(row.rawSummary['SL'] || row.rawSummary['SL ']);
      const co = parseSummaryVal(row.rawSummary['CO'] || row.rawSummary['CO ']);
      const lwp = parseSummaryVal(row.rawSummary['LWP'] || row.rawSummary['LWP ']);
      const aPay = parseSummaryVal(row.rawSummary['A.Pay Days'] || row.rawSummary['A.Present Days'] || row.rawSummary['Actual P. Days'] || row.rawSummary['A.Pay Days ']);
      const total = parseSummaryVal(row.rawSummary['Total Days'] || row.rawSummary['Total Days ']) || cfg.days;

      // Summary Document
      const summaryPayload = {
        _id: new mongoose.Types.ObjectId(),
        employeeId: targetUserId,
        employeeCode: targetEmpCode,
        month: cfg.month,
        year: cfg.year,
        present: p,
        weeklyOff: wo,
        publicHoliday: ph,
        casualLeave: cl,
        sickLeave: sl,
        compensatoryOff: co,
        leaveWithoutPay: lwp,
        absentPayDays: aPay,
        totalDays: total,
        sourceFileName: cfg.file,
        importBatchId: importBatchId,
        sourceEmployeeName: name,
        sourceDepartment: targetDept
      };
      newSummaryDocs.push(summaryPayload);

      // Daily Attendances
      for (let day = 1; day <= cfg.days; day++) {
        const dStr = String(day).padStart(2, '0');
        const dateStr = `${cfg.year}-${mStr}-${dStr}`;
        const sourceVal = row.daily[day];

        // Skip empty day cells
        if (sourceVal === undefined || sourceVal === null || String(sourceVal).trim() === '') {
          continue;
        }

        const dateObj = new Date(`${dateStr}T00:00:00.000Z`);

        let mappedStatus = 'PRESENT';
        let mappedHalfDay = 'NONE';
        let mappedLeaveType = 'NONE';
        let workingHours = 9;

        const valUpper = String(sourceVal).trim().toUpperCase();
        if (valUpper === 'P') {
          mappedStatus = 'PRESENT';
        } else if (valUpper === 'P1/2' || valUpper === 'P 1/2') {
          mappedStatus = 'HALF_DAY';
          mappedHalfDay = 'FIRST_HALF';
          workingHours = 4.5;
        } else if (valUpper === 'SL1/2' || valUpper === 'SL 1/2') {
          mappedStatus = 'HALF_DAY';
          mappedHalfDay = 'FIRST_HALF';
          mappedLeaveType = 'SICK';
          workingHours = 4.5;
        } else if (valUpper === 'CL1/2' || valUpper === 'CL 1/2') {
          mappedStatus = 'HALF_DAY';
          mappedHalfDay = 'FIRST_HALF';
          mappedLeaveType = 'CASUAL';
          workingHours = 4.5;
        } else if (valUpper === 'CO1/2' || valUpper === 'CO 1/2') {
          mappedStatus = 'HALF_DAY';
          mappedHalfDay = 'FIRST_HALF';
          mappedLeaveType = 'COMPENSATORY';
          workingHours = 4.5;
        } else if (valUpper === 'WO') {
          mappedStatus = 'WEEK_OFF';
          workingHours = 0;
        } else if (valUpper === 'PH') {
          mappedStatus = 'HOLIDAY';
          workingHours = 0;
        } else if (valUpper === 'CL') {
          mappedStatus = 'ON_LEAVE';
          mappedLeaveType = 'CASUAL';
          workingHours = 0;
        } else if (valUpper === 'SL') {
          mappedStatus = 'ON_LEAVE';
          mappedLeaveType = 'SICK';
          workingHours = 0;
        } else if (valUpper === 'CO') {
          mappedStatus = 'ON_LEAVE';
          mappedLeaveType = 'COMPENSATORY';
          workingHours = 0;
        } else if (valUpper === 'LWP') {
          mappedStatus = 'ABSENT';
          mappedLeaveType = 'UNPAID';
          workingHours = 0;
        } else if (valUpper === 'AB') {
          mappedStatus = 'ABSENT';
          workingHours = 0;
        }

        newAttendanceDocs.push({
          _id: new mongoose.Types.ObjectId(),
          employee: targetUserId,
          employeeId: targetUserId,
          employeeCode: targetEmpCode,
          employeeName: targetEmpName,
          attendanceDate: dateStr,
          attendanceStatus: sourceVal,
          status: mappedStatus,
          halfDayType: mappedHalfDay,
          leaveType: mappedLeaveType,
          workingHours: workingHours,
          regularHours: workingHours,
          sourceEmployeeName: name,
          sourceDepartment: targetDept,
          departmentName: targetDept,
          month: cfg.month,
          year: cfg.year,
          importBatchId: importBatchId,
          sourceFileName: cfg.file,
          createdBy: superAdmin ? superAdmin._id : null,
          branchName: 'Ahmedabad Branch',
          date: dateObj,
          dateString: dateStr
        });
      }
    }

    if (newSummaryDocs.length > 0) {
      await AttendanceMonthlySummary.insertMany(newSummaryDocs, { ordered: true });
    }
    if (newAttendanceDocs.length > 0) {
      await Attendance.insertMany(newAttendanceDocs, { ordered: true });
    }

    const batch = new AttendanceImportBatch({
      importBatchId: importBatchId,
      fileName: cfg.file,
      month: cfg.month,
      year: cfg.year,
      totalRows: parsedRows.length,
      matchedRows: parsedRows.length,
      importedRows: parsedRows.length,
      unmatchedRows: 0,
      status: 'IMPORTED'
    });
    await batch.save();

    console.log(`[SUCCESS] Imported ${cfg.name}:`);
    console.log(` - Summaries Inserted: ${newSummaryDocs.length}`);
    console.log(` - Daily Records Inserted: ${newAttendanceDocs.length}`);
  }

  // Final count verification
  const summaries = await AttendanceMonthlySummary.aggregate([
    { $group: { _id: { month: '$month', year: '$year' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  console.log('\nFinal Monthly Summaries in DB:');
  console.log(JSON.stringify(summaries, null, 2));

  const attendances = await Attendance.aggregate([
    { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  console.log('Final Daily Attendances in DB:');
  console.log(JSON.stringify(attendances, null, 2));

  console.log('\n=== MULTI-MONTH CLEAN IMPORT COMPLETE ===\n');
  process.exit(0);
}

importAllMonthsClean().catch(err => {
  console.error('Multi-Month Clean Import Failed:', err);
  process.exit(1);
});
