# BJK Healthcare Digital Brain: Migration Test Evidence & Verification Log

**Rule 8 Compliance:** Never claim anything is built, tested, deployed, backed up or verified unless you ran it and can show output. A planned or unexecuted test is NOT a pass. Mark unknowns as TO VERIFY.

**Last Updated:** 2026-10-13  
**Active Track:** Track 1 — Hotfix Pre-Deployment & Verification  
**Branch:** `hotfix/security` (HEAD at `7bf6e5b` + pending working tree fixes for G1-FIX)  
**Network Execution:** Local only (`node:test` + `mongodb-memory-server` + in-process Express HTTP). Zero remote calls.

---

## 1. Hotfix Automated Security Test Evidence (106/106 Passing Tests)

### Summary of Executed Test Suites:
| Test Suite File | Subtests | Pass | Fail | Runtime | Verification Scope |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `tests/unit_anonymize_staging.test.js` | 4 | 4 | 0 | ~5.8s | Password overwrite, UserSession wipe, face template wipe, audit log scrub, per-record unique indexes |
| `tests/unit_b7_security.test.js` | 4 | 4 | 0 | ~20ms | Biometric webhook: missing/wrong secret header returns 401, unset in prod returns 503, valid secret returns 200, timing-safe compare |
| `tests/unit_bank_payroll_security.test.js` | 15 | 15 | 0 | ~50ms | Bank details masking & strict audit, single payroll record deletion reason/status lock parity, segregation of duties |
| `tests/unit_controller_security.test.js` | 10 | 10 | 0 | ~700ms | Controller credential management, protected role denial, self-reset block, mandatory audit failure abort (500), `sanitizeForManager`, `sanitizeForFinance` |
| `tests/unit_group_a_behaviour.test.js` | 13 | 13 | 0 | ~8.4s | Group A behaviour: payroll delete (ALL, bad period, approved batch, empty reason rejected; draft with reason accepted), canteen reset (non-SUPER_ADMIN, missing token, prod flag), demo OTP & reset code absent in prod, database health topology closure, dashboard auth 401, AI query auth 401, leave ledger zero-write default |
| `tests/unit_r2_security.test.js` | 2 | 2 | 0 | ~11.5s | Production developer password rejection, strict bcrypt compare, HTTP login endpoint reject (redacted credential name) |
| `tests/unit_role_drift.test.js` | 3 | 3 | 0 | ~1.3s | Canonical roles mapping, alias resolution, scan of all server routes/controllers/client App.jsx guards with 0 undefined ROLES references |
| `tests/unit_role_hierarchy.test.js` | 9 | 9 | 0 | ~150ms | RBAC 30 roles, rank direction, protected roles (including finance & payroll roles), fail-closed unknown roles, `canManageCredentials`, `canAssignRole`, secure password generator |
| `tests/unit_route_level_security.test.js` | 7 | 7 | 0 | ~8.4s | Route-level tests: 3 biometric webhook routes (missing/wrong secret 401, valid 200, unset in prod 503), admin & employee login dev-password reject (401), dummy OTP 123456 reject (400) |
| `tests/unit_rplus_real_db.test.js` | 6 | 6 | 0 | ~7.7s | Real Mongoose `User`, `Employee`, `UserSession` schemas: identical fields, login route verification, session revocation schema fields, `protect` 401 on revoked session, `protect` 403 on stale JWT role, DB unchanged on audit failure, 409 on missing user, nested schema projections |
| `tests/unit_safety_guards.test.js` | 27 | 27 | 0 | ~3.3s | `requiredEnv` child process validation, `safetyGuards` production database block, URI parser edge cases |
| `tests/unit_trust_proxy.test.js` | 6 | 6 | 0 | ~650ms | Configurable `TRUST_PROXY_HOPS`: prod default (1), dev default (false), numeric/boolean/subnet options, X-Forwarded-For resolution |
| **Total Automated Tests** | **106** | **106** | **0** | **~16.1s** | **100% Pass Rate across all 12 automated test suites** |

---

## 2. Raw Test Runner Output

### Command Executed:
```bash
node --test tests/*.test.js
```

### Raw Terminal Output:
```text
▶ Staging Anonymization Script: Comprehensive Privacy & Index Integrity Test
  ✔ Guard: Refuses to run if NODE_ENV=production (3743.5999ms)
  ✔ Guard: Refuses to run if target DB is bjk_healthcare (prod name) (1.5596ms)
[BJK Digital Brain] Initializing Comprehensive Staging Data Anonymization...
[BJK Digital Brain] Connected to target database: bjk_healthcare_staging
[BJK Digital Brain] Execution Mode: LIVE EXECUTION

--- STEP A: Clearing Sensitive Sessions, Raw Credentials & Biometrics ---
[UserSession] Cleared 1 active user sessions.
[Credential] Cleared 0 raw spreadsheet credential documents.
[EmployeeFaceAttendance] Cleared 1 facial biometric attendance records.
[EmployeeLoginHistory] Cleared 0 employee login history records.
[LoginActivity] Cleared 0 admin login activity records.

--- STEP B: Masking Users & Overwriting All Password Hashes ---
[User] Processing 2 user accounts...

--- STEP C: Masking Employee PII & Identity Documents ---
[Employee] Processing 1 employee records...

--- STEP D: Masking Bank Details ---
[EmployeeBankDetails] Processing 1 bank detail records...

--- STEP E: Masking Onboarding Applications ---
[OnboardingApplication] Processing 0 onboarding applications...

--- STEP F: Scrubbing Audit Logs, Snapshots & Knowledge Chunks ---
[AuditLog] Scrubbed actor and target PII across 1 records.
[AttendanceAuditLog] Scrubbed 0 attendance audit entries.
[AttendanceImportSnapshot] Scrubbed 0 import snapshots.
[KnowledgeChunk] Sanitized content across 0 knowledge chunks.

======================================================
       STAGING ANONYMIZATION COMPREHENSIVE REPORT      
======================================================
Target Database:  bjk_healthcare_staging
Execution Mode:   LIVE EXECUTION (Committed)

1. COLLECTIONS WIPED:
   - UserSession: 1 records cleared
   - Credential (HRMS): 0 records cleared
   - EmployeeFaceAttendance: 1 records cleared
   - EmployeeLoginHistory: 0 records cleared
   - LoginActivity: 0 records cleared

2. COLLECTIONS MASKED:
   - User: 2 records masked (unique indexes intact)
   - Employee: 1 records masked (unique indexes intact)
   - EmployeeBankDetails: 1 records masked (unique indexes intact)
   - OnboardingApplication: 0 records masked (unique indexes intact)

3. COLLECTIONS SCRUBBED:
   - AuditLog: 1 records telemetry/PII scrubbed
   - AttendanceAuditLog: 0 records telemetry/PII scrubbed
   - AttendanceImportSnapshot: 0 records telemetry/PII scrubbed
   - KnowledgeChunk: 0 records telemetry/PII scrubbed

4. COLLECTIONS SKIPPED (Operational Data Preserved): 28 collections
======================================================

  ✔ Comprehensive Execution: Overwrites password hashes, wipes sessions/faces, scrubs audit, preserves unique indexes (1396.4487ms)
✔ Staging Anonymization Script: Comprehensive Privacy & Index Integrity Test (5793.3271ms)
[SECURITY ALERT] BIOMETRIC_WEBHOOK_SECRET is not configured in production environment. Webhook disabled.
✔ BiometricWebhook: Unset secret in production returns 503 (4.3063ms)
✔ BiometricWebhook: Missing secret header returns 401 Unauthorized (0.6751ms)
✔ BiometricWebhook: Wrong secret header returns 401 Unauthorized (0.5602ms)
✔ BiometricWebhook: Valid secret header authorizes request and processes punches (18.692ms)
[BankDetails Strict Audit Failure]: Disk I/O failure: unable to append audit record
✔ Bank RBAC: Canonical permissions confirm HR_EXECUTIVE is view-only (3.4611ms)
✔ Bank RBAC: PAYROLL_ADMIN and FINANCE_MANAGER retain legitimate view permissions (0.4392ms)
✔ Bank RBAC: HR_ADMIN and HR_MANAGER retain full manage and verify capabilities (0.4285ms)
✔ Bank Controller: HR_EXECUTIVE cannot update bank details (403 Forbidden) (19.6445ms)
✔ Bank Controller: HR_EXECUTIVE cannot verify bank details (403 Forbidden) (2.283ms)
✔ Bank Controller: HR_EXECUTIVE cannot reject bank details (403 Forbidden) (1.7401ms)
✔ Bank Controller: HR_EXECUTIVE cannot request correction on bank details (403 Forbidden) (1.2809ms)
✔ Bank Strict Audit: Audit failure halts update and prevents mutation persistence (4.4202ms)
✔ Single Payroll Delete: Rejects invalid ID format (400 Bad Request) (7.1909ms)
✔ Single Payroll Delete: Rejects missing or empty reason (400 Bad Request) (1.1383ms)
✔ Single Payroll Delete: Returns 404 when record does not exist (0.6722ms)
✔ Single Payroll Delete: Strictly rejects deletion of APPROVED record (400) (2.6941ms)
✔ Single Payroll Delete: Strictly rejects deletion of PROCESSED, PAID, and FINALIZED records (400) (1.0776ms)
✔ Single Payroll Delete: Safely deletes eligible DRAFT record with atomic query and audit log (8.0103ms)
✔ Single Payroll Delete: Prevents concurrent race condition if status changed concurrently (0.8497ms)
✔ Controller (resetEmployeePassword): HR_MANAGER can reset EMPLOYEE credentials (263.2318ms)
✔ Controller (resetEmployeePassword): HR_MANAGER CANNOT reset PROTECTED_ROLES or HR_ADMIN (3.6461ms)
[Audit Write Failure in employeeController.resetEmployeePassword]: Database write error: disk full / connection failure
✔ Controller (resetEmployeePassword): SUPER_ADMIN can reset other accounts (234.2964ms)
✔ Controller (resetEmployeePassword): Unknown caller or target role is strictly denied (1.5053ms)
✔ Controller (resetEmployeePassword): Self-reset via HR flow is strictly denied (0.7809ms)
✔ Controller (resetEmployeePassword): Mandatory audit failure strictly aborts reset with 500 (1.5072ms)
✔ Projections: sanitizeForManager strips all compensation, banking, identity, DOB, address, family, documents (0.8733ms)
✔ Projections: sanitizeForFinance retains salary structure but strips PII, banking, family, documents (0.6298ms)
✔ Controller (hrController.resetUserPassword): HR_MANAGER can reset EMPLOYEE and cannot reset PROTECTED_ROLES or HR_ADMIN (185.0862ms)
✔ Controller (updateEmployeeRole): Enforces role hierarchy and self-modification guards (3.391ms)
[Server Init] Auto-init is DISABLED in production environment (NODE_ENV=production).
✔ Group A Payroll Delete: Rejects period "ALL" (4.8721ms)
✔ Group A Payroll Delete: Rejects empty or missing reason (1.4762ms)
✔ Group A Payroll Delete: Rejects deletion if records are APPROVED, PROCESSED, or PAID (1.2136ms)
✔ Group A Payroll Delete: Accepts draft batch with valid reason (75.6963ms)
✔ Group A Canteen Reset: Rejects in production without ENABLE_CANTEEN_RESET=true flag (1.9203ms)
✔ Group A Canteen Reset: Rejects non-SUPER_ADMIN caller (1.6818ms)
✔ Group A Canteen Reset: Rejects missing confirmation token (3.4442ms)
✔ Group A OTP: Demo OTP is absent from sendOtp response in production (4.2297ms)
✔ Group A OTP: Demo reset code is absent from forgotPassword response in production (1.8296ms)
GET /api/health/database 200 8.382 ms - 127
✔ Group A Health: /api/health/database does not expose host, port, or URI topology (8263.6983ms)
GET /api/dashboard/summary 401 2.348 ms - 75
✔ Group A Dashboard: /api/dashboard/summary requires authentication (401 without token) (15.205ms)
POST /api/ai/query 401 33.414 ms - 75
✔ Group A AI Query: /api/ai/query requires authentication (401 without token) (52.3077ms)
✔ Group A Leave Ledger: Returns empty ledger without triggering seed sync or DB write when missing (1.8412ms)
✔ AuthController: In production, developer password cannot log in; strict bcrypt works (607.8636ms)
✔ AuthController.login: In production, HTTP login strictly rejects dev passwords (<redacted>) (10955.5573ms)
✔ Role Drift Verification: All canonical roles exist in ROLE_HIERARCHY (5.1884ms)
✔ Role Aliases Mapping: Standard legacy and frontend aliases map to canonical roles (0.6899ms)
✔ Role Drift Scan: No server or client file references undefined ROLES properties (1279.0554ms)
✔ RBAC Hierarchy: Every role defined in ROLES has an explicit entry in ROLE_HIERARCHY (8.8142ms)
✔ RBAC Hierarchy Direction: Lower numbers represent strictly higher privilege (0.8823ms)
✔ RBAC Hierarchy: PROTECTED_ROLES list is explicit and contains all required protected roles (0.6857ms)
✔ RBAC Hierarchy: Unknown or missing roles return Infinity and are not known (0.56ms)
✔ canManageCredentials: HR_MANAGER can reset EMPLOYEE but cannot reset PROTECTED_ROLES or HR_ADMIN (3.0578ms)
✔ canManageCredentials: SUPER_ADMIN can reset any recognized role (0.7007ms)
✔ canManageCredentials: Unknown caller or target role is strictly denied (0.5291ms)
✔ canAssignRole: Caller must strictly outrank both current and new role (0.8875ms)
✔ generateSecureRandomPassword: generates strong 20-char password with 1,000 unique samples (134.3873ms)
POST /api/hrms/attendance/biometric 401 33.429 ms - 95
POST /api/hrms/attendance/biometric 401 2.210 ms - 95
POST /api/hrms/attendance/biometric 200 2.144 ms - 92
✔ Biometric Route Level: POST /api/hrms/attendance/biometric (8288.0177ms)
POST /api/hrms/attendance/biometric-webhook 401 1.683 ms - 95
POST /api/hrms/attendance/biometric-webhook 401 1.521 ms - 95
POST /api/hrms/attendance/biometric-webhook 200 1.167 ms - 92
✔ Biometric Route Level: POST /api/hrms/attendance/biometric-webhook (39.2136ms)
POST /api/attendance/webhook 401 1.576 ms - 95
POST /api/attendance/webhook 401 1.354 ms - 95
POST /api/attendance/webhook 200 1.471 ms - 92
✔ Biometric Route Level: POST /api/attendance/webhook (23.8543ms)
[SECURITY ALERT] BIOMETRIC_WEBHOOK_SECRET is not configured in production environment. Webhook disabled.
POST /api/hrms/attendance/biometric 503 1.960 ms - 92
[SECURITY ALERT] BIOMETRIC_WEBHOOK_SECRET is not configured in production environment. Webhook disabled.
POST /api/hrms/attendance/biometric-webhook 503 1.748 ms - 92
[SECURITY ALERT] BIOMETRIC_WEBHOOK_SECRET is not configured in production environment. Webhook disabled.
POST /api/attendance/webhook 503 1.662 ms - 92
✔ Biometric Route Level: Unset secret in production returns 503 on all 3 routes (38.7072ms)
POST /api/auth/login 401 6.983 ms - 56
✔ Auth Route Level: POST /api/auth/login strictly rejects dev password bypass in production (14.9534ms)
POST /api/employee/auth/login 401 2.185 ms - 91
✔ Employee Auth Route Level: POST /api/employee/auth/login rejects unauthorized login in production (9.4055ms)
POST /api/employee/auth/verify-otp 400 5.549 ms - 79
✔ Employee OTP Route Level: POST /api/employee/auth/verify-otp has zero bypass with dummy OTP 123456 (40.9831ms)
▶ In-Memory MongoDB Security & Schema Verification
  ✔ Task 5: resetEmployeePassword writes identical fields and temporary password logs in successfully (3482.5533ms)
  ✔ Requirement 3: Revocation uses real UserSession schema fields; protect rejects revoked session (401); stale role in JWT fails (403) (426.2427ms)
[Audit Write Failure in employeeController.resetEmployeePassword]: Disk I/O failure: unable to persist audit trail
  ✔ Task 3: When audit logging fails, database state is completely unchanged (223.9883ms)
  ✔ Task 3: Returns 409 Conflict when employee has no linked user account (29.9156ms)
  ✔ Task 6: Allow-list projections tested against real Employee schema paths including nested fields (38.7965ms)
✔ In-Memory MongoDB Security & Schema Verification (7733.4655ms)
▶ parseDatabaseName - Edge Cases
  ✔ resolves database name from standard MongoDB URI (17.0765ms)
  ✔ resolves database name from MongoDB Atlas SRV URI with query params (0.8203ms)
  ✔ resolves URL-encoded database names correctly (0.4424ms)
  ✔ returns null when URI has no database path (0.5731ms)
  ✔ returns null for empty, non-string, or nullish inputs (0.4704ms)
✔ parseDatabaseName - Edge Cases (26.9061ms)
▶ assertNonProduction - Environment Combinations
  ✔ throws fatal error when NODE_ENV is production (1.4509ms)
  ✔ throws fatal error when MONGODB_URI is missing or empty (1.3066ms)
  ✔ throws fatal error when DATABASE_NAME is unset even with a staging URI (defaults to bjk_healthcare) (0.8484ms)
  ✔ throws fatal error when effective DB is bjk_healthcare (prod name) (0.6751ms)
  ✔ throws fatal error when SEED_ALLOWED_DB is missing or empty (0.4196ms)
  ✔ throws fatal error when effective DB does not exactly match SEED_ALLOWED_DB (0.4648ms)
  ✔ passes successfully when DATABASE_NAME is explicitly set to allowed non-prod DB matching SEED_ALLOWED_DB (1.0607ms)
✔ assertNonProduction - Environment Combinations (10.1001ms)
▶ assertConnectedDbAllowed - Mongoose Connection Verification
  ✔ throws fatal error when NODE_ENV is production (1.7154ms)
  ✔ throws fatal error when connection object has no name (1288.514ms)
  ✔ throws fatal error when connected to production name bjk_healthcare (0.5352ms)
  ✔ throws fatal error when connected to DATABASE_NAME override (0.5293ms)
  ✔ throws fatal error when SEED_ALLOWED_DB is missing or mismatched (0.5439ms)
  ✔ passes when connected database exactly matches SEED_ALLOWED_DB in non-production (0.3306ms)
✔ assertConnectedDbAllowed - Mongoose Connection Verification (1294.5866ms)
▶ requiredEnv - Child Process Validation (Production vs Non-Production)
  ✔ in production: exits with code 1 if JWT_SECRET is missing (328.0143ms)
  ✔ in production: exits with code 1 if JWT_SECRET is shorter than 32 chars (249.5051ms)
  ✔ in production: exits with code 1 if MONGODB_URI is missing (253.1252ms)
  ✔ in production: exits with code 0 when all required env vars are valid (334.648ms)
  ✔ outside production: exits with code 0 and warns when JWT_SECRET is missing or short (282.7173ms)
✔ requiredEnv - Child Process Validation (Production vs Non-Production) (1450.06ms)
✔ Trust Proxy: Defaults to 1 hop in production when TRUST_PROXY_HOPS is unset (5.4241ms)
✔ Trust Proxy: Defaults to false outside production when TRUST_PROXY_HOPS is unset (1.0539ms)
✔ Trust Proxy: Honors explicit numeric TRUST_PROXY_HOPS (1.3142ms)
✔ Trust Proxy: Honors boolean TRUST_PROXY_HOPS (2.1407ms)
✔ Trust Proxy: Honors string subnet/loopback TRUST_PROXY_HOPS (4.8826ms)
✔ Trust Proxy: Correctly resolves client IP from X-Forwarded-For with 1 hop (632.2208ms)
ℹ tests 106
ℹ suites 0
ℹ pass 106
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16141.3722
```

---

## 3. Clean Worktree Patch Sequenced Application Verification

Executed in temporary worktree on `main` (`c0bab07`):

```text
=== VERIFYING GIT APPLY --CHECK IN DEPLOY ORDER ON MAIN ===

[DEPLOY STAGE] 1. R+ (commit_R_plus.patch)
git apply --check "commit_R_plus.patch": EXIT CODE 0 (Clean check)
git apply "commit_R_plus.patch": APPLIED CLEANLY

[DEPLOY STAGE] 2. R2 (commit_R2.patch)
git apply --check "commit_R2.patch": EXIT CODE 0 (Clean check)
git apply "commit_R2.patch": APPLIED CLEANLY

[DEPLOY STAGE] 3. B8 (commit_B8.patch)
git apply --check "commit_B8.patch": EXIT CODE 0 (Clean check)
git apply "commit_B8.patch": APPLIED CLEANLY

[DEPLOY STAGE] 4. B7 (commit_B7.patch)
git apply --check "commit_B7.patch": EXIT CODE 0 (Clean check)
git apply "commit_B7.patch": APPLIED CLEANLY

[DEPLOY STAGE] 5. A  (commit_A.patch)
git apply --check "commit_A.patch": EXIT CODE 0 (Clean check)
git apply "commit_A.patch": APPLIED CLEANLY
```

---

## 4. In-Process Route Audit & Probe Evidence

### Command Executed:
`node scratch/probe_production.js` (with `NODE_ENV=production`)

### Output Summary:
```text
=== ROUTE AUDIT SUMMARY (IN-PROCESS WITH NODE_ENV=production) ===
TOTAL UNIQUE MOUNTED ENDPOINTS: 967
PROTECTED ENDPOINTS: 904
UNAUTHENTICATED ENDPOINTS: 63
  - 35 CATCH-ALL HTTP METHODS (/api/*): 35
  - 28 INTENTIONALLY PUBLIC ENDPOINTS: 28

=== LIST OF 28 PUBLIC ENDPOINTS ===
 1. [GET   ] /api/health
 2. [GET   ] /api/health/database
 3. [GET   ] /api/health/services
 4. [GET   ] /api/hrms/health
 5. [POST  ] /api/auth/login
 6. [POST  ] /api/auth/forgot-password
 7. [POST  ] /api/auth/reset-password
 8. [GET   ] /api/company
 9. [GET   ] /api/facilities
10. [GET   ] /api/products/categories
11. [GET   ] /api/products
12. [GET   ] /api/products/:id
13. [POST  ] /api/crm/enquiries
14. [GET   ] /api/employees/verify-id/:code
15. [GET   ] /api/employees/verify/employee/:code
16. [POST  ] /api/hrms/attendance/biometric
17. [POST  ] /api/hrms/attendance/biometric-webhook
18. [POST  ] /api/attendance/webhook
19. [GET   ] /api/enterprise/company
20. [GET   ] /api/enterprise/facilities
21. [GET   ] /api/enterprise/departments
22. [POST  ] /api/enterprise/crm/enquiries
23. [POST  ] /api/employee/login
24. [POST  ] /api/employee/auth/login
25. [POST  ] /api/employee/auth/send-otp
26. [POST  ] /api/employee/auth/verify-otp
27. [POST  ] /api/employee/auth/forgot-password
28. [POST  ] /api/employee/auth/reset-password

=== DEV-GATED ENDPOINTS STATUS ===
1. GET  /api/credentials/download-excel -> Protected with protect + requireRole("SUPER_ADMIN", "HR_ADMIN"). Returns 401 without token.
2. POST /api/credentials/sync-generated -> Protected with protect + requireRole("SUPER_ADMIN", "HR_ADMIN"). Returns 401 without token.
```
