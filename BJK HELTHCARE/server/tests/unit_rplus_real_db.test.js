const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { resetEmployeePassword, sanitizeForManager, sanitizeForFinance } = require('../controllers/employeeController');
const { resetEmployeePassword: hrResetEmployeePassword } = require('../controllers/hrController');
const { login } = require('../controllers/authController');

let mongod;

test('In-Memory MongoDB Security & Schema Verification', async (t) => {
  // Set required JWT_SECRET for auth tests
  process.env.JWT_SECRET = 'a_very_secure_jwt_secret_with_32_characters_minimum!';

  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  await t.test('Task 5: resetEmployeePassword writes identical fields and temporary password logs in successfully', async () => {
    const salt = await bcrypt.genSalt(10);
    const initialHash = await bcrypt.hash('InitialPermanentPassword2026!', salt);

    // 1. Create real User in in-memory MongoDB
    const testUser = await User.create({
      name: 'Integration Test User',
      email: 'realuser.test@bjkhealthcare.com',
      password: initialHash,
      passwordHash: initialHash,
      role: 'EMPLOYEE',
      department: 'Production',
      employeeId: 'BHK7701',
      employeeCode: 'BHK7701',
      isActive: true,
      status: 'ACTIVE',
      mustChangePassword: false,
      temporaryPassword: false,
      firstLogin: false,
      failedLoginAttempts: 2,
      isLocked: false
    });

    // 2. Create real Employee linked to User
    const testEmp = await Employee.create({
      employeeId: 'BHK7701',
      employeeCode: 'BHK7701',
      firstName: 'Integration',
      lastName: 'User',
      fullName: 'Integration User',
      email: 'realuser.test@bjkhealthcare.com',
      department: 'Production',
      departmentName: 'Production',
      designation: 'Operator',
      status: 'ACTIVE',
      user: testUser._id
    });

    // 3. Execute resetEmployeePassword as HR_MANAGER
    const hrUserId = new mongoose.Types.ObjectId();
    const reqReset = {
      user: { id: hrUserId, _id: hrUserId, role: 'HR_MANAGER', email: 'hrmanager@bjkhealthcare.com' },
      params: { id: 'BHK7701' },
      body: { reason: 'Mandatory credentials onboarding reset' },
      headers: {},
      ip: '127.0.0.1'
    };
    const resReset = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await resetEmployeePassword(reqReset, resReset);

    assert.strictEqual(resReset.statusCode, 200);
    assert.strictEqual(resReset.body.success, true);
    assert.ok(resReset.body.temporaryPassword);
    const tempPassword = resReset.body.temporaryPassword;
    assert.strictEqual(tempPassword.length, 20);

    // 4. Verify exact fields written on real User document in MongoDB
    const updatedUser = await User.findById(testUser._id).select('+password +passwordHash');
    assert.strictEqual(updatedUser.mustChangePassword, true, 'mustChangePassword must be true');
    assert.strictEqual(updatedUser.temporaryPassword, true, 'temporaryPassword must be true');
    assert.strictEqual(updatedUser.firstLogin, true, 'firstLogin must be true');
    assert.strictEqual(updatedUser.failedLoginAttempts, 0, 'failedLoginAttempts must be reset to 0');
    assert.strictEqual(updatedUser.isLocked, false, 'isLocked must be false');
    assert.strictEqual(updatedUser.lockedReason, '', 'lockedReason must be cleared');
    assert.strictEqual(updatedUser.passwordChangedAt, null, 'passwordChangedAt must be null');
    assert.strictEqual(updatedUser.password, updatedUser.passwordHash, 'password and passwordHash must match');

    // 5. Verify bcrypt comparison with temporary password succeeds
    const isTempPassValid = await bcrypt.compare(tempPassword, updatedUser.password);
    assert.strictEqual(isTempPassValid, true, 'Temporary password must match bcrypt hash in DB');

    // Requirement 2: Raw User doc from MongoDB driver has password !== tempPassword
    const rawUserDoc = await mongoose.connection.db.collection('users').findOne({ _id: testUser._id });
    assert.notStrictEqual(rawUserDoc.password, tempPassword, 'Raw User doc password must NEVER be plaintext tempPassword');
    assert.ok(rawUserDoc.password.startsWith('$2'), 'Raw User doc password must be a bcrypt hash string');
    assert.notStrictEqual(rawUserDoc.passwordHash, tempPassword, 'Raw User doc passwordHash must NEVER be plaintext tempPassword');
    assert.ok(rawUserDoc.passwordHash.startsWith('$2'), 'Raw User doc passwordHash must be a bcrypt hash string');

    // 6. Real login with temporary password through real login controller
    const reqLogin = {
      body: { username: 'realuser.test@bjkhealthcare.com', password: tempPassword },
      headers: {},
      ip: '127.0.0.1'
    };
    const resLogin = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await login(reqLogin, resLogin);
    assert.strictEqual(resLogin.statusCode, 200, 'Login with temporary password must return 200');
    assert.strictEqual(resLogin.body.success, true);
    assert.ok(resLogin.body.token, 'Must return JWT token');
    assert.strictEqual(resLogin.body.mustChangePassword, true, 'Token must indicate mustChangePassword=true');
  });

  await t.test('Requirement 3: Revocation uses real UserSession schema fields; protect rejects revoked session (401); stale role in JWT fails (403)', async () => {
    const UserSession = require('../models/UserSession');
    const { protect, requireRole } = require('../middleware/auth');
    const jwt = require('jsonwebtoken');

    // 1. Create user and active UserSession
    const sessUser = await User.create({
      name: 'Session Revocation Test User',
      email: 'session.test@bjkhealthcare.com',
      role: 'EMPLOYEE',
      department: 'Production',
      employeeId: 'BHK8801',
      isActive: true,
      status: 'ACTIVE'
    });

    await Employee.create({
      employeeId: 'BHK8801',
      firstName: 'Session',
      lastName: 'User',
      fullName: 'Session Revocation Test User',
      email: 'session.test@bjkhealthcare.com',
      department: 'Production',
      designation: 'Operator',
      status: 'ACTIVE',
      user: sessUser._id
    });

    const activeSession = await UserSession.create({
      userId: sessUser._id,
      employeeId: 'BHK8801',
      sessionId: 'sess_active_998877',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 3600 * 1000)
    });
    assert.strictEqual(activeSession.status, 'ACTIVE');

    // 2. Perform password reset
    const hrAdminId = new mongoose.Types.ObjectId();
    const reqReset = {
      user: { id: hrAdminId, _id: hrAdminId, role: 'SUPER_ADMIN', email: 'admin@bjkhealthcare.com' },
      params: { id: 'BHK8801' },
      body: { reason: 'Revoke sessions and reset credentials for audit verification' },
      headers: {},
      ip: '127.0.0.1'
    };
    const resReset = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };
    await resetEmployeePassword(reqReset, resReset);

    // 3. Verify UserSession is REVOKED using real schema fields
    const sessionInDb = await UserSession.findOne({ sessionId: 'sess_active_998877' });
    assert.strictEqual(sessionInDb.status, 'REVOKED', 'Session status must be REVOKED');
    assert.ok(sessionInDb.terminatedAt instanceof Date, 'terminatedAt must be a Date');
    assert.strictEqual(sessionInDb.terminatedBy, 'admin@bjkhealthcare.com');

    // 4. Test protect with JWT bearing revoked sessionId -> returns 401
    const revokedToken = jwt.sign(
      { id: sessUser._id.toString(), email: sessUser.email, role: 'EMPLOYEE', sessionId: 'sess_active_998877' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const reqProtectRevoked = {
      headers: { authorization: `Bearer ${revokedToken}` }
    };
    const resProtectRevoked = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };
    let nextCalled = false;
    await protect(reqProtectRevoked, resProtectRevoked, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false, 'Revoked session must not call next()');
    assert.strictEqual(resProtectRevoked.statusCode, 401, 'Revoked session must return 401');
    assert.ok(resProtectRevoked.body.message.includes('revoked'));

    // 5. Test stale role in JWT -> JWT minted with role HR_MANAGER, but DB user is EMPLOYEE
    const staleUser = await User.create({
      name: 'Stale Role User',
      email: 'stale.role@bjkhealthcare.com',
      role: 'EMPLOYEE',
      department: 'Production',
      employeeId: 'BHK8802',
      isActive: true,
      status: 'ACTIVE',
      mustChangePassword: false
    });

    const staleRoleToken = jwt.sign(
      { id: staleUser._id.toString(), email: staleUser.email, role: 'HR_MANAGER' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const reqStaleRole = {
      headers: { authorization: `Bearer ${staleRoleToken}` }
    };
    const resStaleRole = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };
    let protectPassed = false;
    await protect(reqStaleRole, resStaleRole, () => { protectPassed = true; });

    assert.strictEqual(protectPassed, true, 'protect reads live DB record');
    assert.strictEqual(reqStaleRole.user.role, 'EMPLOYEE', 'req.user.role must be EMPLOYEE from DB, ignoring stale JWT role HR_MANAGER');

    // Downstream requireRole('HR_MANAGER') must reject with 403
    const requireHrManager = requireRole('HR_MANAGER');
    const resRequireRole = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };
    let rolePassed = false;
    requireHrManager(reqStaleRole, resRequireRole, () => { rolePassed = true; });

    assert.strictEqual(rolePassed, false, 'Demoted user must not pass requireRole');
    assert.strictEqual(resRequireRole.statusCode, 403, 'Demoted user must receive 403');
  });

  await t.test('Task 3: When audit logging fails, database state is completely unchanged', async () => {
    const salt = await bcrypt.genSalt(10);
    const immutableHash = await bcrypt.hash('UntouchablePassword2026!', salt);

    // Create user in DB
    const user = await User.create({
      name: 'Audit Integrity User',
      email: 'audit.integrity@bjkhealthcare.com',
      password: immutableHash,
      passwordHash: immutableHash,
      role: 'EMPLOYEE',
      employeeId: 'BHK7702',
      employeeCode: 'BHK7702',
      isActive: true,
      status: 'ACTIVE',
      mustChangePassword: false,
      temporaryPassword: false
    });

    await Employee.create({
      employeeId: 'BHK7702',
      employeeCode: 'BHK7702',
      firstName: 'Audit',
      lastName: 'Integrity',
      fullName: 'Audit Integrity',
      email: 'audit.integrity@bjkhealthcare.com',
      department: 'General',
      designation: 'Staff',
      user: user._id
    });

    // Mock AuditLog.logActionStrict to throw failure
    const origAuditStrict = AuditLog.logActionStrict;
    AuditLog.logActionStrict = async () => {
      throw new Error('Disk I/O failure: unable to persist audit trail');
    };

    try {
      const req = {
        user: { id: 'hr-mgr-id', role: 'HR_MANAGER', email: 'hrmanager@bjkhealthcare.com' },
        params: { id: 'BHK7702' },
        body: { reason: 'Reset attempt during audit outage' },
        headers: {},
        ip: '127.0.0.1'
      };
      const res = {
        statusCode: 200,
        status(c) { this.statusCode = c; return this; },
        json(d) { this.body = d; return this; }
      };

      await resetEmployeePassword(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(
        res.body.message,
        'Security error: Mandatory audit log write failed. Password reset aborted.'
      );

      // Verify DB state is COMPLETELY UNCHANGED
      const verifyUser = await User.findById(user._id).select('+password +passwordHash');
      assert.strictEqual(verifyUser.password, immutableHash, 'Password hash in DB must remain completely unchanged');
      assert.strictEqual(verifyUser.passwordHash, immutableHash, 'passwordHash must remain untouched');
      assert.strictEqual(verifyUser.mustChangePassword, false, 'mustChangePassword must not have flipped');
      assert.strictEqual(verifyUser.temporaryPassword, false, 'temporaryPassword must not have flipped');
    } finally {
      AuditLog.logActionStrict = origAuditStrict;
    }
  });

  await t.test('Task 3: Returns 409 Conflict when employee has no linked user account', async () => {
    // Create Employee without any linked User account
    await Employee.create({
      employeeId: 'BHK7703_NO_USER',
      employeeCode: 'BHK7703_NO_USER',
      firstName: 'NoUser',
      lastName: 'Employee',
      fullName: 'NoUser Employee',
      email: 'nouser@bjkhealthcare.com',
      department: 'General',
      designation: 'Staff',
      user: null
    });

    const req = {
      user: { id: 'hr-mgr-id', role: 'HR_MANAGER', email: 'hrmanager@bjkhealthcare.com' },
      params: { id: 'BHK7703_NO_USER' },
      body: { reason: 'Attempting to reset employee with no user account' },
      headers: {},
      ip: '127.0.0.1'
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await resetEmployeePassword(req, res);

    assert.strictEqual(res.statusCode, 409, 'Must return HTTP 409 Conflict');
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Conflict: Employee record has no linked user account to reset.');
  });

  await t.test('Task 6: Allow-list projections tested against real Employee schema paths including nested fields', async () => {
    const fullEmployeeDoc = await Employee.create({
      employeeId: 'BHK7704_PROJ',
      employeeCode: 'BHK7704_PROJ',
      firstName: 'Arvind',
      lastName: 'Sharma',
      fullName: 'Arvind Sharma',
      department: 'Quality Assurance',
      departmentName: 'Quality Assurance',
      designation: 'QA Executive',
      designationTitle: 'QA Executive',
      status: 'ACTIVE',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      workLocation: 'Ahmedabad Plant',
      workEmail: 'arvind.sharma@bjkhealthcare.com',
      email: 'arvind.sharma@bjkhealthcare.com',
      phone: '+91 9876543210',
      basicSalary: 55000,
      ctc: 660000,
      grossSalary: 60000,
      salaryStructure: { ctc: 660000, basic: 55000, hra: 15000 },
      bankDetails: {
        bankName: 'HDFC Bank',
        accountNumber: '5010022334455',
        ifsc: 'HDFC0001234',
        branch: 'Bodakdev'
      },
      bankAccountNumber: '5010022334455',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      panNumber: 'ABCPS1234K',
      aadhaarNumber: '1234-5678-9012',
      dateOfBirth: new Date('1988-11-20'),
      currentAddress: 'A-402 Shivalik Residences, Ahmedabad',
      currentAddressDetails: {
        line1: 'A-402 Shivalik Residences',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015'
      },
      permanentAddress: 'C-12 Village Post, Mehsana',
      familyDetails: [
        { name: 'Kavita Sharma', relation: 'SPOUSE', phone: '+91 9988776655' }
      ],
      emergencyContacts: [
        { name: 'Ramesh Sharma', relationship: 'BROTHER', mobile: '+91 9123456780' }
      ],
      identityDocuments: [
        { documentType: 'PAN', documentNumber: 'ABCPS1234K' },
        { documentType: 'AADHAAR', documentNumber: '123456789012' }
      ],
      documents: [
        { documentId: 'DOC-001', documentName: 'Degree_Certificate.pdf', documentType: 'EDUCATION' }
      ]
    });

    // 1. MANAGER ALLOW-LIST PROJECTION
    const managerProjected = sanitizeForManager(fullEmployeeDoc);

    // Whitelisted operational fields present
    assert.strictEqual(managerProjected.employeeId, 'BHK7704_PROJ');
    assert.strictEqual(managerProjected.fullName, 'Arvind Sharma');
    assert.strictEqual(managerProjected.departmentName, 'Quality Assurance');
    assert.strictEqual(managerProjected.designationTitle, 'QA Executive');
    assert.strictEqual(managerProjected.status, 'ACTIVE');

    // Confidential compensation and banking fields MUST BE UNDEFINED
    assert.strictEqual(managerProjected.basicSalary, undefined);
    assert.strictEqual(managerProjected.ctc, undefined);
    assert.strictEqual(managerProjected.grossSalary, undefined);
    assert.strictEqual(managerProjected.salaryStructure, undefined);
    assert.strictEqual(managerProjected.bankDetails, undefined);
    assert.strictEqual(managerProjected.bankAccountNumber, undefined);
    assert.strictEqual(managerProjected.bankName, undefined);
    assert.strictEqual(managerProjected.ifscCode, undefined);

    // Confidential PII and nested personal fields MUST BE UNDEFINED
    assert.strictEqual(managerProjected.panNumber, undefined);
    assert.strictEqual(managerProjected.aadhaarNumber, undefined);
    assert.strictEqual(managerProjected.dateOfBirth, undefined);
    assert.strictEqual(managerProjected.currentAddress, undefined);
    assert.strictEqual(managerProjected.currentAddressDetails, undefined);
    assert.strictEqual(managerProjected.permanentAddress, undefined);
    assert.strictEqual(managerProjected.familyDetails, undefined);
    assert.strictEqual(managerProjected.emergencyContacts, undefined);
    assert.strictEqual(managerProjected.identityDocuments, undefined);
    assert.strictEqual(managerProjected.documents, undefined);

    // 2. FINANCE ALLOW-LIST PROJECTION
    const financeProjected = sanitizeForFinance(fullEmployeeDoc);

    // Operational fields present
    assert.strictEqual(financeProjected.employeeId, 'BHK7704_PROJ');
    assert.strictEqual(financeProjected.fullName, 'Arvind Sharma');

    // Compensation & banking details RETAINED for payroll operations
    assert.strictEqual(financeProjected.basicSalary, 55000);
    assert.ok(financeProjected.bankDetails);
    assert.strictEqual(financeProjected.bankAccountNumber, '5010022334455');
    assert.strictEqual(financeProjected.bankName, 'HDFC Bank');
    assert.strictEqual(financeProjected.ifscCode, 'HDFC0001234');

    // Sensitive personal PII and unneeded nested fields MUST BE UNDEFINED
    assert.strictEqual(financeProjected.panNumber, undefined);
    assert.strictEqual(financeProjected.aadhaarNumber, undefined);
    assert.strictEqual(financeProjected.dateOfBirth, undefined);
    assert.strictEqual(financeProjected.currentAddress, undefined);
    assert.strictEqual(financeProjected.currentAddressDetails, undefined);
    assert.strictEqual(financeProjected.permanentAddress, undefined);
    assert.strictEqual(financeProjected.familyDetails, undefined);
    assert.strictEqual(financeProjected.emergencyContacts, undefined);
    assert.strictEqual(financeProjected.identityDocuments, undefined);
    assert.strictEqual(financeProjected.documents, undefined);
  });

  // Teardown
  await mongoose.disconnect();
  await mongod.stop();
});
