/**
 * BJK Healthcare - Owner-Run Emergency Password Rotation Script (DRAFT ONLY)
 * 
 * DESIGN ONLY: STRICTLY FOR MANUAL EXECUTION BY SYSTEM OWNER. NEVER EXECUTE AUTOMATICALLY.
 * 
 * SECURITY ARCHITECTURE & CONSTRAINTS (Phase 3A Round 4 Redesign):
 * 1. Password Hashing & Model Synchronization:
 *    - User model (models/User.js:264-281) has both `password` and `passwordHash`.
 *    - To completely avoid double-hashing, this script generates an individual salt per user (cost 10)
 *      via `bcrypt.genSalt(10)` and updates credentials atomically with `User.updateOne({ _id }, { $set: ... })`.
 *    - Synchronizes BOTH `password` and `passwordHash`, sets `mustChangePassword: true`, `temporaryPassword: true`,
 *      and resets `passwordChangedAt: null` so controllers require permanent password change.
 * 2. Scoped Targets (Never all users by default):
 *    - Requires explicit `--target defaults`, `--target emails-file <path>`, or `--target roles <r1,r2>`.
 * 3. Default Password Detection:
 *    - Mode `--detect-defaults` checks hashes against:
 *      (a) Legacy per-employee pattern password: `BJK@<employeeCode>!2026`
 *      (b) Runtime `KNOWN_DEFAULT_PASSWORDS` environment variable (never written to disk).
 *    - Outputs counts, roles, and (with `--list`) emails only.
 * 4. Production Mode Architecture:
 *    - Separate explicit path requiring `--production`.
 *    - Never reuses `assertNonProduction()`.
 *    - Requires `--expect-db <name>` matching the effective database name (DATABASE_NAME || 'bjk_healthcare').
 *    - Requires `process.env.PRODUCTION_RESET_ACK` set to exact phrase containing database name:
 *      `CONFIRM_RESET_PROD_<effectiveDb>`.
 *    - Requires `--dry-run-hash <sha256>` matching sha256 of prior dry-run report file (`--dry-run-file <path>`).
 * 5. Credentials File Delivery:
 *    - Temporary passwords are NEVER printed to stdout or server logs.
 *    - Optional `--write-credentials-file <path>` opens file with flag 'wx' and mode 0600.
 *    - Appends each row immediately after account update.
 *    - Refuses any destination path located inside the repository tree (resolves symlinks).
 *    - Warns prominently that the file contains sensitive credentials and must be deleted after delivery.
 * 6. Session Invalidation:
 *    - Revokes active sessions in UserSession collection (status='REVOKED', terminatedBy=operator).
 * 7. Non-Repudiation Audit:
 *    - Requires `--operator "<name>"` and `--reason "<text>"`.
 *    - Records operator identity and real host identity via `os.hostname()`.
 *    - Writes AuditLog matching real schema BEFORE applying user update; aborts account update if audit write fails.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const AuditLog = require('../models/AuditLog');
const { assertNonProduction, assertConnectedDbAllowed, getEffectiveDatabaseName } = require('../config/safetyGuards');

function generateSecureRandomPassword(length = 20) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()-_=+';
  const allChars = upper + lower + digits + symbols;

  const pwd = [
    upper[crypto.randomInt(0, upper.length)],
    lower[crypto.randomInt(0, lower.length)],
    digits[crypto.randomInt(0, digits.length)],
    symbols[crypto.randomInt(0, symbols.length)]
  ];

  for (let i = pwd.length; i < length; i++) {
    pwd.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  for (let i = pwd.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }

  return pwd.join('');
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    isProduction: args.includes('--production'),
    isDryRun: args.includes('--dry-run'),
    isDetectDefaults: args.includes('--detect-defaults'),
    listEmails: args.includes('--list'),
    isConfirmed: args.includes('--confirm'),
    expectDb: null,
    dryRunHash: null,
    dryRunFile: null,
    target: null,
    targetValue: null,
    operator: null,
    reason: null,
    credentialsFile: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      parsed.target = args[i + 1].toLowerCase().trim();
      if (['emails-file', 'roles'].includes(parsed.target) && args[i + 2]) {
        parsed.targetValue = args[i + 2].trim();
        i++;
      }
      i++;
    } else if (args[i] === '--expect-db' && args[i + 1]) {
      parsed.expectDb = args[i + 1].trim();
      i++;
    } else if (args[i] === '--dry-run-hash' && args[i + 1]) {
      parsed.dryRunHash = args[i + 1].trim();
      i++;
    } else if (args[i] === '--dry-run-file' && args[i + 1]) {
      parsed.dryRunFile = args[i + 1].trim();
      i++;
    } else if (args[i] === '--operator' && args[i + 1]) {
      parsed.operator = args[i + 1].trim();
      i++;
    } else if (args[i] === '--reason' && args[i + 1]) {
      parsed.reason = args[i + 1].trim();
      i++;
    } else if (args[i] === '--write-credentials-file' && args[i + 1]) {
      parsed.credentialsFile = args[i + 1].trim();
      i++;
    }
  }

  return parsed;
}

function assertPathOutsideRepo(targetPath) {
  if (!targetPath) return;
  const repoRoot = path.resolve(__dirname, '../../..');
  const resolvedTarget = path.resolve(targetPath);

  let realTargetDir = path.dirname(resolvedTarget);
  try {
    realTargetDir = fs.realpathSync(realTargetDir);
  } catch (_) {}

  let realRepoRoot = repoRoot;
  try {
    realRepoRoot = fs.realpathSync(repoRoot);
  } catch (_) {}

  if (resolvedTarget.startsWith(realRepoRoot) || realTargetDir.startsWith(realRepoRoot)) {
    throw new Error(`SAFETY REJECTION: Credentials file path [${resolvedTarget}] cannot be located inside repository.`);
  }
}

async function detectDefaultAccounts(knownDefaults) {
  const users = await User.find({ status: { $ne: 'DELETED' } })
    .select('+password +passwordHash email role name employeeId employeeCode');
  const matchedUsers = [];

  for (const user of users) {
    const hash = user.password || user.passwordHash;
    if (!hash) continue;

    let matched = false;

    // 1. Check legacy per-employee pattern password: BJK@<code/id>!2026
    const empCode = (user.employeeCode || user.employeeId || '').trim();
    if (empCode) {
      const patternPwd = `BJK@${empCode}!2026`;
      if (await bcrypt.compare(patternPwd, hash).catch(() => false)) {
        matchedUsers.push(user);
        matched = true;
      }
    }

    if (matched) continue;

    // 2. Check supplied known default passwords
    for (const defPwd of knownDefaults) {
      if (await bcrypt.compare(defPwd, hash).catch(() => false)) {
        matchedUsers.push(user);
        break;
      }
    }
  }

  return matchedUsers;
}

async function main() {
  const options = parseCliArgs();

  console.log('================================================================');
  console.log(' BJK HEALTHCARE — OWNER-RUN EMERGENCY PASSWORD RESET ENGINE');
  console.log('================================================================');

  const effectiveDb = getEffectiveDatabaseName();

  if (options.isDetectDefaults) {
    console.log('[MODE] DETECT DEFAULTS MODE (Read-only Analysis)\n');
  } else if (options.isDryRun) {
    console.log('[MODE] DRY-RUN MODE: No database changes will be written.\n');
  } else if (options.isProduction) {
    console.log('[MODE] PRODUCTION LIVE EXECUTION MODE (Guarded)\n');
  } else {
    console.log('[MODE] NON-PRODUCTION LIVE EXECUTION MODE\n');
  }

  // Pre-Execution Assertions
  if (!options.isDryRun && !options.isDetectDefaults) {
    if (!options.isConfirmed) {
      console.error('[FATAL ERROR] Live rotation requires explicit --confirm flag.');
      process.exit(1);
    }
    if (!options.operator) {
      console.error('[FATAL ERROR] Audit requirement: --operator "<name>" is mandatory.');
      process.exit(1);
    }
    if (!options.reason) {
      console.error('[FATAL ERROR] Audit requirement: --reason "<text>" is mandatory.');
      process.exit(1);
    }
    if (options.credentialsFile) {
      assertPathOutsideRepo(options.credentialsFile);
    }
  }

  // Target Validation: Never target all users by default
  const validTargets = ['defaults', 'emails-file', 'roles'];
  if (!options.isDetectDefaults && (!options.target || !validTargets.includes(options.target))) {
    console.error('[FATAL ERROR] Target mode required. Default target must NOT be all users.');
    console.error('Specify one of:');
    console.error('  --target defaults');
    console.error('  --target emails-file <path_to_txt_or_csv>');
    console.error('  --target roles <ROLE1,ROLE2>');
    process.exit(1);
  }

  // Environment Guard Validation
  if (options.isProduction) {
    // Separate explicit production path: NEVER reuses assertNonProduction
    if (!options.expectDb || options.expectDb.trim() !== effectiveDb) {
      console.error(`[FATAL SAFETY ERROR] --expect-db is required in production and must exactly match effective DB name "${effectiveDb}". Received: "${options.expectDb}".`);
      process.exit(1);
    }

    const expectedAck = `CONFIRM_RESET_PROD_${effectiveDb}`;
    const actualAck = (process.env.PRODUCTION_RESET_ACK || '').trim();
    if (actualAck !== expectedAck) {
      console.error(`[FATAL SAFETY ERROR] PRODUCTION_RESET_ACK environment variable must be set to "${expectedAck}".`);
      process.exit(1);
    }

    if (!options.isDryRun && !options.isDetectDefaults) {
      if (!options.dryRunHash || !options.dryRunFile) {
        console.error('[FATAL SAFETY ERROR] Live execution requires prior dry-run verification:');
        console.error('  --dry-run-file <path_to_report> --dry-run-hash <sha256_hash>');
        process.exit(1);
      }
      assertPathOutsideRepo(options.dryRunFile);
      if (!fs.existsSync(options.dryRunFile)) {
        console.error(`[FATAL SAFETY ERROR] Dry-run report file not found at: ${options.dryRunFile}`);
        process.exit(1);
      }

      const reportContent = fs.readFileSync(options.dryRunFile, 'utf8');
      const calculatedHash = crypto.createHash('sha256').update(reportContent).digest('hex');
      if (calculatedHash !== options.dryRunHash.trim()) {
        console.error(`[FATAL SAFETY ERROR] Dry-run report file hash mismatch. Expected: ${options.dryRunHash}, Calculated: ${calculatedHash}`);
        process.exit(1);
      }
    }
  } else {
    // Non-production execution path: Strictly enforce non-production guards
    assertNonProduction();

    if (!options.isDryRun && !options.isDetectDefaults) {
      if (!options.dryRunHash || !options.dryRunFile) {
        console.error('[FATAL SAFETY ERROR] Live execution requires prior dry-run verification:');
        console.error('  --dry-run-file <path_to_report> --dry-run-hash <sha256_hash>');
        process.exit(1);
      }
      assertPathOutsideRepo(options.dryRunFile);
      if (!fs.existsSync(options.dryRunFile)) {
        console.error(`[FATAL SAFETY ERROR] Dry-run report file not found at: ${options.dryRunFile}`);
        process.exit(1);
      }

      const reportContent = fs.readFileSync(options.dryRunFile, 'utf8');
      const calculatedHash = crypto.createHash('sha256').update(reportContent).digest('hex');
      if (calculatedHash !== options.dryRunHash.trim()) {
        console.error(`[FATAL SAFETY ERROR] Dry-run report file hash mismatch. Expected: ${options.dryRunHash}, Calculated: ${calculatedHash}`);
        process.exit(1);
      }
    }
  }

  // Connect & Verify Connected Database
  console.log('[1/4] Connecting to target database...');
  const conn = await connectDB(0, 3, false);
  if (!options.isProduction) {
    assertConnectedDbAllowed(conn);
  } else {
    if (mongoose.connection.name !== effectiveDb) {
      console.error(`[FATAL ERROR] Connected database "${mongoose.connection.name}" does not match effective database "${effectiveDb}".`);
      process.exit(1);
    }
  }

  // Load Known Defaults from runtime environment
  const knownDefaults = (process.env.KNOWN_DEFAULT_PASSWORDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Mode: Detect Defaults
  if (options.isDetectDefaults) {
    console.log(`[2/4] Testing accounts against legacy pattern BJK@<empCode>!2026 and ${knownDefaults.length} supplied default candidate(s)...`);
    const matched = await detectDefaultAccounts(knownDefaults);

    const roleBreakdown = {};
    matched.forEach(u => {
      roleBreakdown[u.role] = (roleBreakdown[u.role] || 0) + 1;
    });

    console.log('----------------------------------------------------------------');
    console.log(`Accounts matching default patterns: ${matched.length}`);
    console.log('Role breakdown:');
    Object.entries(roleBreakdown).forEach(([r, count]) => {
      console.log(`  - ${r}: ${count}`);
    });

    if (options.listEmails) {
      console.log('\nMatched Account Emails:');
      matched.forEach(u => console.log(`  ${u.email}`));
    }
    console.log('----------------------------------------------------------------');
    await mongoose.connection.close();
    return;
  }

  // Resolve Target Accounts
  console.log(`[2/4] Resolving target accounts for mode: --target ${options.target}...`);
  let targetUsers = [];

  if (options.target === 'defaults') {
    targetUsers = await detectDefaultAccounts(knownDefaults);
  } else if (options.target === 'roles') {
    if (!options.targetValue) {
      console.error('[FATAL ERROR] --target roles requires comma-separated roles.');
      await mongoose.connection.close();
      process.exit(1);
    }
    const roles = options.targetValue.split(',').map(r => r.trim().toUpperCase());
    targetUsers = await User.find({ role: { $in: roles }, status: { $ne: 'DELETED' } })
      .select('+password +passwordHash email role name employeeId employeeCode');
  } else if (options.target === 'emails-file') {
    if (!options.targetValue || !fs.existsSync(options.targetValue)) {
      console.error(`[FATAL ERROR] Emails file not found at: ${options.targetValue}`);
      await mongoose.connection.close();
      process.exit(1);
    }
    const lines = fs.readFileSync(options.targetValue, 'utf8')
      .split(/\r?\n/)
      .map(l => l.trim().toLowerCase())
      .filter(Boolean);
    targetUsers = await User.find({ email: { $in: lines }, status: { $ne: 'DELETED' } })
      .select('+password +passwordHash email role name employeeId employeeCode');
  }

  const roleCounts = {};
  targetUsers.forEach(u => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });

  console.log(`[INFO] Resolved ${targetUsers.length} target accounts.`);
  console.log('Role Breakdown:');
  Object.entries(roleCounts).forEach(([r, c]) => console.log(`  - ${r}: ${c}`));

  // Dry Run Output: Writes mode 0600 report file containing target user _ids
  if (options.isDryRun) {
    if (!options.dryRunFile) {
      console.error('[FATAL SAFETY ERROR] Dry-run requires destination file path via --dry-run-file <path>.');
      await mongoose.connection.close();
      process.exit(1);
    }
    const reportFilePath = path.resolve(options.dryRunFile);
    assertPathOutsideRepo(reportFilePath);

    const reportPayload = {
      database: effectiveDb,
      timestamp: new Date().toISOString(),
      target: options.target,
      targetValue: options.targetValue || null,
      candidateCount: targetUsers.length,
      targetUserIds: targetUsers.map(u => u._id.toString()).sort(),
      roles: roleCounts
    };

    const reportJson = JSON.stringify(reportPayload, null, 2) + '\n';
    fs.writeFileSync(reportFilePath, reportJson, { mode: 0o600, flag: 'w' });

    const dryRunSha = crypto.createHash('sha256').update(reportJson).digest('hex');
    console.log('\nDRY-RUN COMPLETE: Zero accounts modified. Passwords and hashes were neither created nor logged.');
    console.log(`Dry-Run Report Written to: ${reportFilePath} (mode 0600)`);
    console.log(`Dry-Run Report SHA-256 Hash: ${dryRunSha}`);
    console.log(`Target Accounts Recorded: ${targetUsers.length}`);
    console.log('Provide this file and hash to live execution via --dry-run-file and --dry-run-hash.');
    await mongoose.connection.close();
    return;
  }

  // Live Execution Verification: Recompute and verify target IDs against dry-run report
  const dryRunReportContent = fs.readFileSync(options.dryRunFile, 'utf8');
  let dryRunReport;
  try {
    dryRunReport = JSON.parse(dryRunReportContent);
  } catch (parseErr) {
    console.error(`[FATAL ERROR] Failed to parse dry-run report file: ${parseErr.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  const liveTargetIds = targetUsers.map(u => u._id.toString()).sort();
  const recordedTargetIds = Array.isArray(dryRunReport.targetUserIds) ? dryRunReport.targetUserIds : [];

  if (liveTargetIds.length !== recordedTargetIds.length ||
      !liveTargetIds.every((id, idx) => id === recordedTargetIds[idx])) {
    console.error('\n[FATAL SAFETY ERROR] Live recomputed target user IDs do not match dry-run report IDs!');
    console.error(`  Report Target Count:    ${recordedTargetIds.length}`);
    console.error(`  Live Recomputed Count:  ${liveTargetIds.length}`);
    console.error('Database state or candidate users have changed since dry run. Refusing live rotation.');
    await mongoose.connection.close();
    process.exit(1);
  }
  console.log(`[VERIFIED] Live recomputed target user IDs (${liveTargetIds.length}) exactly match dry-run report.`);

  // Live Execution
  console.log('\n[3/4] Executing password rotation with individual bcrypt salts (cost 10)...');

  let credFileFd = null;
  if (options.credentialsFile) {
    const filePath = path.resolve(options.credentialsFile);
    assertPathOutsideRepo(filePath);
    // Open with flag 'wx' and mode 0600
    credFileFd = fs.openSync(filePath, 'wx', 0o600);
    fs.writeSync(credFileFd, 'email,role,employeeId,temporaryPassword,rotatedAt\n');
  }

  let successfulRotations = 0;
  let abortedRotations = 0;
  const operatorHost = os.hostname();

  for (const user of targetUsers) {
    const tempPassword = generateSecureRandomPassword(20);

    // Step A: Write AuditLog FIRST using real AuditLog schema. If audit log write fails, abort this account.
    try {
      const auditEntry = new AuditLog({
        user: {
          id: null,
          name: options.operator,
          email: 'system@bjkhealthcare.com',
          role: 'SYSTEM'
        },
        action: 'OWNER_EMERGENCY_PASSWORD_RESET',
        module: 'SECURITY',
        resource: 'User',
        resourceId: user._id.toString(),
        recordId: user._id.toString(),
        status: 'SUCCESS',
        targetUser: {
          id: user._id,
          name: user.name || '',
          employeeId: user.employeeId || '',
          email: user.email || ''
        },
        targetUserId: user._id.toString(),
        reason: options.reason,
        details: `Owner emergency password rotation. Operator: ${options.operator}. Host: ${operatorHost}. Reason: ${options.reason}`,
        ipAddress: operatorHost,
        ip: operatorHost,
        userAgent: `CLI (node ${process.version}; ${process.platform})`,
        timestamp: new Date()
      });
      await auditEntry.save();
    } catch (auditErr) {
      console.error(`[ABORT] Audit log write failed for ${user.email}. Skipping account: ${auditErr.message}`);
      abortedRotations++;
      continue;
    }

    // Step B: Generate unique individual salt (cost 10) per user
    const userSalt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(tempPassword, userSalt);

    // Step C: Atomically update user credentials and synchronization fields
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: newHash,
          passwordHash: newHash,
          mustChangePassword: true,
          temporaryPassword: true,
          firstLogin: false,
          failedLoginAttempts: 0,
          isLocked: false,
          lockedReason: '',
          lockedUntil: null,
          passwordChangedAt: null, // Forces hasPermanentPassword in authController to false
          lastPasswordResetAt: new Date()
        }
      }
    );

    // Step D: Revoke existing active sessions in UserSession
    await UserSession.updateMany(
      { userId: user._id, status: 'ACTIVE' },
      {
        $set: {
          status: 'REVOKED',
          terminatedAt: new Date(),
          terminatedBy: `Owner Emergency Reset: ${options.operator}`
        }
      }
    );

    // Step E: Append row immediately to credentials file if opened
    if (credFileFd !== null) {
      const csvRow = `${user.email},${user.role},${user.employeeId || ''},${tempPassword},${new Date().toISOString()}\n`;
      fs.writeSync(credFileFd, csvRow);
    }

    successfulRotations++;
  }

  if (credFileFd !== null) {
    fs.closeSync(credFileFd);
    console.log(`\n[DELIVERY] Temporary credentials securely appended to mode 0600 file outside repository: ${path.resolve(options.credentialsFile)}`);
    console.log('*********************************************************************************');
    console.log('WARNING: The generated credentials file contains sensitive temporary passwords.');
    console.log('It MUST be securely delivered to authorized owners and DELETED from disk immediately.');
    console.log('*********************************************************************************');
  }

  console.log('\n[4/4] Execution Summary:');
  console.log('================================================================');
  console.log(` Total Candidate Accounts:  ${targetUsers.length}`);
  console.log(` Successfully Rotated:     ${successfulRotations}`);
  console.log(` Aborted (Audit Failure):   ${abortedRotations}`);
  console.log(` Active Sessions Revoked:  YES (UserSession status=REVOKED)`);
  console.log(` Mandatory Password Change: FORCED on next login`);
  console.log('================================================================\n');

  await mongoose.connection.close();
}

if (require.main === module) {
  main().catch(err => {
    console.error('[FATAL SCRIPT ERROR]:', err.message);
    process.exit(1);
  });
}

module.exports = {
  main,
  parseCliArgs,
  generateSecureRandomPassword,
  assertPathOutsideRepo
};
