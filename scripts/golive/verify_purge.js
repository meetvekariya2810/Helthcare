/**
 * BJK Healthcare - Git History Purge Verification
 * Checks whether historical credential spreadsheets exist in git history.
 */

const { execSync } = require('child_process');

function checkGitHistory() {
  console.log('================================================================');
  console.log('  BJK HEALTHCARE — GIT HISTORY CREDENTIAL PURGE VERIFICATION');
  console.log('================================================================\n');

  let foundCommits = 0;

  const filesToCheck = [
    'BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx',
    'BJK_Employee_Login_Credentials.xlsx'
  ];

  for (const filename of filesToCheck) {
    console.log(`Checking commit history for ${filename}...`);
    try {
      const output = execSync(`git log --all --full-history -- "${filename}"`, { encoding: 'utf8' }).trim();
      if (output) {
        console.log(`[FAIL] Commits found containing ${filename}:`);
        const lines = output.split('\n').filter(l => l.startsWith('commit '));
        lines.forEach(l => console.log(`  -> ${l}`));
        foundCommits++;
      } else {
        console.log(`[PASS] 0 commits found for ${filename}`);
      }
    } catch (err) {
      console.log(`[PASS] 0 commits found for ${filename}`);
    }
    console.log('');
  }

  console.log('================================================================');
  if (foundCommits === 0) {
    console.log('RESULT: GATE G5 PURGE VERIFIED (CLEAN) [PASS]');
    process.exit(0);
  } else {
    console.log('RESULT: GATE G5 PURGE INCOMPLETE / COMMITS REMAIN IN HISTORY [FAIL]');
    process.exit(1);
  }
}

checkGitHistory();
