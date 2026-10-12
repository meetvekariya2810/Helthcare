const test = require('node:test');
const assert = require('node:assert');
const { biometricWebhook } = require('../controllers/hrms/attendanceController');
const Employee = require('../models/Employee');

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
// B7 Security Tests: Biometric Webhook Secret & Error Handling
// -------------------------------------------------------------

test('BiometricWebhook: Unset secret in production returns 503', async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.BIOMETRIC_WEBHOOK_SECRET;

  process.env.NODE_ENV = 'production';
  delete process.env.BIOMETRIC_WEBHOOK_SECRET;

  try {
    const { req, res } = createMockReqRes({
      headers: { 'x-biometric-secret': 'any-secret' },
      body: { deviceId: 'DEV_01', punches: [] }
    });

    await biometricWebhook(req, res);

    assert.strictEqual(res.statusCode, 503);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('unavailable'));
  } finally {
    process.env.NODE_ENV = prevEnv;
    process.env.BIOMETRIC_WEBHOOK_SECRET = prevSecret;
  }
});

test('BiometricWebhook: Missing secret header returns 401 Unauthorized', async () => {
  const prevSecret = process.env.BIOMETRIC_WEBHOOK_SECRET;
  process.env.BIOMETRIC_WEBHOOK_SECRET = 'configured-secret-key-12345';

  try {
    const { req, res } = createMockReqRes({
      headers: {}, // No secret header provided
      body: { deviceId: 'DEV_01', punches: [] }
    });

    await biometricWebhook(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Unauthorized'));
  } finally {
    process.env.BIOMETRIC_WEBHOOK_SECRET = prevSecret;
  }
});

test('BiometricWebhook: Wrong secret header returns 401 Unauthorized', async () => {
  const prevSecret = process.env.BIOMETRIC_WEBHOOK_SECRET;
  process.env.BIOMETRIC_WEBHOOK_SECRET = 'configured-secret-key-12345';

  try {
    const { req, res } = createMockReqRes({
      headers: { 'x-biometric-secret': 'wrong-attacker-secret' },
      body: { deviceId: 'DEV_01', punches: [] }
    });

    await biometricWebhook(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Unauthorized'));
  } finally {
    process.env.BIOMETRIC_WEBHOOK_SECRET = prevSecret;
  }
});

test('BiometricWebhook: Valid secret header authorizes request and processes punches', async () => {
  const prevSecret = process.env.BIOMETRIC_WEBHOOK_SECRET;
  process.env.BIOMETRIC_WEBHOOK_SECRET = 'configured-secret-key-12345';

  const origFindOne = Employee.findOne;
  Employee.findOne = async () => null; // Mock employee search

  try {
    const { req, res } = createMockReqRes({
      headers: { 'x-biometric-secret': 'configured-secret-key-12345' },
      body: { deviceId: 'STATION_01', punches: [] }
    });

    await biometricWebhook(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.message.includes('Biometric batch processed'));
  } finally {
    process.env.BIOMETRIC_WEBHOOK_SECRET = prevSecret;
    Employee.findOne = origFindOne;
  }
});
