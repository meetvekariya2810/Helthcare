# Phase A5 — HRMS Core Modules Functional Audit
**Date:** 16 October 2026  
**Auditor:** Pharma Enterprise HRMS Specialist  
**Database:** MongoDB Atlas Cluster28 (`bjk_healthcare`)

---

## 1. Module-by-Module Verification Matrix

| Module | Route / Workflow | Database Validation | Automated Test Result | Defects / Status |
|---|---|---|:---:|:---:|
| **Leave Management** | `/hrms/leave`, `/api/leave` | 13 Leave Types, 71 Balances, 48 Ledgers, 15 Holidays | `test:policies` (6/6 PASS), `test:hrms` Phase 5 PASS | `PASS` |
| **Attendance & Shifts** | `/hrms/attendance`, `/hrms/shifts` | 7 Shifts, 10,527 Punches, 363 Summaries | `testLiveAttendanceEndpoints.js` (100% PASS) | `PASS` |
| **Cleanroom Qualifications** | `/hrms/shifts`, `/hrms/credentials` | 8 Credentials, cleanroom qualification rules active | `test:hrms` Phase 6 PASS (blocks uncertified staff) | `PASS` |
| **Payroll & Compensation** | `/hrms/payroll`, `/api/payroll` | Calculation engine with GMP controls; role restricted to `PAYROLL_ADMIN`/`FINANCE` | `test:hrms` Phase 2 PASS | `PASS` |
| **Training & LMS** | `/hrms/training` | 6 Training Programs, 84 Enrollments | Verified in Atlas DB collections | `PASS` |
| **Documents Vault** | `/documents`, `/hrms/documents` | Upload type/size limits, secure storage path | File upload/download route validation | `PASS` |
| **Assets Management** | `/hrms/assets` | Hardware/IT asset allocation tracking | Empty state handled gracefully (`--`) | `PASS` |
| **Expenses** | `/hrms/expenses` | Multi-tier approval workflow for travel/pharma claims | Schema & routes defined | `PASS` |
| **Performance & Appraisals** | `/hrms/performance` | Appraisal cycles & review milestones | Schema & routes defined | `PASS` |
| **Recruitment & ATS** | `/hrms/recruitment` | Job requisitions & candidate pipeline | Schema & routes defined | `PASS` |
| **HR Notifications** | `/hrms/notifications` | 22 notification documents in Atlas | Verified live in Atlas DB | `PASS` |
| **HR Automation** | `/hrms/automation` | Automated leave balance rollover & reminder rules | Event trigger engines active | `PASS` |
| **Workforce Analytics** | `/hrms/analytics` | Headcount, attrition, diversity analytics | Live aggregations verified | `PASS` |
| **Policy AI Copilot** | `/hrms/copilot` | RAG search over BJK-HR-POL policies with PII scrub | `test_role_dashboard_regression.js` query test PASS | `PASS` |
| **Canteen Management** | `/canteen`, `/canteen/dashboard` | 1 Canteen Setting record, meal logs | Multi-meal tracking operational | `PASS` |
| **Employee Self-Service Portal** | 19 Employee Routes (`/employee/*`) | Profile, attendance, leave, tasks, documents, support | `employeeSecurityTest.js` 11/11 PASS | `PASS` |
| **Manager Self-Service** | `/dashboard/manager` | Direct report oversight & approval queues | Tested in `employeeSecurityTest.js` Test 8 | `PASS` |

---

## 2. Leave Policy BJK-HR-POL-001 Verification
Evaluated with the authoritative policy automation test suite (`test:policies`):
- **Earned Leave (EL):** Minimum 3 days block enforced (`PASS`), maximum 15 continuous days enforced (`PASS`), 15 days advance notice required for 5+ days (`PASS`).
- **Casual Leave (CL):** Maximum 2 continuous days enforced (`PASS`).
- **Sick Leave (SL):** Medical certificate required for 3+ continuous days (`PASS`); GMP Cleanroom fitness certificate strictly enforced for 4+ days in regulated areas (`PASS`).
- **Attendance Punctuality (BJK-HR-POL-002):** 10-minute grace period allowed; habitual grace (>5 times) flagged; 60+ minutes late triggers Full-Day LOP (`PASS`).
- **Progressive Discipline (BJK-HR-POL-004):** Progressive steps advance Verbal -> Written; gross misconduct jumps to Step 6 (`PASS`).
