const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const terms = [
  'mongoose', 'MongoClient', 'mongodb', 'MONGODB_URI', 'populate(',
  'aggregate(', '$lookup', '$group', '$regex', '$text', 'ObjectId',
  'findOneAndUpdate', 'updateMany', 'bulkWrite', 'startSession', 'lean(',
  'mongodb-memory-server'
];

const results = {};

for (const term of terms) {
  results[term] = {
    total: 0,
    runtime: { count: 0, files: [] },
    test: { count: 0, files: [] },
    seed: { count: 0, files: [] },
    migration: { count: 0, files: [] },
    docs: { count: 0, files: [] }
  };

  try {
    const raw = execFileSync('git', ['grep', '-n', '-F', term], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const lines = raw.trim().split('\n').filter(Boolean);
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const file = line.substring(0, idx).replace(/\\/g, '/');
      let cat = 'runtime';
      if (file.includes('/tests/') || file.includes('test') || file.includes('TestSuite')) cat = 'test';
      else if (file.includes('/seed/')) cat = 'seed';
      else if (file.includes('/scripts/')) cat = 'migration';
      else if (file.startsWith('docs/') || file.endsWith('.md')) cat = 'docs';

      results[term].total++;
      results[term][cat].count++;
      if (!results[term][cat].files.includes(file)) {
        results[term][cat].files.push(file);
      }
    }
  } catch (err) {
    // git grep exits with 1 if no matches found
  }
}

const outDir = path.join(__dirname, '../docs/database');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'GREP_CLASSIFICATION.json'), JSON.stringify(results, null, 2));

console.log('TERM SUMMARY:');
for (const [k, v] of Object.entries(results)) {
  console.log(k.padEnd(25) + ' Total: ' + String(v.total).padStart(5) + 
    ' (Runtime: ' + v.runtime.count + ', Test: ' + v.test.count + 
    ', Seed: ' + v.seed.count + ', Migration: ' + v.migration.count + ', Docs: ' + v.docs.count + ')');
}
