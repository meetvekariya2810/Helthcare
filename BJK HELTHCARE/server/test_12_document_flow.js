const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/db');
const Employee = require('./models/Employee');
const {
  OFFICIAL_DOCUMENT_CHECKLIST,
  buildEmployeeChecklist,
  saveUploadedPDFFile
} = require('./services/hrms/documentChecklistService');

async function test12DocumentModule() {
  console.log('=== BJK HEALTHCARE 12-DOCUMENT MODULE VERIFICATION ===');
  await connectDB();

  // 1. Verify 12-Document Master Definition
  console.log(`\n[Test 1] 12-Document Master List has ${OFFICIAL_DOCUMENT_CHECKLIST.length} slots:`);
  OFFICIAL_DOCUMENT_CHECKLIST.forEach(s => {
    console.log(`  Slot #${s.slotNo}: ${s.title} ${s.isMandatory ? '[MANDATORY]' : '[OPTIONAL]'}`);
  });

  if (OFFICIAL_DOCUMENT_CHECKLIST.length !== 12) {
    throw new Error('Checklist does not have exactly 12 items!');
  }

  // Check mandatory slots: 1 (Aadhar), 2 (PAN), 6 (Bank Passbook / Cheque)
  const mandatorySlots = OFFICIAL_DOCUMENT_CHECKLIST.filter(s => s.isMandatory).map(s => s.slotNo);
  console.log(`\n[Test 2] Mandatory Slots: ${mandatorySlots.join(', ')}`);
  if (!mandatorySlots.includes(1) || !mandatorySlots.includes(2) || !mandatorySlots.includes(6)) {
    throw new Error('Mandatory slots must include #1 (Aadhar), #2 (PAN), #6 (Bank Passbook / Cheque)!');
  }

  // 2. Test employee checklist builder with existing employee
  const testEmp = await Employee.findOne({ $or: [{ employeeId: 'BJK-EMP-003' }, { employeeId: 'BJK-00101' }] });
  if (testEmp) {
    console.log(`\n[Test 3] Building checklist for Employee: ${testEmp.fullName} (${testEmp.employeeId})`);
    const { checklist, stats } = buildEmployeeChecklist(testEmp);
    console.log(`  - Total Slots: ${checklist.length}`);
    console.log(`  - Uploaded Count: ${stats.uploadedCount} / ${stats.totalSlots}`);
    console.log(`  - Mandatory Uploaded: ${stats.mandatoryUploadedCount} / ${stats.mandatoryTotal}`);
    console.log(`  - Mandatory Completed: ${stats.mandatoryCompleted}`);
    console.log(`  - Overall Status: ${stats.overallComplianceStatus}`);
  }

  // 3. Test PDF Persistence & Verification
  console.log('\n[Test 4] Testing PDF storage helper...');
  const fakePdfBuffer = Buffer.from('%PDF-1.4\n%BJK Healthcare Test PDF Document\n%%EOF');
  const saved = await saveUploadedPDFFile({
    buffer: fakePdfBuffer,
    originalFilename: 'Aadhar_Card_Test.pdf',
    employeeId: 'TEST-EMP',
    slotNo: 1
  });
  console.log(`  - Saved PDF at: ${saved.fileUrl} (${saved.fileSize} bytes)`);

  const exists = fs.existsSync(path.join(__dirname, 'uploads', 'documents', saved.filename));
  console.log(`  - File exists on disk: ${exists}`);
  if (!exists) throw new Error('PDF file was not created on disk!');

  console.log('\n>>> ALL 12-DOCUMENT MODULE BACKEND TESTS PASSED SUCCESSFULLY! <<<\n');
  process.exit(0);
}

test12DocumentModule().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
