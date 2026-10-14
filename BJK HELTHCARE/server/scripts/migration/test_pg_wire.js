const { PGlite } = require('@electric-sql/pglite');
const { createServer } = require('pglite-server');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

async function testWireProtocol() {
  console.log('[Wire Test] Starting PGlite wire protocol server...');
  const dataDir = path.join(__dirname, '../../.postgres_staging_data');
  const pglite = new PGlite(dataDir);
  await pglite.waitReady;

  const server = createServer(pglite);
  const port = 5433; // use 5433 to avoid standard port conflicts
  
  await new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[Wire Test] PostgreSQL TCP Wire server listening on port ${port}`);
      resolve();
    });
  });

  console.log('[Wire Test] Connecting with standard node-postgres (pg) client pool...');
  const pool = new Pool({
    connectionString: `postgresql://postgres:postgres@127.0.0.1:${port}/bjk_healthcare`
  });

  const client = await pool.connect();
  const res = await client.query('SELECT current_database(), current_user, version();');
  console.log('[Wire Test] Connected via standard pg driver!');
  console.log('[Wire Test] Query result:', res.rows[0]);

  client.release();
  await pool.end();
  
  await new Promise(resolve => server.close(resolve));
  await pglite.close();
  console.log('[Wire Test] Cleanly shut down wire server. SUCCESS!');
}

testWireProtocol().catch(err => {
  console.error('[Wire Test] Wire test error:', err);
  process.exit(1);
});
