const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { getPool } = require('../../config/postgres');
const dns = require('dns');

if (process.platform === 'win32') {
  try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
}

async function inspectDatabases() {
  console.log('================================================================');
  console.log('       BJK HEALTHCARE — DUAL DATABASE INSPECTION REPORT         ');
  console.log('================================================================\n');

  // 1. Inspect MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME || 'bjk_healthcare';
  console.log(`[Atlas] Connecting to MongoDB Atlas (${dbName})...`);
  
  let atlasColls = [];
  try {
    const mConn = await mongoose.connect(uri, {
      dbName,
      readPreference: 'secondaryPreferred',
      serverSelectionTimeoutMS: 15000,
    });
    console.log('[Atlas] Connected successfully (READ-ONLY).');
    const raw = await mConn.connection.db.listCollections().toArray();
    for (const c of raw) {
      const count = await mConn.connection.db.collection(c.name).countDocuments();
      atlasColls.push({ name: c.name, count });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('[Atlas] Error connecting to Atlas:', err.message);
  }

  // 2. Inspect PostgreSQL
  console.log('\n[PostgreSQL] Connecting to PostgreSQL instance...');
  const pool = getPool();
  let pgTables = [];
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    for (const r of res.rows) {
      try {
        const countRes = await pool.query(`SELECT COUNT(*) as cnt FROM "${r.table_name}";`);
        pgTables.push({ name: r.table_name, count: parseInt(countRes.rows[0].cnt, 10) });
      } catch (e) {
        pgTables.push({ name: r.table_name, count: -1, error: e.message });
      }
    }
    await pool.end();
  } catch (err) {
    console.error('[PostgreSQL] Error connecting to PostgreSQL:', err.message);
  }

  console.log('----------------------------------------------------------------');
  console.log(`Atlas Total Collections:      ${atlasColls.length}`);
  console.log(`Atlas Populated Collections:  ${atlasColls.filter(c => c.count > 0).length}`);
  console.log(`Atlas Total Records:          ${atlasColls.reduce((acc, c) => acc + c.count, 0).toLocaleString()}`);
  console.log('----------------------------------------------------------------');
  console.log(`PostgreSQL Total Tables:      ${pgTables.length}`);
  console.log(`PostgreSQL Total Records:     ${pgTables.filter(t => t.count > 0).reduce((acc, t) => acc + t.count, 0).toLocaleString()}`);
  console.log('================================================================\n');

  console.log('Top Populated Atlas Collections vs. PostgreSQL Tables:');
  const sortedAtlas = atlasColls.filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  sortedAtlas.slice(0, 20).forEach((c, idx) => {
    // Find matching pg table
    const cleanMongo = c.name.replace(/_/g, '').toLowerCase();
    const matchingPg = pgTables.find(t => {
      const cleanPg = t.name.replace(/_/g, '').toLowerCase();
      return cleanPg === cleanMongo || cleanPg + 's' === cleanMongo || cleanMongo + 's' === cleanPg;
    });
    const pgCount = matchingPg ? matchingPg.count : 'N/A';
    console.log(` ${(idx + 1).toString().padStart(2)}. Atlas: ${c.name.padEnd(30)} (${String(c.count).padStart(6)}) -> PG Table: ${(matchingPg ? matchingPg.name : 'none').padEnd(30)} (${String(pgCount).padStart(6)})`);
  });

  return { atlasColls, pgTables };
}

if (require.main === module) {
  inspectDatabases().then(() => process.exit(0)).catch(err => {
    console.error('Fatal inspection error:', err);
    process.exit(1);
  });
}

module.exports = { inspectDatabases };
