const path = require('path');
const {
  parseMasterFile,
  validateMasterRecords
} = require('../services/hrms/employeeMasterMigrationService');

async function testParsing() {
  const csvPath = path.join(__dirname, '../uploads/Employee Master Detail(Sheet 1).csv');
  console.log('Testing parseMasterFile on:', csvPath);

  const parsed = await parseMasterFile(csvPath, true);
  console.log('Is Master Detail:', parsed.isMasterDetailHeader);
  console.log('Total Parsed Rows:', parsed.totalParsedRows);

  const validation = await validateMasterRecords(parsed.records);
  console.log('\n--- Validation Result ---');
  console.log('Total Rows:', validation.totalRows);
  console.log('Valid Count:', validation.validCount);
  console.log('Invalid Count:', validation.invalidCount);
  console.log('Duplicate Count:', validation.duplicateCount);
  console.log('Active Employees:', validation.activeCount);
  console.log('Inactive Employees:', validation.inactiveCount);
  console.log('Departments Detected (' + validation.departmentsDetected.length + '):');
  validation.departmentsDetected.forEach(d => {
    console.log(` - ${d.name} (${d.code}): ${d.employeeCount} employees, SubDepts: [${d.subDepartments.join(', ')}]`);
  });

  if (validation.invalidRecords.length > 0) {
    console.log('\nInvalid Record Details:');
    validation.invalidRecords.forEach(r => {
      console.log(` - Row #${r.rowNumber} (${r.fullName}): ${r.errors.join('; ')}`);
    });
  }

  console.log('\nSample Valid Records:');
  validation.validRecords.slice(0, 3).forEach(r => {
    console.log(` - [${r.employeeCode}] ${r.fullName} | Dept: ${r.department} | Desig: ${r.designation} | Role: ${r.mappedRole} | Status: ${r.accountStatus}`);
  });
}

testParsing().catch(console.error);
