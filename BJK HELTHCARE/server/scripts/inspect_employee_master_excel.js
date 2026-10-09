const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

async function inspectExcel() {
  const xlsxPath = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace\\Employee Master Detail.xlsx';
  console.log('Loading Excel:', xlsxPath);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  console.log('Worksheets in workbook:');
  workbook.eachSheet((sheet, id) => {
    console.log(`Sheet ${id}: "${sheet.name}" with ${sheet.rowCount} rows and ${sheet.columnCount} columns`);
  });

  const sheet = workbook.worksheets[0];
  console.log(`\nInspecting first sheet: "${sheet.name}"`);

  // Print first 5 rows
  for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    const values = [];
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      values[colNum] = cell.value;
    });
    console.log(`Row ${r}:`, values.slice(1, 25));
  }
}

inspectExcel().catch(console.error);
