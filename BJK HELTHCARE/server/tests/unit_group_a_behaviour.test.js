const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'a_secure_temporary_test_secret_with_over_32_characters_2026!';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/bjk_healthcare_staging';
process.env.DATABASE_NAME = 'bjk_healthcare_staging';
process.env.SEED_ALLOWED_DB = 'bjk_healthcare_staging';

const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const app = require('../server');
const { deletePayrollBatch } = require('../controllers/hrms/payrollController');
const { resetAllCanteenData } = require('../controllers/hrms/canteenController');
const { sendOtp, forgotPassword } = require('../controllers/employeeAuthController');
const { Payroll } = require('../models/hrms/Payroll');

let server = null;
let baseUrl = '';

test.before(async () => {
  server = http.createServer(app);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (server) {
    server.close();
  }
});

// 1. Payroll Delete Behaviour Tests
test('Group A Payroll Delete: Rejects period "ALL"', async () => {
  const req = {
    params: { payPeriod: 'ALL' },
    body: { reason: 'Test reason' },
    query: {}
  };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await deletePayrollBatch(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('cannot be ALL'));
});

test('Group A Payroll Delete: Rejects empty or missing reason', async () => {
  const reqEmpty = {
    params: { payPeriod: '2026-03' },
    body: { reason: '   ' },
    query: {}
  };
  const resEmpty = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await deletePayrollBatch(reqEmpty, resEmpty);
  assert.strictEqual(resEmpty.statusCode, 400);
  assert.strictEqual(resEmpty.body.success, false);
  assert.ok(resEmpty.body.message.includes('mandatory deletion reason'));
});

test('Group A Payroll Delete: Rejects deletion if records are APPROVED, PROCESSED, or PAID', async () => {
  // Mock Payroll.countDocuments to return locked records
  const origCount = Payroll.countDocuments;
  Payroll.countDocuments = async () => 3;

  try {
    const req = {
      params: { payPeriod: '2026-03' },
      body: { reason: 'Valid cleanup reason' },
      query: {}
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollBatch(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('already approved'));
  } finally {
    Payroll.countDocuments = origCount;
  }
});

test('Group A Payroll Delete: Accepts draft batch with valid reason', async () => {
  const origCount = Payroll.countDocuments;
  const origDeleteMany = Payroll.deleteMany;
  Payroll.countDocuments = async () => 0;
  Payroll.deleteMany = async () => ({ deletedCount: 5 });

  try {
    const req = {
      params: { payPeriod: '2026-03' },
      body: { reason: 'Valid draft recalculation reason' },
      query: {},
      user: { name: 'Payroll Admin', email: 'payroll@bjkhealthcare.com' },
      headers: {},
      ip: '127.0.0.1'
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await deletePayrollBatch(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.deletedCount, 5);
  } finally {
    Payroll.countDocuments = origCount;
    Payroll.deleteMany = origDeleteMany;
  }
});

// 2. Canteen Reset Behaviour Tests
test('Group A Canteen Reset: Rejects in production without ENABLE_CANTEEN_RESET=true flag', async () => {
  const prevFlag = process.env.ENABLE_CANTEEN_RESET;
  delete process.env.ENABLE_CANTEEN_RESET;

  try {
    const req = {
      user: { role: 'SUPER_ADMIN' },
      body: { confirmationToken: 'CONFIRM_RESET_ALL_CANTEEN_DATA' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await resetAllCanteenData(req, res);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('disabled in production'));
  } finally {
    if (prevFlag !== undefined) process.env.ENABLE_CANTEEN_RESET = prevFlag;
  }
});

test('Group A Canteen Reset: Rejects non-SUPER_ADMIN caller', async () => {
  process.env.ENABLE_CANTEEN_RESET = 'true';

  try {
    const req = {
      user: { role: 'HR_ADMIN' },
      body: { confirmationToken: 'CONFIRM_RESET_ALL_CANTEEN_DATA' }
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await resetAllCanteenData(req, res);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Only SUPER_ADMIN'));
  } finally {
    delete process.env.ENABLE_CANTEEN_RESET;
  }
});

test('Group A Canteen Reset: Rejects missing confirmation token', async () => {
  process.env.ENABLE_CANTEEN_RESET = 'true';

  try {
    const req = {
      user: { role: 'SUPER_ADMIN' },
      body: {}
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await resetAllCanteenData(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid or missing confirmation token'));
  } finally {
    delete process.env.ENABLE_CANTEEN_RESET;
  }
});

// 3. Demo OTP Production Absence Tests
test('Group A OTP: Demo OTP is absent from sendOtp response in production', async () => {
  const req = { body: { identifier: 'test.emp@bjkhealthcare.com' } };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await sendOtp(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.demoOtp, undefined, 'demoOtp must not exist in production response');
});

test('Group A OTP: Demo reset code is absent from forgotPassword response in production', async () => {
  const req = { body: { identifier: 'test.emp@bjkhealthcare.com' } };
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.body = d; return this; }
  };

  await forgotPassword(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.demoResetCode, undefined, 'demoResetCode must not exist in production response');
});

// 4. Health & Dashboard Closures
test('Group A Health: /api/health/database does not expose host, port, or URI topology', async () => {
  const res = await fetch(`${baseUrl}/api/health/database`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.host, undefined);
  assert.strictEqual(data.port, undefined);
  assert.strictEqual(data.connectionString, undefined);
  assert.strictEqual(data.uri, undefined);
  assert.strictEqual(data.topology, undefined);
});

test('Group A Dashboard: /api/dashboard/summary requires authentication (401 without token)', async () => {
  const res = await fetch(`${baseUrl}/api/dashboard/summary`);
  assert.strictEqual(res.status, 401, 'Unauthenticated request must return 401 Unauthorized');
});

test('Group A AI Query: /api/ai/query requires authentication (401 without token)', async () => {
  const res = await fetch(`${baseUrl}/api/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Show all employee salaries' })
  });
  assert.strictEqual(res.status, 401, 'Unauthenticated request to AI query must return 401 Unauthorized');
});

test('Group A Leave Ledger: Returns empty ledger without triggering seed sync or DB write when missing', async () => {
  const LeaveLedger = require('../models/hrms/LeaveLedger');
  const { getEmployeeLedger } = require('../services/hrms/leaveLedgerService');

  const origFindOne = LeaveLedger.findOne;
  let writeAttempted = false;
  LeaveLedger.findOne = async () => null;
  const origCreate = LeaveLedger.create;
  LeaveLedger.create = async () => {
    writeAttempted = true;
    throw new Error('Database write forbidden in test');
  };

  try {
    const result = await getEmployeeLedger('EMP_NON_EXISTENT_999', 2026);
    assert.ok(result, 'Result should be defined');
    assert.strictEqual(result.employeeCode, 'EMP_NON_EXISTENT_999');
    assert.strictEqual(result.sourceType, 'none');
    assert.strictEqual(result.openingBalance.total, 0);
    assert.strictEqual(result.closingBalance.total, 0);
    assert.strictEqual(writeAttempted, false, 'No database writes or sync operations should be triggered');
  } finally {
    LeaveLedger.findOne = origFindOne;
    LeaveLedger.create = origCreate;
  }
});

