const fs = require('fs');
const path = require('path');

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

const seedDir = path.join(__dirname, '..', 'seed');

["Attendance Sheet_Apr'26(APR 2026).csv", "Attendance Sheet_May'26(MAY 2026).csv"].forEach(file => {
  const lines = fs.readFileSync(path.join(seedDir, file), 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
  console.log('=== FILE:', file, '===');
  console.log('Col names (line 1):', parseCSVLine(lines[1]));
  console.log('Row 3:', parseCSVLine(lines[3]));
  console.log('Row 4:', parseCSVLine(lines[4]));
});
