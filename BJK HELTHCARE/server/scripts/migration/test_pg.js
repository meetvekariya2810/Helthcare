const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
const fs = require('fs');

async function testPostgres() {
  console.log('[Test PG] Initializing PGlite PostgreSQL 16 engine from server...');
  const dataDir = path.join(__dirname, '../../.postgres_staging_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pg = new PGlite(dataDir);
  await pg.waitReady;
  console.log('[Test PG] PGlite ready! Running test query...');
  
  const res = await pg.query('SELECT version(), current_timestamp as now;');
  console.log('[Test PG] Version:', res.rows[0].version);
  console.log('[Test PG] Timestamp:', res.rows[0].now);

  // Test table creation and UUIDs
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS test_table (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100),
      meta JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO test_table (name, meta) VALUES ('BJK Healthcare Staging Engine', '{"status": "ready"}'::jsonb);
  `);

  const rows = await pg.query('SELECT * FROM test_table;');
  console.log('[Test PG] Stored row successfully:', rows.rows[0]);
  await pg.close();
  console.log('[Test PG] PGlite closed cleanly. SUCCESS!');
}

testPostgres().catch(err => {
  console.error('[Test PG] ERROR:', err);
  process.exit(1);
});
