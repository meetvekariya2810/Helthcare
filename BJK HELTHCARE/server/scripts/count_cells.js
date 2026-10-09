const fs = require('fs');

const csvPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\08 Attendance Sheet_Aug 2026(AUG 2026).csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

let totalCells = 0;
let filledCells = 0;
let blankCells = 0;

let matchedTotalCells = 0;
let matchedFilledCells = 0;
let matchedBlankCells = 0;

const unmatchedCodes = ['BH1030', 'BH1079'];

for (let i = 3; i < lines.length; i++) {
  const cols = lines[i].split(',');
  const empCode = cols[1]?.trim();
  const isMatched = !unmatchedCodes.includes(empCode);

  for (let day = 1; day <= 31; day++) {
    const val = cols[3 + day] !== undefined ? cols[3 + day].trim() : '';
    totalCells++;
    if (val !== '') filledCells++;
    else blankCells++;

    if (isMatched) {
      matchedTotalCells++;
      if (val !== '') matchedFilledCells++;
      else matchedBlankCells++;
    }
  }
}

console.log('ALL 49 EMPLOYEES:');
console.log(`Total daily cells: ${totalCells}`);
console.log(`Filled cells: ${filledCells}`);
console.log(`Blank cells: ${blankCells}`);

console.log('\n47 MATCHED EMPLOYEES:');
console.log(`Total daily cells: ${matchedTotalCells}`);
console.log(`Filled cells: ${matchedFilledCells}`);
console.log(`Blank cells: ${matchedBlankCells}`);
