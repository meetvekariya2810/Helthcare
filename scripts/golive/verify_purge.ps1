# BJK Healthcare - Git History Purge Verification (PowerShell)
Write-Host "================================================================"
Write-Host "  BJK HEALTHCARE — GIT HISTORY CREDENTIAL PURGE VERIFICATION"
Write-Host "================================================================"

$foundCommits = 0

Write-Host "Checking commit history for BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx..."
$checkAll = git log --all --full-history -- "BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx"
if ($checkAll) {
  Write-Host "[FAIL] Commits found containing BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx:"
  Write-Host $checkAll
  $foundCommits++
} else {
  Write-Host "[PASS] 0 commits found for BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx"
}

Write-Host ""
Write-Host "Checking commit history for BJK_Employee_Login_Credentials.xlsx..."
$checkEmp = git log --all --full-history -- "BJK_Employee_Login_Credentials.xlsx"
if ($checkEmp) {
  Write-Host "[FAIL] Commits found containing BJK_Employee_Login_Credentials.xlsx:"
  Write-Host $checkEmp
  $foundCommits++
} else {
  Write-Host "[PASS] 0 commits found for BJK_Employee_Login_Credentials.xlsx"
}

Write-Host ""
Write-Host "================================================================"
if ($foundCommits -eq 0) {
  Write-Host "RESULT: GATE G5 PURGE VERIFIED (CLEAN)"
  exit 0
} else {
  Write-Host "RESULT: GATE G5 PURGE INCOMPLETE (COMMITS REMAIN)"
  exit 1
}
