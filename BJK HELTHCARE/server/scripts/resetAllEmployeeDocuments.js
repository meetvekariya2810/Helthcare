const { connectDB } = require('../config/db');
const Employee = require('../models/Employee');
const HrmsEmployee = require('../models/hrms/Employee');
const Document = require('../models/hrms/Document');
const fs = require('fs');
const path = require('path');

async function resetAllDocuments() {
  console.log('=== RESETTING ALL EMPLOYEE DOCUMENTS TO FRESH STATE ===');
  await connectDB();

  // 1. Clear employee.documents array for all employees in Master Employee collection
  const masterRes = await Employee.updateMany(
    {},
    {
      $set: {
        documents: [],
        'bankDetails.passbookUrl': '',
        'bankDetails.cancelledChequeUrl': ''
      }
    }
  );
  console.log(`[Master Employees] Reset documents for ${masterRes.modifiedCount || masterRes.matchedCount} employees.`);

  // Clear any fileUrl on identityDocuments if any
  const empList = await Employee.find({});
  for (const emp of empList) {
    let changed = false;
    if (emp.identityDocuments && emp.identityDocuments.length > 0) {
      emp.identityDocuments.forEach(doc => {
        if (doc.fileUrl) {
          doc.fileUrl = '';
          doc.verificationStatus = 'PENDING';
          changed = true;
        }
      });
    }
    if (changed) {
      await emp.save();
    }
  }

  // 2. Clear HRMS Employee documents if any
  try {
    const hrmsRes = await HrmsEmployee.updateMany({}, { $set: { documents: [] } });
    console.log(`[HRMS Employees] Reset documents for ${hrmsRes.modifiedCount || hrmsRes.matchedCount} employees.`);
  } catch (err) {
    console.log('[HRMS Employee Note]:', err.message);
  }

  // 3. Clear Document collection
  try {
    const docDel = await Document.deleteMany({});
    console.log(`[HRMS Documents Vault] Cleared ${docDel.deletedCount} old document records.`);
  } catch (err) {
    console.log('[Document Model Note]:', err.message);
  }

  // 4. Clean uploads/documents directory of test/dummy files
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'documents');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(uploadsDir, file));
      } catch (e) {}
    }
    console.log(`[Uploads Directory] Cleared ${files.length} old cached PDF files.`);
  } else {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log('\n>>> ALL EMPLOYEE ACCOUNTS ARE NOW RESET TO CLEAN 12-DOCUMENT "NOT UPLOADED" STATE! <<<\n');
  process.exit(0);
}

resetAllDocuments().catch(err => {
  console.error('Reset Failed:', err);
  process.exit(1);
});
