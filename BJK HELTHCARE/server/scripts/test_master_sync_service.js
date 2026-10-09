require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { validateMasterSheet, enrichMatchedProfiles } = require('../services/hrms/employeeMasterSyncService');

async function testSync() {
  await connectDB();

  console.log('--- Step 1: Running Non-Destructive Validation ---');
  const validation = await validateMasterSheet();
  console.log(`Total Master Rows: ${validation.totalExcelEmployees}`);
  console.log(`Matched Existing Employees: ${validation.matchedExistingEmployees}`);
  console.log(`Employees Missing in DB: ${validation.employeesMissingInDatabase}`);
  console.log(`No Code Rows: ${validation.noCodeEmployeesCount}`);
  console.log('First 2 missing:', validation.missingEmployees.slice(0, 2));

  console.log('\n--- Step 2: Running Non-Destructive Profile Enrichment ---');
  const enrichment = await enrichMatchedProfiles({ name: 'Superadmin Antigravity', role: 'SUPER_ADMIN' });
  console.log('Result Success:', enrichment.success);
  console.log('Enriched Count:', enrichment.enrichedCount);
  console.log('Skipped Count:', enrichment.skippedCount);
  console.log('Safety Verification:', JSON.stringify(enrichment.safetyVerification, null, 2));

  // Verify sample enriched employee
  const Employee = require('../models/Employee');
  const sample = await Employee.findOne({ employeeCode: 'BH1022' }).lean();
  console.log('\n--- Step 3: Verified BH1022 Profile After Enrichment ---');
  console.log({
    employeeCode: sample.employeeCode,
    fullName: sample.fullName,
    gender: sample.gender,
    dateOfBirth: sample.dateOfBirth,
    age: sample.age,
    dateOfJoining: sample.dateOfJoining,
    yearsOfService: sample.yearsOfService,
    aadhaarNumber: sample.aadhaarNumber,
    panNumber: sample.panNumber,
    bankName: sample.bankName,
    bankAccountNumber: sample.bankAccountNumber,
    ifscCode: sample.ifscCode,
    bankDetails: sample.bankDetails,
    sensitiveData: sample.sensitiveData,
    identityDocumentsCount: sample.identityDocuments?.length,
    profileCompletion: sample.profileCompletion
  });

  await mongoose.disconnect();
}

testSync().catch(err => {
  console.error(err);
  process.exit(1);
});
