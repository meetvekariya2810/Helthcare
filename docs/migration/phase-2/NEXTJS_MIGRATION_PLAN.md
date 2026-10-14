# Next.js Migration Plan: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Phase:** Phase 2 (Architecture & Planning — No Code Changes)  
**Status:** PROPOSED FOR OWNER APPROVAL  

---

## 1. Migration Strategy Overview (Option B: Incremental Hybrid)

To guarantee zero downtime and eliminate deployment risk, migration proceeds under **Option B (Incremental Hybrid Migration)**:
1. The existing Express API backend remains operational on its host (or serverless wrapper) to service unmigrated endpoints.
2. Next.js App Router is scaffolded cleanly in `src/app/` on the isolated branch `migration/nextjs`.
3. In Phase 5, pages are migrated in **6 structured waves**, consuming existing API endpoints.
4. In Phase 6, API controller groups are ported one-by-one to Next.js Route Handlers, accompanied by contract compatibility tests verifying identical request/response shapes, status codes, and error formats.
5. Only when contract tests pass 100% does traffic switch from Express to the native Route Handler.

---

## 2. Rebuilt Phase 5 Module Migration Waves (Condition 6)

Based on the real inventory of 100+ routes, 12 department dashboards, 3 portals, and 30 roles, Phase 5 is structured into **6 Sequential Migration Waves** in the strict execution order **1, 3, 2, 4, 6, 5**:

```
[ Wave 1: Auth & Public ] ──> [ Wave 3: Canteen Portal ] ──> [ Wave 2: Employee Portal ]
                                                                       │
[ Wave 5: Pharma Ops ] <── [ Wave 6: Enterprise HRMS ] <── [ Wave 4: 12 Dept Dashboards ]
```

---

### Wave 1: Authentication Suite & Public Verification
- **Priority:** P0 (Highest) | **Risk:** Low | **Estimated Effort:** 3 Days Dev + 1 Day Review (4 Days Total)
- **Target Routes:**
  - `/login` (Director / Admin / Management Login)
  - `/change-password` (Standard Password Reset)
  - `/employee/login` (Dedicated Employee Portal Login)
  - `/employee/change-password` (Permanent Password Setup)
  - `/canteen/login` (Dedicated Canteen Operator Login)
  - `/verify/employee/:employeeCode` (Public QR ID Card Verification)
  - `/verify-id/:code` (Shortcode ID Verification)
- **Key Deliverables:** Public layout, Auth card layout, Session cookies (httpOnly Secure SameSite), SmartRedirect logic.
- **Verification Gate:** Login as each role class (Admin, HR, Employee, Canteen); verify redirect to correct portal layout.

---

### Wave 3: Dedicated Canteen Management Portal (8 Routes)
- **Priority:** P2 (Medium) | **Risk:** Low | **Estimated Effort:** 2 Days Dev + 1 Day Review (3 Days Total)
- **Target Routes:**
  - `/canteen/dashboard` (Live meal counters: Breakfast, Lunch, Dinner)
  - `/canteen/today` (Today's plant headcount breakdown)
  - `/canteen/employees` (Barcode / Employee ID meal verification)
  - `/canteen/daily` (Daily catering summary)
  - `/canteen/monthly` (Monthly meal payroll deductions)
  - `/canteen/department` (Departmental catering cost allocation)
  - `/canteen/export` (ExcelJS meal report export)
  - `/canteen/settings` (Meal service windows & subsidy rates)
- **Key Deliverables:** `CanteenLayout`, barcode scanner input handler, catering Excel export.
- **Verification Gate:** Meal punch logging, real-time counter increment, monthly deduction export.

---

### Wave 2: Dedicated Employee Self-Service Portal (18 Routes)
- **Priority:** P1 (High) | **Risk:** Medium | **Estimated Effort:** 5 Days Dev + 2 Days Review (7 Days Total)
- **Target Routes:**
  - `/employee/dashboard` (KPI cards, active shift, announcements)
  - `/employee/calendar` (Monthly roster & plant holiday schedule)
  - `/employee/profile` (14-tab personal employee profile)
  - `/employee/id-card` (Official digital ID card with QR code)
  - `/employee/attendance` & `/attendance/history` (Punch clock, monthly logs)
  - `/employee/attendance-face` (Camera face biometric verification)
  - `/employee/shift` & `/shift-swap` (Shift timings & peer swap requests)
  - `/employee/leave`, `/leave/apply`, `/leave/requests`, `/leave/balance` (Leave ledger)
  - `/employee/tasks` (Assigned tasks & checklists)
  - `/employee/payroll` & `/payslips` (Payslips & PDF download)
  - `/employee/documents` (Uploaded compliance certificates)
  - `/employee/training` & `/compliance` (Cleanroom GMP enrollments)
  - `/employee/policies` (13 HR policy handbooks & digital sign-offs)
  - `/employee/team` (Colleague directory)
  - `/employee/notifications` & `/announcements` (Workforce communications)
  - `/employee/support` (Helpdesk grievance tickets)
  - `/employee/canteen` (Personal meal history)
  - `/employee/settings` (Profile security preferences)
- **Key Deliverables:** `EmployeeLayout` with responsive mobile bottom navigation bar; role isolation guard.
- **Verification Gate:** Full employee self-service lifecycle: clock-in, leave application, payslip PDF download.

---

### Wave 4: Central Command Center & 12 Department Dashboards
- **Priority:** P1 (High) | **Risk:** Medium | **Estimated Effort:** 4 Days Dev + 2 Days Review (6 Days Total)
- **Target Routes:**
  - `/dashboard` (`DashboardDispatcher` — role-based dynamic dispatch)
  - `/dashboard/hr` (`HRDashboard`)
  - `/dashboard/production` (`ProductionDashboard`)
  - `/dashboard/quality-control` & `/qc` (`QCDashboard`)
  - `/dashboard/quality-assurance` & `/qa` (`QADashboard`)
  - `/dashboard/warehouse` & `/inventory` (`WarehouseDashboard`)
  - `/dashboard/engineering` (`EngineeringDashboard`)
  - `/dashboard/finance` & `/accounts` (`FinanceDashboard`)
  - `/dashboard/procurement` & `/purchase` (`ProcurementDashboard`)
  - `/dashboard/regulatory` (`RegulatoryDashboard`)
  - `/dashboard/sales` & `/crm` (`SalesDashboard`)
  - `/dashboard/microbiology` & `/micro` (`MicrobiologyDashboard`)
  - `/dashboard/facilities` & `/admin` (`FacilitiesDashboard`)
- **Key Deliverables:** `MainLayout` with 30-role responsive sidebar; `DepartmentRoute` guard; KPI cards & Recharts widgets.
- **Verification Gate:** Log in under each of the 12 department manager roles; assert correct dashboard display.

---

### Wave 6: Master Enterprise HRMS Core Operations
- **Priority:** P0 (Highest) | **Risk:** High | **Estimated Effort:** 8 Days Dev + 3 Days Review (11 Days Total)
- **Target Routes:**
  - `/hrms/dashboard` & `/hr` (Workforce Command Center)
  - `/hrms/employees` & `/hr/employees` (Directory with technical/non-technical filters)
  - `/hrms/employees/create` (Quick-add employee form)
  - `/hrms/onboarding` & `/hr/onboarding` (12-stage guided onboarding wizard with draft resume)
  - `/hrms/employees/:id` (Employee 360 profile with 14 tabs)
  - `/hrms/id-cards` & `/hr/id-cards` (Bulk ID card manager & PDF print)
  - `/hrms/attendance` & `/attendance/today` (Muster rolls, punch adjustment)
  - `/hrms/attendance/command-center` (Real-time plant muster telemetry)
  - `/hrms/attendance/reports` (Custom report builder with ExcelJS/CSV)
  - `/hrms/shifts` & `/rostering` (Shift definitions & multi-dept roster)
  - `/hrms/leave` & `/hr/leave` (3-tier approvals: Manager -> Dept Head -> HR)
  - `/hrms/payroll` & `/finance` (Statutory payroll engine: EPF, ESI, PT, TDS, LOP)
  - `/hrms/recruitment` (Job requisitions, candidate pipeline)
  - `/hrms/training` & `/credentials` (Cleanroom GMP licenses & 30/60/90d alerts)
  - `/hrms/assets` & `/expenses` (Cleanroom gear allocation, expense approvals)
  - `/hrms/analytics` (Attrition, absenteeism, overtime spend charts)
  - `/hrms/automation` (Rule triggers & notification automation)
  - `/hrms/compliance` (Labor law compliance & statutory registers)
  - `/hrms/copilot` (13-policy conversational compliance RAG)
  - `/hrms/login-credentials` (Account unlock, credential generation)
  - `/hrms/access-audit` (Login history, IP tracking, failed attempts)
  - `/hr/policies` (13 official policy handbooks)
  - `/hr/disciplinary`, `/posh`, `/maternity`, `/safety`, `/diversity`, `/privacy-security`
  - `/hr/calendar` (Master workforce calendar)
- **Key Deliverables:** 12-stage onboarding wizard, statutory payroll calculation, 3-tier leave approval, bank details masking.
- **Verification Gate:** 12-stage onboarding submission -> 3-tier approval -> payroll calculation match -> payslip PDF generation.

---

### Wave 5: Pharmaceutical Operations & Enterprise Modules
- **Priority:** P1 (High) | **Risk:** High | **Estimated Effort:** 6 Days Dev + 2 Days Review (8 Days Total)
- **Target Routes:**
  - `/operations` (Operations Dashboard)
  - `/factory` (Lavad Plant Units & Cleanrooms)
  - `/production` (Production lines, machines, OEE telemetry)
  - `/quality/qc` (LIMS samples, test results, COA generation)
  - `/quality/qa` (QMS deviations, CAPA, change controls, SOPs)
  - `/regulatory` (Dossier submissions & country compliance)
  - `/inventory` (Raw materials, packaging, stock transfers)
  - `/crm` (Customer inquiries & sales orders)
  - `/export` (International export shipments)
  - `/finance` (Cost centers, operational expenses, invoices)
  - `/documents` (Enterprise document vault)
  - `/products` (111-Product Official Pharmaceutical Catalogue with filters)
  - `/ai` (Platform Operations Knowledge Copilot)
  - `/modules` (Digital Brain master module switchboard)
  - `/audit-logs` (21 CFR Part 11 Electronic Signature Audit Logs)
  - `/admin/database` (Database connection status & collections monitor)
- **Key Deliverables:** Cleanroom batch records, 111-product catalog with fast search/filter, 21 CFR Part 11 audit tables.
- **Verification Gate:** COA generation, deviation creation, product catalog filtering, immutable audit record creation.

---

## 3. Architecture Specifics (Phase 7, Phase 9, Phase 12)

1. **Authentication Architecture (Phase 7):**
   - Retain existing **JWT + bcrypt + RBAC 30-role system**.
   - **Do NOT use Next-Auth**.
   - Session tokens are migrated to **`httpOnly Secure SameSite=Lax` cookies** for seamless SSR and Next.js middleware verification.
2. **File Storage Architecture (Phase 9):**
   - Use **AWS S3** in region **`ap-south-1` (Mumbai)** with a private bucket and presigned URLs.
   - **Do NOT use Vercel Blob**.
3. **Decommission & Cutover Policy (Phase 12):**
   - The standalone Node/Express host remains active as a running fallback during dual-run.
   - **The standalone Express host is retired ONLY after explicit written owner approval.**

---

## 4. Rollback Strategy & Risk Containment

1. **Deployment Isolation:** All changes live exclusively on branch `migration/nextjs` until Phase 12 cutover. Branch `main` remains untouched.
2. **Instant Rollback:**
   - If any critical issue occurs during testing or preview (Phase 11): Vercel traffic points to the existing `main` deployment immediately.
   - If production cutover encounters regressions (Phase 12): Rollback to the previous deployment takes < 30 seconds via Vercel dashboard instant rollback.
3. **Database Safety:**
   - Development and testing are performed exclusively against a staging database (`bjk_healthcare_staging`).
   - Zero destructive database operations: no collection renames, no schema field drops, no index overwrites.
