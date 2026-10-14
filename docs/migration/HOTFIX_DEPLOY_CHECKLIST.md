# BJK HEALTHCARE — HOTFIX DEPLOYMENT CHECKLIST & OPERATIONAL RUNBOOK
**Target Branch:** `hotfix/security`  
**Security Policy Compliance:** Zero credential leakage, fail-fast configuration validation, strictly guarded RBAC.

---

## 1. Required Environment Variables Per Host (Names Only)

### Required Variables (Mandatory for Production Boot)
| Variable Name | Constraints & Security Specification | Target Host(s) |
| :--- | :--- | :--- |
| `NODE_ENV` | Must be strictly set to `production`. Activates strict startup guards, disables stack traces in error handlers, and enforces production database protection. | All Backend Hosts (Vercel Serverless, Standalone Render / Railway / VM) |
| `JWT_SECRET` | Mandatory. Cryptographically random secret, minimum **32 characters** (recommended 64+ hex/base64 characters). Server immediately terminates on boot if missing or < 32 characters. | All Backend Hosts |
| `MONGODB_URI` | Mandatory. Production MongoDB Atlas replica set URI with TLS enabled (`mongodb+srv://...`). Server immediately terminates on boot if missing or empty. | All Backend Hosts |
| `DATABASE_NAME` | Explicitly configured database name matching production cluster namespace (e.g. `bjk_healthcare`). Overrides URI path defaults. | All Backend Hosts |
| `BIOMETRIC_WEBHOOK_SECRET` | Shared secret header required for biometric attendance hardware webhook (`/api/hrms/attendance/biometric`). If unset in production, webhook returns HTTP 503. | Backend Hosts receiving biometric pushes |

### Flags That MUST BE UNSET in Production
The following variables exist in the codebase and must **NEVER** be enabled or set in the production environment:
- `SEED_ALLOWED_DB` (Must be completely unset; seed routines refuse execution if set or if `NODE_ENV=production`)
- `PRODUCTION_RESET_ACK` (Must be completely unset; guarded reset confirmation in canteenController)
- `ENABLE_CANTEEN_RESET` (Must be completely unset; resets canteen database)
- `ENABLE_AUTO_INIT` (Must be unset or false; triggers automatic database initialization on boot)
- `ENABLE_DEMO_OTP` (Must be unset or false; enables static/mock OTP verification)
- `ALLOW_MEMORY_FALLBACK` (Must be unset or false; falls back to in-memory store)

---

## 2. Pre-Deploy Checklist

- [ ] **Branch Integrity Verification**:
  - Confirm current branch is `hotfix/security`.
  - Confirm `main` branch remains untouched and clean.
- [ ] **Working Tree & Untracked Files Check**:
  - Confirm owner utility scripts (`server/scripts/ownerRunPasswordReset.js`, `server/scripts/count_routes.js`) remain untracked and excluded from commit stages.
  - Verify zero plaintext passwords, secrets, or connection strings exist in git diff.
- [ ] **Syntax & Unit Safety Guards Test Verification**:
  - Run full test suite: `node --test "BJK HELTHCARE/server/tests/unit_safety_guards.test.js"` (must report 27 passing tests, 0 failures).
  - Run role hierarchy suite: `node --test "BJK HELTHCARE/server/tests/unit_role_hierarchy.test.js"` (must report 4 passing tests, 0 failures).
  - Run syntax check across all server modules: `node --check server/server.js`, `node --check server/config/requiredEnv.js`, `node --check server/routes/employeeRoutes.js`, etc.
- [ ] **Secret Strength Audit**:
  - Generate a new, cryptographically random `JWT_SECRET` (>= 32 chars) using `crypto.randomBytes(32).toString('hex')`.
  - Store secret exclusively in the host's encrypted environment variable vault (e.g. Vercel Environment Variables, Render Secret Manager, Doppler).
- [ ] **Database Backup (Immediate Snapshot)**:
  - Take a pre-deployment snapshot / mongodump of production MongoDB before rolling out any application updates.

---

## 3. Preview-Test Plan with Staging Database

Before directing production user traffic to the updated build, validate the deployment on an isolated preview environment with a dedicated staging database:

1. **Staging Environment Configuration**:
   - `NODE_ENV=production`
   - `MONGODB_URI`: Pointed strictly to staging MongoDB cluster (e.g., `bjk_staging_db`).
   - `DATABASE_NAME=bjk_staging_db`.
   - `SEED_ALLOWED_DB`: Unset.
   - `JWT_SECRET`: Valid 64-character staging secret.
2. **Boot Validation**:
   - Verify server boots cleanly without unhandled exceptions or exit code 1.
   - Verify that all seed scripts refuse execution if accidentally triggered.
3. **Diff Group R+ Verification on Staging**:
   - Send `GET /api/employees` without an `Authorization` header: Verify immediate HTTP 401 response (`Access denied: Authentication token required.`).
   - Send `GET /api/employees/verify-id/VALID_CODE`: Verify HTTP 200 response (public verification works).
   - Send `POST /api/employees/test`: Verify HTTP 404 response (test save route completely eliminated).

---

## 4. Production Smoke Tests

Perform the following manual smoke tests immediately following deployment:

### 1. Admin Login Smoke Test
- Navigate to `/login`.
- Authenticate using Super Admin credentials.
- Verify JWT is returned, stored in session, and redirected to Executive Dashboard.
- Verify user profile returns `role: "SUPER_ADMIN"`.

### 2. Employee Login Smoke Test
- Navigate to `/login`.
- Authenticate using Employee credentials.
- Verify successful login and redirection to `/employee/dashboard`.
- Verify employee dashboard widgets load without 401 or 403 errors.

### 3. Employee Leave Page Smoke Test
- From employee portal, navigate to `/employee/leave`.
- Verify leave ledger renders balance cards (Casual Leave, Sick Leave, Earned Leave).
- Verify that if ledger is empty or missing, safe defaults (`0 balance`) render without application crash.
- Submit a mock leave request and confirm validation response.

### 4. Payroll List Smoke Test
- From HR / Admin navigation, open `/hrms/payroll`.
- Select an existing pay period (e.g., `2026-03`).
- Verify payroll list renders records, pay slips, and calculation summaries.
- Click "Clear Batch" / "Delete Batch": Verify confirmation dialog pops up, followed immediately by a prompt requiring a mandatory deletion reason. Test entering an empty reason: verify deletion is blocked with a warning toast.

### 5. HR Password Reset Smoke Test
- Navigate to `/hr/employees` or `/hrms/employee/:id`.
- Select an employee profile and click "Reset Password".
- Verify input modal mandates a non-empty reason.
- Submit reset: Verify new temporary credentials are returned in response, an audit record is created in `AuditLog`, and existing employee sessions are revoked.
- Attempt HR Admin resetting a Director account: Verify HTTP 403 refusal (`Access denied: Only SUPER_ADMIN may reset credentials for SUPER_ADMIN or DIRECTOR accounts.`).

---

## 5. Rollback Plan

In the event of an unexpected regression, authentication failure, or deployment blocker:

1. **Immediate Frontend Rollback**:
   - In Vercel / hosting dashboard, promote previous stable deployment to Production alias with 1 click.
2. **Backend Rollback**:
   - Revert commit on host deployment pipeline:
     ```bash
     git revert HEAD
     ```
   - Alternatively, redeploy previous deployment image or build ID from provider dashboard.
3. **Database State Verification**:
   - If database schema or user document states were altered, restore from the pre-deployment snapshot taken in Step 2.
4. **Post-Rollback Audit**:
   - Review server error logs in hosting provider log stream.
   - Inspect `AuditLog` collection for failure causes.

---

## 6. Incident Response: optionalAuth Exposure Remediation & Forensic Runbook

Prior to Group R+ deployment, `optionalAuth` allowed anonymous access to `/api/employees*` if the `Authorization` header was omitted.

> [!IMPORTANT]
> **Forensic Reality Check**: Standard web server and CDN access logs (Cloudflare, Vercel, Nginx, AWS ALB) do **NOT** log HTTP `Authorization` request headers by default for security and PII compliance reasons. Therefore, searching access logs for `Bearer` tokens cannot reliably distinguish authenticated from unauthenticated traffic. Forensic investigation relies directly on **AuditLog** collection records and **MongoDB user data consistency checks**.

### A. MongoDB AuditLog Forensic Queries
Query the database `auditlogs` collection for placeholder actor identities, unexpected role changes, or credential rotations:
1. **Search for Placeholder or System Identities**:
   ```javascript
   db.auditlogs.find({
     $or: [
       { "user.email": "operator@bjkhealthcare.com" },
       { "user.email": "system@bjkhealthcare.com" },
       { "user.name": "Authorized Operator" },
       { "user.name": "System" },
       { "user.id": null, "user.role": "SUPER_ADMIN" },
       { "user.email": "admin@bjkhealthcare.com", "user.id": null }
     ]
   }).sort({ timestamp: -1 });
   ```
2. **Investigate Specific Accounts in AuditLog**:
   ```javascript
   db.auditlogs.find({
     $or: [
       { "user.name": "Dr. Vikram Mehta" },
       { "targetUser.name": "Dr. Vikram Mehta" }
     ]
   }).sort({ timestamp: -1 });
   ```
3. **Review All Role Changes in the Last 90 Days**:
   ```javascript
   db.auditlogs.find({
     action: { $in: ["ROLE_CHANGED", "USER_ROLE_CHANGE"] },
     timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
   }).sort({ timestamp: -1 });
   ```
4. **Review All Password Resets in the Last 90 Days**:
   ```javascript
   db.auditlogs.find({
     action: { $in: ["PASSWORD_RESET", "USER_RESET_PASSWORD", "OWNER_EMERGENCY_PASSWORD_RESET"] },
     timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
   }).sort({ timestamp: -1 });
   ```

### B. User Collection Consistency & Security Audits
Run targeted database queries to detect unauthorized escalations, uninitialized credentials, or suspicious accounts:
1. **Dr. Vikram Mehta Account Inspection**:
   ```javascript
   db.users.find({ name: "Dr. Vikram Mehta" }).pretty();
   ```
2. **Elevated Role Accounts Inventory & Recent Modifications**:
   ```javascript
   db.users.find(
     {
       role: { $in: ["SUPER_ADMIN", "DIRECTOR", "HR_ADMIN", "HR_MANAGER"] },
       $or: [
         { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
         { updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
       ]
     },
     { email: 1, role: 1, name: 1, employeeId: 1, status: 1, isLocked: 1, createdAt: 1, updatedAt: 1 }
   ).sort({ updatedAt: -1 });
   ```
3. **Users Without Permanent Password**:
   ```javascript
   db.users.find(
     {
       $or: [
         { passwordChangedAt: null },
         { passwordChangedAt: { $exists: false } },
         { mustChangePassword: true }
       ]
     },
     { email: 1, role: 1, employeeId: 1, mustChangePassword: 1, passwordChangedAt: 1, status: 1 }
   ).pretty();
   ```

---

## 7. Phased Rollout Sequence (R+ -> Lockout Plan -> R2)

To ensure zero downtime and prevent locking out legitimate users who relied on bypasses, deployments must follow this strict sequence:

### Step 1: Deploy Group R+ to Staging & Verify
1. Deploy Group R+ (Proposal A department scoping, field sanitization, strict audit logging, limiter before protect).
2. Run staging curl tests:
   ```bash
   # 1. Anonymous GET must return 401
   curl -i https://staging-api.bjkhealthcare.com/api/employees
   # Expected: HTTP/1.1 401 Unauthorized

   # 2. Public verification must succeed without auth
   curl -i https://staging-api.bjkhealthcare.com/api/employees/verify-id/TEST_CODE
   # Expected: HTTP/1.1 200 OK (or 404 if test code not found, not 401)

   # 3. Rate limiter on password reset (limiter is BEFORE protect)
   for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://staging-api.bjkhealthcare.com/api/employees/BJK-EMP-001/reset-password; done
   # Expected: Requests 1-10 return HTTP 401 (limiter allows, protect rejects); Requests 11-12 return HTTP 429 Too Many Requests (limiter rejects before protect)
   ```

### Step 2: Deploy Release 1 (Consolidated R+ and R2) to Production
- **Prerequisites Satisfied**: Backup verified (G2-1), incident check clear (G2-4), real admin passwords configured (G2-5), staging smoke tests passed (G2-2).
- **Contents**:
  - Commit R+ (`b12215b`): Role hierarchy, credential management, allow-list projections, strict audit, authenticated credential export.
  - Commit R2 (`09d9be5`): Elimination of production login password bypass (<redacted>) and universal dev password fallback; strict bcrypt authentication.
  - Commit B8 (`f65a38a`): Bulk employee import disabled in production.
  - Fixes T1a & T1b: `PROTECTED_ROLES` expanded to finance/payroll roles; role-name drift resolved with canonical mapping.
- **Security Rationale**: Shipping R+ and R2 together prevents accounts flagged `mustChangePassword: true` from being vulnerable to developer bypass credentials during rollout.

### Step 3: Execute Lockout Mitigation & Staff Resets
- Run the Mongo query from Section 6.B.3 to identify all accounts with `mustChangePassword: true` or missing `passwordChangedAt`.
- For staff requiring credential synchronization, authorized HR/Superadmin triggers password reset via `/api/employees/:id/reset-password`, generating a cryptographically secure 20-character temporary password for secure handoff.
- With Release 1 active, accounts are fully protected by strict bcrypt authentication.

---

## 8. Interim Operational Policies (Documentation Only)

### Policy 1: Password Reset Handling
- **Authorized Operators**: Password resets must be performed exclusively by named `HR_ADMIN` or `SUPER_ADMIN` users.
- **One-Time Display**: Temporary passwords must only be displayed once on the operator's screen upon generation and never re-displayed or stored in unhashed form.
- **Delivery Protocol**: Temporary passwords must be handed off in-person or via authenticated direct phone call. Transmission via plain SMS or unencrypted chat is prohibited.
- **Forced Rotation**: All reset accounts are flagged with `mustChangePassword: true`, forcing immediate credential update on next login.

### Policy 2: Email & Notification Infrastructure
- **Recommendation**: Transactional email (AWS SES or private SMTP) is recommended as the primary communication channel for credential notices.
- **SMS Deferred**: SMS integration should be deferred to a later phase due to mandatory Indian regulatory requirements (DLT registration, Principal Entity registration, header/template scrubbing under TRAI regulations).

### Policy 3: Leave Ledger Migration Sequence
- **Pre-requisite**: Confirm document count in MongoDB Atlas for active employees (`db.employees.countDocuments({ status: "ACTIVE" })`).
- **Execution**: Run owner-controlled leave ledger import (`syncLeaveLedgerFromSeed`) only after verifying employee records exist, ensuring zero orphan balances.
