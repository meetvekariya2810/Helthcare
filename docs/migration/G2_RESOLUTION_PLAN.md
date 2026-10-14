# BJK HEALTHCARE — GATE G2 OWNER OPERATIONAL WORKSHEET & RESOLUTION PLAN

**Document:** `docs/migration/G2_RESOLUTION_PLAN.md`  
**Date:** 2026-10-13  
**Track:** Track 1 — Infrastructure Verification & Handover  
**Repository Baseline:** `hotfix/security` (HEAD `7bf6e5b` + pending working tree fixes for G1-FIX)  
**Status:** **ACTIVE — PRE-DEPLOYMENT GATES STRICTLY ON HOLD FOR OWNER EXECUTION**

---

## 1. Unified Master Gate Pipeline Overview

Execution proceeds strictly in sequence. No code is pushed to remote, no production database is accessed, and no migration branch is created before all gates are cleared.

```
+---------------------------------------------------------------------------------------------------+
|                                 GATE G2 EXECUTION SEQUENCE                                        |
+-----+---------------------------+--------------------------------+--------------------------------+
| Gate| Objective                 | Responsible Party              | Status                         |
+-----+---------------------------+--------------------------------+--------------------------------+
| G1  | G1-FIX: Review Security   | System Owner                   | PENDING REVIEW                 |
|     | Fixes (T1 Working Tree)   |                                |                                |
| G2-1| Production Backup Verify  | Atlas Administrator / Owner    | BLOCKED (Awaiting Snapshot)    |
| G2-2| Isolated Staging DB       | Atlas Admin / Owner            | BLOCKED (Awaiting G2-1)        |
| G2-3| Secrets Configuration     | Hosting Admin / Owner          | BLOCKED (Awaiting G2-2)        |
| G2-4| Incident Check & Topology | System Owner / DBA             | BLOCKED (Awaiting G2-3)        |
| G2-5| Admin Password Changes    | System Owner                   | BLOCKED (Awaiting G2-4)        |
| G3  | Deploy Releases 1, 2, 3   | System Owner                   | BLOCKED (Awaiting G2-1..5)     |
| G4  | System Password Rotation  | System Owner                   | BLOCKED (Awaiting G3 Deploy)   |
| G5  | Git History Purge         | System Owner                   | BLOCKED (Awaiting G4 Rotation) |
| G6  | Next.js Migration Branch  | Principal Architect / Owner    | BLOCKED (Awaiting G5 Purge)    |
+-----+---------------------------+--------------------------------+--------------------------------+
```

---

## 2. Gate G2-1: Production Backup Verification

### Security Rule:
- Store backup archives strictly **OUTSIDE** the Git repository and **OUTSIDE** OneDrive (e.g., `C:\bjk_backups\`).

### Option A — MongoDB Atlas Cloud Backup (Recommended)
1. Log in to MongoDB Atlas console.
2. Select Cluster -> **Backup** -> **Take On-Demand Snapshot**.
3. Confirm snapshot status: `COMPLETED`.
4. Record:
   - **Snapshot ID**
   - **Completion Timestamp (UTC)**

### Option B — PowerShell `mongodump` Archive
Execute in an administrative Windows PowerShell session:

```powershell
# 1. Create a secure local directory outside OneDrive
New-Item -ItemType Directory -Path "C:\bjk_backups" -Force

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "C:\bjk_backups\bjk_healthcare_backup_$timestamp.archive.gz"

# 2. Set URI in session memory only (never write to disk or script)
$env:PROD_MONGODB_URI = "mongodb+srv://<admin_user>:<password>@cluster0.bjk.mongodb.net/bjk_healthcare?retryWrites=true&w=majority"

# 3. Execute mongodump
mongodump --uri="$env:PROD_MONGODB_URI" --archive="$backupFile" --gzip

if ($LASTEXITCODE -ne 0) {
    throw "Backup failed with exit code $LASTEXITCODE. Do not mark G2-1 complete."
}

# 4. Clear memory variable
Remove-Item Env:\PROD_MONGODB_URI

# 5. Compute SHA-256 hash and file size
Get-Item $backupFile | Select-Object Name, Length, LastWriteTimeUtc
Get-FileHash $backupFile -Algorithm SHA256
```

---

## 3. Gate G2-2: Staging Database Provisioning & Isolation

### Objectives:
- Provision dedicated database `bjk_healthcare_staging` on Atlas.
- Configure dedicated database user restricted **ONLY** to `bjk_healthcare_staging` with `readWrite` role.
- Configure staging environment variables by **NAME** only.
- Prove that safety guards refuse connections to production database name `bjk_healthcare`.

### Host Environment Variables for Staging Host:
```powershell
NODE_ENV=production
MONGODB_URI="mongodb+srv://<staging_user>:<password>@cluster0.bjk.mongodb.net/bjk_healthcare_staging?retryWrites=true&w=majority"
DATABASE_NAME=bjk_healthcare_staging
JWT_SECRET="<cryptographically_random_secret_at_least_32_characters>"
ENABLE_AUTO_INIT=false
```
*(Note: `SEED_ALLOWED_DB` must remain **UNSET** in production mode `NODE_ENV=production`)*.

### Negative Safety Guard Verification:
Run a separate non-production process to prove `safetyGuards.js` rejects the production database name:
```powershell
$env:NODE_ENV="development"
$env:MONGODB_URI="mongodb://127.0.0.1:27017/bjk_healthcare"
$env:DATABASE_NAME="bjk_healthcare"
$env:SEED_ALLOWED_DB="bjk_healthcare_staging"
node -e "const { assertNonProduction } = require('./BJK HELTHCARE/server/config/safetyGuards'); assertNonProduction();"
# Expected output: Fatal Error: Target database matches production name 'bjk_healthcare'
```

---

## 4. Gate G2-3: Secrets Configuration in Host Vaults

Before any code is pushed:
1. **JWT_SECRET**: Generate a 48-byte cryptographically random string (e.g. `[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`). Configure in host vaults (Vercel / Render / AWS). Minimum length: 32 characters.
2. **BIOMETRIC_WEBHOOK_SECRET**: Configure in server vault (min 16 characters) and program identical secret into physical biometric turnstile / punch hardware.
3. Verify using the read-only preflight check script:
```powershell
node "BJK HELTHCARE/server/scripts/preflightCheck.js"
```

---

## 5. Gate G2-4: Incident Check & Topology Verification

Connect to MongoDB Atlas using `mongosh` against the production cluster and run these read-only diagnostic queries. Return **COUNTS AND METADATA ONLY** (no employee PII or passwords):

```javascript
// Query 1: Check for any anonymous audit entries recorded under the placeholder actor
db.auditlogs.countDocuments({ "user.name": "Dr. Vikram Mehta" });

// Query 2: Check for audit entries with admin email but missing user.id
db.auditlogs.countDocuments({ "user.email": "admin@bjkhealthcare.com", "user.id": null });

// Query 3: List SUPER_ADMIN and DIRECTOR accounts to verify real identity
db.users.find({ role: { $in: ["SUPER_ADMIN", "DIRECTOR"] } }, { name: 1, email: 1, role: 1, createdAt: 1, _id: 0 }).toArray();

// Query 4: List distinct roles currently stored in the database
db.users.distinct("role");

// Query 5: Count users who have never changed their initial password
db.users.countDocuments({ $or: [{ passwordChangedAt: null }, { passwordChangedAt: { $exists: false } }] });

// Query 6: Audit log count for password/role changes in the last 90 days
db.auditlogs.countDocuments({
  action: { $in: ["PASSWORD_RESET", "USER_ROLE_UPDATED", "PASSWORD_CHANGED"] },
  createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

### Topology & Authentication Questions for Owner:
1. **Hosting Layout**: Where does production Express run? (Vercel Serverless Function `/api` only, Render, Railway, or standalone VM?)
2. **Employee Login Mechanism**: Do employees currently log in using **Password** (Email/ID + Password) or **OTP**? (Code inspection confirms `EmployeeLogin.jsx` uses Password; mobile OTP endpoints have no live SMS gateway configured).

---

## 6. Gate G2-5: Administrative & Executive Password Rotation

The system owner must directly change all initial or default passwords for high-privilege accounts:
- `SUPER_ADMIN` accounts
- `DIRECTOR` accounts
- `HR_ADMIN` accounts
- `SYSTEM_ADMINISTRATOR` accounts

Set unique, strong passwords (min 16 chars) directly via the application or secure admin workflow.

---

## 7. Hotfix Release Packaging & Staging Smoke Tests

Once Gates G1-FIX and G2-1 through G2-5 are satisfied, the owner deploys releases in strict sequence:

### Release 1 (Consolidated R+, R2, B8 + T1a, T1b)
- **Commits**: R+ (`b12215b`) + R2 (`09d9be5`) + B8 (`f65a38a`) + T1a (Protected Roles) + T1b (Role Drift Fixes).
- **Prerequisites**: G2-1 (Backup), G2-4 (Incident Check), G2-5 (Admin Passwords), G2-2 (Staging Smoke Test).
- **Staging Smoke Test**:
  1. POST `/api/auth/login` with dev password (`<redacted>`) -> Must return **401 Unauthorized**.
  2. POST `/api/auth/login` with valid bcrypt credentials -> Must return **200 OK** and JWT.
  3. POST `/api/employees/:id/reset-password` by `HR_MANAGER` targeting `FINANCE_MANAGER` -> Must return **403 Forbidden**.
  4. POST `/api/employees/:id/reset-password` by `HR_MANAGER` targeting normal `EMPLOYEE` -> Must return **200 OK** with 20-character secure temporary password.

### Release 2 (Biometric Webhook B7 + T1c, T1f)
- **Commits**: B7 (`3b534f6`) + T1c (Route tests) + T1f (`TRUST_PROXY_HOPS`).
- **Prerequisites**: Device configured with secret header, `BIOMETRIC_WEBHOOK_SECRET` set, reverse proxy hops confirmed.
- **Staging Smoke Test**:
  1. POST `/api/hrms/attendance/biometric` without header -> Must return **401 Unauthorized**.
  2. POST `/api/hrms/attendance/biometric` with valid `x-biometric-secret` -> Must return **200 OK**.
  3. Rapidly send 650 requests -> Requests above 600/min return **429 Too Many Requests**.

### Release 3 (Group A Safety Guards & Operations + T1d, T1e, T1g)
- **Commits**: A (`7bf6e5b`) + T1d (Behaviour tests) + T1e + T1g (Preflight check).
- **Prerequisites**: `JWT_SECRET` set on all hosts (32+ chars), leave-ledger count checked.
- **Staging Smoke Test**:
  1. DELETE `/api/hrms/payroll/batch/2026-03` with missing reason -> Returns **400 Bad Request**.
  2. POST `/api/canteen/reset-all-data` without `ENABLE_CANTEEN_RESET=true` -> Returns **403 Forbidden**.
  3. GET `/api/health/database` -> Returns status **200** with host and topology completely masked.

---

## 8. Non-Sensitive Gate Evidence Submission Template

When you are ready to submit, copy and paste this block into chat with non-sensitive values filled in:

```markdown
### GATE G1-FIX:
APPROVED G1-FIX

### GATE G2-1 (Backup):
- Method: [MongoDB Atlas Snapshot / mongodump archive]
- Snapshot ID / Filename: [e.g., 670ad4... or bjk_backup_20261013.archive.gz]
- Completion Timestamp: [UTC Timestamp]
- Size: [e.g., 185 MB]
- SHA-256 Checksum: [Hex hash for archive, or N/A for Atlas Snapshot]

### GATE G2-2 (Staging):
- Database Name: bjk_healthcare_staging
- User Isolation: [Confirmed — user restricted only to bjk_healthcare_staging]
- Negative Guard Test: [Confirmed — safety guard aborts on production DB target]

### GATE G2-3 (Secrets):
- JWT_SECRET: Configured on all hosts (Length >= 32 characters)
- BIOMETRIC_WEBHOOK_SECRET: Configured (Length: [X] characters)

### GATE G2-4 (Incident Queries & Topology):
- Dr. Vikram Mehta Audit Count: [0 or Count]
- Null ID Admin Audit Count: [0 or Count]
- SUPER_ADMIN / DIRECTOR Accounts: [List of names/emails of verified personnel]
- db.users.distinct('role'): [Array of distinct role strings]
- Users without permanent password: [Count]
- Production Hosting Layout: [Vercel Serverless / Render / Railway / Other]
- Employee Login Mechanism: [Password / OTP]

### GATE G2-5 (Admin Passwords):
- Status: [Confirmed changed by system owner]
```
