require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function compareMasterWithDB() {
  await connectDB();
  const User = require('../models/User');
  const Employee = require('../models/Employee');

  const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\Employee Master Detail(Sheet 1).csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.replace(/[,\"\s]/g, '').length > 0);

  const excelRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    excelRows.push({
      sr: cols[0]?.trim(),
      empCode: cols[1]?.trim().toUpperCase(),
      name: cols[2]?.trim(),
      doj: cols[3]?.trim(),
      gender: cols[4]?.trim(),
      dept: cols[5]?.trim(),
      subDept: cols[6]?.trim(),
      designation: cols[7]?.trim(),
      dol: cols[8]?.trim(),
      yearsOfService: cols[9]?.trim(),
      dob: cols[10]?.trim(),
      aadhaar: cols[11]?.trim(),
      pan: cols[12]?.trim(),
      bankName: cols[13]?.trim(),
      accountNumber: cols[14]?.trim(),
      ifsc: cols[15]?.trim(),
      uan: cols[16]?.trim(),
      age: cols[17]?.trim()
    });
  }

  console.log(`Total rows in Excel/CSV: ${excelRows.length}`);

  let matchedInUser = 0;
  let matchedInEmp = 0;
  const missingInUser = [];
  const missingInEmp = [];
  const matchedList = [];

  for (const row of excelRows) {
    if (!row.empCode) {
      console.log(`Row without employee code: [${row.sr}] ${row.name}`);
      continue;
    }

    const u = await User.findOne({
      $or: [
        { employeeCode: row.empCode },
        { employeeId: row.empCode }
      ]
    }).lean();

    const e = await Employee.findOne({
      $or: [
        { employeeCode: row.empCode },
        { employeeId: row.empCode }
      ]
    }).lean();

    if (u) matchedInUser++;
    else missingInUser.push(row);

    if (e) matchedInEmp++;
    else missingInEmp.push(row);

    if (u || e) {
      matchedList.push({
        code: row.empCode,
        name: row.name,
        userExists: !!u,
        empExists: !!e,
        dbUserDept: u?.department,
        excelDept: row.dept,
        dbUserDesig: u?.designation,
        excelDesig: row.designation,
        dbEmpBank: e?.bankDetails?.accountNumber,
        excelBank: row.accountNumber,
        dbEmpPan: e?.statutoryDetails?.panNumber || e?.pan,
        excelPan: row.pan,
        dbEmpAadhaar: e?.statutoryDetails?.aadhaarNumber || e?.aadhaar,
        excelAadhaar: row.aadhaar
      });
    }
  }

  console.log(`\nMatching Results against Existing DB:`);
  console.log(`Matched in User: ${matchedInUser}/${excelRows.length}`);
  console.log(`Matched in Employee: ${matchedInEmp}/${excelRows.length}`);
  console.log(`Missing in User (${missingInUser.length}):`, missingInUser.map(m => `${m.empCode} (${m.name})`));
  console.log(`Missing in Employee (${missingInEmp.length}):`, missingInEmp.map(m => `${m.empCode} (${m.name})`));

  console.log('\nSample Matched Comparison (first 5):');
  console.dir(matchedList.slice(0, 5), { depth: 2 });

  await mongoose.disconnect();
}

compareMasterWithDB().catch(console.error);
