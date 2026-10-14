const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('docs/database/SOURCE_SCHEMA_AUDIT_DATA.json', 'utf8'));
const atlasCollNames = new Set(data.collections.map(c => c.name));

function findModelFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) res = res.concat(findModelFiles(full));
    else if (f.name.endsWith('.js')) res.push(full);
  }
  return res;
}

const modelFiles = findModelFiles('BJK HELTHCARE/server/models');
const registeredModels = [];

for (const mf of modelFiles) {
  const content = fs.readFileSync(mf, 'utf8');
  const regex = /mongoose\.model\(\s*['"]([^'"]+)['"]\s*(?:,\s*[^,]+(?:\s*,\s*['"]([^'"]+)['"])?)?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const modelName = match[1];
    const customColl = match[2];
    registeredModels.push({
      file: path.relative('.', mf).replace(/\\/g, '/'),
      modelName,
      customColl: customColl || null
    });
  }
}

console.log('Total Mongoose model definitions found in codebase:', registeredModels.length);

const results = [];
for (const rm of registeredModels) {
  let matchedColl = null;
  if (rm.customColl && atlasCollNames.has(rm.customColl)) {
    matchedColl = rm.customColl;
  } else {
    // try exact lowercase
    const lower = rm.modelName.toLowerCase();
    if (atlasCollNames.has(lower)) {
      matchedColl = lower;
    } else if (atlasCollNames.has(lower + 's')) {
      matchedColl = lower + 's';
    } else if (lower.endsWith('y') && atlasCollNames.has(lower.slice(0, -1) + 'ies')) {
      matchedColl = lower.slice(0, -1) + 'ies';
    } else {
      // search for contains or similar
      for (const ac of atlasCollNames) {
        if (ac.toLowerCase() === lower || ac.toLowerCase() === lower + 's') {
          matchedColl = ac;
          break;
        }
      }
    }
  }

  results.push({
    ...rm,
    matchedColl,
    foundInAtlas: Boolean(matchedColl)
  });
}

const matchedCount = results.filter(r => r.foundInAtlas).length;
console.log('Successfully mapped to Atlas collection:', matchedCount, 'out of', results.length);

const unmapped = results.filter(r => !r.foundInAtlas);
if (unmapped.length > 0) {
  console.log('Unmapped:');
  unmapped.forEach(u => console.log(' - ' + u.modelName + ' (' + u.file + ')'));
}

fs.writeFileSync('docs/database/MODEL_TO_COLLECTION_MAP.json', JSON.stringify(results, null, 2));
console.log('Saved docs/database/MODEL_TO_COLLECTION_MAP.json');
