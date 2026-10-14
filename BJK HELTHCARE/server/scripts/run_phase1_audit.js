const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const dns = require('dns');

if (process.platform === 'win32') {
  try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME || 'bjk_healthcare';

// Classification of sensitive fields for masking/security
const SENSITIVE_PATTERNS = [
  /password/i,
  /hash/i,
  /secret/i,
  /token/i,
  /aadhaar/i,
  /pan/i,
  /bank.*account/i,
  /account.*no/i,
  /ifsc/i,
  /salary/i,
  /ctc/i,
  /medical/i,
  /health/i,
  /pin/i
];

function isSensitiveField(fieldName) {
  return SENSITIVE_PATTERNS.some((pat) => pat.test(fieldName));
}

function getBsonType(val) {
  if (val === null) return 'Null';
  if (val === undefined) return 'Undefined';
  if (val instanceof mongoose.Types.ObjectId || (val && val._bsontype === 'ObjectID')) return 'ObjectId';
  if (val instanceof Date) return 'Date';
  if (val instanceof mongoose.Types.Decimal128 || (val && val._bsontype === 'Decimal128')) return 'Decimal128';
  if (Buffer.isBuffer(val) || (val && val._bsontype === 'Binary')) return 'Binary';
  if (Array.isArray(val)) return 'Array';
  if (typeof val === 'object') return 'Object';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? 'Integer' : 'Double';
  }
  if (typeof val === 'boolean') return 'Boolean';
  if (typeof val === 'string') return 'String';
  return typeof val;
}

function analyzeDoc(doc, fieldMap, prefix = '') {
  if (!doc || typeof doc !== 'object') return;
  for (const [key, val] of Object.entries(doc)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const btype = getBsonType(val);

    if (!fieldMap[fullPath]) {
      fieldMap[fullPath] = {
        name: fullPath,
        types: {},
        sampleCount: 0,
        nullCount: 0,
        isSensitive: isSensitiveField(key) || isSensitiveField(fullPath),
        isArray: btype === 'Array',
        isNested: btype === 'Object'
      };
    }

    fieldMap[fullPath].sampleCount++;
    if (val === null) {
      fieldMap[fullPath].nullCount++;
    }
    fieldMap[fullPath].types[btype] = (fieldMap[fullPath].types[btype] || 0) + 1;

    if (btype === 'Object' && val !== null && !(val instanceof Date) && !(val instanceof mongoose.Types.ObjectId)) {
      analyzeDoc(val, fieldMap, fullPath);
    } else if (btype === 'Array' && Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object' && !(item instanceof Date) && !(item instanceof mongoose.Types.ObjectId)) {
          analyzeDoc(item, fieldMap, `${fullPath}[]`);
        }
      }
    }
  }
}

async function runAudit() {
  console.log('[Phase 1 Audit] Starting read-only audit of Atlas cluster...');
  const conn = await mongoose.connect(uri, {
    dbName,
    readPreference: 'secondaryPreferred',
    serverSelectionTimeoutMS: 20000,
  });

  const db = conn.connection.db;
  const rawCollections = await db.listCollections().toArray();
  const sortedColls = rawCollections.sort((a, b) => a.name.localeCompare(b.name));
  
  console.log(`[Phase 1 Audit] Found ${sortedColls.length} collections. Analyzing...`);

  const results = {
    auditDate: new Date().toISOString(),
    databaseName: dbName,
    totalCollections: sortedColls.length,
    collections: []
  };

  let totalDocsAll = 0;

  for (const collInfo of sortedColls) {
    const collName = collInfo.name;
    const collection = db.collection(collName);
    const count = await collection.countDocuments();
    totalDocsAll += count;

    let indexes = [];
    try {
      indexes = await collection.indexes();
    } catch (e) {
      indexes = [{ name: 'error', error: e.message }];
    }

    // Sample documents to understand schema
    // If count <= 500, sample all. If > 500, sample 200 documents
    const sampleLimit = count <= 500 ? count : 200;
    const sampleDocs = sampleLimit > 0 ? await collection.find({}).limit(sampleLimit).toArray() : [];

    const fieldMap = {};
    for (const doc of sampleDocs) {
      analyzeDoc(doc, fieldMap);
    }

    // Check duplicate business keys if applicable
    const duplicateChecks = {};
    const candidateKeys = ['employeeId', 'empId', 'email', 'code', 'slug', 'sku', 'productCode', 'accountNumber'];
    for (const ck of candidateKeys) {
      if (fieldMap[ck] && count > 0) {
        const dupes = await collection.aggregate([
          { $match: { [ck]: { $ne: null, $exists: true } } },
          { $group: { _id: `$${ck}`, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } },
          { $limit: 10 }
        ]).toArray();
        if (dupes.length > 0) {
          duplicateChecks[ck] = dupes.map(d => ({ value: d._id, count: d.count }));
        }
      }
    }

    results.collections.push({
      name: collName,
      count,
      indexes: indexes.map(idx => ({
        name: idx.name,
        key: idx.key,
        unique: Boolean(idx.unique),
        sparse: Boolean(idx.sparse),
        expireAfterSeconds: idx.expireAfterSeconds
      })),
      fieldCount: Object.keys(fieldMap).length,
      fields: Object.values(fieldMap),
      duplicateKeys: duplicateChecks
    });

    if (count > 0) {
      console.log(`[Phase 1 Audit] Coll: ${collName.padEnd(35)} Count: ${String(count).padStart(6)} Fields: ${Object.keys(fieldMap).length}`);
    }
  }

  results.totalDocuments = totalDocsAll;

  const outDir = path.join(__dirname, '../../../docs/database');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'SOURCE_SCHEMA_AUDIT_DATA.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`[Phase 1 Audit] Successfully wrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);

  await mongoose.disconnect();
  console.log('[Phase 1 Audit] Atlas disconnected. Audit complete.');
}

runAudit().catch(err => {
  console.error('[Phase 1 Audit] FATAL ERROR:', err);
  process.exit(1);
});
