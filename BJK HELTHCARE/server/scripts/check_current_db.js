require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const Attendance = require('../models/hrms/Attendance');

async function check() {
  await connectDB();
  const summaries = await AttendanceMonthlySummary.aggregate([
    { $group: { _id: { month: '$month', year: '$year' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  console.log('Current Monthly Summaries in DB:');
  console.log(JSON.stringify(summaries, null, 2));

  const attendances = await Attendance.aggregate([
    { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  console.log('Current Daily Attendances in DB:');
  console.log(JSON.stringify(attendances, null, 2));
  process.exit(0);
}
check();
