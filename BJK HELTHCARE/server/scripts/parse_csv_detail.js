const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\08 Attendance Sheet_Aug 2026(AUG 2026).csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

console.log('Line 0:', lines[0]);
console.log('Line 1 (headers):', lines[1]);
console.log('Line 2 (days of week):', lines[2]);

const headers = lines[1].split(',').map(h => h.trim());
console.log('\nParsed Headers:');
headers.forEach((h, idx) => console.log(`  [${idx}] "${h}"`));

const dailyStatuses = new Set();
const summaryKeys = headers.slice(35);
console.log('\nSummary columns:', summaryKeys);

const rows = [];
for (let i = 3; i < lines.length; i++) {
  const rawCols = lines[i].split(',');
  const row = {
    sr: rawCols[0]?.trim(),
    empCode: rawCols[1]?.trim(),
    name: rawCols[2]?.trim(),
    dept: rawCols[3]?.trim(),
    daily: {},
    summary: {}
  };

  // Days 1 to 31 are cols index 4 to 34
  for (let day = 1; day <= 31; day++) {
    const val = rawCols[3 + day] !== undefined ? rawCols[3 + day].trim() : '';
    row.daily[day] = val;
    if (val !== '') dailyStatuses.add(val);
  }

  // Summary cols index 35 to 43
  headers.slice(35).forEach((h, hIdx) => {
    const val = rawCols[35 + hIdx] !== undefined ? rawCols[35 + hIdx].trim() : '';
    row.summary[h] = val;
  });

  rows.push(row);
}

console.log(`\nParsed ${rows.length} employee rows.`);
console.log('Unique Daily Statuses found in CSV:', Array.from(dailyStatuses));

console.log('\nSample Row 1:');
console.dir(rows[0], { depth: 3 });

console.log('\nSample Row 8 (LEFT):');
console.dir(rows[7], { depth: 3 });

console.log('\nSample Row 49 (Sachinkumar):');
console.dir(rows[48], { depth: 3 });
