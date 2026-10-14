const { test, describe } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const { secureUploads } = require('../middleware/fileSecurity');

const TEST_SECRET = 'bjk_test_jwt_secret_with_more_than_32_characters_for_unit_tests';
process.env.JWT_SECRET = TEST_SECRET;

function createApp() {
  const app = express();
  app.use('/uploads', secureUploads);
  // Mock downstream file delivery if security middleware passes
  app.use('/uploads', (req, res) => {
    res.status(200).json({ success: true, message: 'File served successfully', file: req.path });
  });
  return app;
}

function makeRequest(app, pathWithQuery, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: '127.0.0.1',
        port,
        path: pathWithQuery,
        method: 'GET',
        headers
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          server.close();
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: JSON.parse(body)
            });
          } catch (_) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body
            });
          }
        });
      });

      req.on('error', err => {
        server.close();
        reject(err);
      });
      req.end();
    });
  });
}

describe('Upload & File Serving Security (/uploads)', () => {
  const app = createApp();

  test('Spreadsheet Blacklist: Rejects .xlsx direct download with 403 Forbidden', async () => {
    const res = await makeRequest(app, '/uploads/BJK_Employee_Login_Credentials.xlsx');
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /forbidden/i);
  });

  test('CSV Blacklist: Rejects .csv master detail direct download with 403 Forbidden', async () => {
    const res = await makeRequest(app, '/uploads/Employee%20Master%20Detail(Sheet%201).csv');
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /forbidden/i);
  });

  test('Extension Blacklist: Rejects .env, .json, .sql, .dump, .zip files with 403 Forbidden', async () => {
    const resEnv = await makeRequest(app, '/uploads/config.env');
    assert.strictEqual(resEnv.statusCode, 403);

    const resJson = await makeRequest(app, '/uploads/backup.json');
    assert.strictEqual(resJson.statusCode, 403);

    const resSql = await makeRequest(app, '/uploads/database.sql');
    assert.strictEqual(resSql.statusCode, 403);

    const resZip = await makeRequest(app, '/uploads/documents/archive.zip');
    assert.strictEqual(resZip.statusCode, 403);
  });

  test('Extension Blacklist in Public: Blacklisted files in /public are STILL rejected with 403', async () => {
    const resPublicCsv = await makeRequest(app, '/uploads/public/data.csv');
    assert.strictEqual(resPublicCsv.statusCode, 403);

    const resPublicSql = await makeRequest(app, '/uploads/public/dump.sql');
    assert.strictEqual(resPublicSql.statusCode, 403);
  });

  test('Directory Traversal Protection: Rejects plain and encoded traversal sequences with 400', async () => {
    const res1 = await makeRequest(app, '/uploads/..%2fpackage.json');
    assert.strictEqual(res1.statusCode, 400);
    assert.strictEqual(res1.body.success, false);

    const res2 = await makeRequest(app, '/uploads/documents/..//secret.pdf');
    assert.strictEqual(res2.statusCode, 400);

    const res3 = await makeRequest(app, '/uploads/%2e%2e%2fserver.js');
    assert.strictEqual(res3.statusCode, 400);
  });

  test('Null-Byte Mitigation: Rejects null-byte injection attempts with 400 Bad Request', async () => {
    const res = await makeRequest(app, '/uploads/public/logo.png%00.exe');
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /null-byte/i);
  });

  test('Explicit Allowlist Defense: Rejects unpartitioned root-level uploads (403)', async () => {
    const res = await makeRequest(app, '/uploads/sample_doc.pdf');
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /partitioned vaults/i);
  });

  test('Explicit Allowlist Defense: Rejects non-whitelisted extensions in /documents/ (403)', async () => {
    const superToken = jwt.sign({ id: 'super1', role: 'SUPER_ADMIN' }, TEST_SECRET);
    const res = await makeRequest(app, '/uploads/documents/script.exe', {
      authorization: `Bearer ${superToken}`
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('Security Headers: Applies nosniff, no-referrer, and private no-store headers', async () => {
    const res = await makeRequest(app, '/uploads/public/company_logo.png');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(res.headers['referrer-policy'], 'no-referrer');
    assert.match(res.headers['cache-control'], /no-store/);
  });

  test('Public Assets: Permits /uploads/public/* and /uploads/assets/* without authentication', async () => {
    const res1 = await makeRequest(app, '/uploads/public/company_logo.png');
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.body.success, true);

    const res2 = await makeRequest(app, '/uploads/assets/ui-icon.svg');
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.body.success, true);
  });

  test('Unauthenticated Access: Rejects unauthenticated document requests with 401 Unauthorized', async () => {
    const res = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Authentication required/i);
  });

  test('Forged Token Validation: Rejects signature-mismatched token with 401 Unauthorized', async () => {
    const forgedToken = jwt.sign(
      { id: 'attacker', role: 'SUPER_ADMIN' },
      'wrong_untrusted_signing_key_1234567890123456'
    );
    const res = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf', {
      authorization: `Bearer ${forgedToken}`
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Invalid or forged/i);
  });

  test('Expired Token Validation: Rejects expired token with 401 Unauthorized', async () => {
    const expiredToken = jwt.sign(
      { id: 'user1', employeeId: 'EMP001', role: 'EMPLOYEE', exp: Math.floor(Date.now() / 1000) - 3600 },
      TEST_SECRET
    );
    const res = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf', {
      authorization: `Bearer ${expiredToken}`
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /expired/i);
  });

  test('Unauthorized Roles: Rejects unknown or non-HR roles with 403 Forbidden', async () => {
    const guestToken = jwt.sign({ id: 'guest1', role: 'GUEST' }, TEST_SECRET);
    const resGuest = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf', {
      authorization: `Bearer ${guestToken}`
    });
    assert.strictEqual(resGuest.statusCode, 403);
    assert.strictEqual(resGuest.body.success, false);

    const canteenToken = jwt.sign({ id: 'canteen1', role: 'CANTEEN_STAFF' }, TEST_SECRET);
    const resCanteen = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf', {
      authorization: `Bearer ${canteenToken}`
    });
    assert.strictEqual(resCanteen.statusCode, 403);
  });

  test('Cross-Employee Access: Employee EMP001 cannot view EMP002 document (403 Forbidden)', async () => {
    const emp1Token = jwt.sign(
      { id: 'user1', employeeId: 'EMP001', role: 'EMPLOYEE' },
      TEST_SECRET
    );

    const res = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP002-SLOT1.pdf', {
      authorization: `Bearer ${emp1Token}`
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /another employee/i);
  });

  test('Sub-token Collision Defense: Employee EMP1 cannot view EMP10 document (403 Forbidden)', async () => {
    const emp1Token = jwt.sign(
      { id: 'user1', employeeId: 'EMP1', role: 'EMPLOYEE' },
      TEST_SECRET
    );

    // Document belongs to EMP10; simple substring match would mistakenly allow EMP1 without word boundaries
    const res = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP10-SLOT1.pdf', {
      authorization: `Bearer ${emp1Token}`
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('Employee Self-Access (Bearer Header): Employee EMP001 can view their own document (200)', async () => {
    const emp1Token = jwt.sign(
      { id: 'user1', employeeId: 'EMP001', role: 'EMPLOYEE' },
      TEST_SECRET
    );

    const res = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf', {
      authorization: `Bearer ${emp1Token}`
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  test('Employee Self-Access (Query Param ?token=): Employee views document in browser iframe (200)', async () => {
    const emp1Token = jwt.sign(
      { id: 'user1', employeeId: 'EMP001', role: 'EMPLOYEE' },
      TEST_SECRET
    );

    const res = await makeRequest(app, `/uploads/documents/BJK-DOC-EMP001-SLOT1.pdf?token=${emp1Token}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  test('Employee Self-Access (Query Param ?auth=): Alternative query parameter token works (200)', async () => {
    const empToken = jwt.sign(
      { id: 'user2', employeeId: 'BJK-101', role: 'EMPLOYEE' },
      TEST_SECRET
    );

    const res = await makeRequest(app, `/uploads/documents/BJK-DOC-BJK-101-SLOT2.pdf?auth=${empToken}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  test('Administrative Access: HR_ADMIN and SUPER_ADMIN can view any employee document (200)', async () => {
    const hrToken = jwt.sign({ id: 'admin1', role: 'HR_ADMIN' }, TEST_SECRET);
    const resHr = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP002-SLOT1.pdf', {
      authorization: `Bearer ${hrToken}`
    });
    assert.strictEqual(resHr.statusCode, 200);

    const superToken = jwt.sign({ id: 'super1', role: 'SUPER_ADMIN' }, TEST_SECRET);
    const resSuper = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP999-SLOT5.pdf', {
      authorization: `Bearer ${superToken}`
    });
    assert.strictEqual(resSuper.statusCode, 200);
  });

  test('Administrative Access: HR_MANAGER and HR_EXECUTIVE can view employee documents (200)', async () => {
    const managerToken = jwt.sign({ id: 'mgr1', role: 'HR_MANAGER' }, TEST_SECRET);
    const resMgr = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP555-SLOT1.pdf', {
      authorization: `Bearer ${managerToken}`
    });
    assert.strictEqual(resMgr.statusCode, 200);

    const execToken = jwt.sign({ id: 'exec1', role: 'HR_EXECUTIVE' }, TEST_SECRET);
    const resExec = await makeRequest(app, '/uploads/documents/BJK-DOC-EMP555-SLOT1.pdf', {
      authorization: `Bearer ${execToken}`
    });
    assert.strictEqual(resExec.statusCode, 200);
  });

  test('Company Policies: Any authenticated employee can access company policies (200)', async () => {
    const empToken = jwt.sign(
      { id: 'user1', employeeId: 'EMP001', role: 'EMPLOYEE' },
      TEST_SECRET
    );

    const res = await makeRequest(app, '/uploads/policies/safety-standard.pdf', {
      authorization: `Bearer ${empToken}`
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  test('Company Policies: Unauthenticated access to company policies is rejected (401)', async () => {
    const res = await makeRequest(app, '/uploads/policies/safety-standard.pdf');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });
});
