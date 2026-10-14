const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const Employee = require('../models/Employee');
const EmployeeBankDetails = require('../models/EmployeeBankDetails');
const UserSession = require('../models/UserSession');
const EmployeeFaceAttendance = require('../models/EmployeeFaceAttendance');
const AuditLog = require('../models/AuditLog');
const { runAnonymization, resolveStagingPasswordHash, SAFE_COLLECTIONS } = require('../scripts/anonymizeStaging');

test('Staging Anonymization Script: Comprehensive Privacy, Scrubbing & Residual Scan Test', async (t) => {
  let mongoServer;

  t.before(async () => {
    mongoServer = await MongoMemoryServer.create();
  });

  t.after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  await t.test('Guard: Refuses to run if NODE_ENV=production', async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      assert.throws(() => {
        require('../config/safetyGuards').assertNonProduction();
      }, /FATAL SAFETY ERROR.*production/);
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  await t.test('Guard: Refuses to run if target DB is bjk_healthcare (prod name)', async () => {
    const origDb = process.env.DATABASE_NAME;
    const origSeed = process.env.SEED_ALLOWED_DB;
    const origUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/bjk_healthcare';
    process.env.DATABASE_NAME = 'bjk_healthcare';
    process.env.SEED_ALLOWED_DB = 'bjk_healthcare_staging';
    try {
      assert.throws(() => {
        require('../config/safetyGuards').assertNonProduction();
      }, /production default/);
    } finally {
      process.env.DATABASE_NAME = origDb;
      process.env.SEED_ALLOWED_DB = origSeed;
      process.env.MONGODB_URI = origUri;
    }
  });

  await t.test('Password Hash: Derived from STAGING_SEED_PASSWORD or randomly generated per-run (never hardcoded)', async () => {
    const origSeed = process.env.STAGING_SEED_PASSWORD;
    try {
      // 1. With STAGING_SEED_PASSWORD set
      process.env.STAGING_SEED_PASSWORD = 'CustomStagingSeedKey2026!';
      const resEnv = resolveStagingPasswordHash();
      assert.equal(resEnv.isFromEnv, true);
      assert.equal(await bcrypt.compare('CustomStagingSeedKey2026!', resEnv.hash), true);

      // 2. Without STAGING_SEED_PASSWORD (random per-run)
      delete process.env.STAGING_SEED_PASSWORD;
      const resRand1 = resolveStagingPasswordHash();
      const resRand2 = resolveStagingPasswordHash();
      assert.equal(resRand1.isFromEnv, false);
      assert.equal(resRand2.isFromEnv, false);
      assert.notEqual(resRand1.hash, resRand2.hash, 'Per-run hashes must differ when random');
    } finally {
      process.env.STAGING_SEED_PASSWORD = origSeed;
    }
  });

  await t.test('Comprehensive Execution: Default-Deny, Operational Scrubbing, Numeric Bank Accounts, Residual Scan', async () => {
    const uri = mongoServer.getUri();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = uri;
    process.env.DATABASE_NAME = 'bjk_healthcare_staging';
    process.env.SEED_ALLOWED_DB = 'bjk_healthcare_staging';
    process.env.STAGING_SEED_PASSWORD = 'TestStagingRunKey2026!';

    await mongoose.connect(uri, { dbName: 'bjk_healthcare_staging' });
    const db = mongoose.connection.db;

    // Clean tables
    await User.deleteMany({});
    await Employee.deleteMany({});
    await EmployeeBankDetails.deleteMany({});
    await UserSession.deleteMany({});
    await EmployeeFaceAttendance.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Seed unknown non-whitelisted collection to test DEFAULT-DENY
    const legacyDumpCol = db.collection('legacy_unauthorized_dump');
    await legacyDumpCol.insertMany([
      { secretDump: 'sensitive_financial_info', id: 1 },
      { secretDump: 'confidential_contract_text', id: 2 }
    ]);

    // 2. Seed test users
    const realHash1 = await bcrypt.hash('RealDirectorPass!', 10);
    const realHash2 = await bcrypt.hash('RealScientistPass!', 10);

    const adminUser = await User.create({
      name: 'Dr. Real Director',
      email: 'director@bjkhealthcare.com',
      password: realHash1,
      passwordHash: realHash1,
      role: 'SUPER_ADMIN',
      department: 'Executive'
    });

    const empUser = await User.create({
      name: 'Real Senior Scientist',
      email: 'scientist@bjkhealthcare.com',
      phone: '+919876543210',
      password: realHash2,
      passwordHash: realHash2,
      role: 'EMPLOYEE',
      department: 'Quality Control'
    });

    // 3. Seed active session and facial biometric
    await UserSession.create({
      userId: empUser._id,
      sessionId: 'sess_live_token_123',
      tokenHash: 'hash_live_token_123',
      expiresAt: new Date(Date.now() + 3600000),
      ipAddress: '198.51.100.5',
      userAgent: 'Real Chrome on Mac'
    });

    await EmployeeFaceAttendance.create({
      employee: empUser._id,
      employeeId: 'BJK-EMP-888',
      faceDescriptor: [0.123, 0.456, 0.789],
      verificationStatus: 'VERIFIED'
    });

    // 4. Seed AuditLog
    await AuditLog.create({
      user: {
        id: adminUser._id,
        name: 'Dr. Real Director',
        email: 'director@bjkhealthcare.com',
        role: 'SUPER_ADMIN'
      },
      action: 'EMPLOYEE_RECORD_UPDATED',
      module: 'HRMS',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Updated bank details for Ramesh Patel (PAN: ABCDE1234F)'
    });

    // 5. Seed Employee and Bank Details
    const emp = await Employee.create({
      employeeId: 'BJK-EMP-888',
      firstName: 'Ramesh',
      lastName: 'Patel',
      name: 'Ramesh Patel',
      fullName: 'Ramesh Patel',
      email: 'ramesh.patel@bjkhealthcare.com',
      phone: '+919988776655',
      designation: 'QC Officer',
      department: 'Quality Control',
      currentAddress: '123 Real Street, Secret Colony, Ahmedabad',
      identityDocuments: [
        { documentType: 'AADHAAR', documentNumber: '1234-5678-9012' },
        { documentType: 'PAN', documentNumber: 'ABCDE1234F' }
      ]
    });

    await EmployeeBankDetails.create({
      employeeId: emp._id,
      employeeCode: 'BJK-EMP-888',
      accountHolderName: 'Ramesh Patel',
      accountNumber: '987654321012',
      bankName: 'HDFC Bank',
      branchName: 'Navrangpura',
      ifscCode: 'HDFC0001234'
    });

    // 6. Seed Operational collections (Attendance, Leave, LeaveLedger, Payroll, Canteen, Enquiries)
    await db.collection('attendance').insertOne({
      employeeId: 'BJK-EMP-888',
      employeeName: 'Ramesh Patel',
      ipAddress: '203.0.113.50',
      notes: 'Doctor visit note'
    });

    await db.collection('leaves').insertOne({
      employeeId: 'BJK-EMP-888',
      reason: 'Medical surgery for Ramesh Patel at Apollo Hospital',
      contactAddressDuringLeave: '45 Hospital Road, Ahmedabad'
    });

    await db.collection('payrolls').insertOne({
      employeeId: 'BJK-EMP-888',
      bankAccountNumber: '987654321012',
      remarks: 'Confidential bonus for Ramesh'
    });

    await db.collection('enquiries').insertOne({
      name: 'External Vendor John Doe',
      email: 'john.doe@externalpharma.com',
      phone: '+919911223344',
      message: 'Confidential procurement proposal'
    });

    // Run anonymization with confirm
    const report = await runAnonymization({ confirm: true, keepConnected: true });

    // --- Assertions ---
    // A. Default-Deny Policy
    const remainingDumpCount = await legacyDumpCol.countDocuments();
    assert.equal(remainingDumpCount, 0, 'Non-whitelisted collection must be emptied by default-deny');
    assert.equal(report.collectionsEmptiedByDefaultDeny['legacy_unauthorized_dump'], 2);

    // B. Password Hash Overwritten
    const updatedAdmin = await User.findById(adminUser._id).select('+password +passwordHash');
    assert.notEqual(updatedAdmin.passwordHash, realHash1, 'Real password hash must be overwritten');
    assert.equal(await bcrypt.compare('TestStagingRunKey2026!', updatedAdmin.passwordHash), true);

    // C. Sensitive Credentials & Face Templates Cleared
    assert.equal(await UserSession.countDocuments(), 0, 'UserSession must be cleared');
    assert.equal(await EmployeeFaceAttendance.countDocuments(), 0, 'EmployeeFaceAttendance must be cleared');

    // D. Numeric Fake Bank Account (pure digits, 12 digits, unique)
    const updatedBank = await EmployeeBankDetails.findOne({ employeeId: emp._id });
    assert.match(updatedBank.accountNumber, /^\d{12}$/, 'Bank account must be purely numeric 12 digits');
    assert.notEqual(updatedBank.accountHolderName, 'Ramesh Patel');

    // E. Operational Collections Scrubbed
    const scrubbedAtt = await db.collection('attendance').findOne();
    assert.equal(scrubbedAtt.employeeName, 'Staging Employee');
    assert.equal(scrubbedAtt.ipAddress, '127.0.0.1');

    const scrubbedLeave = await db.collection('leaves').findOne();
    assert.equal(scrubbedLeave.reason, 'Staging Leave Request');
    assert.equal(scrubbedLeave.contactAddressDuringLeave, '');

    const scrubbedPayroll = await db.collection('payrolls').findOne();
    assert.match(scrubbedPayroll.bankAccountNumber, /^\d{12}$/);
    assert.equal(scrubbedPayroll.remarks, 'Staging Payroll Ledger');

    const scrubbedEnquiry = await db.collection('enquiries').findOne();
    assert.equal(scrubbedEnquiry.email, 'enquiry@staging.bjkhealthcare.com');

    // F. Residual PII Scan
    assert.equal(report.residualScan.residualEmails, 0, 'Zero residual real emails must remain');
    assert.equal(report.residualScan.residualPhones, 0, 'Zero residual real phones must remain');
    assert.equal(report.residualScan.residualPAN, 0, 'Zero residual real PANs must remain');
    assert.equal(report.residualScan.residualAadhaar, 0, 'Zero residual real Aadhaar must remain');

    await mongoose.disconnect();
  });
});
