const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPool, isLocalPostgres } = require('../../config/postgres');

async function applyMigrations() {
  console.log('[Schema Migrator] Initializing PostgreSQL schema migration runner...');
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Ensure schema_migrations exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64) NOT NULL
      );
    `);

    // 2. Fetch applied migrations
    const res = await client.query('SELECT version, checksum FROM schema_migrations ORDER BY version ASC;');
    const appliedMap = new Map(res.rows.map(r => [r.version, r.checksum]));

    // 3. Read migration files
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    console.log(`[Schema Migrator] Found ${files.length} migration files in ${migrationsDir}`);

    let newlyApplied = 0;

    for (const file of files) {
      const version = file.split('_')[0];
      const name = file;
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex').substring(0, 16);

      if (appliedMap.has(version)) {
        console.log(`[Schema Migrator] Skipped already applied: ${file} (v${version})`);
        continue;
      }

      console.log(`[Schema Migrator] Applying migration: ${file}...`);
      
      // Execute in a transaction (unless file contains role creation that cannot run in transaction or local pglite)
      await client.query('BEGIN;');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3);',
          [version, name, checksum]
        );
        await client.query('COMMIT;');
        console.log(`[Schema Migrator] Successfully applied: ${file}`);
        newlyApplied++;
      } catch (migErr) {
        await client.query('ROLLBACK;');
        console.error(`[Schema Migrator] ERROR applying migration ${file}:`, migErr.message);
        throw migErr;
      }
    }

    console.log(`[Schema Migrator] Migration completed. Applied ${newlyApplied} new migrations. Total current: ${appliedMap.size + newlyApplied}`);
    return { success: true, newlyApplied, total: appliedMap.size + newlyApplied };
  } finally {
    client.release();
  }
}

if (require.main === module) {
  applyMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Schema Migrator] FATAL:', err);
      process.exit(1);
    });
}

module.exports = { applyMigrations };
