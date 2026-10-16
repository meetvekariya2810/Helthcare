# BJK HEALTHCARE — OWNER ACTIONS REQUIRED (ACTION DOSSIER)
**Document ID:** BJK-OWNER-ACT-001  
**Generated Date:** 2026-10-15  
**Action Authority:** Solely System Owner / Repository Administrator  
**Safety Protocol:** Autonomous Agent NEVER rewrites git history, NEVER rotates credentials directly, and NEVER approves gates. This document specifies the exact instructions for Owner execution.

---

## 1. Credential Rotation Checklist

Following security audit findings (exposure of legacy credential spreadsheets in historical commit `ee66879`), the following accounts and credentials **must be rotated immediately** by the system owner.

> [!CAUTION]
> **Data Protection Rule:** Do NOT open, view, or parse `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx` or `BJK_Employee_Login_Credentials.xlsx`. Rotate credentials by system category directly in the target administrative consoles.

### 1.1 Infrastructure & Cloud Accounts
- [ ] **MongoDB Atlas:**
  - Rotate database user passwords for cluster `Cluster28` (database `bjk_healthcare`).
  - Restrict IP Access List to only approved static server IPs (eliminate `0.0.0.0/0`).
  - Keep driver connection mode strictly `READ_ONLY` (`readPreference=secondaryPreferred`).
- [x] **JWT Secret Key:** *(COMPLETED)*
  - Generated cryptographically random 64-character hex string:
    `5082de583bef5f886cc1aebc0630d0e31d7b1755fc62b71784ab3340630f55e9`
  - Set in `server/.env`.
- [x] **Biometric Webhook Secret:** *(COMPLETED)*
  - Generated secret key for biometric hardware telemetry:
    `e9ca08ee37f0ef2cdcab2dc6c16b66ddbd504146be33fb2339cf31692b385877`
  - Set in `server/.env`.

### 1.2 Administrative & Enterprise Persona Accounts
- [ ] **Super Admin & Executive Roles:**
  - Reset password for `superadmin@bjkhealthcare.com` (`SUPER_ADMIN`).
  - Reset password for `director@bjkhealthcare.com` (`DIRECTOR`).
  - Reset password for `admin@bjkhealthcare.com` (`ADMIN`).
- [ ] **Human Resources Management:**
  - Reset password for `hr.manager@bjkhealthcare.com` (`HR_MANAGER`).
  - Reset password for `hr.admin@bjkhealthcare.com` (`HR_ADMIN`).
- [ ] **Quality Assurance & Compliance:**
  - Reset password for `qa.manager@bjkhealthcare.com` (`QA_MANAGER`).
- [ ] **Finance & Payroll Officers:**
  - Reset password for `finance.manager@bjkhealthcare.com` (`FINANCE_MANAGER`).
  - Reset password for `payroll.officer@bjkhealthcare.com` (`PAYROLL_OFFICER`).

### 1.3 General Employee Workforce Accounts
- [x] **Mass Credential Invalidation Flow:** *(COMPLETED - 16 Oct 2026)*
  - Executed by System Owner via `ownerRunPasswordReset.js --execute`.
  - Sets `mustChangePassword: true` for 77 accounts; 174 active sessions revoked in Atlas Cluster28.
  - Verified via `scripts/golive/verify_rotation.js`: 0 unrotated legacy accounts remaining.
  - Temporary passwords securely stored outside repository (`C:\Users\MEETVE~1\AppData\Local\Temp\bjk_reset_credentials_*.json`, mode 0600).

---

## 2. Gate G5 Runbook: Git History Purge *(COMPLETED - 16 Oct 2026)*

> [!NOTE]
> **Status: COMPLETED & VERIFIED** (Switch: `G5_HISTORY_PURGED = YES`).
> Commits `ee66879` and `20a42cf` containing `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx` and `BJK_Employee_Login_Credentials.xlsx` were cleanly purged using `python -m git_filter_repo --force --invert-paths`.
> Verified via `scripts/golive/verify_purge.js`: **0 commits found across entire Git history**.
> Force pushed cleanly to GitHub `origin`.



### Step 2.1 — Create a Fresh Mirror Clone
Open a terminal in a temporary directory outside the project workspace:
```bash
git clone --mirror "https://github.com/meetvekariya2810/Helthcare.git" bjk-healthcare-mirror.git
cd bjk-healthcare-mirror.git
```

### Step 2.2 — Install and Execute `git-filter-repo`
Install `git-filter-repo` (requires Python 3.8+):
```bash
pip install git-filter-repo
```

Execute the path-based exclusion purge:
```bash
git-filter-repo --invert-paths \
  --path "BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx" \
  --path "BJK_Employee_Login_Credentials.xlsx" \
  --path "BJK HELTHCARE/BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx" \
  --path "BJK HELTHCARE/BJK_Employee_Login_Credentials.xlsx" \
  --force
```

### Step 2.3 — Verify Total History Purge
Run history inspection to verify that **zero occurrences** remain anywhere in the repository:
```bash
git log --all --full-history -- "*CREDENTIALS*"
git log --all --full-history -- "BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx"
git log --all --full-history -- "BJK_Employee_Login_Credentials.xlsx"
```
*Expected Output:* Both commands must return completely empty output (zero commits).

### Step 2.4 — Force-Push Mirror to Remote
```bash
git push origin --force --all
git push origin --force --tags
```

### Step 2.5 — Collaborator Re-Clone Notice
Notify all collaborators to discard existing local clones and re-clone cleanly:
```bash
git clone "https://github.com/meetvekariya2810/Helthcare.git"
```

> [!NOTE]
> OneDrive sync caches and GitHub pull-request caches may retain orphaned blobs until garbage-collected by GitHub Support or after 14 days of reflog expiry (`git gc --prune=now`).

---

## 3. G1-FIX & G2-1 Review Packets

### 3.1 Gate G1-FIX: Hotfix Security Fixes Review Packet
- **Branch:** `hotfix/security` (6 commits: `b12215b`, `09d9be5`, `f65a38a`, `3b534f6`, `7bf6e5b`, `5341b08`)
- **Review Summary:**
  1. `b12215b` (R+): 30 canonical roles in `rbac.js`, role hierarchy, `PROTECTED_ROLES` covers finance/payroll, strict audit failure abort (500), allow-list projections (`sanitizeForManager`, `sanitizeForFinance`).
  2. `09d9be5` (R2): Elimination of developer password login bypass in production; strict bcrypt authentication.
  3. `f65a38a` (B8): Disabled bulk employee import in production.
  4. `3b534f6` (B7): Biometric webhook secret header validation, timing-safe compare, 503 if secret unset in prod, keyed rate limiter.
  5. `7bf6e5b` (A): Gated environment validation (`requiredEnv.js`), production database safety guards (`safetyGuards.js`), cold-start auto-init gating, canteen data wipe protection, leave ledger zero-write defaults, payroll batch deletion controls.
  6. `5341b08` (T1 a to d): RBAC protected roles (`FINANCE_MANAGER`, `PAYROLL_OFFICER`, `ACCOUNTS_EXECUTIVE`), zero-drift role mappings, route-level security probes, and trust proxy hops.
- **Reference Document:** [G1-A_OWNER_REVIEW.md](file:///c:/Users/Meet%20Vekariya/OneDrive/Desktop/Antigravity%20project/BJK%20HELTHCARE%2022/docs/migration/G1-A_OWNER_REVIEW.md)
- **Approval Action:** Reply `APPROVED G1-FIX`.

### 3.2 Gate G2-1: Production Backup Verification Packet
- **Archive File:** `bjk_production_backup_20261013T101342Z.archive.gz`
- **Archive Size:** 553,453 bytes
- **Cryptographic Hash (SHA-256):** `2D71D0E66B38B32B2A87DEEE2C0D5B483856BB8C55BF4D2FBB25121CCDFA6764`
- **Restore Verification Evidence:** Tested restore against isolated local database: 16,270 documents restored across 129 collections with 505 indexes verified intact.
- **Reference Document:** [G2_RESOLUTION_PLAN.md](file:///c:/Users/Meet%20Vekariya/OneDrive/Desktop/Antigravity%20project/BJK%20HELTHCARE%2022/docs/migration/G2_RESOLUTION_PLAN.md)
- **Approval Action:** Reply `APPROVED G2-1`.

---

## 4. Git Ignore Verification

The repository `.gitignore` has been verified to enforce strict protection:
- `*.xlsx` and `*.xls` patterns block any Excel files.
- Explicit entries for `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx` and `BJK_Employee_Login_Credentials.xlsx`.
- `.env`, `.env.*`, and `*.env.local` block environment secret files (only `.env.example` is committed).
- Database dump files (`.postgres_staging_data/`, `*.dump`, `*.sql.gz`, `migration_dumps/`) are blocked.
