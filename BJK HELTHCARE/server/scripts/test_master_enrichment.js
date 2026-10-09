require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

function parseDateDMY(dStr) {
  if (!dStr) return null;
  const parts = dStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  return null;
}

function parseMasterCSV() {
  const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\Employee Master Detail(Sheet 1).csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.replace(/[,\"\s]/g, '').length > 0);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    rows.push({
      sr: cols[0]?.trim(),
      empCode: cols[1]?.trim().toUpperCase(),
      name: cols[2]?.trim(),
      doj: cols[3]?.trim(),
      gender: cols[4]?.trim() ? (cols[4].trim().toUpperCase() === 'FEMALE' ? 'Female' : 'Male') : '',
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
  return rows;
}

async function dryRunMasterEnrichment() {
  await connectDB();
  const Employee = require('../models/Employee');
  const User = require('../models/User');

  const rows = parseMasterCSV();
  console.log(`Parsed ${rows.length} rows from Master CSV.`);

  let matchedCount = 0;
  let missingCount = 0;
  const missingList = [];
  const sampleEnrichments = [];

  for (const row of rows) {
    if (!row.empCode) {
      console.log(`Row without code: ${row.name}`);
      continue;
    }

    const emp = await Employee.findOne({
      $or: [{ employeeCode: row.empCode }, { employeeId: row.empCode }]
    }).lean();

    if (!emp) {
      missingCount++;
      missingList.push({ code: row.empCode, name: row.name, dol: row.dol });
    } else {
      matchedCount++;
      if (sampleEnrichments.length < 5) {
        sampleEnrichments.push({
          empCode: row.empCode,
          name: row.name,
          currentBank: emp.bankName || 'EMPTY',
          newBank: row.bankName,
          currentAccount: emp.bankAccountNumber || 'EMPTY',
          newAccount: row.accountNumber,
          currentIFSC: emp.ifscCode || 'EMPTY',
          newIFSC: row.ifsc,
          currentPAN: emp.panNumber || 'EMPTY',
          newPAN: row.pan,
          currentAadhaar: emp.aadhaarNumber || 'EMPTY',
          newAadhaar: row.aadhaar,
          currentUAN: emp.uanNumber || 'EMPTY',
          newUAN: row.uan,
          currentDOB: emp.dateOfBirth,
          newDOB: parseDateDMY(row.dob),
          currentDOJ: emp.dateOfJoining,
          newDOJ: parseDateDMY(row.doj),
          currentSubDept: emp.subDepartment || '-',
          newSubDept: row.subDept || '-',
          currentGender: emp.gender,
          newGender: row.gender,
          currentAge: emp.age || 'EMPTY',
          newAge: row.age,
          currentYearsOfService: emp.yearsOfService || 'EMPTY',
          newYearsOfService: row.yearsOfService
        });
      }
    }
  }

  console.log(`\nMatched in DB: ${matchedCount}`);
  console.log(`Missing in DB: ${missingCount}`);
  console.log(`Missing List:`, JSON.stringify(missingList, null, 2));
  console.log(`\nSample Planned Enrichments (first 5):`);
  console.dir(sampleEnrichments, { depth: 2 });

  await mongoose.disconnect();
}

dryRunMasterEnrichment().catch(err => {
  console.error(err);
  process.exit(1);
});
