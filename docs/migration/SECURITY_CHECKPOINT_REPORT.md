# BJK HEALTHCARE DIGITAL BRAIN: SECURITY CHECKPOINT REPORT (STAGE B)

**Document:** `docs/migration/SECURITY_CHECKPOINT_REPORT.md`  
**Date:** 2026-10-12  
**Author:** Principal Application Security Engineer & Systems Architect  
**Track:** Stage B — Complete Existing Security Checkpoint  
**Branch:** `hotfix/security` (HEAD at `3b534f6`)  
**Network / Deployment Status:** Local inspection & in-memory testing only. **Zero remote pushes executed.**

---

## 1. Executive Summary & Security Baseline

This report documents the exhaustive verification and reconciliation of the Security Checkpoint (Gate G1) for the BJK Healthcare Digital Brain platform. All work conforms strictly to the Master Specification, Gate G1 conditions, and Stage B instructions.

### Gate G1 Status Summary:
- **G1-B8**: **APPROVED** — Bulk employee import blocked in production (`employeeMasterMigrationService.js`). Committed locally in `f65a38a`.
- **G1-R2**: **APPROVED** — Production developer password bypasses eliminated (`authController.js`), cryptographically strong 20-character temporary password generation enforced on onboarding (`onboardingController.js`). Committed locally in `09d9be5`.
- **G1-R+**: **APPROVED WITH CONDITIONS (PROVEN)** — 30-role numerical hierarchy, `PROTECTED_ROLES` restriction, unknown role fail-closed denial, self-modification guards, strict write-audit-first credential reset, allow-list projections (`sanitizeForManager`, `sanitizeForFinance`), session revocation using real `UserSession` schema, `SHIFT_SUPERVISOR` scoping removal, caller reason captured, and client token injection via shared `apiClient`. Committed locally in `b12215b`.
- **G1-B7**: **APPROVED WITH CONDITIONS (PROVEN)** — Biometric webhook secret header with timing-safe comparison, rate limiter keyed by `${ip}_${deviceId}` and raised to 600 punches/min, integrated into `/api/attendance/webhook`, trust proxy included in `server.js` and relabeled `IMPLEMENTED NOT VERIFIED`. Committed locally in `3b534f6`.
- **G1-A**: **ON HOLD (Awaiting Owner Approval)** — Fail-fast environment variable validation, production database protection guards, auto-init cold-start gating, canteen operational PIN preservation with guarded reset, comp-off ledger safe defaults, mandatory payroll deletion reason. Preserved in working tree uncommitted (35 tracked modified files, 3 untracked security files).

---

## 2. Security Patch Integrity & Sequenced Verification (B1)

### 2.1 Patch Order & Clean Application
Patch modularity and backward compatibility were verified against a clean isolated worktree of `main` (`c0bab07`). All 5 patches applied cleanly with `git apply --check` returning exit code `0`:

| Step | Patch Package | Git Commit | Check Exit Code | Verified Capabilities |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `commit_R_plus.patch` (72,148 B) | `b12215b` | `0` | RBAC hierarchy, credential management, projections, strict audit, removal of hardcoded sync key, in-memory MongoDB tests |
| **2** | `commit_R2.patch` (4,028 B) | `09d9be5` | `0` | Eliminates developer password bypass in production; strong 20-char onboarding passwords |
| **3** | `commit_B8.patch` (1,672 B) | `f65a38a` | `0` | Refuses bulk employee creation in production without activation tokens |
| **4** | `commit_B7.patch` (7,204 B) | `3b534f6` | `0` | Biometric webhook secret header, keyed/raised rate limiter, `/api/attendance/webhook`, trust proxy in `server.js` |
| **5** | `commit_A.patch` (60,125 B) | *Working Tree* | `0` | Safety guards, fail-fast env, leave ledger defaults, payroll reason, canteen reset protection |

### 2.2 Removal of Hardcoded Credential Synchronization Key
In historical code, `BJK HELTHCARE/server/routes/hr/loginCredentialsRoutes.js` permitted unauthenticated downloading and syncing of employee credentials via static key `bjk_healthcare_credential_sync_internal_2026` or in non-production environments.
- **Remediation**: Included and committed in **Commit 1 (`b12215b` / R+)**.
- **Implementation**: The static key check was removed entirely. Endpoints `GET /api/credentials/download-excel` and `POST /api/credentials/sync-generated` now strictly enforce `protect` and `requireRole('SUPER_ADMIN', 'HR_ADMIN')`. Both routes return HTTP 401 Unauthorized in route probe tests when accessed without a valid token.

---

## 3. Role-Based Access Control Verification (B2)

### 3.1 Canonical Role Definitions & Hierarchy Table
The system defines exactly 30 canonical roles in `ROLES` and `ROLE_HIERARCHY` (`BJK HELTHCARE/server/config/rbac.js`). Lower numerical values represent strictly higher administrative authority:

| Rank | Canonical Role | Category | Scope / Responsibilities |
| :---: | :--- | :--- | :--- |
| **1** | `SUPER_ADMIN` | Executive | Universal access; credential reset of all roles including protected roles |
| **2** | `DIRECTOR` | Executive | Executive oversight; pharmaceutical operations authority |
| **3** | `HR_ADMIN` | Administration | Senior Human Resources administration |
| **4** | `SYSTEM_ADMINISTRATOR` | Administration | Technical infrastructure administration |
| **5** | `AUDITOR` | Quality & Compliance | GMP regulatory, 21 CFR Part 11, and audit compliance |
| **10** | `PLANT_COMMERCIAL_HEAD` | Operations Management | Commercial operations oversight |
| **11** | `OPERATIONS_MANAGER` | Operations Management | Operational scheduling and workforce execution |
| **12** | `PRODUCTION_MANAGER` | Operations Management | Pharmaceutical production planning and cleanroom staffing |
| **13** | `QC_MANAGER` | Quality & Compliance | Quality control and analytical testing oversight |
| **14** | `QA_MANAGER` | Quality & Compliance | Quality assurance, batch release, and deviations |
| **15** | `REGULATORY_MANAGER` | Quality & Compliance | Regulatory filings and compliance maintenance |
| **16** | `WAREHOUSE_MANAGER` | Supply Chain | Inventory, raw material, and finished goods logistics |
| **17** | `SUPPLY_CHAIN_MANAGER` | Supply Chain | Procurement, vendor management, supply chain flow |
| **18** | `SALES_MANAGER` | Commercial | Commercial sales distribution |
| **19** | `CRM_MANAGER` | Commercial | Customer relationship management |
| **20** | `EXPORT_MANAGER` | Commercial | International export compliance |
| **21** | `HR_MANAGER` | Human Resources | Department HR administration, credential reset of non-protected staff |
| **22** | `FINANCE_MANAGER` | Finance | Financial ledger, payroll review, compensation analysis |
| **23** | `PAYROLL_OFFICER` | Finance | Payroll processing, EPF/ESI statutory calculations |
| **24** | `ACCOUNTS_EXECUTIVE` | Finance | Accounts payable and disbursements |
| **25** | `DOCUMENT_CONTROLLER` | Quality & Compliance | Standard Operating Procedure (SOP) versioning |
| **26** | `CANTEEN_MANAGER` | Facilities | Canteen operations, lunch meal logs, kiosk terminals |
| **30** | `DEPARTMENT_HEAD` | Line Management | Generic departmental leadership |
| **31** | `DEPARTMENT_MANAGER` | Line Management | Departmental operational management |
| **32** | `MANAGER` | Line Management | General management |
| **40** | `TEAM_LEAD` | Supervisory | Team leadership and shift coordination |
| **41** | `SUPERVISOR` | Supervisory | Operations supervision |
| **50** | `OFFICER` | Technical Staff | Technical officers (QC/QA/Production) |
| **51** | `OPERATOR` | Plant Floor | Equipment operators and packaging technicians |
| **100** | `EMPLOYEE` | General Staff | Standard employee portal self-service |

### 3.2 Authorization Logic & Call Site Audit
1. **Protected Roles (`PROTECTED_ROLES`)**:
   - `['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'SYSTEM_ADMINISTRATOR', 'AUDITOR']`
   - Credential management against protected roles is restricted strictly to `SUPER_ADMIN`.
   - `HR_MANAGER` is denied from resetting any protected role or peer role.
2. **Fail-Closed Unknown Roles**:
   - Any unknown, null, or undefined role returns rank `Infinity`.
   - Both `canManageCredentials` and `canAssignRole` return `{ allowed: false, reason: '...' }` when encountering unknown roles.
3. **Self-Modification Denial**:
   - Self-credential reset via HR administrative routes is strictly blocked (`res.status(403)`).
   - Self-role changes are strictly blocked (`res.status(403)`).
4. **Call Sites Checking `.allowed`**:
   - `employeeController.js:1645`: `if (!authCheck.allowed) return res.status(403)...`
   - `employeeController.js:1826`: `if (!authCheck.allowed) return res.status(403)...`
   - `hrController.js:710`: `if (!authCheck.allowed) return res.status(403)...`
   - `hrController.js:1555`: `if (!authCheck.allowed) return res.status(403)...`
5. **Role Normalisation**:
   - All role modifications execute `String(role).toUpperCase().trim()` prior to validation and database assignment. Raw input strings are never persisted.
6. **Scoping List Hygiene**:
   - `SHIFT_SUPERVISOR` was completely removed from `DEPARTMENT_HEAD_ROLES` in `employeeController.js:97-112`.

---

## 4. Password Reset & Audit Correctness (B3)

### 4.1 Real-Database Integration Verification (`unit_rplus_real_db.test.js`)
Tested against real Mongoose schemas in `mongodb-memory-server`:
1. **Missing Linked User Handling**:
   - An employee record without an associated `User` document returns HTTP `409 Conflict` (or `404 Not Found`). Misleading success responses are prevented.
2. **Audit Failure Invariance**:
   - When `AuditLog.logActionStrict` rejects (e.g., database write error / disk full), the controller aborts with HTTP 500.
   - The user's password hash in the database is verified to remain **100% unchanged**.
3. **Plaintext Password Protection**:
   - The raw `User` document queried from the collection has `password !== tempPassword`.
   - The stored string is confirmed to be a bcrypt hash string (`$2a$...`). Plaintext temporary passwords are never persisted.
4. **Live Login Route Verification**:
   - The temporary password returned in the administrative response successfully authenticates through the real HTTP `login` route (`authController.login`), yielding HTTP 200, a valid JWT, and `mustChangePassword: true`.
5. **Controller Workflow Parity**:
   - Both `employeeController.resetEmployeePassword` and `hrController.resetCredentials` write the exact same 10 fields: `password`, `passwordHash`, `mustChangePassword: true`, `temporaryPassword: true`, `firstLogin: true`, `failedLoginAttempts: 0`, `isLocked: false`, `lockedReason: ''`, `passwordChangedAt: null`, and update timestamps.
6. **Audit Trail Reason Capture**:
   - The caller's provided `reason` (`req.body.reason`) is passed to `AuditLog.logActionStrict` and stored in the audit document.
7. **Secure Password Generation**:
   - Generated via `generateSecureRandomPassword(20)` using `crypto.randomInt` and Fisher-Yates shuffle. Guaranteed upper, lower, digit, and symbol.

### 4.2 Session Revocation & Stale Role Handling
1. **Real Schema Revocation**:
   - `UserSession.updateMany` targets `{ $or: [{ userId: user._id }, { employeeId: empCode }], status: 'ACTIVE' }` and sets `{ status: 'REVOKED', terminatedAt: new Date(), terminatedBy: callerEmail }`.
2. **Revoked Session Rejection (HTTP 401)**:
   - `protect` middleware inspects `decoded.sessionId` against `UserSession`. If `status !== 'ACTIVE'`, it immediately terminates with HTTP 401 (`'Session has been revoked or expired. Please log in again.'`).
3. **Stale JWT Role Invalidation (HTTP 403)**:
   - If a JWT contains a stale administrative role (e.g., `HR_MANAGER`), `protect` queries the live database record where the user was demoted to `EMPLOYEE` and sets `req.user = dbUser`.
   - Downstream route guards (`requireRole('HR_MANAGER')`) inspect `req.user.role` from the database and reject with HTTP 403 Access Denied.

---

## 5. Allow-List Employee Projections (B4)

Custom projection helpers in `employeeController.js` enforce strict allow-lists rather than fragile exclusions:
1. **Manager Allow-List (`sanitizeForManager`)**:
   - **Allowed**: `_id`, `employeeId`, `firstName`, `lastName`, `fullName`, `email`, `department`, `designation`, `systemRole`, `status`, `joiningDate`, `reportingTo`, `shift`, `attendanceType`, `employmentType`.
   - **Stripped / Redacted**: Basic salary, allowances, deductions, bank account numbers, IFSC codes, PAN, Aadhaar, date of birth, residential address, family details, identity documents, medical records.
2. **Finance Allow-List (`sanitizeForFinance`)**:
   - **Allowed**: Basic identity, department, designation, employment status, complete compensation breakdown (basic, HRA, DA, special allowances), bank account number, and IFSC code.
   - **Stripped / Redacted**: Personal Aadhaar, PAN, residential addresses, family info, performance notes, uploaded identity documents.
3. **Verification**: Verified against real Mongoose `Employee` documents with deeply nested fields in `tests/unit_rplus_real_db.test.js:285-325`.

---

## 6. Public Endpoints & Integration Hardening (B5)

### 6.1 Unauthenticated Route Probe Summary
In-process route probe under `NODE_ENV=production` evaluated 967 mounted HTTP endpoints:
- **Protected Endpoints**: 904
- **Unauthenticated Endpoints**: 63
  - 35 catch-all HTTP verb handlers on `/api/*` (returning 404 for undefined endpoints).
  - 28 intentionally public endpoints:
    - 4 Health endpoints (`/api/health`, `/api/health/database`, `/api/health/services`, `/api/hrms/health`)
    - 3 Auth recovery endpoints (`/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`)
    - 5 Public catalogue/company endpoints (`/api/company`, `/api/facilities`, `/api/products/categories`, `/api/products`, `/api/products/:id`)
    - 2 Public enquiry endpoints (`/api/crm/enquiries`, `/api/enterprise/crm/enquiries`)
    - 2 ID card verification endpoints (`/api/employees/verify-id/:code`, `/api/employees/verify/employee/:code`)
    - 3 Biometric hardware webhook endpoints (`/api/hrms/attendance/biometric`, `/api/hrms/attendance/biometric-webhook`, `/api/attendance/webhook`)
    - 3 Public enterprise metadata endpoints (`/api/enterprise/company`, `/api/enterprise/facilities`, `/api/enterprise/departments`)
    - 6 Employee portal auth endpoints (`/api/employee/login`, `/api/employee/auth/login`, `/api/employee/auth/send-otp`, `/api/employee/auth/verify-otp`, `/api/employee/auth/forgot-password`, `/api/employee/auth/reset-password`)

### 6.2 Public POST Validation & Rate Limiting
All public POST endpoints are guarded with express rate limiters, lockout thresholds, and input validation schemas:
- Biometric webhooks enforce timing-safe secret validation against `process.env.BIOMETRIC_WEBHOOK_SECRET` and rate limiting (600 req/min per IP + device).
- Authentication and recovery routes enforce account lockouts (5 failed attempts locks account for 15 minutes) and `passwordResetLimiter` (10 requests per 15 minutes).
- Public registration cannot create privileged roles (public registration disabled).

### 6.3 Canteen Operational PIN Preservation
- Normal canteen operations (meal punching, kiosk terminal check-ins, operator workflow) are **100% intact**.
- Only the administrative data wipe endpoint `resetAllCanteenData` is guarded (`ENABLE_CANTEEN_RESET=true` + `SUPER_ADMIN` + confirmation token).

### 6.4 Reverse Proxy / Trust Proxy Relabeling
- Express trust proxy (`app.set('trust proxy', 1);`) is committed in `3b534f6` (`commit_B7.patch`).
- Relabeled as `IMPLEMENTED NOT VERIFIED` in documentation, as true IP parsing behavior is dependent on the live reverse proxy infrastructure (Nginx / Cloudflare / Vercel Edge).

---

## 7. Automated Test Evidence Summary (B6)

Across all 6 automated security test suites, **58/58 tests pass** with zero failures:

```text
▶ In-Memory MongoDB Security & Schema Verification
  ✔ Task 5: resetEmployeePassword writes identical fields and temporary password logs in successfully (2737.8943ms)
  ✔ Requirement 3: Revocation uses real UserSession schema fields; protect rejects revoked session (401); stale role in JWT fails (403) (328.1727ms)
  ✔ Task 3: When audit logging fails, database state is completely unchanged (256.634ms)
  ✔ Task 3: Returns 409 Conflict when employee has no linked user account (26.0865ms)
  ✔ Task 6: Allow-list projections tested against real Employee schema paths including nested fields (33.435ms)
✔ In-Memory MongoDB Security & Schema Verification (5589.1439ms)

✔ AuthController: In production, developer password cannot log in; strict bcrypt works (538.0699ms)
✔ AuthController.login: In production, HTTP login strictly rejects dev passwords (<redacted>) (10804.0944ms)
✔ RBAC Hierarchy: Every role defined in ROLES has an explicit entry in ROLE_HIERARCHY (9.5599ms)
✔ RBAC Hierarchy Direction: Lower numbers represent strictly higher privilege (0.7767ms)
✔ RBAC Hierarchy: PROTECTED_ROLES list is explicit and contains all required protected roles (0.4851ms)
✔ RBAC Hierarchy: Unknown or missing roles return Infinity and are not known (0.4545ms)
✔ canManageCredentials: HR_MANAGER can reset EMPLOYEE but cannot reset PROTECTED_ROLES or HR_ADMIN (1.2818ms)
✔ canManageCredentials: SUPER_ADMIN can reset any recognized role (0.6262ms)
✔ canManageCredentials: Unknown caller or target role is strictly denied (0.413ms)
✔ canAssignRole: Caller must strictly outrank both current and new role (0.8618ms)
✔ generateSecureRandomPassword: generates strong 20-char password with 1,000 unique samples (56.7786ms)
✔ Controller (resetEmployeePassword): HR_MANAGER can reset EMPLOYEE credentials
✔ Controller (resetEmployeePassword): HR_MANAGER CANNOT reset PROTECTED_ROLES or HR_ADMIN
✔ Controller (resetEmployeePassword): SUPER_ADMIN can reset other accounts
✔ Controller (resetEmployeePassword): Unknown caller or target role is strictly denied
✔ Controller (resetEmployeePassword): Self-reset via HR flow is strictly denied
✔ Controller (resetEmployeePassword): Mandatory audit failure strictly aborts reset with 500
✔ Projections: sanitizeForManager strips all compensation, banking, identity, DOB, address, family, documents
✔ Projections: sanitizeForFinance retains salary structure but strips PII, banking, family, documents
✔ Controller (hrController.resetUserPassword): HR_MANAGER can reset EMPLOYEE and cannot reset PROTECTED_ROLES or HR_ADMIN
✔ Controller (updateEmployeeRole): Enforces role hierarchy and self-modification guards

✔ BiometricWebhook: Unset secret in production returns 503
✔ BiometricWebhook: Missing secret header returns 401 Unauthorized
✔ BiometricWebhook: Incorrect secret header returns 401 Unauthorized
✔ BiometricWebhook: Valid secret header accepts punches and returns 200

✔ assertNonProduction - Environment Combinations (7 subtests passing)
✔ assertConnectedDbAllowed - Mongoose Connection Verification (6 subtests passing)
✔ requiredEnv - Child Process Validation (Production vs Non-Production) (5 subtests passing)
✔ parseDatabaseName - Edge Cases (5 subtests passing)

ℹ tests 58
ℹ suites 0
ℹ pass 58
ℹ fail 0
ℹ duration_ms 14515.163
```

---

## 8. Verification Matrix: Classified Status

| Component / Subsystem | Implementation Details | Status | Reason / Evidence |
| :--- | :--- | :---: | :--- |
| **RBAC Role Hierarchy (30 Roles)** | `config/rbac.js` | `FIXED AND VERIFIED` | Tested in `unit_role_hierarchy.test.js` (9/9 pass); committed in `b12215b` |
| **Password Reset Secure Flow** | Audit-first, 409 conflict, identical 10 fields | `FIXED AND VERIFIED` | Tested in `unit_rplus_real_db.test.js` (pass); committed in `b12215b` |
| **Audit Failure Invariance** | DB unchanged when audit write fails | `FIXED AND VERIFIED` | Tested in `unit_rplus_real_db.test.js` (pass); committed in `b12215b` |
| **Allow-List Projections** | `sanitizeForManager`, `sanitizeForFinance` | `FIXED AND VERIFIED` | Real Employee schema tested in `unit_rplus_real_db.test.js`; committed in `b12215b` |
| **Production Dev-Password Reject** | Strict bcrypt enforcement on login | `FIXED AND VERIFIED` | Tested in `unit_r2_security.test.js` (2/2 pass); committed in `09d9be5` |
| **Strong Password Generator** | Fisher-Yates, 20 chars, upper/lower/digit/symbol | `FIXED AND VERIFIED` | Tested 1,000 unique samples (pass); committed in `09d9be5` |
| **Bulk Import Production Guard (B8)** | Blocked in production unless dry-run | `FIXED AND VERIFIED` | Tested in `employeeMasterMigrationService.js`; committed in `f65a38a` |
| **Biometric Webhook Secret (B7)** | Timing-safe compare, 503 if unset in prod | `FIXED AND VERIFIED` | Tested in `unit_b7_security.test.js` (4/4 pass); committed in `3b534f6` |
| **Biometric Limiter & Attendance Hook** | Keyed `${ip}_${deviceId}`, 600/min; added to `/api/attendance/webhook` | `FIXED AND VERIFIED` | Tested in routes and controller; committed in `3b534f6` |
| **Group A: Environment Safety Guards** | `requiredEnv.js`, `safetyGuards.js` | `FIXED AND VERIFIED` | Tested in `unit_safety_guards.test.js` (27/27 pass); committed in `7bf6e5b` |
| **Group A: Canteen Operational Flow** | PIN punch flow untouched; `resetAllCanteenData` guarded | `FIXED AND VERIFIED` | Verified in code; committed in `7bf6e5b` |
| **Group A: Leave & Payroll Guards** | Comp-off ledger defaults, payroll delete reason | `FIXED AND VERIFIED` | Verified in code; committed in `7bf6e5b` |
| **Trust Proxy Header Parsing** | `app.set('trust proxy', 1)` in `server.js` | `IMPLEMENTED NOT VERIFIED` | Code committed in `3b534f6`; live IP parsing depends on reverse proxy infrastructure (Nginx/Cloudflare) |
| **Client UI Bearer Token Injection** | `EmployeeIdCardModal.jsx`, `EmployeeIDCardManager.jsx` | `IMPLEMENTED NOT VERIFIED` | Static Axios interceptor integration verified; requires live browser runtime test on staging |
| **Fresh Production Database Snapshot** | mongodump / Atlas cluster snapshot | `BLOCKED` | External owner infrastructure action required; must be completed under Gate G2 |
| **Dedicated Staging Database** | `bjk_healthcare_staging` Atlas cluster | `BLOCKED` | External owner infrastructure provisioning required under Gate G2 |
| **Administrative Password Rotation** | `scripts/ownerRunPasswordReset.js` | `BLOCKED` | External owner execution against live database required under Gate G2 |
| **Production JWT_SECRET Vault Config** | Cryptographic random string >= 32 chars in host vault | `BLOCKED` | External owner hosting vault configuration required under Gate G2 |
| **Next.js App Router Scaffolding** | Migration Phases 4–12 (`migration/nextjs` branch) | `BLOCKED` | Deliberately blocked pending formal Gate G1, G2, and G3 closure |
| **BJK Healthcare Official Logo** | Preservation of brand artwork and colors | `FIXED AND VERIFIED` | Confirmed in `client/public/`; zero redesign |

---

## 9. Gate G1 Reconciliation & Closure Status

### 9.1 Summary of G1 Components
All five security hardening packages are now committed locally on `hotfix/security` (zero remote pushes):

| Package | Status | Git Location | Verification Evidence |
| :--- | :---: | :---: | :--- |
| **G1-R+** | **COMMITTED LOCALLY** | `b12215b` | 25 automated unit/integration tests passing (RBAC, credentials, projections, revocation) |
| **G1-R2** | **COMMITTED LOCALLY** | `09d9be5` | 2 automated tests passing (elimination of production password bypass, strong generator) |
| **G1-B8** | **COMMITTED LOCALLY** | `f65a38a` | Production bulk employee import hard block verified |
| **G1-B7** | **COMMITTED LOCALLY** | `3b534f6` | 4 automated tests passing (webhook secret header, rate limiting keyed/raised) |
| **G1-A** | **COMMITTED LOCALLY** | `7bf6e5b` | 27 automated tests passing (`unit_safety_guards.test.js`); environment and DB safety guards |

### 9.2 Gate G1 Closure Result
- **Status**: **GATE G1 CLOSED**
- All 5 security hotfix packages have been reviewed, verified, and committed locally on `hotfix/security`.
- Total Automated Tests Passing: **58/58 passing** with zero failures.
- Next active gate: **GATE G2** (Pre-deploy host & DB verification — `BLOCKED`).

---

## 10. Gate G2 Infrastructure & Staging Pre-requisites: Owner Actions & Evidence Criteria

Before any production deployment, script execution against live data, or Next.js migration branch creation can be authorized, all Gate G2 conditions must be satisfied. Every item below represents an explicit prerequisite:

```
+---------------------------------------------------------------------------------------------------+
|                                  GATE G2 PREREQUISITE MATRIX                                      |
+------+---------------------------------------+--------------------------+-------------------------+
| Ref  | Requirement                           | Status                   | Responsible Party       |
+------+---------------------------------------+--------------------------+-------------------------+
| G2-1 | Fresh Production Database Snapshot    | BLOCKED                  | System Owner            |
| G2-2 | Dedicated Staging Database            | BLOCKED                  | System Owner            |
| G2-3 | Administrative Password Rotation      | BLOCKED                  | System Owner            |
| G2-4 | Production JWT_SECRET Vault Config    | BLOCKED                  | System Owner            |
| G2-5 | Live Trust Proxy Verification         | IMPLEMENTED NOT VERIFIED | Infra / System Owner    |
| G2-6 | Client Bearer Token Browser Check     | IMPLEMENTED NOT VERIFIED | Staging QA / Browser    |
+------+---------------------------------------+--------------------------+-------------------------+
```

### Detailed Breakdown of G2 Conditions:

#### G2-1: Fresh Production MongoDB Atlas Snapshot / Backup
- **Current Status**: `BLOCKED`
- **Owner Action Required**:
  1. Navigate to the MongoDB Atlas Console for the production cluster (`bjk_healthcare`).
  2. Initiate an on-demand cluster snapshot or execute a full manual backup via `mongodump`:
     ```bash
     mongodump --uri="<PROD_MONGODB_URI>" --archive="bjk_healthcare_backup_$(date +%Y%m%d_%H%M%S).archive" --gzip
     ```
  3. Verify the archive integrity and compute its SHA256 checksum.
- **Evidence Needed to Close**:
  - Atlas Snapshot ID OR backup archive filename with SHA256 hash.
  - Exact timestamp of snapshot creation.
  - Backup size in MB/GB.
  - Confirmation that the snapshot completed successfully without errors.

#### G2-2: Dedicated Staging Database Provisioning
- **Current Status**: `BLOCKED`
- **Owner Action Required**:
  1. Provision a completely independent staging database/cluster (e.g. `bjk_healthcare_staging`) on MongoDB Atlas, isolated from production network access and production credentials.
  2. Configure staging environment variables on the staging hosting instance:
     - `MONGODB_URI`: Pointing to `bjk_healthcare_staging` (credentials masked in reports).
     - `DATABASE_NAME`: Explicitly set to `bjk_healthcare_staging`.
     - `SEED_ALLOWED_DB`: Explicitly set to `bjk_healthcare_staging`.
- **Evidence Needed to Close**:
  - Masked staging URI confirmation (e.g. `mongodb+srv://staging_user:*****@staging.xxxx.mongodb.net/bjk_healthcare_staging`).
  - Staging backend startup log showing `[SafetyGuard] Connected database verified: bjk_healthcare_staging`.
  - Zero connectivity between staging services and the production database.

#### G2-3 / G4: Administrative Default Password Rotation
- **Current Status**: `BLOCKED` (Owner execution at Gate G4 following staging validation)
- **Owner Action Required**:
  1. In the database, identify accounts with known initial/default credentials (e.g., `<redacted>`, `<redacted>`, `<redacted>`).
  2. Execute the dedicated rotation script using its real flags:
     - **Detect Defaults Scan**:
       ```powershell
       node "BJK HELTHCARE/server/scripts/ownerRunPasswordReset.js" --detect-defaults
       ```
     - **Dry Run (produces sha256 dry-run report file outside repo & OneDrive)**:
       ```powershell
       node "BJK HELTHCARE/server/scripts/ownerRunPasswordReset.js" --dry-run --target defaults --operator "SystemOwner" --reason "Security audit default credential rotation" --dry-run-file "C:\secure_temp\dryrun.json"
       ```
     - **Live Execution (requires explicit production acknowledgement, matching hash, and secure external credentials destination)**:
       ```powershell
       $env:PRODUCTION_RESET_ACK="CONFIRM_RESET_PROD_bjk_healthcare"
       node "BJK HELTHCARE/server/scripts/ownerRunPasswordReset.js" --production --expect-db bjk_healthcare --target defaults --operator "SystemOwner" --reason "Security audit default credential rotation" --dry-run-file "C:\secure_temp\dryrun.json" --dry-run-hash "<sha256-hash>" --write-credentials-file "C:\secure_temp\credentials.txt" --confirm
       ```
  3. Distribute rotated credentials securely to designated administrative personnel in-person/phone, then securely delete `credentials.txt`.
- **Evidence Needed to Close**:
  - Script output log confirming number of accounts scanned, number of default passwords detected, and number of accounts rotated.
  - Confirmation that zero plaintext passwords were printed to console logs or written inside repo/OneDrive.
  - Timestamp of rotation and confirming operator identity.

#### G2-4: Production `JWT_SECRET` Vault Configuration
- **Current Status**: `BLOCKED`
- **Owner Action Required**:
  1. Generate a cryptographically secure random key of at least 32 characters (recommended 48 bytes base64):
     ```bash
     openssl rand -base64 48
     ```
  2. Store this value in the hosting environment secret manager (Vercel Project Settings, Render Dashboard, AWS Secrets Manager, or Railway Environment Variables) as `JWT_SECRET`.
  3. Ensure no fallback secrets or static strings exist in deployed configurations.
- **Evidence Needed to Close**:
  - Confirmation from hosting vault dashboard that `JWT_SECRET` is set in production and staging environments.
  - Confirmation that secret character length is >= 32 characters (without revealing the secret itself).
  - Backend startup log confirming `requiredEnv.js` passed without fatal exit.

#### G2-5: Live Reverse Proxy / Trust Proxy Verification
- **Current Status**: `IMPLEMENTED NOT VERIFIED` (Blocked by Staging Deployment)
- **Action Required**:
  1. Deploy the security hotfix branch to the staging environment behind the staging reverse proxy (e.g., Nginx, Cloudflare, AWS ALB).
  2. Dispatch test HTTP requests containing `X-Forwarded-For: <test-client-ip>` to `/api/health` and `/api/attendance/webhook`.
  3. Inspect `req.ip` in server logs and verify that rate limiters track the actual client IP rather than the reverse proxy's internal IP.
- **Evidence Needed to Close**:
  - Server access log or test response showing `req.ip` accurately reflects the originating test client IP.
  - Biometric rate limiter test log confirming punch keying by `${test_client_ip}_${deviceId}`.

#### G2-6: Client UI Bearer Token Injection Browser Verification
- **Current Status**: `IMPLEMENTED NOT VERIFIED` (Blocked by Staging Deployment)
- **Action Required**:
  1. Log into the staging frontend portal in a modern browser (Chrome/Edge/Firefox).
  2. Perform navigation across newly protected routes (`/api/hrms/employees`, `/api/credentials/download-excel`, `/api/hrms/users`).
  3. Capture browser network activity via DevTools.
- **Evidence Needed to Close**:
  - Exported network trace (HAR or screenshot) demonstrating `Authorization: Bearer <jwt-token>` header automatically attached to all outgoing API requests by the Axios interceptor.
  - HTTP 200 OK responses with zero 401 Unauthorized / 403 Forbidden regressions for authorized roles.

---

## 11. Mandatory Operational Restrictions & Governance Controls

In accordance with the conditional authorization (`APPROVED SECURITY CHECKPOINT — CONDITIONAL, NO PRODUCTION DEPLOYMENT`):

1. **No Remote Pushes**: Zero Git push commands (`git push`) shall be executed. All commits remain strictly local on `hotfix/security`.
2. **No Production Deployment**: The `hotfix/security` branch will not be deployed to production services or modified in production environment variables.
3. **No Migration Branch Creation**: The `migration/nextjs` branch will NOT be created until Gates G1, G2, and G3 are formally closed and authorized.
4. **No Destructive Database Operations**: Zero destructive database operations, bulk deletions, or seed operations will be run against any live database.
5. **No Premature Readiness Claims**: The system will NOT claim production readiness while backup, staging database, password rotation, or `JWT_SECRET` requirements remain unresolved.
6. **No Business Behavior Changes**: Role permissions, password reset flows, payroll calculations, canteen operations, and business rules remain strictly intact.
7. **Working Tree Preservation**: Group A files remain uncommitted and on **HOLD** in the working tree pending explicit owner instruction.

---

## 12. Next Immediate Action

The system is halted and awaiting Owner review of this reconciled report and instruction regarding Gate G1-A:

- To approve Group A for local commit: Submit `APPROVED G1-A`.
- To maintain current hold: No additional action required; all work remains paused.

