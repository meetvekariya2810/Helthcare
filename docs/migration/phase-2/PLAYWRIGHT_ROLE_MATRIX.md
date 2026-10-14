# BJK Healthcare — Playwright 30-Role Automated E2E Test Matrix
**Document:** `docs/migration/phase-2/PLAYWRIGHT_ROLE_MATRIX.md`  
**Phase:** Phase 2 (Architecture & Parallel-Safe Planning)  
**Status:** DRAFT SPECIFICATION (Parallel-Safe, Untracked)  

---

## 1. Executive Summary & Objective

BJK Healthcare enforces a strict 30-tier role hierarchy in `server/config/rbac.js`. During the Next.js migration (Wave 1 through Wave 6), Playwright end-to-end (E2E) automated browser testing will validate:
1. **Authentication Redirection & Portal Access:** Each role lands on their designated portal without redirect loops.
2. **Sidebar & Menu Visibility:** Sub-menus and action buttons render only when permitted by the role hierarchy.
3. **Data Scoping & Masking:** Managers only see department data; Finance sees salary; Employees only see self-records; Aadhaar, PAN, and Bank details are masked.
4. **Action Authorization:** Buttons for password reset, role escalation, payroll batch deletion, and batch release trigger 403 or remain hidden for unauthorized roles.

---

## 2. The 30 Roles Access & Assertion Matrix

| # | Role Key | Hierarchy Rank | Allowed Portal Layout | Primary Landing Page | Critical E2E Assertions & Restrictions |
|---|---|:---:|---|---|---|
| 1 | `SUPER_ADMIN` | 1 | `(dashboard)` | `/dashboard` | Unrestricted global access; can reset any role including PROTECTED_ROLES; sees all 12 dept tabs |
| 2 | `DIRECTOR` | 2 | `(dashboard)` | `/dashboard` | Executive overview, financial reporting, read-only audit logs; cannot self-reset |
| 3 | `VP_OPERATIONS` | 3 | `(dashboard)` | `/dashboard/operations` | Operations & factory overview, plant headcount, high-level batch approvals |
| 4 | `PLANT_HEAD` | 4 | `(dashboard)` | `/dashboard/production` | Plant-level production overview, shift schedules, muster roll review |
| 5 | `PRODUCTION_HEAD` | 5 | `(dashboard)` | `/dashboard/production` | Batch release staging, equipment logs, manufacturing formula access |
| 6 | `QA_HEAD` | 6 | `(dashboard)` | `/dashboard/quality-assurance` | Master batch record review, deviations, CAPA approvals, audit trails |
| 7 | `QC_HEAD` | 7 | `(dashboard)` | `/dashboard/quality-control` | Laboratory information management (LIMS), certificate of analysis approvals |
| 8 | `RA_HEAD` | 8 | `(dashboard)` | `/dashboard/regulatory` | Regulatory filings, WHO-GMP dossier tracking, drug master file access |
| 9 | `SUPPLY_CHAIN_HEAD`| 9 | `(dashboard)` | `/dashboard/warehouse` | Inventory valuation, material requisition approvals, supplier audit |
| 10| `ENGINEERING_HEAD` | 10 | `(dashboard)` | `/dashboard/engineering` | HVAC cleanroom calibration, plant maintenance schedule, breakdown logs |
| 11| `HR_HEAD` | 11 | `(dashboard)` | `/dashboard/hr` | Full HRMS command center, policy approvals, headcount analytics |
| 12| `IT_ADMIN` | 12 | `(dashboard)` | `/dashboard/admin/database` | User directory management, system health, session telemetry; PROTECTED_ROLE |
| 13| `HR_ADMIN` | 13 | `(dashboard)` | `/hrms/dashboard` | 12-stage onboarding, leave approvals, salary structure edits; cannot touch PROTECTED_ROLES |
| 14| `FINANCE_MANAGER` | 14 | `(dashboard)` | `/dashboard/finance` | Full payroll gross-to-net calculations, bank disbursements, EPF/ESI exports; PROTECTED_ROLE |
| 15| `HR_MANAGER` | 15 | `(dashboard)` | `/hrms/employees` | Employee 360 review, attendance regularization, leave approvals; salaries masked |
| 16| `PRODUCTION_MANAGER`| 16 | `(dashboard)` | `/production` | Work orders, line clearance checklists, batch progress tracking |
| 17| `QA_MANAGER` | 17 | `(dashboard)` | `/quality/qa` | In-process quality checks, batch sampling, line clearance sign-off |
| 18| `QC_MANAGER` | 18 | `(dashboard)` | `/quality/qc` | Stability testing, HPLC/UV lab test entry, sample disposition |
| 19| `MICROBIOLOGY_HEAD` | 19 | `(dashboard)` | `/dashboard/microbiology` | Cleanroom air particle counts, water testing, sterility validation |
| 20| `AUDITOR` | 20 | `(dashboard)` | `/dashboard/audit-logs` | Read-only immutable access to AuditLog, 21 CFR Part 11 electronic records; PROTECTED_ROLE |
| 21| `PRODUCTION_SUPERVISOR`| 21 | `(dashboard)` | `/production` | Operator shift assignments, line attendance, raw material issue |
| 22| `QA_OFFICER` | 22 | `(dashboard)` | `/quality/qa` | Packaging verification, batch record physical check, swab testing |
| 23| `QC_ANALYST` | 23 | `(dashboard)` | `/quality/qc` | Assay test results, raw material testing, reference standard logging |
| 24| `STORE_EXECUTIVE` | 24 | `(dashboard)` | `/inventory` | GRN creation, dispensing verification, quarantine/approved bins |
| 25| `MAINTENANCE_ENGINEER`| 25 | `(dashboard)` | `/engineering` | Equipment PM tickets, breakdown log entry, calibration logs |
| 26| `OPERATOR` | 26 | `(employee)` | `/employee/dashboard` | Personal muster roll, assigned machine log, personal leave/payslips |
| 27| `CANTEEN_ADMIN` | 27 | `(canteen)` | `/canteen/dashboard` | Meal kiosk operation, barcode scans, catering monthly billing |
| 28| `CANTEEN_STAFF` | 28 | `(canteen)` | `/canteen/dashboard` | Barcode scanning kiosk, live meal punch logging only |
| 29| `HR_EXECUTIVE` | 29 | `(dashboard)` | `/hrms/attendance` | Daily muster check, biometric sync trigger, document upload assist |
| 30| `EMPLOYEE` | 30 | `(employee)` | `/employee/dashboard` | Strictly self-records: personal leave, attendance, payslips, profile |

---

## 3. Automated Playwright Test Suite Structure

```
tests/e2e/
├── fixtures/
│   ├── authFixtures.ts       # Seeds & manages 30 authenticated test session cookies
│   └── testData.ts           # Clean test dataset (mock employee, mock department)
├── suites/
│   ├── 01_auth_redirects.spec.ts  # Validates all 30 roles land on correct portal
│   ├── 02_sidebar_security.spec.ts# Validates route & navigation visibility per role
│   ├── 03_data_scoping.spec.ts    # Validates department isolation (HR, Prod, QC, Employee)
│   ├── 04_pii_masking.spec.ts     # Validates bank, Aadhaar, PAN masking per role
│   ├── 05_payroll_guards.spec.ts  # Validates only FINANCE_MANAGER & SUPER_ADMIN see salaries
│   └── 06_action_security.spec.ts # Validates reset, role change, batch delete refusal
```

---

## 4. Spec Example: Data Scoping & Masking Assertion

```typescript
// tests/e2e/suites/04_pii_masking.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsRole } from '../fixtures/authFixtures';

test.describe('Role-Based PII Masking & Data Scoping', () => {

  test('HR_MANAGER can view employee details but compensation & banking is masked', async ({ page }) => {
    await loginAsRole(page, 'HR_MANAGER');
    await page.goto('/hrms/employees/BJK-EMP-001');

    // Name and department are visible
    await expect(page.locator('[data-testid="employee-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="employee-department"]')).toBeVisible();

    // Banking number is masked: XXXXXX1234
    const bankText = await page.locator('[data-testid="bank-account"]').innerText();
    expect(bankText).toMatch(/^XXXXXX\d{4}$/);

    // Salary info is completely hidden / rendered as '--'
    const salaryText = await page.locator('[data-testid="gross-salary"]').innerText();
    expect(salaryText).toBe('--');
  });

  test('FINANCE_MANAGER can view compensation structure but PII is masked', async ({ page }) => {
    await loginAsRole(page, 'FINANCE_MANAGER');
    await page.goto('/hrms/employees/BJK-EMP-001');

    // Salary is visible for statutory calculation
    await expect(page.locator('[data-testid="gross-salary"]')).not.toHaveText('--');

    // PAN is masked: ABCDE****F
    const panText = await page.locator('[data-testid="pan-number"]').innerText();
    expect(panText).toMatch(/^[A-Z]{5}\*{4}[A-Z]$/);
  });

  test('EMPLOYEE can only access personal profile and cannot load another employee', async ({ page }) => {
    await loginAsRole(page, 'EMPLOYEE');
    // Attempting to access another employee's profile
    const response = await page.goto('/employee/profile?employeeId=BJK-EMP-099');
    expect(response?.status()).toBe(403);
  });
});
```
