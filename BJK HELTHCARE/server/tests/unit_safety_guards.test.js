const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  parseDatabaseName,
  assertNonProduction,
  assertConnectedDbAllowed
} = require('../config/safetyGuards');

test('parseDatabaseName - Edge Cases', async (t) => {
  await t.test('resolves database name from standard MongoDB URI', () => {
    assert.strictEqual(parseDatabaseName('mongodb://127.0.0.1:27017/bjk_test_db'), 'bjk_test_db');
  });

  await t.test('resolves database name from MongoDB Atlas SRV URI with query params', () => {
    assert.strictEqual(
      parseDatabaseName('mongodb+srv://admin_user:secret_pass@cluster0.bjk.mongodb.net/staging_branch_db?retryWrites=true&w=majority'),
      'staging_branch_db'
    );
  });

  await t.test('resolves URL-encoded database names correctly', () => {
    assert.strictEqual(
      parseDatabaseName('mongodb://127.0.0.1:27017/bjk%20custom%20db?authSource=admin'),
      'bjk custom db'
    );
  });

  await t.test('returns null when URI has no database path', () => {
    assert.strictEqual(parseDatabaseName('mongodb://127.0.0.1:27017'), null);
    assert.strictEqual(parseDatabaseName('mongodb://127.0.0.1:27017/'), null);
    assert.strictEqual(parseDatabaseName('mongodb+srv://cluster.mongodb.net/?ssl=true'), null);
  });

  await t.test('returns null for empty, non-string, or nullish inputs', () => {
    assert.strictEqual(parseDatabaseName(''), null);
    assert.strictEqual(parseDatabaseName('   '), null);
    assert.strictEqual(parseDatabaseName(null), null);
    assert.strictEqual(parseDatabaseName(undefined), null);
    assert.strictEqual(parseDatabaseName(12345), null);
    assert.strictEqual(parseDatabaseName({}), null);
  });
});

test('assertNonProduction - Environment Combinations', async (t) => {
  const originalEnv = { ...process.env };

  const restoreEnv = () => {
    process.env = { ...originalEnv };
  };

  await t.test('throws fatal error when NODE_ENV is production', () => {
    restoreEnv();
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/safe_test_db';
    process.env.SEED_ALLOWED_DB = 'safe_test_db';

    assert.throws(
      () => assertNonProduction(),
      /strictly forbidden when NODE_ENV=production/
    );
  });

  await t.test('throws fatal error when MONGODB_URI is missing or empty', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;

    assert.throws(
      () => assertNonProduction(),
      /MONGODB_URI environment variable is missing or empty/
    );

    process.env.MONGODB_URI = '   ';
    assert.throws(
      () => assertNonProduction(),
      /MONGODB_URI environment variable is missing or empty/
    );
  });

  await t.test('throws fatal error when DATABASE_NAME is unset even with a staging URI (defaults to bjk_healthcare)', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/staging_sandbox_db';
    delete process.env.DATABASE_NAME;
    process.env.SEED_ALLOWED_DB = 'staging_sandbox_db';

    assert.throws(
      () => assertNonProduction(),
      /Effective database is 'bjk_healthcare' \(production default\)/
    );
  });

  await t.test('throws fatal error when effective DB is bjk_healthcare (prod name)', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/any_uri';
    process.env.DATABASE_NAME = 'bjk_healthcare';
    process.env.SEED_ALLOWED_DB = 'bjk_healthcare';

    assert.throws(
      () => assertNonProduction(),
      /Effective database is 'bjk_healthcare' \(production default\)/
    );
  });

  await t.test('throws fatal error when SEED_ALLOWED_DB is missing or empty', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/safe_test_db';
    process.env.DATABASE_NAME = 'safe_test_db';
    delete process.env.SEED_ALLOWED_DB;

    assert.throws(
      () => assertNonProduction(),
      /SEED_ALLOWED_DB environment variable is not configured/
    );
  });

  await t.test('throws fatal error when effective DB does not exactly match SEED_ALLOWED_DB', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/actual_test_db';
    process.env.DATABASE_NAME = 'actual_test_db';
    process.env.SEED_ALLOWED_DB = 'different_allowed_db';

    assert.throws(
      () => assertNonProduction(),
      /does not exactly match SEED_ALLOWED_DB/
    );
  });

  await t.test('passes successfully when DATABASE_NAME is explicitly set to allowed non-prod DB matching SEED_ALLOWED_DB', () => {
    restoreEnv();
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/isolated_ci_test_db';
    process.env.DATABASE_NAME = 'isolated_ci_test_db';
    process.env.SEED_ALLOWED_DB = 'isolated_ci_test_db';

    assert.doesNotThrow(() => assertNonProduction());
  });

  restoreEnv();
});

test('assertConnectedDbAllowed - Mongoose Connection Verification', async (t) => {
  const originalEnv = { ...process.env };

  const restoreEnv = () => {
    process.env = { ...originalEnv };
  };

  await t.test('throws fatal error when NODE_ENV is production', () => {
    restoreEnv();
    process.env.NODE_ENV = 'production';
    assert.throws(
      () => assertConnectedDbAllowed({ name: 'safe_test_db' }),
      /forbidden when NODE_ENV=production/
    );
  });

  await t.test('throws fatal error when connection object has no name', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    assert.throws(
      () => assertConnectedDbAllowed({ name: '' }),
      /No active database connection name found/
    );
    assert.throws(
      () => assertConnectedDbAllowed(null),
      /No active database connection name found/
    );
  });

  await t.test('throws fatal error when connected to production name bjk_healthcare', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.SEED_ALLOWED_DB = 'bjk_healthcare';
    assert.throws(
      () => assertConnectedDbAllowed({ name: 'bjk_healthcare' }),
      /targets the production database name/
    );
  });

  await t.test('throws fatal error when connected to DATABASE_NAME override', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_NAME = 'bjk_live_prod';
    process.env.SEED_ALLOWED_DB = 'bjk_live_prod';
    assert.throws(
      () => assertConnectedDbAllowed({ name: 'bjk_live_prod' }),
      /targets the production database name/
    );
  });

  await t.test('throws fatal error when SEED_ALLOWED_DB is missing or mismatched', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    delete process.env.SEED_ALLOWED_DB;
    assert.throws(
      () => assertConnectedDbAllowed({ name: 'safe_dev_db' }),
      /SEED_ALLOWED_DB environment variable is not configured/
    );

    process.env.SEED_ALLOWED_DB = 'expected_db';
    assert.throws(
      () => assertConnectedDbAllowed({ name: 'safe_dev_db' }),
      /does not exactly match SEED_ALLOWED_DB/
    );
  });

  await t.test('passes when connected database exactly matches SEED_ALLOWED_DB in non-production', () => {
    restoreEnv();
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_NAME = 'bjk_healthcare';
    process.env.SEED_ALLOWED_DB = 'dev_seed_db';

    assert.doesNotThrow(() => assertConnectedDbAllowed({ name: 'dev_seed_db' }));
  });

  restoreEnv();
});

test('requiredEnv - Child Process Validation (Production vs Non-Production)', async (t) => {
  const serverDir = path.resolve(__dirname, '..');
  const requiredEnvPath = path.resolve(serverDir, 'config/requiredEnv.js');

  const runSubprocess = (env) => {
    return spawnSync(
      process.execPath,
      ['-e', `require(${JSON.stringify(requiredEnvPath)});`],
      {
        cwd: serverDir,
        env: {
          ...process.env,
          ...env
        },
        encoding: 'utf8'
      }
    );
  };

  await t.test('in production: exits with code 1 if JWT_SECRET is missing', () => {
    const res = runSubprocess({
      NODE_ENV: 'production',
      JWT_SECRET: '',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/prod_db'
    });
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr + res.stdout, /JWT_SECRET is missing or empty/);
  });

  await t.test('in production: exits with code 1 if JWT_SECRET is shorter than 32 chars', () => {
    const res = runSubprocess({
      NODE_ENV: 'production',
      JWT_SECRET: 'short_secret_only_20_chars',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/prod_db'
    });
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr + res.stdout, /JWT_SECRET must be at least 32 characters long/);
  });

  await t.test('in production: exits with code 1 if MONGODB_URI is missing', () => {
    const res = runSubprocess({
      NODE_ENV: 'production',
      JWT_SECRET: 'a_very_secure_and_long_jwt_secret_with_32_plus_chars!',
      MONGODB_URI: ''
    });
    assert.strictEqual(res.status, 1);
    assert.match(res.stderr + res.stdout, /MONGODB_URI is missing or empty/);
  });

  await t.test('in production: exits with code 0 when all required env vars are valid', () => {
    const res = runSubprocess({
      NODE_ENV: 'production',
      JWT_SECRET: 'a_very_secure_and_long_jwt_secret_with_32_plus_chars!',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/bjk_healthcare'
    });
    assert.strictEqual(res.status, 0);
  });

  await t.test('outside production: exits with code 0 and warns when JWT_SECRET is missing or short', () => {
    const res = runSubprocess({
      NODE_ENV: 'development',
      JWT_SECRET: 'short',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/dev_db'
    });
    assert.strictEqual(res.status, 0);
    assert.match(res.stderr + res.stdout, /JWT_SECRET must be at least 32 characters long/);
  });
});
