# BJK HEALTHCARE HRMS — COMPREHENSIVE CODEBASE & ARCHITECTURAL AUDIT

**System:** BJK Healthcare Digital Brain — Enterprise HR Command Center  
**Database:** Single Source of Truth — MongoDB Atlas (`bjk_healthcare`)  
**Auditor / Lead:** Enterprise HRMS Architect, Security Engineer & QA Lead  
**Audit Status:** Active Production Readiness Verification  

---

## 1. System Inventory Summary

| Functional Subsystem | Backend Controller / Service | Frontend Route & Component | Database Model / Collection | Operational Status |
| :--- | :--- | :--- | :--- | :---: |
| **Authentication & Sessions** | `authController.js`, `protect`, `requireRole` | `/login`, `Login.jsx` | `User`, `UserSession`, `LoginActivity` | **WORKING** |
| **HR Command Center** | `hrController.js` (`/api/hr/stats`) | `/hr`, `/hrms`, `HRDashboard.jsx` | `Employee`, `Department`, `OnboardingApplication` | **WORKING** |
| **Employee Directory** | `hrController.js`, `employeeController.js` | `/hr/employees`, `Employees.jsx` | `Employee` (542-line enterprise model) | **WORKING** |
| **Employee 360 Profile** | `hrController.js` (`getEmployeeById`) | `/hr/employees/:id`, `EmployeeProfile.jsx` | `Employee`, `LeaveBalance`, `AuditLog` | **WORKING** |
| **11-Step Onboarding** | `onboardingController.js` (`/api/hr/onboarding`) | `/hr/onboarding`, `Onboarding.jsx` | `OnboardingApplication`, `Employee` | **WORKING** |
| **Attendance & Punch** | `attendanceController.js` (`/api/hrms/attendance`) | `/hrms/attendance`, `Attendance.jsx` | `Attendance` | **WORKING** |
| **Shift & Rostering** | `shiftController.js`, `rosterController.js` | `/hrms/shifts`, `/hrms/rostering`, `Shifts.jsx` | `Shift`, `Roster` | **WORKING** |
| **Leave Management** | `leaveController.js`, `leaveService.js` | `/hrms/leave`, `LeaveManagement.jsx` | `LeaveType`, `LeavePolicy`, `LeaveBalance`, `LeaveRequest` | **WORKING** |
| **Payroll Processing** | `payrollController.js` (`/api/hrms/payroll`) | `/hrms/payroll`, `Payroll.jsx` | `Payroll` | **WORKING & RESTRICTED** |
| **Training & cGMP LMS** | `trainingController.js`, `credentialController.js` | `/hrms/training`, `/hrms/credentials`, `Training.jsx` | `Training`, `Credential` | **WORKING** |
| **Document Vault** | `documentController.js`, `pdfService.js` | `/hrms/documents`, `Documents.jsx` | `Document` | **WORKING** |
| **Assets & Equipment** | `assetExpenseController.js` | `/hrms/assets`, `Assets.jsx` | `Asset` | **WORKING** |
| **Expense Reimbursement** | `assetExpenseController.js` | `/hrms/expenses`, `Expenses.jsx` | `Expense` | **WORKING** |
| **Performance Reviews** | `performanceController.js` | `/hrms/performance`, `Performance.jsx` | `Performance` | **WORKING** |
| **Recruitment & ATS** | `recruitmentController.js` | `/hrms/recruitment`, `Recruitment.jsx` | `Recruitment` | **WORKING** |
| **Employee Self-Service** | `hrmsRoutes.js` (`/api/hrms/me`) | `/hrms/me`, `EmployeeSelfService.jsx` | `Employee`, `LeaveBalance`, `Attendance` | **WORKING** |
| **Manager Self-Service** | `hrmsRoutes.js` (`/api/hrms/manager`) | `/hrms/manager`, `ManagerSelfService.jsx` | Scoped subordinates query via `dataScopeService.js` | **WORKING** |
| **Reports & Registers** | `reportController.js`, `pdfService.js` | `/hrms/analytics`, `HRAnalytics.jsx` | Form 25 muster, census, document expiry | **WORKING** |
| **HR Notification Center** | `notificationController.js` | `/hrms/notifications`, `HRNotifications.jsx` | `HRNotification` | **WORKING** |
| **AI HR Copilot** | `copilotController.js` (`/api/hrms/copilot`) | `/hrms/copilot`, `HRAICopilot.jsx` | RBAC-filtered knowledge chunks & personnel stats | **WORKING** |
| **21 CFR Part 11 Audit** | `auditRoutes.js`, `auditRoutes.js` | `/audit-logs`, `/hr/audit-logs`, `AuditLogs.jsx` | `AuditLog` (Immutable cryptographic records) | **WORKING** |
| **HR Automation Rules** | `automationController.js` | `/hrms/automation`, `HRAutomation.jsx` | `HRAutomationRule` | **WORKING** |
| **HR Settings & Policy** | `hrController.js` | `/hr/settings`, `/hrms/settings`, `HRSettings.jsx` | Enterprise policies, shift parameters, holiday calendar | **WORKING** |

---

## 2. In-Depth Component & Architecture Status

### 2.1 Existing HR Pages (`client/src/pages/hrms/` and `client/src/pages/`)
* **`HRDashboard.jsx`**: **WORKING** — Master HR Command Center supporting dynamic persona switching (Super Admin, HR Manager, Plant Manager, Employee). Displays workforce headcount, real-time presence gauges, onboarding pipelines, and compliance alert cards.
* **`Employees.jsx`**: **WORKING** — Data table with debounced search, multiple filters (Department, Designation, Location, Status, Employment Type), pagination, sorting, status badges, and direct navigation to 360 profile.
* **`EmployeeProfile.jsx`**: **WORKING** — Comprehensive 360 profile containing 14 tabs: Overview, Personal, Employment, Previous Employment, Education, Family, Address, Bank Details (Protected PII), Identity Documents, Compliance Training, Attendance Muster, Leaves Ledger, Payroll History, and 21 CFR Part 11 Audit Trail.
* **`Onboarding.jsx`**: **WORKING** — 11-step guided wizard with Save Draft, Auto-Save, Resume, Client & Server Validation, Completion Progress Counter, and Multi-Tier Approval workflow.
* **`Attendance.jsx`**: **WORKING** — Daily muster, monthly calendar grid, web clock-in/out, GPS breadcrumb playback, break-time telemetry, overtime calculation, and absent regularizations.
* **`Shifts.jsx` & `Rostering.jsx`**: **WORKING** — Shift scheduling, day/night shift differentials, cleanroom qualification cross-checking, and drag-and-drop roster management.
* **`LeaveManagement.jsx`**: **WORKING** — Multi-category leave engine (CL, SL, EL, PL, ML, Comp-off) with automated holiday calendar deduction, 2-tier approval workflow (Manager → HR), and balance ledgers.
* **`Payroll.jsx`**: **WORKING & RESTRICTED** — Gross-to-net salary breakdown (Basic, HRA, Allowances, EPF 12%, ESI, PT, TDS, LOP) with streaming PDF payslip generation. Restricted strictly to `PAYROLL_ADMIN` and `SUPER_ADMIN`.
* **`Training.jsx` & `Credentials.jsx`**: **WORKING** — cGMP Schedule M & US-FDA 21 CFR 211 training matrix with automated 90/60/30-day expiration alerts and cleanroom qualification gatekeeping.

---

## 3. Database Schema & Indexing Validation

* **Single Source of Truth:** `bjk_healthcare` MongoDB Atlas database.
* **Models Tested & Verified:**
  * `User`: Password hashing via bcrypt, failed login tracking, lockout threshold.
  * `Employee`: Comprehensive 542-line enterprise schema with strict data validation.
  * `OnboardingApplication`: Progressive step storage, completion percentage, multi-stage verification flags.
  * `LeaveType`, `LeavePolicy`, `HolidayCalendar`, `LeaveBalance`, `LeaveRequest`: 10 statutory leave categories with automatic accrual and balance tracking.
  * `Attendance`: Punch types (BIOMETRIC, WEB, MOBILE_GPS), grace period calculation, regularization requests.
  * `Shift`, `Roster`: Cleanroom shift definitions and employee assignments.
  * `AuditLog`: 21 CFR Part 11 compliant audit trail recording actor, role, IP address, timestamp, previous state, and new state.

---

## 4. Technical Debt & Cleanup Identified

1. **Duplicate Schema Indexes:**
   * *Finding:* Duplicate index declarations in `Employee.js` and `OnboardingApplication.js` (both inline `unique: true` and explicit `schema.index()`).
   * *Status:* Cleanup scheduled to eliminate Mongoose runtime duplicate index warnings.
2. **PII Masking Verification:**
   * *Finding:* Sensitive bank account numbers and Aadhaar numbers are masked in standard API projections.
   * *Status:* Field-level authorization confirmed: only `PAYROLL_ADMIN` and `SUPER_ADMIN` receive unmasked financial details.
3. **Cleanroom Staffing Gatekeeper:**
   * *Finding:* Qualification checks prior to shift assignment.
   * *Status:* Validated in `server/services/hrms/rosterService.js` and `shiftController.js`.
