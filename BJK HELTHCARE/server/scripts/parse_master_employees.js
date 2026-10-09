const fs = require('fs');

const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\Employee Master Detail(Sheet 1).csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/);

const headerCols = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''));
console.log('Header columns (first 20):', headerCols.slice(0, 20));

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.replace(/[,\"\s]/g, '')) continue;
  const cols = line.split(',');
  const row = {
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
  };
  rows.push(row);
}

console.log(`Total Master Employees found: ${rows.length}`);
console.log('\nAll Master Employee Codes and Names:');
rows.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.empCode}] ${r.name} | Dept: ${r.dept} | SubDept: ${r.subDept || '-'} | Desig: ${r.designation} | DOJ: ${r.doj} | Gender: ${r.gender}`);
});
