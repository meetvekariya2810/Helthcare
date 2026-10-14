const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'a_secure_temporary_test_secret_with_over_32_characters_2026!';

const { ROLES, PERMISSIONS, hasPermission } = require('../config/rbac');
const {
  updateHRBankDetailsByEmployeeId,
  verifyHRBankDetails,
  rejectHRBankDetails,
  requestCorrectionHRBankDetails
} = require('../controllers/hrms/bankDetailsController');
const bankDetailsService = require('../services/hrms/bankDetailsService');
const AuditLog = require('../models/AuditLog');
const { deletePayrollRecord } = require('../controllers/hrms/payrollController');
const { Payroll } = require('../models/hrms/Payroll');

// ==============================================================================
// 1. BANK DETAILS RBAC LEAST-PRIVILEGE TESTS
// ==============================================================================

test('Bank RBAC: Canonical permissions confirm HR_EXECUTIVE is view-only', () => {
  assert.strictEqual(hasPermission(ROLES.HR_EXECUTIVE, PERMISSIONS.BANK_DETAILS_VIEW), true);
  assert.strictEqual(hasPermission(ROLES.HR_EXECUTIVE, PERMISSIONS.BANK_DETAILS_MANAGE), false);
  assert.strictEqual(hasPermission(ROLES.HR_EXECUTIVE, PERMISSIONS.BANK_DETAILS_VERIFY), false);
});

test('Bank RBAC: PAYROLL_ADMIN and FINANCE_MANAGER retain legitimate view permissions', () => {
  assert.strictEqual(hasPermission(ROLES.PAYROLL_ADMIN, PERMISSIONS.BANK_DETAILS_VIEW), true);
  assert.strictEqual(hasPermission(ROLES.FINANCE_MANAGER, PERMISSIONS.BANK_DETAILS_VIEW), true);
  assert.strictEqual(hasPermission(ROLES.HR_ADMIN, PERMISSIONS.BANK_DETAILS_VIEW), true);
  assert.strictEqual(hasPermission(ROLES.HR_MANAGER, PERMISSIONS.BANK_DETAILS_VIEW), true);
});

test('Bank RBAC: HR_ADMIN and HR_MANAGER retain full manage and verify capabilities', () => {
  assert.strictEqual(hasPermission(ROLES.HR_ADMIN, PERMISSIONS.BANK_DETAILS_MANAGE), true);
  assert.strictEqual(hasPermission(ROLES.HR_ADMIN, PERMISSIONS.BANK_DETAILS_VERIFY), true);
  assert.strictEqual(hasPermission(ROLES.HR_MANAGER, PERMISSIONS.BANK_DETAILS_MANAGE), true);
  assert.strictEqual(hasPermission(ROLES.HR_MANAGER, PERMISSIONS.BANK_DETAILS_VERIFY), true);
});

test('Bank Controller: HR_EXECUTIVE cannot update bank details (403 Forbidden)', async () => {
  const req = {
    user: { role: ROLES.HR_EXECUTIVE, permissions: ['bank_details:view'] },
    params: { employeeId: 'BH1001' },
    body: { accountNumber: '123456789012', ifscCode: 'SBIN0001234' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await updateHRBankDetailsByEmployeeId(req, res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('bank_details:manage'));
});

test('Bank Controller: HR_EXECUTIVE cannot verify bank details (403 Forbidden)', async () => {
  const req = {
    user: { role: ROLES.HR_EXECUTIVE, permissions: ['bank_details:view'] },
    params: { employeeId: 'BH1001' },
    body: { remarks: 'Verified by Executive' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await verifyHRBankDetails(req, res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('bank_details:verify'));
});

test('Bank Controller: HR_EXECUTIVE cannot reject bank details (403 Forbidden)', async () => {
  const req = {
    user: { role: ROLES.HR_EXECUTIVE, permissions: ['bank_details:view'] },
    params: { employeeId: 'BH1001' },
    body: { remarks: 'Invalid IFSC' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await rejectHRBankDetails(req, res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('bank_details:verify'));
});

test('Bank Controller: HR_EXECUTIVE cannot request correction on bank details (403 Forbidden)', async () => {
  const req = {
    user: { role: ROLES.HR_EXECUTIVE, permissions: ['bank_details:view'] },
    params: { employeeId: 'BH1001' },
    body: { remarks: 'Provide cancelled cheque' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await requestCorrectionHRBankDetails(req, res);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('bank_details:manage'));
});

// ==============================================================================
// 2. STRICT FAIL-CLOSED AUDIT LOGGING TESTS
// ==============================================================================

test('Bank Strict Audit: Audit failure halts update and prevents mutation persistence', async () => {
  const origLogStrict = AuditLog.logActionStrict;
  const Employee = require('../models/Employee');
  const EmployeeBankDetails = require('../models/EmployeeBankDetails');
  const origEmpFindOne = Employee.findOne;
  const origBankFindOne = EmployeeBankDetails.findOne;

  let saveCalled = false;
  Employee.findOne = async () => ({
    _id: new mongoose.Types.ObjectId(),
    employeeId: 'BH1001',
    fullName: 'Test Employee',
    email: 'test@bjkhealthcare.com'
  });

  EmployeeBankDetails.findOne = async () => ({
    _id: new mongoose.Types.ObjectId(),
    accountHolderName: 'Test Employee',
    accountNumber: '123456789012',
    ifscCode: 'SBIN0001234',
    save: async () => { saveCalled = true; }
  });

  // Mock AuditLog.logActionStrict to throw failure
  AuditLog.logActionStrict = async () => {
    throw new Error('Disk I/O failure: unable to append audit record');
  };

  const req = {
    user: { role: ROLES.HR_ADMIN, name: 'Lead HR', email: 'hr.lead@bjkhealthcare.com' },
    params: { employeeId: 'BH1001' },
    body: { accountNumber: '987654321098' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  try {
    await updateHRBankDetailsByEmployeeId(req, res);
    assert.strictEqual(res.statusCode, 500, 'Must return 500 on mandatory audit log failure');
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Mandatory audit logging failed'));
    assert.strictEqual(saveCalled, false, 'bankDetails.save() must never be called when audit fails');
  } finally {
    AuditLog.logActionStrict = origLogStrict;
    Employee.findOne = origEmpFindOne;
    EmployeeBankDetails.findOne = origBankFindOne;
  }
});

// ==============================================================================
// 3. SINGLE PAYROLL RECORD DELETION SAFETY TESTS
// ==============================================================================

test('Single Payroll Delete: Rejects invalid ID format (400 Bad Request)', async () => {
  const req = {
    params: { id: 'invalid-mongodb-id' },
    body: { reason: 'Test cleanup' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await deletePayrollRecord(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('Invalid payroll record ID'));
});

test('Single Payroll Delete: Rejects missing or empty reason (400 Bad Request)', async () => {
  const req = {
    params: { id: new mongoose.Types.ObjectId().toString() },
    body: { reason: '   ' }
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await deletePayrollRecord(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('mandatory deletion reason'));
});

test('Single Payroll Delete: Returns 404 when record does not exist', async () => {
  const origFindById = Payroll.findById;
  Payroll.findById = async () => null;

  try {
    const req = {
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: { reason: 'Corrective removal' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollRecord(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Payroll record not found.');
  } finally {
    Payroll.findById = origFindById;
  }
});

test('Single Payroll Delete: Strictly rejects deletion of APPROVED record (400)', async () => {
  const origFindById = Payroll.findById;
  Payroll.findById = async () => ({
    _id: new mongoose.Types.ObjectId(),
    status: 'APPROVED',
    employeeId: 'BH1001',
    payPeriod: '2026-03'
  });

  try {
    const req = {
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: { reason: 'Draft was mistakenly submitted' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollRecord(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("locked status 'APPROVED'"));
  } finally {
    Payroll.findById = origFindById;
  }
});

test('Single Payroll Delete: Strictly rejects deletion of PROCESSED, PAID, and FINALIZED records (400)', async () => {
  const origFindById = Payroll.findById;

  for (const lockedStatus of ['PROCESSED', 'PAID', 'FINALIZED']) {
    Payroll.findById = async () => ({
      _id: new mongoose.Types.ObjectId(),
      status: lockedStatus,
      employeeId: 'BH1001',
      payPeriod: '2026-03'
    });

    const req = {
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: { reason: 'Need to re-run payroll' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollRecord(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes(`locked status '${lockedStatus}'`));
  }

  Payroll.findById = origFindById;
});

test('Single Payroll Delete: Safely deletes eligible DRAFT record with atomic query and audit log', async () => {
  const testId = new mongoose.Types.ObjectId();
  const origFindById = Payroll.findById;
  const origFindOneAndDelete = Payroll.findOneAndDelete;

  Payroll.findById = async () => ({
    _id: testId,
    status: 'DRAFT',
    employeeId: 'BH1001',
    employeeName: 'Ramesh Patel',
    payPeriod: '2026-03'
  });

  let atomicFilterUsed = null;
  Payroll.findOneAndDelete = async (filter) => {
    atomicFilterUsed = filter;
    return {
      _id: testId,
      status: 'DRAFT',
      employeeId: 'BH1001',
      employeeName: 'Ramesh Patel',
      payPeriod: '2026-03'
    };
  };

  try {
    const req = {
      params: { id: testId.toString() },
      body: { reason: 'Incorrect attendance days entered' },
      user: { name: 'Payroll Lead', role: 'PAYROLL_ADMIN' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollRecord(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.message.includes('removed successfully'));

    // Verify atomic filter prevented status transition race conditions
    assert.deepStrictEqual(atomicFilterUsed.status, {
      $nin: ['APPROVED', 'PROCESSED', 'PAID', 'FINALIZED']
    });
  } finally {
    Payroll.findById = origFindById;
    Payroll.findOneAndDelete = origFindOneAndDelete;
  }
});

test('Single Payroll Delete: Prevents concurrent race condition if status changed concurrently', async () => {
  const testId = new mongoose.Types.ObjectId();
  const origFindById = Payroll.findById;
  const origFindOneAndDelete = Payroll.findOneAndDelete;

  // Record was DRAFT when checked initially
  Payroll.findById = async () => ({
    _id: testId,
    status: 'DRAFT',
    employeeId: 'BH1001',
    payPeriod: '2026-03'
  });

  // Concurrent request approved the record before atomic delete executes -> returns null
  Payroll.findOneAndDelete = async () => null;

  try {
    const req = {
      params: { id: testId.toString() },
      body: { reason: 'Cleanup before run' },
      user: { name: 'Payroll Officer', role: 'PAYROLL_ADMIN' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollRecord(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('changed concurrently to a locked status'));
  } finally {
    Payroll.findById = origFindById;
    Payroll.findOneAndDelete = origFindOneAndDelete;
  }
});
