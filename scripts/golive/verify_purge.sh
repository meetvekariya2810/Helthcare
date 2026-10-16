#!/usr/bin/env bash
# BJK Healthcare - Git History Purge Verification
echo "================================================================"
echo "  BJK HEALTHCARE — GIT HISTORY CREDENTIAL PURGE VERIFICATION"
echo "================================================================"

FOUND_COMMITS=0

echo "Checking commit history for BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx..."
CHECK_ALL=$(git log --all --full-history -- "BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx" 2>/dev/null)
if [ -n "$CHECK_ALL" ]; then
  echo "[FAIL] Commits found containing BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx:"
  echo "$CHECK_ALL"
  FOUND_COMMITS=1
else
  echo "[PASS] 0 commits found for BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx"
fi

echo "Checking commit history for BJK_Employee_Login_Credentials.xlsx..."
CHECK_EMP=$(git log --all --full-history -- "BJK_Employee_Login_Credentials.xlsx" 2>/dev/null)
if [ -n "$CHECK_EMP" ]; then
  echo "[FAIL] Commits found containing BJK_Employee_Login_Credentials.xlsx:"
  echo "$CHECK_EMP"
  FOUND_COMMITS=1
else
  echo "[PASS] 0 commits found for BJK_Employee_Login_Credentials.xlsx"
fi

echo "Checking commit history for general wildcard *CREDENTIALS*..."
CHECK_GEN=$(git log --all --full-history -- "*CREDENTIALS*.xlsx" 2>/dev/null)
if [ -n "$CHECK_GEN" ]; then
  echo "[FAIL] Commits found matching *CREDENTIALS*.xlsx:"
  echo "$CHECK_GEN"
  FOUND_COMMITS=1
else
  echo "[PASS] 0 commits found for *CREDENTIALS*.xlsx"
fi

echo "================================================================"
if [ $FOUND_COMMITS -eq 0 ]; then
  echo "RESULT: GATE G5 PURGE VERIFIED (CLEAN)"
  exit 0
else
  echo "RESULT: GATE G5 PURGE INCOMPLETE (COMMITS REMAIN)"
  exit 1
fi
