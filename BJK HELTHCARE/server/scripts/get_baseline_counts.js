require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function getBaseline() {
  await connectDB();
  const db = mongoose.connection.db;

  const userCount = await db.collection('users').countDocuments({});
  const empCount = await db.collection('employees').countDocuments({});
  const deptCount = await db.collection('departments').countDocuments({});
  const roleCount = await db.collection('roles').countDocuments({});
  const attendanceCount = await db.collection('attendances').countDocuments({});
  const monthlySummaryCount = await db.collection('attendance_monthly_summaries').countDocuments({});
  const batchCount = await db.collection('attendance_import_batches').countDocuments({});
  const snapshotCount = await db.collection('attendance_import_snapshots').countDocuments({});

  // Subdepartments & Designations from Departments or Employees
  const subDepts = await db.collection('employees').distinct('subDepartment');
  const designations = await db.collection('employees').distinct('designationTitle');

  const baseline = {
    totalUsers: userCount,
    totalEmployees: empCount,
    totalDepartments: deptCount,
    totalRoles: roleCount,
    totalSubDepartments: subDepts.filter(Boolean).length,
    totalDesignations: designations.filter(Boolean).length,
    totalAttendanceRecords: attendanceCount,
    totalMonthlySummaries: monthlySummaryCount,
    totalImportBatches: batchCount,
    totalSnapshots: snapshotCount
  };

  console.log('=== BASELINE DATABASE COUNTS ===');
  console.log(JSON.stringify(baseline, null, 2));

  // Also check active August 2026 batches
  const batches = await db.collection('attendance_import_batches').find({}).toArray();
  console.log('\n=== ATTENDANCE IMPORT BATCHES ===');
  batches.forEach(b => {
    console.log(`Batch: ${b.importBatchId} | Status: ${b.status} | TotalRows: ${b.totalRows} | Matched: ${b.matchedRows} | Daily: ${b.importedDailyRecords || b.importedRows} | Summaries: ${b.importedMonthlySummaries}`);
  });

  await mongoose.disconnect();
}

getBaseline().catch(err => {
  console.error(err);
  process.exit(1);
});
