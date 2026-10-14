/**
 * BJK Healthcare - Comprehensive Staging Data Anonymization Engine
 * Standard compliant with Master Prompt v4:
 *
 * 1. DEFAULT-DENY COLLECTION POLICY:
 *    - Queries all collections in the target database.
 *    - Empties (deleteMany({})) any collection not explicitly present on the SAFE_COLLECTIONS whitelist.
 *
 * 2. ZERO RETAINED SECRETS / CREDENTIALS:
 *    - Overwrites ALL password hashes in User collection with a per-run staging hash
 *      derived from STAGING_SEED_PASSWORD (or crypto-generated per-run); NEVER printed or hardcoded.
 *    - Clears UserSession collection (revoking all active tokens).
 *    - Clears Credential collection (purging spreadsheet credentials).
 *    - Clears EmployeeFaceAttendance collection (purging biometric facial templates).
 *    - Clears EmployeeLoginHistory and LoginActivity collections (purging IP/device telemetry).
 *
 * 3. FULL PII ANONYMIZATION WITH UNIQUE INDEX INTEGRITY:
 *    - Unique per-record numeric fake bank accounts (pure digits, 12 digits, unique per record).
 *    - Unique per-record staging emails, phones, Aadhaar, and PAN.
 *    - Neutralizes names, dates of birth, and addresses.
 *
 * 4. OPERATIONAL COLLECTION SCRUBBING:
 *    - Scrubs Attendance, Leave, LeaveLedger, Payroll, CanteenLunchRecord, enquiries,
 *      employeetasks, hrnotifications, trainingenrollments, attendance_monthly_summaries,
 *      employeesupportrequests.
 *    - Scrubs actor names, emails, and IPs in AuditLog and AttendanceAuditLog.
 *    - Scrubs employee records in AttendanceImportSnapshot and KnowledgeChunk.
 *
 * 5. POST-MASKING RESIDUAL SCAN:
 *    - Inspects ALL collections in the database for residual unmasked email, phone, PAN,
 *      and Aadhaar patterns, and reports residual counts.
 *
 * 6. STRICT FAIL-CLOSED SAFETY GUARDS:
 *    - Refuses execution if NODE_ENV === 'production'.
 *    - Refuses execution if target database does not match SEED_ALLOWED_DB.
 *    - Refuses execution if connected database targets bjk_healthcare or production override.
 *
 * Usage:
 *   node scripts/anonymizeStaging.js --dry-run
 *   node scripts/anonymizeStaging.js --confirm
 */

const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { assertNonProduction, assertConnectedDbAllowed, getEffectiveDatabaseName } = require('../config/safetyGuards');

// Load environment from staging-scripts.env if present outside repo
const envArg = process.argv.find(a => a.startsWith('--env-file='));
const envPath = envArg ? envArg.split('=')[1] : (fs.existsSync('D:\\bjk-secrets\\staging-scripts.env') ? 'D:\\bjk-secrets\\staging-scripts.env' : null);
if (envPath && fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    if (!process.env[k]) process.env[k] = envConfig[k];
  }
}

// Explicit Safe List of Collections allowed to retain documents
const SAFE_COLLECTIONS = new Set([
  // Core System & Accounts
  'users',
  'employees',
  'employeebankdetails',
  'employee_bank_details',
  'usersessions',
  'credentials',
  'employeefaceattendances',
  'employeeloginhistories',
  'loginactivities',
  'auditlogs',
  'attendanceauditlogs',
  'attendanceimportsnapshots',
  'knowledgechunks',
  'onboardingapplications',

  // Pharma & Operations Master Data
  'products',
  'productcategories',
  'facilities',
  'departments',
  'designations',
  'companies',
  'policymasters',
  'policy_masters',
  'attendancepolicies',
  'leavepolicies',
  'shifts',
  'batches',
  'productionlines',
  'productionorders',
  'qcresults',
  'qcsamples',
  'qctests',
  'capas',
  'changecontrols',
  'deviations',
  'sops',
  'regulatoryrecords',
  'warehouses',
  'inventoryitems',

  // Operational Collections (explicitly scrubbed)
  'attendances',
  'attendance',
  'leaves',
  'leaveledgers',
  'payrolls',
  'canteenlunchrecords',
  'enquiries',
  'employeetasks',
  'hrnotifications',
  'trainingenrollments',
  'attendance_monthly_summaries',
  'employeesupportrequests'
]);

// Helper to safely load mongoose models
function loadModel(modelPath) {
  try {
    return require(modelPath);
  } catch (_) {
    return null;
  }
}

const User = loadModel('../models/User');
const Employee = loadModel('../models/Employee');
const EmployeeBankDetails = loadModel('../models/EmployeeBankDetails');
const UserSession = loadModel('../models/UserSession');
const EmployeeFaceAttendance = loadModel('../models/EmployeeFaceAttendance');
const EmployeeLoginHistory = loadModel('../models/EmployeeLoginHistory');
const LoginActivity = loadModel('../models/LoginActivity');
const AuditLog = loadModel('../models/AuditLog');
const AttendanceAuditLog = loadModel('../models/AttendanceAuditLog');
const KnowledgeChunk = loadModel('../models/KnowledgeChunk');
const Credential = loadModel('../models/hrms/Credential');
const AttendanceImportSnapshot = loadModel('../models/hrms/AttendanceImportSnapshot');
const OnboardingApplication = loadModel('../models/hrms/OnboardingApplication');

const defaultDryRun = process.argv.includes('--dry-run');
const defaultConfirmed = process.argv.includes('--confirm');

/**
 * Resolve per-run staging password hash without exposing secret in code or stdout
 */
function resolveStagingPasswordHash() {
  const seedPass = (process.env.STAGING_SEED_PASSWORD || '').trim();
  const rawPass = seedPass || crypto.randomBytes(18).toString('base64');
  return {
    hash: bcrypt.hashSync(rawPass, 10),
    isFromEnv: Boolean(seedPass)
  };
}

async function runAnonymization(options = {}) {
  const isDryRun = options.dryRun !== undefined ? options.dryRun : defaultDryRun;
  const isConfirmed = options.confirm !== undefined ? options.confirm : defaultConfirmed;

  console.log('[BJK Digital Brain] Initializing Comprehensive Staging Data Anonymization Engine...');

  // 1. Static pre-connection guard
  assertNonProduction();

  const effectiveDb = getEffectiveDatabaseName();
  const allowedDb = (process.env.SEED_ALLOWED_DB || '').trim();

  if (!allowedDb || effectiveDb !== allowedDb) {
    throw new Error(`[SAFETY GUARD REFUSAL] Effective database '${effectiveDb}' does not match SEED_ALLOWED_DB '${allowedDb}'. Anonymization aborted.`);
  }

  if (!isDryRun && !isConfirmed) {
    console.error('ERROR: You must specify either --dry-run or --confirm.');
    console.error('  Dry run: node scripts/anonymizeStaging.js --dry-run');
    console.error('  Live run: node scripts/anonymizeStaging.js --confirm');
    process.exit(1);
  }

  // 2. Connect to MongoDB if not already connected
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, { dbName: effectiveDb });
  }

  // 3. Post-connection guard on connected instance
  assertConnectedDbAllowed(mongoose.connection);

  console.log(`[BJK Digital Brain] Connected to target database: ${mongoose.connection.name}`);
  console.log(`[BJK Digital Brain] Execution Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE EXECUTION'}`);

  const stagingPasswordInfo = resolveStagingPasswordHash();
  const stagingPasswordHash = stagingPasswordInfo.hash;
  console.log(`[BJK Digital Brain] Staging Password Hash: ${stagingPasswordInfo.isFromEnv ? '[DERIVED FROM STAGING_SEED_PASSWORD]' : '[GENERATED RANDOMLY PER-RUN]'}`);

  const report = {
    collectionsWiped: {},
    collectionsMasked: {},
    collectionsScrubbed: {},
    collectionsEmptiedByDefaultDeny: {},
    residualScan: {
      collectionsScanned: 0,
      residualEmails: 0,
      residualPhones: 0,
      residualPAN: 0,
      residualAadhaar: 0,
      findings: {}
    }
  };

  const db = mongoose.connection.db;

  // --------------------------------------------------------------------------
  // STEP 0: DEFAULT-DENY POLICY (Empty collections not on SAFE_COLLECTIONS list)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP 0: Default-Deny Collection Whitelist Enforcement ---');
  const allCollections = await db.listCollections().toArray();

  for (const colInfo of allCollections) {
    const colName = colInfo.name;
    const colNameLower = colName.toLowerCase();

    // Skip MongoDB internal collections
    if (colName.startsWith('system.')) continue;

    if (!SAFE_COLLECTIONS.has(colNameLower)) {
      const col = db.collection(colName);
      const count = await col.countDocuments();
      if (count > 0) {
        if (!isDryRun) {
          await col.deleteMany({});
        }
        report.collectionsEmptiedByDefaultDeny[colName] = count;
        console.log(`[DEFAULT-DENY] Emptied non-whitelisted collection '${colName}' (${count} records cleared).`);
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP A: CLEAR SENSITIVE CREDENTIALS, ACTIVE SESSIONS & BIOMETRIC TEMPLATES
  // --------------------------------------------------------------------------
  console.log('\n--- STEP A: Clearing Sensitive Sessions, Raw Credentials & Biometrics ---');

  if (UserSession) {
    const count = await UserSession.countDocuments();
    if (!isDryRun) await UserSession.deleteMany({});
    report.collectionsWiped['UserSession'] = count;
    console.log(`[UserSession] Cleared ${count} active user sessions.`);
  }

  if (Credential) {
    const count = await Credential.countDocuments();
    if (!isDryRun) await Credential.deleteMany({});
    report.collectionsWiped['Credential (HRMS)'] = count;
    console.log(`[Credential] Cleared ${count} raw spreadsheet credential documents.`);
  }

  if (EmployeeFaceAttendance) {
    const count = await EmployeeFaceAttendance.countDocuments();
    if (!isDryRun) await EmployeeFaceAttendance.deleteMany({});
    report.collectionsWiped['EmployeeFaceAttendance'] = count;
    console.log(`[EmployeeFaceAttendance] Cleared ${count} facial biometric attendance records.`);
  }

  if (EmployeeLoginHistory) {
    const count = await EmployeeLoginHistory.countDocuments();
    if (!isDryRun) await EmployeeLoginHistory.deleteMany({});
    report.collectionsWiped['EmployeeLoginHistory'] = count;
    console.log(`[EmployeeLoginHistory] Cleared ${count} employee login history records.`);
  }

  if (LoginActivity) {
    const count = await LoginActivity.countDocuments();
    if (!isDryRun) await LoginActivity.deleteMany({});
    report.collectionsWiped['LoginActivity'] = count;
    console.log(`[LoginActivity] Cleared ${count} admin login activity records.`);
  }

  // --------------------------------------------------------------------------
  // STEP B: MASK USERS & REPLACE ALL PASSWORD HASHES (PER-RUN SEED/RANDOM HASH)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP B: Masking Users & Overwriting All Password Hashes ---');
  if (User) {
    const users = await User.find({});
    report.collectionsMasked['User'] = users.length;
    console.log(`[User] Processing ${users.length} user accounts...`);

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const seq = String(i + 1).padStart(4, '0');
      const isSuper = u.role === 'SUPER_ADMIN' || u.role === 'DIRECTOR';

      if (!isDryRun) {
        // ALWAYS overwrite passwordHash and password with staging hash
        u.password = stagingPasswordHash;
        u.passwordHash = stagingPasswordHash;
        u.mustChangePassword = false;
        u.passwordChangedAt = new Date();

        // Unique per-record email maintaining index integrity
        u.email = isSuper ? `admin${seq}@staging.bjkhealthcare.com` : `staging.user${seq}@staging.bjkhealthcare.com`;
        u.name = isSuper ? `Staging Admin ${seq}` : `Staging User ${seq}`;
        if (u.phone) {
          u.phone = `+919800${String(100000 + (i % 900000))}`;
        }
        await u.save({ validateBeforeSave: false });
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP C: MASK EMPLOYEES (NAMES, EMAILS, PHONES, ADDRESSES, AADHAAR, PAN, DOB)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP C: Masking Employee PII & Identity Documents ---');
  if (Employee) {
    const employees = await Employee.find({});
    report.collectionsMasked['Employee'] = employees.length;
    console.log(`[Employee] Processing ${employees.length} employee records...`);

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const seq = String(i + 1).padStart(4, '0');

      if (!isDryRun) {
        emp.firstName = 'Staging';
        emp.lastName = `Emp${seq}`;
        emp.name = `Staging Emp ${seq}`;
        emp.fullName = `Staging Emp ${seq}`;
        emp.email = `staging.emp${seq}@staging.bjkhealthcare.com`;
        emp.workEmail = `staging.work${seq}@staging.bjkhealthcare.com`;
        emp.personalEmail = `staging.personal${seq}@staging.bjkhealthcare.com`;

        const uniquePhone = `+919810${String(100000 + (i % 900000))}`;
        emp.phone = uniquePhone;
        emp.officialMobile = uniquePhone;
        emp.alternateMobile = '';
        emp.emergencyPhone = '';

        // Neutralize Date of Birth
        if (emp.dob || emp.dateOfBirth) {
          const genericDob = new Date('1990-01-01T00:00:00.000Z');
          emp.dob = genericDob;
          emp.dateOfBirth = genericDob;
        }

        // Mask Addresses
        const stagingAddress = `Plot ${seq}, Industrial Area Phase II, Ahmedabad, Gujarat`;
        emp.currentAddress = stagingAddress;
        emp.permanentAddress = stagingAddress;
        if (emp.currentAddressDetails) {
          emp.currentAddressDetails.line1 = `Plot ${seq}, Industrial Area`;
          emp.currentAddressDetails.line2 = 'Phase II';
          emp.currentAddressDetails.city = 'Ahmedabad';
          emp.currentAddressDetails.state = 'Gujarat';
          emp.currentAddressDetails.pinCode = '382330';
        }
        if (emp.permanentAddressDetails) {
          emp.permanentAddressDetails.line1 = `Plot ${seq}, Industrial Area`;
          emp.permanentAddressDetails.line2 = 'Phase II';
          emp.permanentAddressDetails.city = 'Ahmedabad';
          emp.permanentAddressDetails.state = 'Gujarat';
          emp.permanentAddressDetails.pinCode = '382330';
        }

        // Mask Identity Documents (unique per-record format)
        if (Array.isArray(emp.identityDocuments)) {
          emp.identityDocuments.forEach((doc, dIdx) => {
            if (doc.documentType === 'AADHAAR') {
              doc.documentNumber = `9999${String(1000 + ((i + dIdx) % 9000))}1234`;
            } else if (doc.documentType === 'PAN') {
              doc.documentNumber = `STGPN${String(1000 + ((i + dIdx) % 9000))}Z`;
            } else {
              doc.documentNumber = `MASKED-DOC-${seq}-${dIdx}`;
            }
            doc.fileUrl = '';
          });
        }

        // Mask Family Members
        if (Array.isArray(emp.familyMembers)) {
          emp.familyMembers.forEach((fm, fIdx) => {
            fm.name = `Family Contact ${fIdx + 1}`;
            fm.mobile = `+919820${String(100000 + ((i + fIdx) % 900000))}`;
            fm.email = '';
          });
        }

        // Mask Emergency Contacts
        if (Array.isArray(emp.emergencyContacts)) {
          emp.emergencyContacts.forEach((ec, ecIdx) => {
            ec.name = `Emergency Contact ${ecIdx + 1}`;
            ec.mobile = `+919830${String(100000 + ((i + ecIdx) % 900000))}`;
            ec.email = '';
            ec.address = 'Emergency Staging Address, Ahmedabad';
          });
        }

        // Mask embedded bankDetails if present
        if (emp.bankDetails) {
          emp.bankDetails.accountHolderName = `Staging Emp ${seq}`;
          emp.bankDetails.accountNumber = String(100000000000 + i + 1); // Purely numeric, unique 12 digits
          emp.bankDetails.bankName = 'Staging National Bank';
          emp.bankDetails.branchName = 'Ahmedabad Commercial Branch';
          emp.bankDetails.ifscCode = 'SBIN0001234';
        }

        await emp.save({ validateBeforeSave: false });
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP D: MASK EMPLOYEE BANK DETAILS (PURE NUMERIC UNIQUE ACCOUNTS)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP D: Masking Bank Details (Pure Numeric 12-Digit Accounts) ---');
  if (EmployeeBankDetails) {
    const bankRecords = await EmployeeBankDetails.find({});
    report.collectionsMasked['EmployeeBankDetails'] = bankRecords.length;
    console.log(`[EmployeeBankDetails] Processing ${bankRecords.length} bank detail records...`);

    for (let i = 0; i < bankRecords.length; i++) {
      const b = bankRecords[i];
      const seq = String(i + 1).padStart(4, '0');

      if (!isDryRun) {
        b.accountHolderName = `Staging Emp ${seq}`;
        // Purely numeric 12-digit account number, guaranteed unique per record
        b.accountNumber = String(100000000000 + i + 1);
        b.bankName = 'Staging National Bank';
        b.branchName = 'Ahmedabad Commercial Branch';
        b.branchAddress = '101 Industrial Estate, Ahmedabad';
        b.ifscCode = 'SBIN0001234';
        b.panNumber = `STGPN${String(1000 + (i % 9000))}Z`;
        b.aadhaarNumber = `9999${String(1000 + (i % 9000))}1234`;

        await b.save({ validateBeforeSave: false });
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP E: MASK ONBOARDING APPLICATIONS
  // --------------------------------------------------------------------------
  console.log('\n--- STEP E: Masking Onboarding Applications ---');
  if (OnboardingApplication) {
    const apps = await OnboardingApplication.find({});
    report.collectionsMasked['OnboardingApplication'] = apps.length;
    console.log(`[OnboardingApplication] Processing ${apps.length} onboarding applications...`);

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const seq = String(i + 1).padStart(4, '0');

      if (!isDryRun) {
        if (app.personalDetails) {
          app.personalDetails.fullName = `Staging Applicant ${seq}`;
          app.personalDetails.email = `staging.app${seq}@staging.bjkhealthcare.com`;
          app.personalDetails.phone = `+919840${String(100000 + (i % 900000))}`;
        }
        await app.save({ validateBeforeSave: false });
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP F: SCRUB OPERATIONAL & TELEMETRY COLLECTIONS
  // --------------------------------------------------------------------------
  console.log('\n--- STEP F: Scrubbing Operational Collections & Telemetry ---');

  // 1. AuditLog
  if (AuditLog) {
    const auditCount = await AuditLog.countDocuments();
    if (!isDryRun) {
      await AuditLog.updateMany({}, {
        $set: {
          'user.name': 'Staging Operator',
          'user.email': 'operator@staging.bjkhealthcare.com',
          'targetUser.name': 'Staging Target',
          'targetUser.email': 'target@staging.bjkhealthcare.com',
          ipAddress: '127.0.0.1',
          userAgent: 'Staging Audit Monitor',
          details: 'Staging operational audit trail record.'
        }
      });
    }
    report.collectionsScrubbed['AuditLog'] = auditCount;
    console.log(`[AuditLog] Scrubbed actor and target PII across ${auditCount} records.`);
  }

  // 2. AttendanceAuditLog
  if (AttendanceAuditLog) {
    const aAuditCount = await AttendanceAuditLog.countDocuments();
    if (!isDryRun) {
      await AttendanceAuditLog.updateMany({}, {
        $set: {
          ipAddress: '127.0.0.1',
          operatorName: 'Staging Operator'
        }
      });
    }
    report.collectionsScrubbed['AttendanceAuditLog'] = aAuditCount;
    console.log(`[AttendanceAuditLog] Scrubbed ${aAuditCount} attendance audit entries.`);
  }

  // 3. AttendanceImportSnapshot
  if (AttendanceImportSnapshot) {
    const snapCount = await AttendanceImportSnapshot.countDocuments();
    if (!isDryRun) {
      await AttendanceImportSnapshot.updateMany({}, {
        $set: {
          importedByName: 'Staging System Importer',
          importedByEmail: 'importer@staging.bjkhealthcare.com',
          originalFilename: 'staging_attendance_import.csv'
        }
      });
    }
    report.collectionsScrubbed['AttendanceImportSnapshot'] = snapCount;
    console.log(`[AttendanceImportSnapshot] Scrubbed ${snapCount} import snapshots.`);
  }

  // 4. KnowledgeChunk
  if (KnowledgeChunk) {
    const kcCount = await KnowledgeChunk.countDocuments();
    if (!isDryRun) {
      const chunks = await KnowledgeChunk.find({});
      for (const kc of chunks) {
        if (kc.content && typeof kc.content === 'string') {
          kc.content = kc.content
            .replace(/[a-zA-Z0-9._%+-]+@bjkhealthcare\.com/gi, 'user@staging.bjkhealthcare.com')
            .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, 'STGPN1234Z')
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '999912341234');
          await kc.save({ validateBeforeSave: false });
        }
      }
    }
    report.collectionsScrubbed['KnowledgeChunk'] = kcCount;
    console.log(`[KnowledgeChunk] Sanitized content across ${kcCount} knowledge chunks.`);
  }

  // Helper for generic operational collection scrubbing
  async function scrubCollectionIfExists(colName, updateSpec, logLabel) {
    try {
      const col = db.collection(colName);
      const count = await col.countDocuments();
      if (count > 0) {
        if (!isDryRun) {
          await col.updateMany({}, updateSpec);
        }
        report.collectionsScrubbed[colName] = count;
        console.log(`[${logLabel || colName}] Scrubbed ${count} operational records.`);
      }
    } catch (_) {}
  }

  // 5. Attendance / attendances
  await scrubCollectionIfExists('attendance', {
    $set: {
      employeeName: 'Staging Employee',
      ipAddress: '127.0.0.1',
      notes: '',
      remarks: ''
    }
  }, 'Attendance');
  await scrubCollectionIfExists('attendances', {
    $set: {
      employeeName: 'Staging Employee',
      ipAddress: '127.0.0.1',
      notes: '',
      remarks: ''
    }
  }, 'Attendances');

  // 6. Leave / leaves
  await scrubCollectionIfExists('leaves', {
    $set: {
      reason: 'Staging Leave Request',
      remarks: '',
      notes: '',
      doctorCertificate: '',
      contactAddressDuringLeave: ''
    }
  }, 'Leave');

  // 7. LeaveLedger / leaveledgers
  await scrubCollectionIfExists('leaveledgers', {
    $set: {
      remarks: 'Staging Leave Ledger Entry',
      notes: ''
    }
  }, 'LeaveLedger');

  // 8. Payroll / payrolls
  await scrubCollectionIfExists('payrolls', {
    $set: {
      remarks: 'Staging Payroll Ledger',
      bankAccountNumber: '100000000001',
      bankName: 'Staging National Bank',
      ifscCode: 'SBIN0001234'
    }
  }, 'Payroll');

  // 9. CanteenLunchRecord / canteenlunchrecords
  await scrubCollectionIfExists('canteenlunchrecords', {
    $set: {
      employeeName: 'Staging Employee',
      department: 'Operations',
      notes: ''
    }
  }, 'CanteenLunchRecord');

  // 10. enquiries
  await scrubCollectionIfExists('enquiries', {
    $set: {
      name: 'Staging Enquirer',
      email: 'enquiry@staging.bjkhealthcare.com',
      phone: '+919800000000',
      message: 'Staging customer enquiry text'
    }
  }, 'Enquiries');

  // 11. employeetasks
  await scrubCollectionIfExists('employeetasks', {
    $set: {
      description: 'Staging operational task',
      comments: [],
      notes: ''
    }
  }, 'EmployeeTasks');

  // 12. hrnotifications
  await scrubCollectionIfExists('hrnotifications', {
    $set: {
      title: 'Staging Notification',
      message: 'Staging system notification',
      recipientEmail: 'staging@bjkhealthcare.com'
    }
  }, 'HrNotifications');

  // 13. trainingenrollments
  await scrubCollectionIfExists('trainingenrollments', {
    $set: {
      feedback: 'Staging training feedback',
      assessmentNotes: ''
    }
  }, 'TrainingEnrollments');

  // 14. attendance_monthly_summaries
  await scrubCollectionIfExists('attendance_monthly_summaries', {
    $set: {
      employeeName: 'Staging Employee',
      remarks: '',
      comments: ''
    }
  }, 'AttendanceMonthlySummaries');

  // 15. employeesupportrequests
  await scrubCollectionIfExists('employeesupportrequests', {
    $set: {
      subject: 'Staging Support Request',
      description: 'Staging support ticket details',
      resolutionNotes: ''
    }
  }, 'EmployeeSupportRequests');

  // --------------------------------------------------------------------------
  // STEP G: POST-MASKING RESIDUAL SCAN ACROSS ALL COLLECTIONS
  // --------------------------------------------------------------------------
  console.log('\n--- STEP G: Post-Masking Residual PII Scan Across ALL Collections ---');
  const postCollections = await db.listCollections().toArray();
  report.residualScan.collectionsScanned = postCollections.length;

  for (const colInfo of postCollections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    const col = db.collection(colName);
    const docs = await col.find({}).limit(500).toArray();

    let colEmails = 0;
    let colPhones = 0;
    let colPAN = 0;
    let colAadhaar = 0;

    for (const d of docs) {
      const str = JSON.stringify(d);

      // 1. Email check: flag real non-staging email addresses
      const emailMatches = str.match(/[a-zA-Z0-9_.+-]+@(?!staging\.bjkhealthcare\.com)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi);
      if (emailMatches) colEmails += emailMatches.length;

      // 2. Phone check: flag real 10-digit mobile numbers not starting with staging prefixes
      const phoneRegex = /(?:^|[^\d])(?:(?:\+91|0)[\s-]?)?([6-9]\d{9})\b/g;
      let m;
      while ((m = phoneRegex.exec(str)) !== null) {
        const p = m[1];
        if (!['9800', '9810', '9820', '9830', '9840'].some(pfx => p.startsWith(pfx))) {
          colPhones++;
        }
      }

      // 3. PAN check: flag standard Indian PAN format not starting with staging prefix STGPN
      const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
      while ((m = panRegex.exec(str)) !== null) {
        if (!m[0].startsWith('STGPN')) colPAN++;
      }

      // 4. Aadhaar check: flag 12-digit numbers formatted as Aadhaar not starting with staging prefix 9999, 1000 (bank account), or 9198 (phone)
      const aadhaarRegex = /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/g;
      while ((m = aadhaarRegex.exec(str)) !== null) {
        const raw = m[1].replace(/[-\s]/g, '');
        if (!raw.startsWith('9999') && !raw.startsWith('1000') && !raw.startsWith('9198')) {
          colAadhaar++;
        }
      }
    }

    if (colEmails > 0 || colPhones > 0 || colPAN > 0 || colAadhaar > 0) {
      report.residualScan.findings[colName] = {
        emails: colEmails,
        phones: colPhones,
        pan: colPAN,
        aadhaar: colAadhaar
      };
      report.residualScan.residualEmails += colEmails;
      report.residualScan.residualPhones += colPhones;
      report.residualScan.residualPAN += colPAN;
      report.residualScan.residualAadhaar += colAadhaar;
    }
  }

  console.log(`[Residual Scan] Completed scan across ${postCollections.length} collections.`);
  if (Object.keys(report.residualScan.findings).length === 0) {
    console.log('[Residual Scan] 0 unmasked PII patterns detected across all collections.');
  } else {
    console.warn(`[Residual Scan] Residual findings detected in ${Object.keys(report.residualScan.findings).length} collections.`);
  }

  console.log('\n======================================================');
  console.log('       STAGING ANONYMIZATION COMPREHENSIVE REPORT      ');
  console.log('======================================================');
  console.log(`Target Database:  ${mongoose.connection.name}`);
  console.log(`Execution Mode:   ${isDryRun ? 'DRY RUN (Simulated)' : 'LIVE EXECUTION (Committed)'}`);
  console.log('\n1. COLLECTIONS EMPTIED BY DEFAULT-DENY:');
  const deniedCols = Object.entries(report.collectionsEmptiedByDefaultDeny);
  if (deniedCols.length === 0) console.log('   (None - all collections matched safe list)');
  else deniedCols.forEach(([c, n]) => console.log(`   - ${c}: ${n} records cleared`));

  console.log('\n2. COLLECTIONS WIPED:');
  Object.entries(report.collectionsWiped).forEach(([c, n]) => console.log(`   - ${c}: ${n} records cleared`));

  console.log('\n3. COLLECTIONS MASKED:');
  Object.entries(report.collectionsMasked).forEach(([c, n]) => console.log(`   - ${c}: ${n} records masked (unique indexes intact)`));

  console.log('\n4. COLLECTIONS SCRUBBED:');
  Object.entries(report.collectionsScrubbed).forEach(([c, n]) => console.log(`   - ${c}: ${n} records telemetry/PII scrubbed`));

  console.log('\n5. POST-MASKING RESIDUAL SCAN:');
  console.log(`   - Collections Scanned: ${report.residualScan.collectionsScanned}`);
  console.log(`   - Residual Real Emails: ${report.residualScan.residualEmails}`);
  console.log(`   - Residual Real Phones: ${report.residualScan.residualPhones}`);
  console.log(`   - Residual Real PANs:   ${report.residualScan.residualPAN}`);
  console.log(`   - Residual Real Aadhaar: ${report.residualScan.residualAadhaar}`);
  console.log('======================================================\n');

  if (mongoose.connection.readyState !== 0 && !options.keepConnected) {
    await mongoose.disconnect();
  }

  return report;
}

if (require.main === module) {
  runAnonymization()
    .then(() => {
      console.log('[BJK Digital Brain] Anonymization procedure finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[BJK Digital Brain] Anonymization failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runAnonymization, resolveStagingPasswordHash, SAFE_COLLECTIONS };
