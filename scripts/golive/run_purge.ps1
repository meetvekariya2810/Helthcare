# BJK HEALTHCARE — AUTOMATED G5 GIT HISTORY PURGE RUNBOOK
# Execute this in your dedicated repository clone or backup directory.

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  BJK HEALTHCARE — GATE G5 GIT HISTORY PURGE" -ForegroundColor Cyan
Write-Host "================================================================"

Write-Host "`n[1/3] Verifying Python and git-filter-repo module..." -ForegroundColor Yellow
python -m git_filter_repo --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] git-filter-repo not found. Installing via pip..." -ForegroundColor Red
    pip install git-filter-repo
}

Write-Host "`n[2/3] Executing git-filter-repo to purge credential sheets..." -ForegroundColor Yellow
python -m git_filter_repo --force --invert-paths --path "BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx" --path "BJK_Employee_Login_Credentials.xlsx"

Write-Host "`n[3/3] Re-verifying Git history..." -ForegroundColor Yellow
node scripts/golive/verify_purge.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Git history is completely clean of credential sheets!" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] Purge verification reported remaining references." -ForegroundColor Red
}
