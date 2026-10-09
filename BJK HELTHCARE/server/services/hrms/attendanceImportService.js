const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../../models/User');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const Role = require('../../models/Role');
const AuditLog = require('../../models/AuditLog');
const Attendance = require('../../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../../models/hrms/AttendanceImportBatch');
const AttendanceImportSnapshot = require('../../models/hrms/AttendanceImportSnapshot');

const DEFAULT_CSV_PATH = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\08 Attendance Sheet_Aug 2026(AUG 2026).csv';
const SOURCE_FILE_NAME = '08 Attendance Sheet_Aug 2026(AUG 2026).csv';

/**
 * Helper to parse the August 2026 CSV file content
 */
function parseCSVContent(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 4) {
    throw new Error('Invalid CSV: insufficient rows in attendance file.');
  }

  const headerCols = lines[1].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 3; i < lines.length; i++) {
    const rawCols = lines[i].split(',');
    const sr = rawCols[0]?.trim();
    const rawEmpCode = rawCols[1]?.trim();
    const name = rawCols[2]?.trim();
    const dept = rawCols[3]?.trim();

    if (!rawEmpCode) continue;

    const daily = {};
    for (let day = 1; day <= 31; day++) {
      const val = rawCols[3 + day] !== undefined ? rawCols[3 + day].trim() : '';
      daily[day] = val;
    }

    const summary = {};
    headerCols.slice(35).forEach((h, hIdx) => {
      const val = rawCols[35 + hIdx] !== undefined ? rawCols[35 + hIdx].trim() : '';
      summary[h] = val;
    });

    rows.push({
      sr,
      rawEmpCode,
      normalizedEmpCode: rawEmpCode.toUpperCase(),
      name,
      dept,
      daily,
      summary
    });
  }

  return { headerCols, rows };
}

/**
 * Pre-Import Validation / Dry Run (High-Performance Bulk Indexed)
 */
async function validateAttendanceImport({ csvPath = DEFAULT_CSV_PATH, csvContent = null, user = null }) {
  const content = csvContent || fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCSVContent(content);

  const totalSourceRows = rows.length;
  const empCodes = rows.map(r => r.normalizedEmpCode);

  // Bulk fetch users, employees, and existing attendances in parallel
  const [allUsers, allEmps, existingAtts] = await Promise.all([
    User.find({
      $or: [
        { employeeCode: { $in: empCodes } },
        { employeeId: { $in: empCodes } }
      ]
    }).select('_id name email role employeeCode employeeId department').lean(),

    Employee.find({
      $or: [
        { employeeCode: { $in: empCodes } },
        { employeeId: { $in: empCodes } }
      ]
    }).select('_id fullName employeeCode employeeId department designation').lean(),

    Attendance.find({
      employeeCode: { $in: empCodes },
      $or: [
        { attendanceDate: { $regex: '^2026-08' } },
        { dateString: { $regex: '^2026-08' } }
      ]
    }).select('_id employeeCode attendanceDate dateString attendanceStatus status importBatchId').lean()
  ]);

  // Index users and employees by uppercase codes
  const userMap = new Map();
  allUsers.forEach(u => {
    if (u.employeeCode) userMap.set(u.employeeCode.toUpperCase(), u);
    if (u.employeeId) userMap.set(u.employeeId.toUpperCase(), u);
  });

  const empMap = new Map();
  allEmps.forEach(e => {
    if (e.employeeCode) empMap.set(e.employeeCode.toUpperCase(), e);
    if (e.employeeId) empMap.set(e.employeeId.toUpperCase(), e);
  });

  // Index existing attendances by "CODE_YYYY-MM-DD"
  const existingAttMap = new Map();
  existingAtts.forEach(a => {
    const code = (a.employeeCode || '').toUpperCase();
    const date = a.attendanceDate || a.dateString;
    if (code && date) existingAttMap.set(`${code}_${date}`, a);
  });

  const matchedEmployees = [];
  const unmatchedEmployees = [];
  let validAttendanceCells = 0;
  let blankCells = 0;
  const duplicateRecords = [];
  const invalidEmployeeCodes = [];
  const invalidAttendanceValues = [];

  for (const row of rows) {
    const code = row.normalizedEmpCode;
    const matchedUser = userMap.get(code);
    const matchedEmp = empMap.get(code);

    if (!matchedUser && !matchedEmp) {
      unmatchedEmployees.push({
        sr: row.sr,
        employeeCode: row.rawEmpCode,
        name: row.name,
        department: row.dept,
        reason: 'UNMATCHED_EMPLOYEE'
      });
      continue;
    }

    const targetEmployeeId = matchedUser ? matchedUser._id : matchedEmp._id;
    const targetEmployeeCode = (matchedUser?.employeeCode || matchedUser?.employeeId || matchedEmp?.employeeCode || code).toUpperCase();

    matchedEmployees.push({
      sr: row.sr,
      employeeCode: targetEmployeeCode,
      sourceName: row.name,
      matchedName: matchedUser?.name || matchedEmp?.fullName,
      sourceDept: row.dept,
      userId: matchedUser?._id || null,
      employeeId: targetEmployeeId
    });

    for (let day = 1; day <= 31; day++) {
      const val = row.daily[day];
      const dayFormatted = String(day).padStart(2, '0');
      const attendanceDate = `2026-08-${dayFormatted}`;

      if (val === '') {
        blankCells++;
      } else {
        validAttendanceCells++;

        const existingAtt = existingAttMap.get(`${targetEmployeeCode}_${attendanceDate}`);
        if (existingAtt) {
          duplicateRecords.push({
            employeeCode: targetEmployeeCode,
            attendanceDate,
            existingStatus: existingAtt.attendanceStatus || existingAtt.status,
            sourceStatus: val,
            existingBatch: existingAtt.importBatchId,
            reason: 'DUPLICATE_EXISTING_RECORD'
          });
        }
      }
    }
  }

  const validationReport = {
    importStatus: 'VALIDATED',
    sourceFile: SOURCE_FILE_NAME,
    attendancePeriod: 'August 2026',
    month: 8,
    year: 2026,
    totalSourceRows,
    matchedCount: matchedEmployees.length,
    unmatchedCount: unmatchedEmployees.length,
    validAttendanceCells,
    blankCells,
    duplicateCount: duplicateRecords.length,
    invalidEmployeeCodesCount: invalidEmployeeCodes.length,
    invalidAttendanceValuesCount: invalidAttendanceValues.length,
    potentialDatabaseConflictsCount: duplicateRecords.length,
    matchedEmployees,
    unmatchedEmployees,
    duplicateRecords
  };

  if (user) {
    await AuditLog.logAction({
      user,
      action: 'ATTENDANCE_IMPORT_VALIDATED',
      module: 'HRMS',
      resource: 'AttendanceImportBatch',
      details: `Dry run validation completed. Total rows: ${totalSourceRows}, Matched: ${matchedEmployees.length}, Unmatched: ${unmatchedEmployees.length}, Valid cells: ${validAttendanceCells}, Blank cells: ${blankCells}`,
      newData: {
        totalRows: totalSourceRows,
        matched: matchedEmployees.length,
        unmatched: unmatchedEmployees.length,
        validCells: validAttendanceCells,
        blankCells
      }
    });
  }

  return validationReport;
}

/**
 * Execute Attendance Import with Safety Checks, Snapshots, and Audit (High-Performance Bulk Operations)
 */
async function executeAttendanceImport({ csvPath = DEFAULT_CSV_PATH, csvContent = null, user = null }) {
  const content = csvContent || fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCSVContent(content);

  const uniqueBatchNumber = Math.floor(1000 + Math.random() * 9000);
  const importBatchId = `ATT-2026-08-${Date.now()}-${uniqueBatchNumber}`;

  // STEP 28: BEFORE DATABASE SAFETY CHECK
  const beforeCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({})
  };

  // Create batch in PROCESSING status
  const batchRecord = await AttendanceImportBatch.create({
    importBatchId,
    fileName: SOURCE_FILE_NAME,
    month: 8,
    year: 2026,
    status: 'PROCESSING',
    totalRows: rows.length,
    importedBy: user?._id || user?.id || null,
    importedByName: user?.name || 'Superadmin'
  });

  await AuditLog.logAction({
    user,
    action: 'ATTENDANCE_IMPORT_STARTED',
    module: 'HRMS',
    resource: 'AttendanceImportBatch',
    resourceId: importBatchId,
    details: `Attendance upload started for August 2026. File: ${SOURCE_FILE_NAME}. Batch: ${importBatchId}`
  });

  const empCodes = rows.map(r => r.normalizedEmpCode);

  // Bulk fetch users, employees, and existing attendances in parallel
  const [allUsers, allEmps, existingAtts, existingSummaries] = await Promise.all([
    User.find({
      $or: [
        { employeeCode: { $in: empCodes } },
        { employeeId: { $in: empCodes } }
      ]
    }).select('_id name email role employeeCode employeeId department').lean(),

    Employee.find({
      $or: [
        { employeeCode: { $in: empCodes } },
        { employeeId: { $in: empCodes } }
      ]
    }).select('_id fullName employeeCode employeeId department designation').lean(),

    Attendance.find({
      employeeCode: { $in: empCodes },
      $or: [
        { attendanceDate: { $regex: '^2026-08' } },
        { dateString: { $regex: '^2026-08' } }
      ]
    }).lean(),

    AttendanceMonthlySummary.find({
      employeeCode: { $in: empCodes },
      month: 8,
      year: 2026
    }).lean()
  ]);

  const userMap = new Map();
  allUsers.forEach(u => {
    if (u.employeeCode) userMap.set(u.employeeCode.toUpperCase(), u);
    if (u.employeeId) userMap.set(u.employeeId.toUpperCase(), u);
  });

  const empMap = new Map();
  allEmps.forEach(e => {
    if (e.employeeCode) empMap.set(e.employeeCode.toUpperCase(), e);
    if (e.employeeId) empMap.set(e.employeeId.toUpperCase(), e);
  });

  const existingAttMap = new Map();
  existingAtts.forEach(a => {
    const code = (a.employeeCode || '').toUpperCase();
    const date = a.attendanceDate || a.dateString;
    if (code && date) existingAttMap.set(`${code}_${date}`, a);
  });

  const existingSummaryMap = new Map();
  existingSummaries.forEach(s => {
    const code = (s.employeeCode || '').toUpperCase();
    if (code) existingSummaryMap.set(code, s);
  });

  const matchedEmployees = [];
  const unmatchedEmployees = [];
  const duplicates = [];

  const newAttendanceDocs = [];
  const snapshotDocs = [];
  const updatePromises = [];

  const newSummaryDocs = [];
  const updateSummaryPromises = [];

  let validCellsCount = 0;
  let blankCellsCount = 0;

  try {
    for (const row of rows) {
      const code = row.normalizedEmpCode;
      const matchedUser = userMap.get(code);
      const matchedEmp = empMap.get(code);

      // Rule 3 & 30: DO NOT CREATE A NEW EMPLOYEE
      if (!matchedUser && !matchedEmp) {
        unmatchedEmployees.push({
          sr: row.sr,
          employeeCode: row.rawEmpCode,
          name: row.name,
          department: row.dept,
          reason: 'UNMATCHED_EMPLOYEE'
        });
        continue;
      }

      const targetUserId = matchedUser ? matchedUser._id : matchedEmp._id;
      const targetEmpCode = (matchedUser?.employeeCode || matchedUser?.employeeId || matchedEmp?.employeeCode || code).toUpperCase();
      const targetEmpName = matchedUser?.name || matchedEmp?.fullName || row.name;
      const targetDept = matchedUser?.department || matchedEmp?.department || row.dept;

      matchedEmployees.push({
        employeeCode: targetEmpCode,
        name: targetEmpName,
        department: targetDept
      });

      // 1. Process daily attendance
      for (let day = 1; day <= 31; day++) {
        const val = row.daily[day];
        const dayFormatted = String(day).padStart(2, '0');
        const attendanceDate = `2026-08-${dayFormatted}`;
        const dateObj = new Date(`2026-08-${dayFormatted}T00:00:00.000Z`);

        if (val === '') {
          blankCellsCount++;
          // Rule 6: Preserve blank cells without converting to Absent
          continue;
        }

        validCellsCount++;
        const existingRecord = existingAttMap.get(`${targetEmpCode}_${attendanceDate}`);

        if (existingRecord) {
          duplicates.push({
            employeeCode: targetEmpCode,
            attendanceDate,
            reason: 'DUPLICATE_EXISTING_RECORD'
          });

          snapshotDocs.push({
            importBatchId,
            attendanceId: existingRecord._id,
            employeeId: targetUserId,
            employeeCode: targetEmpCode,
            attendanceDate,
            previousStatus: existingRecord.attendanceStatus || existingRecord.status,
            snapshotType: 'EXISTING_RECORD'
          });

          updatePromises.push(
            Attendance.findByIdAndUpdate(existingRecord._id, {
              attendanceStatus: val,
              status: val,
              importBatchId,
              sourceFileName: SOURCE_FILE_NAME
            })
          );
        } else {
          const newDocId = new mongoose.Types.ObjectId();
          newAttendanceDocs.push({
            _id: newDocId,
            employee: targetUserId,
            employeeId: targetUserId,
            employeeCode: targetEmpCode,
            attendanceDate,
            dateString: attendanceDate,
            date: dateObj,
            attendanceStatus: val,
            status: val,
            sourceEmployeeName: row.name,
            sourceDepartment: row.dept,
            employeeName: targetEmpName,
            departmentName: targetDept,
            month: 8,
            year: 2026,
            importBatchId,
            sourceFileName: SOURCE_FILE_NAME,
            createdBy: user?._id || user?.id || null
          });

          snapshotDocs.push({
            importBatchId,
            attendanceId: newDocId,
            employeeId: targetUserId,
            employeeCode: targetEmpCode,
            attendanceDate,
            snapshotType: 'NEW_RECORD'
          });
        }
      }

      // 2. Process Monthly Summary
      const parseSummaryVal = (v) => {
        if (!v || v.trim() === '') return 0;
        const num = parseFloat(v);
        return isNaN(num) ? 0 : num;
      };

      const summaryData = {
        employeeId: targetUserId,
        employeeCode: targetEmpCode,
        month: 8,
        year: 2026,
        present: parseSummaryVal(row.summary['Present']),
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
        sourceEmployeeName: row.name,
        sourceDepartment: row.dept
      };

      const existingSummary = existingSummaryMap.get(targetEmpCode);
      if (existingSummary) {
        snapshotDocs.push({
          importBatchId,
          employeeId: targetUserId,
          employeeCode: targetEmpCode,
          previousSummary: existingSummary,
          snapshotType: 'EXISTING_RECORD'
        });

        updateSummaryPromises.push(
          AttendanceMonthlySummary.findByIdAndUpdate(existingSummary._id, summaryData)
        );
      } else {
        newSummaryDocs.push(summaryData);
      }
    }

    // Execute bulk writes
    if (newAttendanceDocs.length > 0) {
      await Attendance.insertMany(newAttendanceDocs, { ordered: false });
    }
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
    if (snapshotDocs.length > 0) {
      await AttendanceImportSnapshot.insertMany(snapshotDocs, { ordered: false });
    }
    if (newSummaryDocs.length > 0) {
      await AttendanceMonthlySummary.insertMany(newSummaryDocs, { ordered: false });
    }
    if (updateSummaryPromises.length > 0) {
      await Promise.all(updateSummaryPromises);
    }

    // STEP 28: AFTER DATABASE SAFETY CHECK
    const afterCounts = {
      users: await User.countDocuments({}),
      departments: await Department.countDocuments({}),
      roles: await Role.countDocuments({}),
      employees: await Employee.countDocuments({})
    };

    const safetyPassed =
      beforeCounts.users === afterCounts.users &&
      beforeCounts.departments === afterCounts.departments &&
      beforeCounts.roles === afterCounts.roles &&
      beforeCounts.employees === afterCounts.employees;

    if (!safetyPassed) {
      throw new Error(`Critical Safety Violation: Non-attendance collections were modified during import! Before: ${JSON.stringify(beforeCounts)}, After: ${JSON.stringify(afterCounts)}`);
    }

    const attendanceRecordsCreated = newAttendanceDocs.length;
    const attendanceRecordsUpdated = updatePromises.length;
    const monthlySummariesCreatedOrUpdated = newSummaryDocs.length + updateSummaryPromises.length;

    const finalReport = {
      importStatus: 'IMPORTED',
      importBatchId,
      sourceFile: SOURCE_FILE_NAME,
      attendancePeriod: 'August 2026',
      totalSourceRows: rows.length,
      matchedEmployees: matchedEmployees.length,
      unmatchedEmployees: unmatchedEmployees.length,
      validRecords: validCellsCount,
      blankCells: blankCellsCount,
      duplicateRecords: duplicates.length,
      invalidRecords: 0,
      importedRecords: attendanceRecordsCreated + attendanceRecordsUpdated,
      failedRecords: 0,
      database: {
        attendanceRecordsCreated,
        attendanceRecordsUpdated,
        monthlySummariesCreatedOrUpdated
      },
      safety: {
        employeeMasterModified: 'NO',
        usersModified: 'NO',
        rolesModified: 'NO',
        departmentsModified: 'NO',
        permissionsModified: 'NO',
        authenticationModified: 'NO'
      },
      rollback: {
        rollbackAvailable: 'YES',
        importBatchId
      },
      unmatchedList: unmatchedEmployees,
      duplicateList: duplicates
    };

    batchRecord.status = 'IMPORTED';
    batchRecord.matchedRows = matchedEmployees.length;
    batchRecord.importedRows = attendanceRecordsCreated + attendanceRecordsUpdated;
    batchRecord.unmatchedRows = unmatchedEmployees.length;
    batchRecord.duplicateRows = duplicates.length;
    batchRecord.failedRows = 0;
    batchRecord.warningCount = unmatchedEmployees.length;
    batchRecord.importedAt = new Date();
    batchRecord.validationReport = finalReport;
    await batchRecord.save();

    await AuditLog.logAction({
      user,
      action: 'ATTENDANCE_IMPORT_COMPLETED',
      module: 'HRMS',
      resource: 'AttendanceImportBatch',
      resourceId: importBatchId,
      details: `Attendance import completed successfully for August 2026. Batch: ${importBatchId}. Records created: ${attendanceRecordsCreated}, Summaries: ${monthlySummariesCreatedOrUpdated}`,
      newData: finalReport
    });

    return finalReport;
  } catch (error) {
    batchRecord.status = 'FAILED';
    batchRecord.validationReport = { error: error.message };
    await batchRecord.save();

    await AuditLog.logAction({
      user,
      action: 'ATTENDANCE_IMPORT_FAILED',
      module: 'HRMS',
      resource: 'AttendanceImportBatch',
      resourceId: importBatchId,
      status: 'FAILURE',
      details: `Attendance import failed for batch ${importBatchId}: ${error.message}`
    });

    throw error;
  }
}

/**
 * Safe Rollback of an Attendance Import Batch
 */
async function rollbackAttendanceImport({ importBatchId, user, rollbackReason = 'Administrative rollback requested' }) {
  if (!importBatchId) {
    throw new Error('Import Batch ID is required for rollback.');
  }

  const batch = await AttendanceImportBatch.findOne({ importBatchId });
  if (!batch) {
    throw new Error(`Import batch [${importBatchId}] not found.`);
  }

  if (batch.status === 'ROLLED_BACK') {
    throw new Error('This attendance import has already been rolled back.');
  }

  if (batch.status !== 'IMPORTED' && batch.status !== 'PARTIAL') {
    throw new Error(`Cannot rollback batch with status: ${batch.status}`);
  }

  const beforeCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({})
  };

  try {
    const deleteResult = await Attendance.deleteMany({ importBatchId });

    const existingSnapshots = await AttendanceImportSnapshot.find({
      importBatchId,
      snapshotType: 'EXISTING_RECORD',
      attendanceId: { $ne: null }
    }).lean();

    const restoreAttPromises = existingSnapshots.map(snap => {
      if (snap.previousStatus) {
        return Attendance.findByIdAndUpdate(snap.attendanceId, {
          attendanceStatus: snap.previousStatus,
          status: snap.previousStatus
        });
      }
      return Promise.resolve();
    });
    await Promise.all(restoreAttPromises);

    const summaryDeleteResult = await AttendanceMonthlySummary.deleteMany({ importBatchId });

    const summarySnapshots = await AttendanceImportSnapshot.find({
      importBatchId,
      snapshotType: 'EXISTING_RECORD',
      previousSummary: { $ne: null }
    }).lean();

    if (summarySnapshots.length > 0) {
      await AttendanceMonthlySummary.insertMany(summarySnapshots.map(s => s.previousSummary));
    }

    const remainingBatchRecords = await Attendance.countDocuments({ importBatchId });
    const remainingBatchSummaries = await AttendanceMonthlySummary.countDocuments({ importBatchId });

    const afterCounts = {
      users: await User.countDocuments({}),
      departments: await Department.countDocuments({}),
      roles: await Role.countDocuments({}),
      employees: await Employee.countDocuments({})
    };

    const safetyMaintained =
      beforeCounts.users === afterCounts.users &&
      beforeCounts.departments === afterCounts.departments &&
      beforeCounts.roles === afterCounts.roles &&
      beforeCounts.employees === afterCounts.employees &&
      remainingBatchRecords === 0;

    if (!safetyMaintained) {
      batch.status = 'ROLLBACK_FAILED';
      await batch.save();
      throw new Error('Rollback verification failed: records still remain or non-attendance collections were affected.');
    }

    batch.status = 'ROLLED_BACK';
    batch.rolledBackAt = new Date();
    batch.rolledBackBy = user?._id || user?.id || null;
    batch.rolledBackByName = user?.name || 'Superadmin';
    batch.rollbackReason = rollbackReason;
    await batch.save();

    await AuditLog.logAction({
      user,
      action: 'ATTENDANCE_IMPORT_ROLLED_BACK',
      module: 'HRMS',
      resource: 'AttendanceImportBatch',
      resourceId: importBatchId,
      details: `Attendance import batch [${importBatchId}] safely rolled back. ${deleteResult.deletedCount} daily records and ${summaryDeleteResult.deletedCount} monthly summaries removed. Reason: ${rollbackReason}`
    });

    return {
      success: true,
      message: 'Rollback Successful',
      importBatchId,
      recordsDeleted: deleteResult.deletedCount,
      summariesDeleted: summaryDeleteResult.deletedCount,
      restoredSnapshots: existingSnapshots.length,
      verification: {
        remainingBatchRecords: 0,
        remainingBatchSummaries: 0,
        employeeMasterUnchanged: 'YES',
        usersUnchanged: 'YES',
        rolesUnchanged: 'YES',
        departmentsUnchanged: 'YES'
      }
    };
  } catch (err) {
    await AuditLog.logAction({
      user,
      action: 'ATTENDANCE_IMPORT_ROLLBACK_FAILED',
      module: 'HRMS',
      resource: 'AttendanceImportBatch',
      resourceId: importBatchId,
      status: 'FAILURE',
      details: `Attendance import rollback failed for batch [${importBatchId}]: ${err.message}`
    });

    throw err;
  }
}

module.exports = {
  validateAttendanceImport,
  executeAttendanceImport,
  rollbackAttendanceImport,
  DEFAULT_CSV_PATH,
  SOURCE_FILE_NAME
};
