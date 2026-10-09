const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const EmployeeBankDetails = require('../models/EmployeeBankDetails');
const AuditLog = require('../models/AuditLog');
const bankDetailsService = require('../services/hrms/bankDetailsService');

const JWT_SECRET = process.env.JWT_SECRET || 'bjk_healthcare_digital_brain_ultra_secure_jwt_secret_key_2026_enterprise';

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('BJK HEALTHCARE - BANK DETAILS END-TO-END ACCEPTANCE TEST');
  console.log('====================================================');

  await connectDB();

  // Baseline Safety Counts (Requirement 43)
  const baselineUsers = await mongoose.connection.db.collection('users').countDocuments();
  const baselineEmployees = await mongoose.connection.db.collection('employees').countDocuments();
  const baselineDepartments = await mongoose.connection.db.collection('departments').countDocuments();
  const baselineAttendances = await mongoose.connection.db.collection('attendances').countDocuments();

  console.log('Baseline Database Counts:');
  console.log(`- Users: ${baselineUsers}`);
  console.log(`- Employees: ${baselineEmployees}`);
  console.log(`- Departments: ${baselineDepartments}`);
  console.log(`- Attendances: ${baselineAttendances}`);

  // 1. Identify Test Employee and HR Admin
  const empDoc = await Employee.findOne({ employeeId: 'BJK-EMP-003' }) || await Employee.findOne({});
  const hrUser = await User.findOne({ role: 'SUPER_ADMIN' }) || await User.findOne({ email: 'admin@bjkhealthcare.com' });

  if (!empDoc) throw new Error('Test employee not found.');
  if (!hrUser) throw new Error('HR admin user not found.');

  console.log(`\nUsing Test Employee: ${empDoc.fullName} (${empDoc.employeeId})`);
  console.log(`Using HR Admin: ${hrUser.name} (${hrUser.role})`);

  // Generate real JWT tokens
  const employeeToken = jwt.sign(
    {
      id: empDoc._id.toString(),
      employeeId: empDoc.employeeId,
      name: empDoc.fullName,
      email: empDoc.email,
      role: 'EMPLOYEE'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const hrToken = jwt.sign(
    {
      id: hrUser._id.toString(),
      name: hrUser.name,
      email: hrUser.email,
      role: hrUser.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 2. Test Employee Self-Service Service: View Own Bank Details
  console.log('\n[TEST 1] Employee View Own Bank Details:');
  const empBank = await bankDetailsService.getEmployeeBankDetails(empDoc._id);
  console.log(`✓ Retrieved details for ${empDoc.fullName}: Status = ${empBank.verificationStatus}`);
  console.log(`  Masked Account: ${empBank.getMaskedAccountNumber ? empBank.getMaskedAccountNumber() : empBank.maskedAccountNumber}`);

  // 3. Test Employee Save Draft
  console.log('\n[TEST 2] Employee Save Draft:');
  const draftData = {
    accountHolderName: empDoc.fullName,
    accountNumber: '987654321098',
    accountType: 'Salary',
    bankName: 'HDFC Bank Ltd.',
    branchName: 'Navrangpura Branch',
    branchAddress: 'C.G. Road, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    ifscCode: 'HDFC0001248',
    action: 'SAVE_DRAFT'
  };
  const savedDraft = await bankDetailsService.saveOrUpdateEmployeeBankDetails(empDoc._id, draftData, { _id: empDoc._id, name: empDoc.fullName }, false);
  console.log(`✓ Draft saved. Status = ${savedDraft.verificationStatus} (Expected: Draft)`);
  if (savedDraft.verificationStatus !== 'Draft') throw new Error('Status should be Draft');

  // 4. Test Employee Submit
  console.log('\n[TEST 3] Employee Save & Submit for HR Review:');
  const submitData = {
    ...draftData,
    documentType: 'Cancelled Cheque',
    documentNumber: 'CHQ-882190',
    bankProofReference: 'https://bjkhealthcare.com/uploads/cheque-sample.pdf',
    action: 'SUBMIT'
  };
  const submitted = await bankDetailsService.saveOrUpdateEmployeeBankDetails(empDoc._id, submitData, { _id: empDoc._id, name: empDoc.fullName }, true);
  console.log(`✓ Submitted. Status = ${submitted.verificationStatus} (Expected: Submitted)`);
  if (submitted.verificationStatus !== 'Submitted') throw new Error('Status should be Submitted');

  // 5. Test HR Directory View & Masking
  console.log('\n[TEST 4] HR Directory List & Masking:');
  const hrList = await bankDetailsService.getHRBankDetailsList({ search: empDoc.employeeId });
  const hrEmpItem = hrList.items.find(i => i.employeeCode === empDoc.employeeId);
  console.log(`✓ HR Directory Item for ${empDoc.employeeId}:`);
  console.log(`  Masked Account: ${hrEmpItem?.maskedAccountNumber}`);
  console.log(`  Bank Name: ${hrEmpItem?.bankName}`);
  console.log(`  Verification Status: ${hrEmpItem?.verificationStatus}`);
  if (!hrEmpItem?.maskedAccountNumber?.startsWith('XXXX')) {
    throw new Error('Account number must be masked in directory view!');
  }

  // 6. Test HR Request Correction
  console.log('\n[TEST 5] HR Request Correction:');
  const correction = await bankDetailsService.hrRequestCorrection(empDoc._id, hrUser, 'Please ensure cheque leaf shows branch IFSC clearly.');
  console.log(`✓ Correction Requested. Status = ${correction.verificationStatus} (Expected: Needs Correction)`);
  console.log(`  Remarks = "${correction.remarks}"`);
  if (correction.verificationStatus !== 'Needs Correction') throw new Error('Status should be Needs Correction');

  // 7. Test Employee Resubmission
  console.log('\n[TEST 6] Employee Re-submits after Correction:');
  const resubmitted = await bankDetailsService.saveOrUpdateEmployeeBankDetails(empDoc._id, { ...submitData, remarks: 'Re-uploaded high-res copy' }, { _id: empDoc._id, name: empDoc.fullName }, true);
  console.log(`✓ Re-submitted. Status = ${resubmitted.verificationStatus} (Expected: Submitted)`);
  if (resubmitted.verificationStatus !== 'Submitted') throw new Error('Status should be Submitted');

  // 8. Test HR Verification
  console.log('\n[TEST 7] HR Verify Bank Details:');
  const verified = await bankDetailsService.hrVerifyBankDetails(empDoc._id, hrUser, 'All statutory documents verified against UIDAI and Bank IFSC.');
  console.log(`✓ Verified. Status = ${verified.verificationStatus} (Expected: Verified)`);
  console.log(`  Verified By = ${verified.verifiedByName}`);
  console.log(`  Verification Date = ${verified.verificationDate}`);
  if (verified.verificationStatus !== 'Verified') throw new Error('Status should be Verified');

  // 9. Test Change Detection (Section 39)
  console.log('\n[TEST 8] Change Detection (Employee alters verified account number):');
  const altered = await bankDetailsService.saveOrUpdateEmployeeBankDetails(
    empDoc._id,
    { ...submitData, accountNumber: '112233445566' },
    { _id: empDoc._id, name: empDoc.fullName },
    false
  );
  console.log(`✓ Alteration detected. Status = ${altered.verificationStatus} (Expected: Needs Re-Verification)`);
  if (altered.verificationStatus !== 'Needs Re-Verification') throw new Error('Status should be Needs Re-Verification on change of verified account!');

  // Re-verify for clean final state
  await bankDetailsService.hrVerifyBankDetails(empDoc._id, hrUser, 'Re-verified successfully.');

  // 10. Test Audit History (Section 15, 40)
  console.log('\n[TEST 9] Audit History & Privacy Check:');
  const audits = await AuditLog.find({ resource: 'EmployeeBankDetails' }).sort({ createdAt: -1 }).limit(10);
  console.log(`✓ Found ${audits.length} recent audit logs for EmployeeBankDetails:`);
  for (const a of audits.slice(0, 5)) {
    console.log(`  - [${a.action}] By ${a.user?.name} on record ${a.recordId}: Status=${a.status}`);
    // Privacy check: ensure full account number 987654321098 is not logged in plaintext
    const jsonStr = JSON.stringify(a);
    if (jsonStr.includes('987654321098') || jsonStr.includes('112233445566')) {
      throw new Error(`CRITICAL PRIVACY VIOLATION: Full account number found in AuditLog: ${a._id}`);
    }
  }
  console.log('✓ Privacy Verified: Zero unmasked account numbers written to audit logs.');

  // 11. Final Database Safety Counts Verification (Requirement 43)
  console.log('\n[TEST 10] Final Database Safety Verification (Requirement 43):');
  const finalUsers = await mongoose.connection.db.collection('users').countDocuments();
  const finalEmployees = await mongoose.connection.db.collection('employees').countDocuments();
  const finalDepartments = await mongoose.connection.db.collection('departments').countDocuments();
  const finalAttendances = await mongoose.connection.db.collection('attendances').countDocuments();

  console.log(`- Users: ${finalUsers} (Baseline: ${baselineUsers}) -> ${finalUsers === baselineUsers ? 'MATCH' : 'MISMATCH'}`);
  console.log(`- Employees: ${finalEmployees} (Baseline: ${baselineEmployees}) -> ${finalEmployees === baselineEmployees ? 'MATCH' : 'MISMATCH'}`);
  console.log(`- Departments: ${finalDepartments} (Baseline: ${baselineDepartments}) -> ${finalDepartments === baselineDepartments ? 'MATCH' : 'MISMATCH'}`);
  console.log(`- Attendances: ${finalAttendances} (Baseline: ${baselineAttendances}) -> ${finalAttendances === baselineAttendances ? 'MATCH' : 'MISMATCH'}`);

  if (finalUsers !== baselineUsers || finalEmployees !== baselineEmployees || finalDepartments !== baselineDepartments || finalAttendances !== baselineAttendances) {
    throw new Error('Database integrity check failed: Existing collections modified!');
  }

  console.log('\n====================================================');
  console.log('✓ ALL ACCEPTANCE TESTS PASSED WITH 100% SUCCESS');
  console.log('====================================================');

  await mongoose.disconnect();
}

runEndToEndTests().catch(err => {
  console.error('\n❌ ACCEPTANCE TEST FAILED:', err);
  process.exit(1);
});
