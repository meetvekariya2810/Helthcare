const fs = require('fs');

const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\Employee Master Detail(Sheet 1).csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/);
console.log('Total lines in CSV:', lines.length);

const nonEmptyLines = [];
for (let i = 0; i < lines.length; i++) {
  // Check if line contains any character other than commas, quotes, and whitespace
  const clean = lines[i].replace(/[,\"\s]/g, '');
  if (clean.length > 0) {
    nonEmptyLines.push({ lineIndex: i, text: lines[i].slice(0, 300) });
  }
}

console.log('Non-empty lines count:', nonEmptyLines.length);
console.log('First 15 non-empty lines:');
nonEmptyLines.slice(0, 15).forEach(l => console.log(`[Line ${l.lineIndex}] ${l.text}`));

// Also inspect the first 100 bytes of Employee Master Detail.xlsx
const xlsxPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\Employee Master Detail.xlsx';
const buf = fs.readFileSync(xlsxPath);
console.log('\nXLSX file size:', buf.length);
console.log('First 32 bytes (hex):', buf.slice(0, 32).toString('hex'));
console.log('First 64 bytes (ascii):', buf.slice(0, 64).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
