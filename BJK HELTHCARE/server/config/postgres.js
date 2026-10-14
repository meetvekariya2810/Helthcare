const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const fs = require('fs');

let pool = null;
let pgliteInstance = null;
let isConnected = false;

const isProduction = process.env.NODE_ENV === 'production';
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);

function getPool() {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (databaseUrl) {
    const useSsl = process.env.DATABASE_SSL === 'true' || 
      (isProduction && !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1'));

    const poolConfig = {
      connectionString: databaseUrl,
      max: isServerless ? parseInt(process.env.DATABASE_POOL_MAX || '2', 10) : parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
    });

    isConnected = true;
    console.log(`[PostgreSQL] Connection pool established (SSL: ${useSsl}, Max: ${poolConfig.max})`);
    return pool;
  }

  // Production Safety Rule 8: Fail fast in production if no connection string is provided
  if (isProduction) {
    throw new Error('[PostgreSQL] FATAL: Production environment detected, but DATABASE_URL is not configured! Aborting startup.');
  }

  // Local development / staging mode: Use local persistent PGlite PostgreSQL engine
  console.log('[PostgreSQL] No external DATABASE_URL found. Initializing local persistent PostgreSQL engine...');
  const stagingDir = path.join(__dirname, '../../.postgres_staging_data');
  if (!fs.existsSync(stagingDir)) {
    fs.mkdirSync(stagingDir, { recursive: true });
  }

  pgliteInstance = new PGlite(stagingDir);

  // Adapter pool wrapping PGlite to provide 100% standard pg.Pool interface
  pool = {
    isLocal: true,
    pglite: pgliteInstance,
    async exec(text) {
      return pgliteInstance.exec(text);
    },
    async query(text, params) {
      if (params === undefined || (Array.isArray(params) && params.length === 0)) {
        // If no params and contains multiple statements, use exec
        if (text.includes(';') && text.trim().indexOf(';') < text.trim().length - 1) {
          await pgliteInstance.exec(text);
          return { rows: [], rowCount: 0 };
        }
      }
      const res = await pgliteInstance.query(text, params);
      return {
        rows: res.rows,
        rowCount: res.affectedRows !== undefined ? res.affectedRows : res.rows.length,
        fields: res.fields
      };
    },
    async connect() {
      await pgliteInstance.waitReady;
      return {
        exec: async (text) => pgliteInstance.exec(text),
        query: async (text, params) => {
          if (params === undefined || (Array.isArray(params) && params.length === 0)) {
            if (text.includes(';') && text.trim().indexOf(';') < text.trim().length - 1) {
              await pgliteInstance.exec(text);
              return { rows: [], rowCount: 0 };
            }
          }
          const res = await pgliteInstance.query(text, params);
          return {
            rows: res.rows,
            rowCount: res.affectedRows !== undefined ? res.affectedRows : res.rows.length,
            fields: res.fields
          };
        },
        release: () => {}
      };
    },
    async end() {

      if (pgliteInstance) {
        await pgliteInstance.close();
        pgliteInstance = null;
      }
      pool = null;
      isConnected = false;
    }
  };

  isConnected = true;
  console.log(`[PostgreSQL] Local persistent engine connected at ${stagingDir}`);
  return pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

async function transaction(callback) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN;');
    const result = await callback(client);
    await client.query('COMMIT;');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK;'); } catch (_) {}
    throw err;
  } finally {
    client.release();
  }
}

async function isDBConnected() {
  try {
    const res = await query('SELECT 1 as ok;');
    return res.rows && res.rows[0].ok === 1;
  } catch (_) {
    return false;
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    isConnected = false;
    console.log('[PostgreSQL] Connection pool cleanly terminated.');
  }
}

module.exports = {
  getPool,
  query,
  transaction,
  isDBConnected,
  closePool
};
