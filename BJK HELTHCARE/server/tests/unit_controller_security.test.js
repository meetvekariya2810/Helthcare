const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

const {
  ROLES,
  PROTECTED_ROLES,
  getRoleRank,
  canManageCredentials,
  canAssignRole,
  generateSecureRandomPassword
} = require('../config/rbac');
const {
  resetEmployeePassword,
  updateEmployeeRole,
  sanitizeForManager,
  sanitizeForFinance
} = require('../controllers/employeeController');
const {
  resetEmployeePassword: resetUserPassword,
  updateUserRole
} = require('../controllers/hrController');
const AuditLog = require('../models/AuditLog');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Helper to construct mock Express req / res objects
function createMockReqRes({ user, body = {}, params = {}, headers = {}, ip = '127.0.0.1' }) {
  const req = {
    user,
    body,
    params,
    headers,
    ip
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };

  return { req, res };
}

// -------------------------------------------------------------
// 1. Controller Tests: resetEmployeePassword & Role Enforcement
// -------------------------------------------------------------

test('Controller (resetEmployeePassword): HR_MANAGER can reset EMPLOYEE credentials', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findOne;
  const origAuditStrict = AuditLog.logActionStrict;

  let auditCalled = false;
  let userSaved = false;

  const mockTargetUser = {
    _id: 'target-user-001',
    role: 'EMPLOYEE',
    email: 'target.emp@bjkhealthcare.com',
    password: 'old-hash',
    mustChangePassword: false,
    save: async () => { userSaved = true; }
  };

  const mockEmployee = {
    _id: 'emp-doc-001',
    employeeId: 'BHK0101',
    employeeCode: 'BHK0101',
    fullName: 'Jane Doe',
    email: 'target.emp@bjkhealthcare.com',
    systemRole: 'EMPLOYEE',
    department: 'Packaging',
    save: async () => {}
  };

  Employee.findOne = async () => mockEmployee;
  User.findOne = async () => mockTargetUser;
  AuditLog.logActionStrict = async () => { auditCalled = true; };

  try {
    const { req, res } = createMockReqRes({
      user: { id: 'hr-user-001', role: 'HR_MANAGER', email: 'hr.manager@bjkhealthcare.com' },
      params: { employeeId: 'BHK0101' },
      body: { reason: 'Scheduled onboarding credential reset' }
    });

    await resetEmployeePassword(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.temporaryPassword, 'Must return temporary password to HR caller once');
    assert.strictEqual(res.body.temporaryPassword.length, 20, 'Temp password must be 20 chars');
    assert.strictEqual(auditCalled, true, 'AuditLog must be recorded');
    assert.strictEqual(userSaved, true, 'Target user must be saved');
  } finally {
    Employee.findOne = origFindEmployee;
    User.findOne = origFindUser;
    AuditLog.logActionStrict = origAuditStrict;
  }
});

test('Controller (resetEmployeePassword): HR_MANAGER CANNOT reset PROTECTED_ROLES or HR_ADMIN', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findOne;
  const origAuditStrict = AuditLog.logActionStrict;

  const testRolesToBlock = [
    ...PROTECTED_ROLES,
    ROLES.HR_ADMIN
  ];

  for (const forbiddenRole of testRolesToBlock) {
    const mockTargetUser = {
      _id: `target-user-${forbiddenRole}`,
      role: forbiddenRole,
      email: `${forbiddenRole.toLowerCase()}@bjkhealthcare.com`,
      save: async () => { throw new Error('User save should NOT be called for forbidden reset!'); }
    };

    const mockEmployee = {
      _id: `emp-${forbiddenRole}`,
      employeeId: `BHK-${forbiddenRole}`,
      fullName: `User ${forbiddenRole}`,
      email: mockTargetUser.email,
      systemRole: forbiddenRole,
      save: async () => {}
    };

    Employee.findOne = async () => mockEmployee;
    User.findOne = async () => mockTargetUser;
    AuditLog.logActionStrict = async () => { throw new Error('AuditLog should NOT be written for forbidden reset!'); };

    try {
      const { req, res } = createMockReqRes({
        user: { id: 'hr-user-001', role: 'HR_MANAGER', email: 'hr.manager@bjkhealthcare.com' },
        params: { employeeId: `BHK-${forbiddenRole}` },
        body: { reason: 'Unauthorized reset attempt' }
      });

      await resetEmployeePassword(req, res);

      assert.strictEqual(res.statusCode, 403, `HR_MANAGER resetting ${forbiddenRole} must return 403`);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Access denied'));
    } finally {
      Employee.findOne = origFindEmployee;
      User.findOne = origFindUser;
      AuditLog.logActionStrict = origAuditStrict;
    }
  }
});

test('Controller (resetEmployeePassword): SUPER_ADMIN can reset other accounts', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findOne;
  const origAuditStrict = AuditLog.logActionStrict;

  let auditCalled = false;
  let userSaved = false;

  const mockTargetUser = {
    _id: 'target-director-001',
    role: 'DIRECTOR',
    email: 'director@bjkhealthcare.com',
    save: async () => { userSaved = true; }
  };

  const mockEmployee = {
    _id: 'emp-dir',
    employeeId: 'BHK-DIR',
    fullName: 'Executive Director',
    email: 'director@bjkhealthcare.com',
    systemRole: 'DIRECTOR',
    save: async () => {}
  };

  Employee.findOne = async () => mockEmployee;
  User.findOne = async () => mockTargetUser;
  AuditLog.logActionStrict = async () => { auditCalled = true; };

  try {
    const { req, res } = createMockReqRes({
      user: { id: 'super-admin-001', role: 'SUPER_ADMIN', email: 'super.admin@bjkhealthcare.com' },
      params: { employeeId: 'BHK-DIR' },
      body: { reason: 'Executive credentials rotation by Super Admin' }
    });

    await resetEmployeePassword(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(auditCalled, true);
    assert.strictEqual(userSaved, true);
  } finally {
    Employee.findOne = origFindEmployee;
    User.findOne = origFindUser;
    AuditLog.logActionStrict = origAuditStrict;
  }
});

test('Controller (resetEmployeePassword): Unknown caller or target role is strictly denied', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findOne;

  // Unknown target role
  const mockTargetUser = {
    _id: 'target-invalid',
    role: 'NON_EXISTENT_ROLE',
    email: 'invalid@bjkhealthcare.com',
    save: async () => {}
  };
  const mockEmployee = {
    employeeId: 'BHK-INV',
    fullName: 'Invalid Target',
    systemRole: 'NON_EXISTENT_ROLE',
    save: async () => {}
  };

  Employee.findOne = async () => mockEmployee;
  User.findOne = async () => mockTargetUser;

  try {
    // 1. Valid HR caller targeting unknown role
    const { req: req1, res: res1 } = createMockReqRes({
      user: { id: 'hr-user-001', role: 'HR_MANAGER' },
      params: { employeeId: 'BHK-INV' },
      body: { reason: 'Testing unknown target role' }
    });
    await resetEmployeePassword(req1, res1);
    assert.strictEqual(res1.statusCode, 403);
    assert.strictEqual(res1.body.success, false);

    // 2. Unknown caller role targeting EMPLOYEE
    mockTargetUser.role = 'EMPLOYEE';
    mockEmployee.systemRole = 'EMPLOYEE';
    const { req: req2, res: res2 } = createMockReqRes({
      user: { id: 'rogue-user-001', role: 'UNKNOWN_CALLER_ROLE' },
      params: { employeeId: 'BHK-INV' },
      body: { reason: 'Testing unknown caller role' }
    });
    await resetEmployeePassword(req2, res2);
    assert.strictEqual(res2.statusCode, 403);
    assert.strictEqual(res2.body.success, false);
  } finally {
    Employee.findOne = origFindEmployee;
    User.findOne = origFindUser;
  }
});

test('Controller (resetEmployeePassword): Self-reset via HR flow is strictly denied', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findOne;

  const mockTargetUser = {
    _id: 'same-user-id',
    role: 'HR_MANAGER',
    email: 'hr.manager@bjkhealthcare.com',
    save: async () => {}
  };
  const mockEmployee = {
    employeeId: 'BHK-HR-01',
    fullName: 'HR Manager',
    email: 'hr.manager@bjkhealthcare.com',
    systemRole: 'HR_MANAGER',
    save: async () => {}
  };

  Employee.findOne = async () => mockEmployee;
  User.findOne = async () => mockTargetUser;

  try {
    const { req, res } = createMockReqRes({
      user: { id: 'same-user-id', role: 'HR_MANAGER', email: 'hr.manager@bjkhealthcare.com' },
      params: { employeeId: 'BHK-HR-01' },
      body: { reason: 'Attempting self-reset' }
    });

    await resetEmployeePassword(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Self-reset'));
  } finally {
    Employee.findOne = origFindEmployee;
    User.findOne = origFindUser;
  }
});

test('Controller (resetEmployeePassword): Mandatory audit failure strictly aborts reset with 500', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findOne;
  const origAuditStrict = AuditLog.logActionStrict;

  let targetSaved = false;

  const mockTargetUser = {
    _id: 'emp-user-001',
    role: 'EMPLOYEE',
    password: 'unchanged-hash',
    email: 'test@bjkhealthcare.com',
    save: async () => { targetSaved = true; }
  };
  const mockEmployee = {
    employeeId: 'BHK-001',
    fullName: 'Worker',
    systemRole: 'EMPLOYEE',
    save: async () => {}
  };

  Employee.findOne = async () => mockEmployee;
  User.findOne = async () => mockTargetUser;
  AuditLog.logActionStrict = async () => {
    throw new Error('Database write error: disk full / connection failure');
  };

  try {
    const { req, res } = createMockReqRes({
      user: { id: 'hr-001', role: 'HR_MANAGER', email: 'hr@bjkhealthcare.com' },
      params: { employeeId: 'BHK-001' },
      body: { reason: 'Reset attempt with simulated audit failure' }
    });

    await resetEmployeePassword(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('audit log write failed'));
    assert.strictEqual(targetSaved, false, 'Target password MUST NOT be updated if audit log write fails');
  } finally {
    Employee.findOne = origFindEmployee;
    User.findOne = origFindUser;
    AuditLog.logActionStrict = origAuditStrict;
  }
});

// -------------------------------------------------------------
// 2. Pure Projection Function Unit Tests (sanitizeForManager / sanitizeForFinance)
// -------------------------------------------------------------

test('Projections: sanitizeForManager strips all compensation, banking, identity, DOB, address, family, documents', () => {
  const mockEmployeeDoc = {
    _id: 'emp-501',
    employeeId: 'BHK1055',
    fullName: 'Amit Patel',
    departmentName: 'Production',
    designationTitle: 'Machine Operator',
    status: 'ACTIVE',
    basicSalary: 45000,
    basicPay: 45000,
    salary: 45000,
    salaryStructure: { ctc: 540000, basic: 45000 },
    ctc: 540000,
    grossSalary: 48000,
    bankDetails: { accountNumber: '1234567890', ifsc: 'SBIN0001234' },
    bankName: 'State Bank of India',
    bankAccountNumber: '1234567890',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    branchName: 'Naroda',
    aadhaarNumber: '9999-8888-7777',
    panNumber: 'ABCDE1234F',
    passportNumber: 'Z1234567',
    identityDocuments: [{ type: 'Aadhaar', number: '999988887777' }],
    dateOfBirth: new Date('1990-05-15'),
    dob: '1990-05-15',
    currentAddress: '123 MG Road, Ahmedabad',
    currentAddressDetails: { city: 'Ahmedabad' },
    permanentAddress: '456 Ring Road, Surat',
    permanentAddressDetails: { city: 'Surat' },
    familyDetails: [{ relation: 'Spouse', name: 'Pooja' }],
    familyMembers: ['Pooja'],
    emergencyContacts: [{ name: 'Father', phone: '9876543210' }],
    emergencyContactName: 'Father',
    emergencyContactPhone: '9876543210',
    emergencyContactRelation: 'Parent',
    documents: [{ name: 'offer_letter.pdf' }],
    documentUploads: ['doc1.pdf']
  };

  const managerView = sanitizeForManager(mockEmployeeDoc);

  // Allowed operational fields
  assert.strictEqual(managerView.fullName, 'Amit Patel');
  assert.strictEqual(managerView.employeeId, 'BHK1055');
  assert.strictEqual(managerView.departmentName, 'Production');
  assert.strictEqual(managerView.status, 'ACTIVE');

  // Strictly stripped confidential fields
  assert.strictEqual(managerView.basicSalary, undefined);
  assert.strictEqual(managerView.salary, undefined);
  assert.strictEqual(managerView.salaryStructure, undefined);
  assert.strictEqual(managerView.ctc, undefined);
  assert.strictEqual(managerView.grossSalary, undefined);
  assert.strictEqual(managerView.bankDetails, undefined);
  assert.strictEqual(managerView.bankName, undefined);
  assert.strictEqual(managerView.bankAccountNumber, undefined);
  assert.strictEqual(managerView.accountNumber, undefined);
  assert.strictEqual(managerView.ifscCode, undefined);
  assert.strictEqual(managerView.aadhaarNumber, undefined);
  assert.strictEqual(managerView.panNumber, undefined);
  assert.strictEqual(managerView.passportNumber, undefined);
  assert.strictEqual(managerView.identityDocuments, undefined);
  assert.strictEqual(managerView.dateOfBirth, undefined);
  assert.strictEqual(managerView.dob, undefined);
  assert.strictEqual(managerView.currentAddress, undefined);
  assert.strictEqual(managerView.permanentAddress, undefined);
  assert.strictEqual(managerView.familyDetails, undefined);
  assert.strictEqual(managerView.emergencyContacts, undefined);
  assert.strictEqual(managerView.documents, undefined);
  assert.strictEqual(managerView.documentUploads, undefined);
});

test('Projections: sanitizeForFinance retains salary structure but strips PII, banking, family, documents', () => {
  const mockEmployeeDoc = {
    _id: 'emp-502',
    employeeId: 'BHK1056',
    fullName: 'Suresh Shah',
    basicSalary: 60000,
    salaryStructure: { ctc: 720000, basic: 60000 },
    ctc: 720000,
    bankDetails: { accountNumber: '9876543210' },
    bankAccountNumber: '9876543210',
    aadhaarNumber: '1111-2222-3333',
    panNumber: 'FGHIJ5678K',
    dateOfBirth: new Date('1985-02-10'),
    currentAddress: 'Ahmedabad'
  };

  const financeView = sanitizeForFinance(mockEmployeeDoc);

  // Compensation & banking retained for payroll calculation
  assert.strictEqual(financeView.basicSalary, 60000);
  assert.strictEqual(financeView.ctc, 720000);
  assert.ok(financeView.salaryStructure);
  assert.ok(financeView.bankDetails);
  assert.strictEqual(financeView.bankAccountNumber, '9876543210');

  // PII & direct personal identity stripped
  assert.strictEqual(financeView.aadhaarNumber, undefined);
  assert.strictEqual(financeView.panNumber, undefined);
  assert.strictEqual(financeView.dateOfBirth, undefined);
  assert.strictEqual(financeView.currentAddress, undefined);
});

// -------------------------------------------------------------
// 3. Controller Tests: hrController.resetUserPassword
// -------------------------------------------------------------

test('Controller (hrController.resetUserPassword): HR_MANAGER can reset EMPLOYEE and cannot reset PROTECTED_ROLES or HR_ADMIN', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findById;
  const origAuditStrict = AuditLog.logActionStrict;
  const origUserSession = require('../models/UserSession');
  const origUpdateMany = origUserSession.updateMany;

  let auditCalled = false;
  let userSaved = false;

  const mockTargetUser = {
    _id: 'target-emp-55',
    email: 'target.emp@bjkhealthcare.com',
    role: 'EMPLOYEE',
    save: async () => { userSaved = true; }
  };

  const mockEmployee = {
    employeeId: 'BHK1055',
    email: 'target.emp@bjkhealthcare.com',
    user: 'target-emp-55'
  };

  Employee.findOne = async () => mockEmployee;
  User.findById = async () => mockTargetUser;
  AuditLog.logActionStrict = async () => { auditCalled = true; };
  origUserSession.updateMany = async () => ({ modifiedCount: 1 });

  try {
    // 1. HR_MANAGER resets EMPLOYEE -> 200
    const { req: req1, res: res1 } = createMockReqRes({
      user: { id: 'hr-mgr-1', role: 'HR_MANAGER', email: 'hr.mgr@bjkhealthcare.com' },
      params: { id: 'BHK1055' },
      body: { reason: 'Password reset request by HR' }
    });
    await resetUserPassword(req1, res1);
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.body.success, true);
    assert.ok(res1.body.temporaryPassword);
    assert.strictEqual(res1.body.temporaryPassword.length, 20);
    assert.strictEqual(auditCalled, true);
    assert.strictEqual(userSaved, true);

    // 2. HR_MANAGER cannot reset AUDITOR -> 403
    mockTargetUser.role = 'AUDITOR';
    const { req: req2, res: res2 } = createMockReqRes({
      user: { id: 'hr-mgr-1', role: 'HR_MANAGER', email: 'hr.mgr@bjkhealthcare.com' },
      params: { id: 'BHK1055' },
      body: { reason: 'Attempt to reset Auditor' }
    });
    await resetUserPassword(req2, res2);
    assert.strictEqual(res2.statusCode, 403);
    assert.strictEqual(res2.body.success, false);

    // 3. HR_MANAGER cannot reset HR_ADMIN -> 403
    mockTargetUser.role = 'HR_ADMIN';
    const { req: req3, res: res3 } = createMockReqRes({
      user: { id: 'hr-mgr-1', role: 'HR_MANAGER', email: 'hr.mgr@bjkhealthcare.com' },
      params: { id: 'BHK1055' },
      body: { reason: 'Attempt to reset HR_ADMIN' }
    });
    await resetUserPassword(req3, res3);
    assert.strictEqual(res3.statusCode, 403);
    assert.strictEqual(res3.body.success, false);

    // 4. Self-reset denied -> 403
    mockTargetUser.role = 'HR_MANAGER';
    mockTargetUser._id = 'hr-mgr-1';
    const { req: req4, res: res4 } = createMockReqRes({
      user: { id: 'hr-mgr-1', role: 'HR_MANAGER', email: 'target.emp@bjkhealthcare.com' },
      params: { id: 'BHK1055' },
      body: { reason: 'Attempt self reset' }
    });
    await resetUserPassword(req4, res4);
    assert.strictEqual(res4.statusCode, 403);
    assert.strictEqual(res4.body.success, false);
    assert.ok(res4.body.message.includes('Self-reset'));
  } finally {
    Employee.findOne = origFindEmployee;
    User.findById = origFindUser;
    AuditLog.logActionStrict = origAuditStrict;
    origUserSession.updateMany = origUpdateMany;
  }
});

// -------------------------------------------------------------
// 4. Controller Tests: Role Assignment Authorization (updateEmployeeRole & updateUserRole)
// -------------------------------------------------------------

test('Controller (updateEmployeeRole): Enforces role hierarchy and self-modification guards', async () => {
  const origFindEmployee = Employee.findOne;
  const origFindUser = User.findById;

  const mockTargetUser = {
    _id: 'target-u-1',
    role: 'EMPLOYEE',
    email: 'target.u1@bjkhealthcare.com',
    save: async () => {}
  };

  const mockEmployee = {
    employeeId: 'BHK201',
    systemRole: 'EMPLOYEE',
    email: 'target.u1@bjkhealthcare.com',
    user: 'target-u-1',
    save: async () => {}
  };

  Employee.findOne = async () => mockEmployee;
  User.findById = async () => mockTargetUser;

  try {
    // 1. HR_MANAGER cannot promote EMPLOYEE to SUPER_ADMIN -> 403
    const { req: req1, res: res1 } = createMockReqRes({
      user: { id: 'hr-mgr-1', role: 'HR_MANAGER', email: 'hr.mgr@bjkhealthcare.com' },
      params: { id: 'BHK201' },
      body: { role: 'SUPER_ADMIN', reason: 'Unauthorized privilege escalation' }
    });
    await updateEmployeeRole(req1, res1);
    assert.strictEqual(res1.statusCode, 403);
    assert.strictEqual(res1.body.success, false);

    // 2. HR_MANAGER cannot promote EMPLOYEE to PROTECTED_ROLES (e.g. AUDITOR) -> 403
    const { req: req2, res: res2 } = createMockReqRes({
      user: { id: 'hr-mgr-1', role: 'HR_MANAGER', email: 'hr.mgr@bjkhealthcare.com' },
      params: { id: 'BHK201' },
      body: { role: 'AUDITOR', reason: 'Unauthorized role assignment' }
    });
    await updateEmployeeRole(req2, res2);
    assert.strictEqual(res2.statusCode, 403);
    assert.strictEqual(res2.body.success, false);

    // 3. Self-modification of role is strictly denied -> 403
    const { req: req3, res: res3 } = createMockReqRes({
      user: { id: 'target-u-1', role: 'EMPLOYEE', email: 'target.u1@bjkhealthcare.com' },
      params: { id: 'BHK201' },
      body: { role: 'TEAM_LEAD', reason: 'Self-promotion attempt' }
    });
    await updateEmployeeRole(req3, res3);
    assert.strictEqual(res3.statusCode, 403);
    assert.strictEqual(res3.body.success, false);
    assert.ok(res3.body.message.includes('Self-modification'));
  } finally {
    Employee.findOne = origFindEmployee;
    User.findById = origFindUser;
  }
});

