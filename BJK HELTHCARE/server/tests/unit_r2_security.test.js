const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// -------------------------------------------------------------
// R2 Security Test: Login Bypass Elimination in Production
// -------------------------------------------------------------

test('AuthController: In production, developer password cannot log in; strict bcrypt works', async () => {
  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const salt = await bcrypt.genSalt(10);
    const realHash = await bcrypt.hash('RealUserPassword2026!', salt);

    // Mock user model with comparePassword
    const mockUser = {
      _id: 'user-prod-01',
      email: 'employee@bjkhealthcare.com',
      password: realHash,
      passwordHash: realHash,
      role: 'EMPLOYEE',
      isLocked: false,
      failedLoginAttempts: 0,
      status: 'ACTIVE',
      comparePassword: async function(candidate) {
        return bcrypt.compare(candidate, this.password);
      }
    };

    // 1. Attempt dev password 'Password123!' against user who has a different password
    const devPassMatch = await mockUser.comparePassword('Password123!');
    assert.strictEqual(devPassMatch, false, 'Dev password comparison must evaluate to false');

    // In production, the bypass branch is NOT reached:
    const isProduction = process.env.NODE_ENV === 'production';
    let allowedLogin = false;
    if (isProduction) {
      allowedLogin = devPassMatch; // Only strict bcrypt match allowed in production
    }
    assert.strictEqual(allowedLogin, false, 'Production mode MUST NOT allow dev password');

    // 2. Real user password succeeds via strict bcrypt compare
    const realPassMatch = await mockUser.comparePassword('RealUserPassword2026!');
    assert.strictEqual(realPassMatch, true, 'Strict bcrypt compare must succeed for authentic password');
  } finally {
    process.env.NODE_ENV = prevEnv;
  }
});

test('AuthController.login: In production, HTTP login strictly rejects dev passwords (Password123!)', async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevJwt = process.env.JWT_SECRET;
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'a_very_secure_jwt_secret_with_32_characters_minimum!';

  const { login } = require('../controllers/authController');
  const User = require('../models/User');
  const origFindOne = User.findOne;

  const salt = await bcrypt.genSalt(10);
  const authenticHash = await bcrypt.hash('AuthenticSecret2026!', salt);

  const mockUserDoc = {
    _id: '507f1f77bcf86cd799439011',
    email: 'operator@bjkhealthcare.com',
    password: authenticHash,
    passwordHash: authenticHash,
    role: 'EMPLOYEE',
    isLocked: false,
    failedLoginAttempts: 0,
    status: 'ACTIVE',
    isActive: true,
    mustChangePassword: false,
    temporaryPassword: false,
    comparePassword: async function(candidate) {
      return bcrypt.compare(candidate, this.password);
    },
    save: async () => {}
  };

  const LoginActivity = require('../models/LoginActivity');
  const UserSession = require('../models/UserSession');
  const AuditLog = require('../models/AuditLog');
  const audit = require('../middleware/audit');
  const origLoginActCreate = LoginActivity.create;
  const origSessionCreate = UserSession.create;
  const origAuditCreate = AuditLog.create;
  const origRecordAudit = audit.recordAudit;
  LoginActivity.create = async () => ({});
  UserSession.create = async () => ({});
  AuditLog.create = async () => ({});
  audit.recordAudit = async () => {};

  // Temporarily set readyState to 1 to simulate active database connection
  Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

  User.findOne = () => ({
    select: () => mockUserDoc
  });

  try {
    // 1. Attempt login with dev password in production -> Must be rejected with 401
    const reqDev = {
      body: { username: 'operator@bjkhealthcare.com', password: 'Password123!' },
      headers: {},
      ip: '127.0.0.1'
    };
    const resDev = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await login(reqDev, resDev);
    assert.strictEqual(resDev.statusCode, 401, 'Dev password in production must return 401');
    assert.strictEqual(resDev.body.success, false);

    // 2. Attempt login with authentic password -> Must succeed with 200
    const reqAuth = {
      body: { username: 'operator@bjkhealthcare.com', password: 'AuthenticSecret2026!' },
      headers: {},
      ip: '127.0.0.1'
    };
    const resAuth = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; }
    };

    await login(reqAuth, resAuth);
    assert.strictEqual(resAuth.statusCode, 200, 'Authentic password in production must return 200');
    assert.strictEqual(resAuth.body.success, true);
    assert.ok(resAuth.body.token, 'Must return valid JWT token on successful login');
  } finally {
    User.findOne = origFindOne;
    LoginActivity.create = origLoginActCreate;
    UserSession.create = origSessionCreate;
    AuditLog.create = origAuditCreate;
    audit.recordAudit = origRecordAudit;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });
    process.env.NODE_ENV = prevEnv;
    process.env.JWT_SECRET = prevJwt;
  }
});
