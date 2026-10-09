require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');

const MONTH_FILES = [
  { month: 1, year: 2026, days: 31, file: "Attendance Sheet_Jan'25(Jan 2026).csv" },
  { month: 2, year: 2026, days: 28, file: "Attendance Sheet_Feb'25(FEB 2026).csv" },
  { month: 3, year: 2026, days: 31, file: "Attendance Sheet_Mar'26(MAR 2026).csv" },
  { month: 4, year: 2026, days: 30, file: "Attendance Sheet_Apr'26(APR 2026).csv" },
  { month: 5, year: 2026, days: 31, file: "Attendance Sheet_May'26(MAY 2026).csv" },
  { month: 6, year: 2026, days: 30, file: "Attendance Sheet_June'26(JUNE 2026).csv" },
  { month: 7, year: 2026, days: 31, file: "Attendance Sheet_July 2026(JULY 2026).csv" },
  { month: 8, year: 2026, days: 31, file: "08 Attendance Sheet_Aug 2026(AUG 2026).csv" },
  { month: 9, year: 2026, days: 30, file: "Attendance Sheet_Sep 2026(SEP 2026).csv" }
];

const DIR = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace';

async function testParse() {
  await connectDB();
  const allUsers = await User.find({}).lean();
  const allEmployees = await Employee.find({}).lean();

  const userMap = new Map();
  const nameMap = new Map();

  allUsers.forEach(u => {
    if (u.employeeCode) userMap.set(u.employeeCode.toUpperCase().trim(), u);
    if (u.employeeId) userMap.set(u.employeeId.toUpperCase().trim(), u);
    if (u.name) nameMap.set(u.name.toLowerCase().replace(/[^a-z0-9]/g, ''), u);
  });

  allEmployees.forEach(e => {
    const code = (e.employeeCode || e.employeeId || '').toUpperCase().trim();
    if (code && !userMap.has(code)) userMap.set(code, e);
    const cleanName = (e.fullName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanName && !nameMap.has(cleanName)) nameMap.set(cleanName, e);
  });

  console.log(`Master Users: ${allUsers.length}, Master Employees: ${allEmployees.length}\n`);

  for (const item of MONTH_FILES) {
    const filePath = path.join(DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`MISSING FILE: ${item.file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

    console.log(`=== MONTH ${item.month} / ${item.year} (${item.file}) ===`);
    console.log(`Total lines: ${lines.length}`);

    // Parse header and rows
    const headerLine = lines[1].split(',');
    const dayIndices = [];
    for (let col = 1; col < headerLine.length; col++) {
      const val = parseInt(headerLine[col]?.trim(), 10);
      if (!isNaN(val) && val >= 1 && val <= item.days) {
        dayIndices.push({ day: val, colIndex: col });
      }
    }

    console.log(`Detected Day Columns: 1 to ${dayIndices.length}`);

    let matchedCount = 0;
    let unmatchedCount = 0;
    let dailyRecordsCount = 0;

    for (let r = 3; r < lines.length; r++) {
      const rawCols = lines[r].split(',');
      const sr = rawCols[0]?.trim();
      if (!sr || isNaN(parseInt(sr, 10))) continue;

      let rawEmpCode = '';
      let rawName = '';
      let rawDept = '';

      if (item.month === 1) {
        // Jan format: Sr, Name, Dept, Days...
        rawName = rawCols[1]?.trim();
        rawDept = rawCols[2]?.trim();
        const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matched = nameMap.get(cleanName);
        if (matched) {
          rawEmpCode = matched.employeeCode || matched.employeeId;
          if (!rawDept) rawDept = matched.department;
        }
      } else {
        rawEmpCode = rawCols[1]?.trim();
        rawName = rawCols[2]?.trim();
        rawDept = rawCols[3]?.trim();
      }

      const code = (rawEmpCode || '').toUpperCase().trim();
      let matched = userMap.get(code);
      if (!matched && rawName) {
        const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        matched = nameMap.get(cleanName);
        if (matched) rawEmpCode = matched.employeeCode || matched.employeeId;
      }

      if (matched || rawEmpCode) {
        matchedCount++;
        // Count non-empty days
        dayIndices.forEach(({ day, colIndex }) => {
          const val = rawCols[colIndex]?.trim();
          if (val && val !== 'LEFT' && val !== 'Not Joined' && val !== '-') {
            dailyRecordsCount++;
          }
        });
      } else {
        unmatchedCount++;
        console.log(`  Unmatched Row: Sr=${sr}, Code=${rawEmpCode}, Name=${rawName}`);
      }
    }

    console.log(`  Matched Rows: ${matchedCount}, Unmatched: ${unmatchedCount}, Daily Records: ${dailyRecordsCount}\n`);
  }

  process.exit(0);
}

testParse().catch(err => {
  console.error(err);
  process.exit(1);
});
