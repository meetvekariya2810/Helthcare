const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Setup environment before requiring server
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'a_secure_temporary_test_secret_with_over_32_characters_2026!';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/bjk_healthcare_staging';
process.env.DATABASE_NAME = 'bjk_healthcare_staging';
process.env.SEED_ALLOWED_DB = 'bjk_healthcare_staging';
process.env.BIOMETRIC_WEBHOOK_SECRET = 'test_biometric_webhook_secret_key_32chars!';

const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const app = require('../server');

// Helper to make in-process HTTP requests via a lightweight server
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

test('Biometric Route Level: POST /api/hrms/attendance/biometric', async () => {
  // 1. Missing secret header -> 401
  const resMissing = await fetch(`${baseUrl}/api/hrms/attendance/biometric`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'BIO-01', punches: [] })
  });
  assert.strictEqual(resMissing.status, 401);

  // 2. Wrong secret header -> 401
  const resWrong = await fetch(`${baseUrl}/api/hrms/attendance/biometric`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-biometric-secret': 'wrong_secret_key'
    },
    body: JSON.stringify({ deviceId: 'BIO-01', punches: [] })
  });
  assert.strictEqual(resWrong.status, 401);

  // 3. Valid secret header -> 200
  const resValid = await fetch(`${baseUrl}/api/hrms/attendance/biometric`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-biometric-secret': process.env.BIOMETRIC_WEBHOOK_SECRET
    },
    body: JSON.stringify({ deviceId: 'BIO-01', punches: [] })
  });
  assert.strictEqual(resValid.status, 200);
});

test('Biometric Route Level: POST /api/hrms/attendance/biometric-webhook', async () => {
  // 1. Missing secret header -> 401
  const resMissing = await fetch(`${baseUrl}/api/hrms/attendance/biometric-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'BIO-02', punches: [] })
  });
  assert.strictEqual(resMissing.status, 401);

  // 2. Wrong secret header -> 401
  const resWrong = await fetch(`${baseUrl}/api/hrms/attendance/biometric-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-biometric-secret': 'wrong_secret_key'
    },
    body: JSON.stringify({ deviceId: 'BIO-02', punches: [] })
  });
  assert.strictEqual(resWrong.status, 401);

  // 3. Valid secret header -> 200
  const resValid = await fetch(`${baseUrl}/api/hrms/attendance/biometric-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-biometric-secret': process.env.BIOMETRIC_WEBHOOK_SECRET
    },
    body: JSON.stringify({ deviceId: 'BIO-02', punches: [] })
  });
  assert.strictEqual(resValid.status, 200);
});

test('Biometric Route Level: POST /api/attendance/webhook', async () => {
  // 1. Missing secret header -> 401
  const resMissing = await fetch(`${baseUrl}/api/attendance/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'BIO-03', punches: [] })
  });
  assert.strictEqual(resMissing.status, 401);

  // 2. Wrong secret header -> 401
  const resWrong = await fetch(`${baseUrl}/api/attendance/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-biometric-secret': 'wrong_secret_key'
    },
    body: JSON.stringify({ deviceId: 'BIO-03', punches: [] })
  });
  assert.strictEqual(resWrong.status, 401);

  // 3. Valid secret header -> 200
  const resValid = await fetch(`${baseUrl}/api/attendance/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-biometric-secret': process.env.BIOMETRIC_WEBHOOK_SECRET
    },
    body: JSON.stringify({ deviceId: 'BIO-03', punches: [] })
  });
  assert.strictEqual(resValid.status, 200);
});

test('Biometric Route Level: Unset secret in production returns 503 on all 3 routes', async () => {
  const orig = process.env.BIOMETRIC_WEBHOOK_SECRET;
  delete process.env.BIOMETRIC_WEBHOOK_SECRET;

  try {
    const endpoints = [
      '/api/hrms/attendance/biometric',
      '/api/hrms/attendance/biometric-webhook',
      '/api/attendance/webhook'
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}${ep}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-biometric-secret': 'any_token'
        },
        body: JSON.stringify({ deviceId: 'BIO-TEST', punches: [] })
      });
      assert.strictEqual(
        res.status,
        503,
        `Endpoint ${ep} must return 503 when BIOMETRIC_WEBHOOK_SECRET is unset in production`
      );
    }
  } finally {
    process.env.BIOMETRIC_WEBHOOK_SECRET = orig;
  }
});

test('Auth Route Level: POST /api/auth/login strictly rejects dev password bypass in production', async () => {
  // 1. In production, getDevAccounts() returns an empty object
  const { getDevAccounts } = require('../controllers/authController');
  assert.deepStrictEqual(getDevAccounts(), {}, 'getDevAccounts() must return empty object in production');

  // 2. Reject arbitrary dev bypass candidate
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'nonexistent.superadmin@bjkhealthcare.com',
      password: 'DevBypassPasswordCandidate2026!'
    })
  });
  assert.strictEqual(res.status, 401, 'Dev password bypass must be rejected with 401');

  // 3. Reject known development personas (e.g. bh1046, superadmin) in production
  const resDevPersona = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'bh1046@bjkhealthcare.com',
      password: 'Bjk@2810'
    })
  });
  assert.strictEqual(resDevPersona.status, 401, 'Dev persona login must return 401 in production');

  // 4. Verify dev-account route probes return 404 (zero exposed routes)
  const resDevRoute1 = await fetch(`${baseUrl}/api/auth/dev-accounts`);
  assert.strictEqual(resDevRoute1.status, 404, 'No /api/auth/dev-accounts route exists');
  const resDevRoute2 = await fetch(`${baseUrl}/api/dev-accounts`);
  assert.strictEqual(resDevRoute2.status, 404, 'No /api/dev-accounts route exists');
});

test('Employee Auth Route Level: POST /api/employee/auth/login rejects unauthorized login in production', async () => {
  const res = await fetch(`${baseUrl}/api/employee/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginIdentifier: 'nonexistent.employee@bjkhealthcare.com',
      password: 'DevBypassPasswordCandidate2026!'
    })
  });
  assert.strictEqual(res.status, 401, 'Dev password attempt must be rejected with 401');
});

test('Employee OTP Route Level: POST /api/employee/auth/verify-otp has zero bypass with dummy OTP 123456', async () => {
  const res = await fetch(`${baseUrl}/api/employee/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test.user@bjkhealthcare.com',
      otp: '123456'
    })
  });
  assert.strictEqual(res.status, 400, 'Dummy OTP 123456 must be rejected with 400 (no bypass)');
  const data = await res.json();
  assert.strictEqual(data.success, false);
});
