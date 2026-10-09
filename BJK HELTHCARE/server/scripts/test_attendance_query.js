require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function testQuery() {
  await connectDB();
  const Attendance = require('../models/hrms/Attendance');

  const q1 = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' } });
  console.log('1. DateString 2026-08-01 to 2026-08-31:', q1);

  const q2 = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' }, branchName: 'Ahmedabad' });
  console.log('2. branchName "Ahmedabad":', q2);

  const q2b = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' }, branchName: { $regex: /Ahmedabad/i } });
  console.log('2b. branchName regex /Ahmedabad/i:', q2b);

  const q3 = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' }, departmentName: 'Production' });
  console.log('3. departmentName "Production":', q3);

  const q4 = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' }, sourceDepartment: 'Production' });
  console.log('4. sourceDepartment "Production":', q4);

  const q5 = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' }, status: { $in: ['PRESENT', 'LATE', 'HALF_DAY'] } });
  console.log('5. status $in ["PRESENT", "LATE", "HALF_DAY"]:', q5);

  const q6 = await Attendance.countDocuments({ dateString: { $gte: '2026-08-01', $lte: '2026-08-31' }, status: { $in: ['P', 'PRESENT', 'P1/2', 'M'] } });
  console.log('6. status $in ["P", "PRESENT", "P1/2", "M"]:', q6);

  await mongoose.disconnect();
}

testQuery().catch(console.error);
