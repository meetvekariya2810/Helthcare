/**
 * BJK Healthcare - Production Environment Preflight Verification Script
 * 
 * Read-only check: Inspects environment configuration without touching any database
 * or logging any secret values.
 * 
 * Security Rule 2A: Prints variable NAMES and LENGTHS only. Never prints, quotes,
 * or logs secret values, URIs, or credentials.
 * 
 * Usage:
 *   node scripts/preflightCheck.js
 */

const fs = require('fs');
const dotenv = require('dotenv');

// Load environment file from command-line argument if provided
if (process.argv[2] && fs.existsSync(process.argv[2])) {
  console.log(`[Preflight] Loading environment definitions from file: ${process.argv[2]}`);
  const envConfig = dotenv.parse(fs.readFileSync(process.argv[2]));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const requiredVars = [
  { name: 'NODE_ENV', minLength: 1, required: true },
  { name: 'JWT_SECRET', minLength: 32, required: true },
  { name: 'MONGODB_URI', minLength: 10, required: true },
  { name: 'DATABASE_NAME', minLength: 1, required: true },
  { name: 'BIOMETRIC_WEBHOOK_SECRET', minLength: 16, required: false, prodWarning: true }
];

const forbiddenProdFlags = [
  'ENABLE_AUTO_INIT',
  'ENABLE_DEMO_OTP',
  'ENABLE_CANTEEN_RESET',
  'ALLOW_MEMORY_FALLBACK',
  'SEED_ALLOWED_DB',
  'PRODUCTION_RESET_ACK'
];

function runPreflight() {
  console.log('===============================================================');
  console.log('    BJK HEALTHCARE - ENVIRONMENT PREFLIGHT CHECK (READ-ONLY)   ');
  console.log('===============================================================');
  console.log('Timestamp (UTC):', new Date().toISOString());
  console.log('Rule 2A: Variable names and character lengths only (no secrets)\n');

  let hasFatalErrors = false;
  const isProd = process.env.NODE_ENV === 'production';

  console.log('--- 1. REQUIRED CONFIGURATION VARIABLES ---');
  for (const v of requiredVars) {
    const val = process.env[v.name];
    const isSet = typeof val === 'string' && val.length > 0;
    const len = isSet ? val.length : 0;

    let status = 'PASS';
    let note = '';

    if (!isSet) {
      if (v.required) {
        status = 'FAIL';
        note = 'MISSING (Mandatory)';
        hasFatalErrors = true;
      } else if (v.prodWarning && isProd) {
        status = 'WARN';
        note = 'UNSET (Biometric webhooks disabled/503 in production)';
      } else {
        status = 'INFO';
        note = 'UNSET (Optional)';
      }
    } else if (v.minLength && len < v.minLength) {
      if (v.name === 'JWT_SECRET' && isProd) {
        status = 'FAIL';
        note = `LENGTH ${len} < REQUIRED MINIMUM ${v.minLength}`;
        hasFatalErrors = true;
      } else {
        status = 'WARN';
        note = `Length ${len} is shorter than recommended ${v.minLength}`;
      }
    }

    console.log(`[${status}] ${v.name.padEnd(28)}: ${isSet ? `SET (${len} chars)` : 'UNSET'.padEnd(14)} ${note}`);
  }

  console.log('\n--- 2. PRODUCTION FORBIDDEN / HIGH-RISK FLAGS ---');
  for (const flag of forbiddenProdFlags) {
    const val = process.env[flag];
    const isSet = typeof val === 'string' && val.length > 0;
    const isTrue = isSet && (val === 'true' || val === '1');

    let status = 'PASS';
    let note = 'Unset (Secure)';

    if (isProd) {
      if (flag === 'SEED_ALLOWED_DB' && isSet) {
        status = 'FAIL';
        note = 'SET IN PRODUCTION (Database safety guards will abort boot)';
        hasFatalErrors = true;
      } else if (isTrue) {
        status = 'FAIL';
        note = 'ACTIVE IN PRODUCTION (Security violation)';
        hasFatalErrors = true;
      } else if (isSet) {
        status = 'WARN';
        note = `Set with length ${val.length} (Ensure value is false)`;
      }
    } else {
      note = isSet ? `Set in non-production (${val.length} chars)` : 'Unset';
    }

    console.log(`[${status}] ${flag.padEnd(28)}: ${isSet ? `SET (${val.length} chars)` : 'UNSET'.padEnd(14)} ${note}`);
  }

  console.log('\n--- 3. NETWORK / PROXY CONFIGURATION ---');
  const trustProxy = process.env.TRUST_PROXY_HOPS;
  if (trustProxy) {
    console.log(`[INFO] TRUST_PROXY_HOPS            : SET (${trustProxy.length} chars) - Configured`);
  } else {
    console.log(`[INFO] TRUST_PROXY_HOPS            : UNSET - Defaults to 1 in production, false in dev`);
  }

  console.log('===============================================================');
  if (hasFatalErrors) {
    console.log('PREFLIGHT RESULT: FAILED - Resolve fatal errors before starting server.');
    console.log('===============================================================');
    process.exitCode = 1;
  } else {
    console.log('PREFLIGHT RESULT: PASSED - Environment configuration meets baseline.');
    console.log('===============================================================');
    process.exitCode = 0;
  }
}

if (require.main === module) {
  runPreflight();
}

module.exports = { runPreflight };
