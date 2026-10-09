const ExcelJS = require('exceljs');
const path = require('path');

async function inspectMultiSheet() {
  const filePath = path.join(__dirname, '../artifacts_test/Live_Test3_MultiSheet_Summary_Detailed.xlsx');
  console.log('Inspecting multi-sheet workbook:', filePath);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  console.log('Worksheet count:', workbook.worksheets.length);
  workbook.worksheets.forEach((ws, i) => {
    console.log(`Sheet ${i + 1}: "${ws.name}", Rows: ${ws.rowCount}, Columns: ${ws.columnCount}`);
  });

  const sumSheet = workbook.getWorksheet('Executive Summary');
  if (sumSheet) {
    console.log('\n--- Executive Summary Rows ---');
    for (let r = 1; r <= Math.min(sumSheet.rowCount, 12); r++) {
      const vals = [];
      sumSheet.getRow(r).eachCell({ includeEmpty: true }, (c) => vals.push(c.value || ''));
      if (vals.length > 0) console.log(`Row ${r}:`, vals.join(' | '));
    }
  }

  const detSheet = workbook.getWorksheet('Detailed Attendance');
  if (detSheet) {
    console.log('\n--- Detailed Attendance Headers (Row 7) ---');
    const headers = [];
    detSheet.getRow(7).eachCell((c) => headers.push(c.value));
    console.log(headers.join(' | '));
  }
}

inspectMultiSheet().catch(console.error);
