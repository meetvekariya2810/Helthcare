/**
 * BJK HEALTHCARE — REST CONTRACT PARITY VERIFIER
 * Validates converted endpoints against captured contract fixtures
 */

const fs = require('fs');
const path = require('path');
const { contracts } = require('./capture_contracts');

function verifyContracts() {
  console.log('====================================================');
  console.log('BJK HEALTHCARE — REST CONTRACT PARITY VERIFICATION');
  console.log('====================================================');

  const fixturesDir = path.join(__dirname, 'fixtures');
  let passed = 0;
  let total = 0;

  for (const c of contracts) {
    const fixtureFile = path.join(fixturesDir, `${c.domain}_contract.json`);
    total++;
    if (!fs.existsSync(fixtureFile)) {
      console.error(`  [FAIL] Missing fixture file for domain [${c.domain}]`);
      continue;
    }
    const fixtureData = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
    if (fixtureData.endpoint === c.endpoint && fixtureData.method === c.method) {
      console.log(`  [PASS] Verified REST contract parity for domain [${c.domain}] (${c.method} ${c.endpoint})`);
      passed++;
    } else {
      console.error(`  [FAIL] Contract mismatch for domain [${c.domain}]`);
    }
  }

  console.log('====================================================');
  console.log(`CONTRACT VERIFICATION SUMMARY: ${passed}/${total} PASSING`);
  console.log('====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  verifyContracts();
}

module.exports = { verifyContracts };
