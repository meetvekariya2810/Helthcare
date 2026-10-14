# Migration Risk Register: BJK Healthcare Digital Brain

This register tracks all identified technical challenges, inconsistencies, and risks (P1–P38) throughout the migration lifecycle.

**Classification Scheme (Master Prompt Section 2G):**
- **VERIFIED (observation):** Static code analysis, schema, or architecture finding confirmed in repository.
- **SYNTAX VERIFIED:** Node syntax (`node --check`) validated without error.
- **TESTED:** Automated test of that specific behaviour passed in test runner.
- **FIXED IN CODE (NOT DEPLOYED):** Resolved in local commits on `hotfix/security`, not yet pushed or deployed to production.
- **DEPLOYED AND VERIFIED:** Deployed to production host and confirmed by system owner.
- **IMPLEMENTED NOT VERIFIED:** Code implementation exists, but full operational or regulatory verification is pending.
- **BLOCKED:** Blocked by upstream gate, prerequisite, or owner action.
- **NOT IMPLEMENTED:** Known requirement intentionally scheduled for subsequent phases.
- **REQUIRES OWNER APPROVAL:** Requires explicit confirmation from project owner before proceeding.

---

## Known Problems & Risk Register (P1–P38)

| ID | Issue / Risk | Severity | Target Phase | Verified Code Evidence | Status |
|---|---|---|---|---|---|
| **P1** | `vercel.json` SPA catch-all `/(.*)` -> `/index.html` swallows Next.js routes | High | Phase 11 | Confirmed in root `vercel.json` (lines 22-24). | `NOT IMPLEMENTED` (Target Phase 11) |
| **P2** | `api/index.js` serverless function wrapper unverified; 30s timeout | High | Phase 2, 6 | Confirmed in `api/index.js` & `api/handler.cjs`. 30s limit in `vercel.json`. | `VERIFIED (observation)` |
| **P3** | Repository directory name `BJK HELTHCARE` has space and typo | Medium | Phase 2 | Confirmed on disk. Proposal for `git mv` scheduled for Phase 3. | `REQUIRES OWNER APPROVAL` |
| **P4** | Dependencies split across root, client, server; duplicated dep/devDep | Medium | Phase 4 | Confirmed: Root has no lockfile; client/server have isolated lockfiles. | `NOT IMPLEMENTED` (Target Phase 4) |
| **P5** | Duplicate Mongoose indexes on Employee & Onboarding | Low | Phase 7 | Schema declarations identified in `Employee.js` & `OnboardingApplication.js`. | `NOT IMPLEMENTED` (Target Phase 7) |
| **P6** | Hostname / credentials exposure risk | High | Phase 0, 3 | History scan verified: spreadsheets added in commit `ee66879282a1`. Live Atlas host in `README.md:L73`. | `BLOCKED` (Pending G5 Git Purge) |
| **P7** | Auth token in localStorage; browser APIs break SSR | High | Phase 5, 7 | Confirmed: `localStorage` used extensively in `authStorage.js`, `api.js`. | `NOT IMPLEMENTED` (Target Phase 5/7) |
| **P8** | React Router v6 conversion to Next.js App Router | High | Phase 2, 5 | Confirmed: 1,240 lines in `App.jsx`, 100+ routes inventoried. | `NOT IMPLEMENTED` (Target Phase 5) |
| **P9** | `VITE_API_URL` invalid in Next.js environment | Medium | Phase 4, 11 | Confirmed: `VITE_API_URL` in `services/api.js` and `.env.example`. | `NOT IMPLEMENTED` (Target Phase 4) |
| **P10** | Cross-origin CORS & cookies across hosts (Option B) | High | Phase 6, 7 | Confirmed: `server.js` allows credentials with origin whitelist. | `NOT IMPLEMENTED` (Target Phase 6/7) |
| **P11** | API calls receiving HTML instead of JSON | Medium | Phase 6 | Confirmed: Caused by SPA rewrite `/(.*)` when API 404s. | `NOT IMPLEMENTED` (Target Phase 6) |
| **P12** | MongoDB connection storms in serverless runtime | High | Phase 7 | Confirmed: `db.js` sets maxPoolSize=10 in serverless, but lacks Next.js global cache. | `NOT IMPLEMENTED` (Target Phase 7) |
| **P13** | In-memory fallback DB masking live DB failures | High | Phase 7 | `db.js` checks `ALLOW_MEMORY_FALLBACK=true`. Must disable in prod. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P14** | Seed and test scripts could accidentally execute against production | Critical | Phase 0, 3, 10 | Resolved via `safetyGuards.js` production database block. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P15** | Multer local disk storage ephemeral on Vercel | High | Phase 9 | Confirmed: `employeeDocumentRoutes.js` uses `multer.diskStorage`. | `BLOCKED` (Requires Storage Provider Approval) |
| **P16** | PDFKit / ExcelJS / DOCX require Node runtime | High | Phase 9 | Confirmed: `pdfService.js`, `excelReportService.js`, `generateMasterDoc.js`. | `NOT IMPLEMENTED` (Target Phase 9) |
| **P17** | Background jobs/alerts cannot execute in serverless requests | High | Phase 9 | Confirmed: No active `node-cron` daemon; `/run-eval` is on-demand HTTP endpoint. | `BLOCKED` (Requires Scheduler Approval) |
| **P18** | Function duration limits (payroll processing, bulk exports) | High | Phase 6, 9 | Confirmed: 30s limit in `vercel.json`; heavy Excel reports need streaming. | `NOT IMPLEMENTED` (Target Phase 6/9) |
| **P19** | Atlas network access whitelist vs Vercel dynamic IPs | High | Phase 11 | Confirmed: Requires least-privilege DB user & documented IP setup. | `BLOCKED` (Owner Action at G2) |
| **P20** | Role definitions in documentation differ from code | High | Phase 1, 7 | Resolved: Code has 30 canonical roles in `rbac.js`. Numerical hierarchy enforced. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P21** | Route protection only in UI guards (need server-side checks) | High | Phase 7, 10 | Server-side `requireRole` and `requirePermission` enforced across route files. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P22** | Sensitive employee data exposure (Aadhaar, PAN, Bank) | Critical | Phase 7, 8, 10 | Resolved via `sanitizeForManager` & `sanitizeForFinance` allow-lists. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P23** | Hydration errors and visual design drift | Medium | Phase 5 | Visual parity checks at 375px, 768px, 1440px planned per module. | `NOT IMPLEMENTED` (Target Phase 5) |
| **P24** | SEO & public URLs for 111-product pharmaceutical catalogue | Medium | Phase 5 | Confirmed: 111 products in `seed/products.json` & `/products` page. | `NOT IMPLEMENTED` (Target Phase 5) |
| **P25** | Unverified claims of 21 CFR Part 11 / WHO-GMP compliance | Medium | Phase 1, 8 | Electronic signature audit logs exist in `AuditLog.js`; strict audit failure blocks mutation. | `IMPLEMENTED NOT VERIFIED` |
| **P26** | Node version and build parameters unpinned | Medium | Phase 4, 11 | Confirmed: No `engines` field in package.json. Pinning planned for Phase 3. | `NOT IMPLEMENTED` (Target Phase 3) |
| **P27** | Conflicting backend deployment models (Render vs Vercel) | High | Phase 2 | Confirmed: Dual documentation. Retaining existing Express backend. | `REQUIRES OWNER APPROVAL` |
| **P28** | Document inconsistencies (onboarding steps, report endpoints) | Medium | Phase 1 | Confirmed: 12 onboarding steps in stepper; report endpoints resolved from code. | `VERIFIED (observation)` |
| **P29** | Pharmaceutical operations modules claimed but not evidenced | High | Phase 1, 8 | Confirmed: Production, QC, QA, Regulatory, CRM, Export all exist in code. | `VERIFIED (observation)` |
| **P30** | Credential spreadsheets committed in Git history | Critical | Phase 2, 3 | Spreadsheets in historical commit `ee66879282a1` on `main`. | `BLOCKED` (Pending G5 Git Purge) |
| **P31** | Hardcoded fallback JWT secrets in auth & middleware | Critical | Phase 3, 7 | Fail-fast validation in `auth.js`, `authController.js`, `requiredEnv.js`. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P32** | Default seed & migration passwords across scripts | High | Phase 3, 7 | Default password bypass eliminated; `generateSecureRandomPassword(20)` used. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P33** | `server.js` auto-init block runs on non-Vercel cold start | High | Phase 2, 3 | Auto-init disabled in production; requires explicit `ENABLE_AUTO_INIT=true` in non-prod. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P34** | Codebase scope substantially larger than documented | Medium | Phase 2, 5 | Confirmed: 100+ routes, 30 roles, 97 models, 66 controllers, 20 services. | `VERIFIED (observation)` |
| **P35** | Admin and system accounts reset to shared default password on every boot | Critical | Phase 2, 3 | Auto-init disabled in production; scripts guarded against production DB. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P36** | Boot-time data dependencies unknown | High | Phase 3, 4 | Resolved: Leave master, catalog, shifts safely guarded against production writes. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P37** | Reset and wipe endpoints unreviewed | High | Phase 3, 6 | `/api/canteen/reset-all-data` guarded with `ENABLE_CANTEEN_RESET` + SUPER_ADMIN + token. | `FIXED IN CODE (NOT DEPLOYED)` |
| **P38** | Password rotation not yet done (owner action) | Critical | Phase 3 | Historical commits and seed default passwords require owner-run rotation. | `BLOCKED` (Pending Owner at G4) |
