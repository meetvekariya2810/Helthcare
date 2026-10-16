/**
 * BJK Healthcare — Production Smoke & Security Audit Script (Read-Only)
 * Evaluates target production/preview URL without mutating any records.
 *
 * Usage:
 *   node scripts/golive/prod_smoke.js --url=https://your-production-url.vercel.app
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const args = process.argv.slice(2);
let targetUrl = '';
for (const arg of args) {
  if (arg.startsWith('--url=')) {
    targetUrl = arg.split('=')[1].trim();
  }
}

if (!targetUrl) {
  targetUrl = process.env.PRODUCTION_URL || '';
}

async function request(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(urlStr);
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request(urlStr, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out after 10s'));
      });
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function runSmoke() {
  console.log('================================================================');
  console.log('  BJK HEALTHCARE — PRODUCTION SMOKE & SECURITY SUITE (READ-ONLY)');
  console.log('================================================================\n');

  if (!targetUrl || targetUrl.includes('<fill in') || targetUrl.includes('<owner')) {
    console.log('[BLOCKED] Target URL is unconfigured.');
    console.log('  Please supply target URL via --url=https://<your-vercel-domain> or set PRODUCTION_URL.');
    process.exit(1);
  }

  console.log(`Target URL: ${targetUrl}\n`);
  let passedChecks = 0;
  let totalChecks = 0;

  const test = async (name, fn) => {
    totalChecks++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passedChecks++;
    } catch (err) {
      console.log(`  [FAIL] ${name}`);
      console.log(`         Reason: ${err.message}`);
    }
  };

  // 1. HTTPS Protocol
  await test('Protocol: Enforces HTTPS', async () => {
    if (!targetUrl.startsWith('https://') && !targetUrl.includes('localhost')) {
      throw new Error('Production target does not enforce https://');
    }
  });

  // 2. Health Endpoints
  const healthEndpoints = [
    '/api/health',
    '/api/health/database',
    '/api/health/services',
    '/api/hrms/health'
  ];

  for (const ep of healthEndpoints) {
    await test(`Endpoint: ${ep} returns 200 Healthy`, async () => {
      const res = await request(`${targetUrl}${ep}`);
      if (res.statusCode !== 200) {
        throw new Error(`HTTP ${res.statusCode} (body: ${res.body.slice(0, 100)})`);
      }
      try {
        const json = JSON.parse(res.body);
        if (json.database === 'disconnected' || json.status === 'degraded') {
          throw new Error(`Degraded health: ${res.body}`);
        }
      } catch (pe) {
        if (!pe.message.includes('Degraded')) {
          throw new Error(`Response was not JSON: ${res.body.slice(0, 50)}`);
        }
        throw pe;
      }
    });
  }

  // 3. Security Headers
  await test('Security Headers: X-Content-Type-Options & Frame Protection', async () => {
    const res = await request(`${targetUrl}/`);
    const headers = res.headers;
    const nosniff = headers['x-content-type-options'];
    const frame = headers['x-frame-options'];
    if (!nosniff || !nosniff.includes('nosniff')) {
      throw new Error('Missing X-Content-Type-Options: nosniff');
    }
    if (!frame && !headers['content-security-policy']) {
      throw new Error('Missing frameguard protection (X-Frame-Options or CSP)');
    }
  });

  // 4. Credential File URL Exposure Probe (Must NOT be 200)
  const credentialProbes = [
    '/uploads/BJK_Employee_Login_Credentials.xlsx',
    '/uploads/BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx',
    '/BJK_Employee_Login_Credentials.xlsx',
    '/BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx',
    '/.env'
  ];

  for (const probe of credentialProbes) {
    await test(`Security: Sensitive file ${probe} is strictly protected (401/403/404)`, async () => {
      const res = await request(`${targetUrl}${probe}`);
      if (res.statusCode === 200) {
        throw new Error(`CRITICAL SECURITY FAILURE: ${probe} is publicly accessible with HTTP 200!`);
      }
      if (![401, 403, 404].includes(res.statusCode)) {
        throw new Error(`Unexpected status code: ${res.statusCode}`);
      }
    });
  }

  // 5. Dedicated Test Login (if configured in environment)
  const testEmail = process.env.TEST_LOGIN_EMAIL;
  const testPassword = process.env.TEST_LOGIN_PASSWORD;

  if (testEmail && testPassword) {
    await test('Authentication: Dedicated TEST Account Login', async () => {
      const res = await request(`${targetUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      });
      if (res.statusCode !== 200) {
        throw new Error(`Login failed with HTTP ${res.statusCode}: ${res.body.slice(0, 100)}`);
      }
      const json = JSON.parse(res.body);
      if (!json.token) throw new Error('No JWT token returned in auth payload');
    });
  } else {
    console.log('  [NOTE] Dedicated Test Account Login: SKIPPED (TEST_LOGIN_EMAIL & TEST_LOGIN_PASSWORD not set in env)');
  }

  console.log('\n================================================================');
  console.log(`SMOKE AUDIT SUMMARY: ${passedChecks} / ${totalChecks} CHECKS PASSED`);
  console.log('================================================================\n');

  process.exit(passedChecks === totalChecks ? 0 : 1);
}

runSmoke().catch(err => {
  console.error('Smoke audit error:', err.message);
  process.exit(1);
});
