# Phase A2 — Security Gate for Go-Live (Mandatory)
**Date:** 16 October 2026  
**Auditor:** Enterprise Security Auditor & Pharma Compliance Specialist  
**Gate Status:** **FAIL / NO-GO (P0 Blockers Active)**

---

## 1. Security Verification Matrix

| Security Control | Required Standard | Audited Real Status | Status | Evidence / Notes |
|---|---|---|:---:|---|
| **Credential Rotation** | All passwords in exposed spreadsheets must be rotated before employee onboarding | Owner Switch: `CREDENTIALS_ROTATED = NO` | **`FAIL` (P0)** | **Release Blocker.** Default credentials exist in exposed master files. Employees must not be onboarded until rotated. |
| **Git History Purge** | Historical commits containing credentials must be purged from repo history | Commits `ee66879` and `20a42cf` contain spreadsheet files. Switch: `G5_HISTORY_PURGED = NO` | **`FAIL` (P0)** | **Release Blocker.** `git-filter-repo` runbook prepared in `docs/migration/OWNER_ACTIONS_REQUIRED.md §2`. Awaiting owner execution. |
| **JWT Secret Strength** | 64-char cryptographically random hex key | Generated in `.env`: `5082de583bef5f886cc1aebc0630d0e31d7b1755fc62b71784ab3340630f55e9` | `PASS` | No fallback placeholder secrets in production. |
| **Token Expiry** | Bounded expiration with short session for temp auth | Regular: `1d` / Temp auth: `1h` | `PASS` | Configured in `EmployeeAuthController.js` and `authController.js`. |
| **Password Hashing** | Bcrypt with work factor >= 10 | Bcrypt work factor 10 applied on all user & employee records | `PASS` | Verified via `User.js` pre-save hook and `bcrypt.compare`. |
| **Rate Limiting & Lockout** | Brute force defense & account lock after repeated failures | `express-rate-limit` active; 5 failed logins locks account for 15m | `PASS` | Verified in `authController.js` and `test_first_time_password_change.js`. |
| **Forced Password Change** | Mandatory temp password rotation before accessing protected APIs | `mustChangePassword: true` enforced on first login | `PASS` | Verified in `test_first_time_password_change.js` (15/15 passed). |
| **Server-Side RBAC** | Strict role permissions covering 30 canonical roles | `config/rbac.js` defines role-permission matrix; middleware `protect` & `authorize` | `PASS` | Verified in `test:hrms` and `employeeSecurityTest.js`. |
| **IDOR Protection** | Employee A cannot view or modify Employee B | Verified in `employeeSecurityTest.js` (Test 6: EMP001 requesting EMP002 blocked 403) | `PASS` | Verified with automated security suite. |
| **PII Masking** | Bank account, Aadhaar, PAN masked in API responses | Bank: `XXXXXX1234`, Aadhaar: `XXXX-XXXX-9012`, PAN: `ABCDE****F` | `PASS` | Tested in `test:hrms` Phase 4 and `testHRGuidedOnboarding.js`. |
| **Payroll Access Control** | Strictly restricted to `PAYROLL_ADMIN`, `FINANCE_MANAGER`, `SUPER_ADMIN` | `payrollRoutes.js` and `EmployeePayrollController.js` enforce strict role guard | `PASS` | Standard employees barred from payroll ledger modifications. |
| **AI Copilot Redaction** | No PII or raw financial secrets leaked into AI prompts | Sanitization layer scrubs Aadhaar, PAN, and salary fields prior to LLM submission | `PASS` | Verified in `HRAICopilot` service. |
| **Secure Headers** | Helmet protection on HTTP headers | `helmet()` active; nosniff, frameguard DENY | `PASS` | Verified in `server.js` and `vercel.json`. |
| **Upload File Security** | File type whitelist and max size limit (10MB) | Multer middleware restricts MIME types to PDF/JPG/PNG; size limit 10MB | `PASS` | Verified in upload routes. |
| **NPM Audit Vulnerabilities** | Zero critical vulnerabilities in production dependencies | 5 vulnerabilities in dev dependencies (`nodemon`/`chokidar` and `exceljs`/`uuid`) | `PASS` | Non-exploitable in production bundle; dev dependencies isolated. |

---

## 2. P0 Security Blockers Summary

1. **Exposed Credentials (`DEF-01`):**
   - The master credentials spreadsheets remain in historical commits `ee66879` and `20a42cf` and were present in local directories.
   - The owner switch is explicitly set to `CREDENTIALS_ROTATED = NO`.
   - **Verdict:** Go-live cannot proceed until the system owner executes the credential rotation checklist and completes the mirror clone history purge.
