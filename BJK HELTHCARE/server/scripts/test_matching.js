require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function testMatch() {
  await connectDB();
  const User = require('../models/User');
  const Employee = require('../models/Employee');

  const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\08 Attendance Sheet_Aug 2026(AUG 2026).csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  // Line 0: Aug-26...
  // Line 1: Sr. NO.,Emp. Code,Name ,Dept.,1,2,...
  // Line 2: ,,,,SA,SU,MO...
  // Line 3..: Data rows
  console.log(`Total CSV lines: ${lines.length}`);
  const headerCols = lines[1].split(',');
  console.log('Headers count:', headerCols.length);

  const codes = [];
  for (let i = 3; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const sr = cols[0]?.trim();
    const empCode = cols[1]?.trim();
    const name = cols[2]?.trim();
    const dept = cols[3]?.trim();
    if (empCode) {
      codes.push({ sr, empCode, name, dept });
    }
  }

  console.log(`Found ${codes.length} employee rows in CSV.`);

  let matchedUsers = 0;
  let matchedEmps = 0;
  const unmatched = [];

  for (const c of codes) {
    // Check User
    const user = await User.findOne({
      $or: [
        { employeeCode: { $regex: new RegExp(`^${c.empCode}$`, 'i') } },
        { employeeId: { $regex: new RegExp(`^${c.empCode}$`, 'i') } }
      ]
    }).lean();

    // Check Employee
    const emp = await Employee.findOne({
      $or: [
        { employeeCode: { $regex: new RegExp(`^${c.empCode}$`, 'i') } },
        { employeeId: { $regex: new RegExp(`^${c.empCode}$`, 'i') } }
      ]
    }).lean();

    if (user) matchedUsers++;
    if (emp) matchedEmps++;
    if (!user && !emp) {
      unmatched.push(c);
    } else {
      console.log(`Matched ${c.empCode} (${c.name}): User=${user ? user._id : 'NO'}, Emp=${emp ? emp._id : 'NO'}, user.empCode=${user?.employeeCode}, user.empId=${user?.employeeId}`);
    }
  }

  console.log(`\nResults:`);
  console.log(`Matched in User: ${matchedUsers}/${codes.length}`);
  console.log(`Matched in Employee: ${matchedEmps}/${codes.length}`);
  console.log(`Unmatched completely: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched rows:', unmatched);
  }

  await mongoose.disconnect();
}

testMatch().catch(err => {
  console.error(err);
  process.exit(1);
});
