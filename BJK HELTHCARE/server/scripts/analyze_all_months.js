const fs = require('fs');
const path = require('path');

const seedDir = path.join(__dirname, '..', 'seed');

function parseCSVLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += c;
    }
  }
  result.push(curr.trim());
  return result;
}

const targetFiles = [
  { month: 4, name: 'April 2026', file: "Attendance Sheet_Apr'26(APR 2026).csv", days: 30 },
  { month: 5, name: 'May 2026', file: "Attendance Sheet_May'26(MAY 2026).csv", days: 31 },
  { month: 6, name: 'June 2026', file: "Attendance Sheet_June'26(JUNE 2026).csv", days: 30 },
  { month: 7, name: 'July 2026', file: 'Attendance Sheet_July 2026(JULY 2026).csv', days: 31 },
  { month: 8, name: 'August 2026', file: '08 Attendance Sheet_Aug 2026(AUG 2026).csv', days: 31 },
  { month: 9, name: 'September 2026', file: 'Attendance Sheet_Sep 2026(SEP 2026).csv', days: 30 }
];

targetFiles.forEach(tf => {
  const filePath = path.join(seedDir, tf.file);
  if (!fs.existsSync(filePath)) {
    console.log('MISSING FILE:', tf.file);
    return;
  }
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
  console.log('==============================================');
  console.log(`MONTH ${tf.month}: ${tf.name} (${tf.file})`);
  console.log('Line 1 (Header):', parseCSVLine(lines[0]));
  console.log('Line 2 (Columns):', parseCSVLine(lines[1]));
  console.log('Line 3 (Weekdays):', parseCSVLine(lines[2]));

  const dataRows = [];
  for (let i = 3; i < lines.length; i++) {
    const parsed = parseCSVLine(lines[i]);
    const srNo = parsed[0];
    const empCode = parsed[1];
    const empName = parsed[2];
    if (srNo && !isNaN(parseInt(srNo)) && (empCode || empName)) {
      dataRows.push({ idx: i, srNo, empCode, empName, dept: parsed[3], raw: parsed });
    }
  }
  console.log(`Total Employee Data Rows: ${dataRows.length}`);
  if (dataRows.length > 0) {
    console.log('First Row:', dataRows[0].srNo, dataRows[0].empCode, dataRows[0].empName, 'Dept col:', dataRows[0].dept);
    console.log('Last Row:', dataRows[dataRows.length-1].srNo, dataRows[dataRows.length-1].empCode, dataRows[dataRows.length-1].empName, 'Dept col:', dataRows[dataRows.length-1].dept);
    
    // Check missing codes/names/depts
    const missingCodes = dataRows.filter(r => !r.empCode);
    const missingNames = dataRows.filter(r => !r.empName);
    const missingDepts = dataRows.filter(r => !r.dept || !isNaN(parseFloat(r.dept)) || ['P','AB','WO','CL','SL','CO','PH'].includes(r.dept));
    console.log(`Missing/Blank codes: ${missingCodes.length}`, missingCodes.map(c => ({ sr: c.srNo, name: c.empName })));
    console.log(`Missing/Blank names: ${missingNames.length}`);
    console.log(`Missing/Blank or non-dept column in raw[3]: ${missingDepts.length}`);
  }
});
