# Route and Feature Inventory: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Audit Mode:** Static Codebase Audit (Phase 1)  
**Source File:** `BJK HELTHCARE/client/src/App.jsx` (1,240 Lines)  

---

## 1. Public & Authentication Routes

| Path | Component | Access / Guard | Target Next.js Route | Notes |
|---|---|---|---|---|
| `/login` | `Login` | Public | `src/app/(auth)/login/page.tsx` | Main portal login |
| `/change-password` | `ChangePasswordPage` | Public / Token | `src/app/(auth)/change-password/page.tsx` | Password change |
| `/employee/change-password` | `ChangePasswordPage` | Public / Token | `src/app/(auth)/employee/change-password/page.tsx` | First-time password change |
| `/employee/login` | `EmployeeLogin` | Public | `src/app/(auth)/employee/login/page.tsx` | Dedicated employee login |
| `/canteen/login` | `CanteenLogin` | Public | `src/app/(auth)/canteen/login/page.tsx` | Canteen portal login |
| `/verify/employee/:employeeCode`| `PublicEmployeeVerification` | Public | `src/app/(public)/verify/employee/[employeeCode]/page.tsx` | Public QR ID card verification |
| `/verify-id/:code` | `PublicEmployeeVerification` | Public | `src/app/(public)/verify-id/[code]/page.tsx` | Shortcode ID verification |

---

## 2. Dedicated Employee Self-Service Portal (`/employee/*`)
*Guard: `EmployeeProtectedRoute` -> Layout: `EmployeeLayout`*

| Route Path | Component | Description / Features |
|---|---|---|
| `/employee/dashboard` | `EmployeeDashboard` | Attendance KPI, balance card, active shift, announcement feed |
| `/employee/calendar` | `EmployeeCalendarPage` | Monthly schedule, shift timings, plant holidays |
| `/employee/profile` | `EmployeeProfilePage` | Personal details, PF/ESI numbers, bank information |
| `/employee/id-card` | `EmployeeIDCardPage` | Official digital ID card with verifiable QR code |
| `/employee/attendance` | `EmployeeAttendancePage` | Web punch clock, monthly punch history, regularization requests |
| `/employee/attendance-face` | `EmployeeFaceAttendancePage`| Biometric camera capture & face verification |
| `/employee/shift` | `EmployeeShiftPage` | Assigned shift details & peer shift swap requests |
| `/employee/leave` | `EmployeeLeavePage` | Leave ledger (PL/CL/SL/Comp-Off), balance cards, application form |
| `/employee/tasks` | `EmployeeTasksPage` | Assigned operational & departmental tasks |
| `/employee/payroll` | `EmployeePayrollPage` | Monthly salary slip breakdown, tax deductions, PDF download |
| `/employee/documents` | `EmployeeDocumentsPage` | Uploaded certificates, employment contracts, ID proofs |
| `/employee/training` | `EmployeeTrainingPage` | GMP cleanroom certifications, safety enrollments |
| `/employee/policies` | `EmployeePoliciesPage` | 13 official HR policy handbooks & digital acknowledgments |
| `/employee/team` | `EmployeeTeamPage` | Department colleagues, supervisor contacts |
| `/employee/notifications` | `EmployeeCommunicationPage`| System notifications & company announcements |
| `/employee/support` | `EmployeeSupportPage` | Helpdesk grievance submissions & ticket tracking |
| `/employee/canteen` | `EmployeeCanteenPage` | Meal punch history & dietary allowance tracking |
| `/employee/settings` | `EmployeeSettingsPage` | Security preferences, profile settings |

---

## 3. Dedicated Canteen Portal (`/canteen/*`)
*Guard: `CanteenProtectedRoute` -> Layout: `CanteenLayout`*

| Route Path | Component | Description / Features |
|---|---|---|
| `/canteen/dashboard` | `CanteenDashboard` | Real-time meal counter (Breakfast, Lunch, Dinner), live scan feed |
| `/canteen/today` | `CanteenDashboard` | Today's headcount breakdown by shift and department |
| `/canteen/employees` | `CanteenDashboard` | Barcode & employee ID meal verification search |
| `/canteen/daily` | `CanteenDashboard` | Daily meal summaries for catering reconciliation |
| `/canteen/monthly` | `CanteenDashboard` | Monthly employee meal deductions for payroll |
| `/canteen/department`| `CanteenDashboard` | Departmental catering cost allocation |
| `/canteen/export` | `CanteenDashboard` | ExcelJS meal report export |
| `/canteen/settings` | `CanteenDashboard` | Meal timing windows & rate configuration |

---

## 4. Central Department RBAC Dashboards (`/dashboard/*`)
*Guard: `ProtectedRoute` -> `DepartmentRoute`*

| Route Path | Component | Department | Allowed Roles |
|---|---|---|---|
| `/dashboard` | `DashboardDispatcher` | All | Automatically routes to user's primary department dashboard |
| `/dashboard/hr` | `HRDashboard` | HR | `HR_ADMIN`, `HR_MANAGER`, `SUPER_ADMIN`, `DIRECTOR` |
| `/dashboard/production`| `ProductionDashboard` | Production | `PRODUCTION_MANAGER`, `OPERATIONS_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/quality-control` / `/qc` | `QCDashboard` | QC | `QC_MANAGER`, `OPERATIONS_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/quality-assurance` / `/qa` | `QADashboard` | QA | `QA_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/warehouse` / `/inventory` | `WarehouseDashboard` | Warehouse | `WAREHOUSE_MANAGER`, `OPERATIONS_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/engineering`| `EngineeringDashboard`| Engineering | `DEPARTMENT_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/finance` / `/accounts` | `FinanceDashboard` | Finance | `FINANCE_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/procurement` / `/purchase`| `ProcurementDashboard`| Procurement | `SUPPLY_CHAIN_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/regulatory`| `RegulatoryDashboard` | Regulatory | `REGULATORY_MANAGER`, `REGULATORY_VIEWER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/sales` / `/crm` | `SalesDashboard` | Commercial | `SALES_MANAGER`, `CRM_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/microbiology` / `/micro` | `MicrobiologyDashboard`| QC Micro | `QC_MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| `/dashboard/facilities` / `/admin` | `FacilitiesDashboard` | Facilities | `SYSTEM_ADMINISTRATOR`, `IT_ADMIN`, `DIRECTOR`, `SUPER_ADMIN` |

---

## 5. Pharmaceutical Operations & Enterprise Modules

| Route Path | Component | Allowed Roles / Permissions | Target Next.js Route |
|---|---|---|---|
| `/operations` | `OperationsDashboard` | `SUPER_ADMIN`, `DIRECTOR`, `OPERATIONS_MANAGER`, `PRODUCTION_MANAGER` | `src/app/(dashboard)/operations/page.tsx` |
| `/factory` | `FactoryPage` | `SUPER_ADMIN`, `DIRECTOR`, `OPERATIONS_MANAGER`, `PRODUCTION_MANAGER` | `src/app/(dashboard)/factory/page.tsx` |
| `/production` | `ProductionPage` | `production.view` | `src/app/(dashboard)/production/page.tsx` |
| `/quality/qc` | `QCPage` | `qc.view` | `src/app/(dashboard)/quality/qc/page.tsx` |
| `/quality/qa` | `QAPage` | `qa.view` | `src/app/(dashboard)/quality/qa/page.tsx` |
| `/regulatory` | `RegulatoryPage` | `regulatory.view` | `src/app/(dashboard)/regulatory/page.tsx` |
| `/inventory` | `InventoryPage` | `inventory.view` | `src/app/(dashboard)/inventory/page.tsx` |
| `/crm` | `CRMPage` | `crm.view` | `src/app/(dashboard)/crm/page.tsx` |
| `/export` | `ExportPage` | `export.view` | `src/app/(dashboard)/export/page.tsx` |
| `/finance` | `FinancePage` | `finance.view` | `src/app/(dashboard)/finance/page.tsx` |
| `/documents` | `DocumentsPage` | `documents.view` | `src/app/(dashboard)/documents/page.tsx` |
| `/products` | `ProductsPage` | `products.view` (111-product pharmaceutical catalogue) | `src/app/(dashboard)/products/page.tsx` |
| `/ai` | `AICopilotPage` | `copilot` (Platform Operations AI) | `src/app/(dashboard)/ai/page.tsx` |
| `/modules` | `DigitalBrainModules` | `SUPER_ADMIN`, `DIRECTOR` | `src/app/(dashboard)/modules/page.tsx` |
| `/audit-logs` | `AuditLogs` | `audit:view` (21 CFR Part 11 Electronic Signature Logs) | `src/app/(dashboard)/audit-logs/page.tsx` |
| `/admin/database` | `AdminDatabaseManager`| `SUPER_ADMIN`, `DIRECTOR`, `AUDITOR` | `src/app/(dashboard)/admin/database/page.tsx` |

---

## 6. HRMS Core & Management Modules (`/hrms/*` and `/hr/*` Aliases)

| Route Path | Component | Primary Roles | Features / Workflows |
|---|---|---|---|
| `/hrms/dashboard` & `/hr` | `CoreHRMSDashboard` / `HRDashboard` | HR Admins & Managers | Workforce KPI, headcounts, present/absent summary |
| `/hrms/employees` & `/hr/employees` | `Employees` / `NonTechnicalEmployees` | HR & Dept Managers | Employee directory, search, filter, 14-tab Employee 360 |
| `/hrms/employees/create` | `AddEmployeeWizard` | HR Admins | Quick-add employee provisioning form |
| `/hrms/onboarding` & `/hr/onboarding` | `Onboarding` | HR Admins & Recruiters | 12-stage guided onboarding wizard with draft resume & approval |
| `/hrms/employees/:id` | `EmployeeProfile` | HR & Dept Managers | Comprehensive employee 360 profile view |
| `/hrms/id-cards` & `/hr/id-cards` | `EmployeeIDCardManager` | HR Admins | Bulk employee ID card designer & PDF print generator |
| `/hrms/attendance` & `/hr/attendance`| `Attendance` / `DailyAttendanceManagement`| HR Admins | Daily attendance muster, punch correction, overtime logs |
| `/hrms/attendance/command-center` | `AttendanceCommandCenter` | HR & Directors | Real-time plant floor muster telemetry & geofence monitor |
| `/hrms/attendance/reports` | `AttendanceReportBuilder` | HR Admins | Custom report builder (Excel/CSV/PDF export) |
| `/hrms/shifts` & `/hr/shifts` | `Shifts` | HR & Plant Managers | Plant shift definitions (General, Shift A, B, C, Overlaps) |
| `/hrms/rostering` | `Rostering` | HR & Dept Managers | Multi-department weekly & monthly roster planner |
| `/hrms/leave` & `/hr/leave` | `LeaveManagement` | HR & Dept Managers | Multi-tier leave approvals (Manager -> Dept Head -> HR) |
| `/hrms/payroll` & `/finance` | `Payroll` | HR & Finance Managers | Statutory salary calculation, payslip batch generation |
| `/hrms/recruitment` | `Recruitment` | Recruiters & HR | Job requisitions, candidate pipeline, interviews |
| `/hrms/training` & `/hr/training` | `Training` | QA & HR Managers | Cleanroom GMP certifications & training compliance |
| `/hrms/credentials` | `Credentials` | HR & QA Managers | Professional licenses, certifications, 30/60/90d expiry alerts |
| `/hrms/documents` & `/hr/documents` | `Documents` | HR Admins | Employee document repository & verification |
| `/hrms/assets` | `Assets` | IT & Facilities | IT hardware, cleanroom apparel, asset assignment |
| `/hrms/expenses` | `Expenses` | Finance & HR | Reimbursements, travel allowance claims, approvals |
| `/hrms/analytics` & `/hr/reports` | `HRAnalytics` | HR & Directors | Attrition, absenteeism, overtime spend, diversity charts |
| `/hrms/automation` | `HRAutomation` | HR Admins | Configurable automation rules & notification triggers |
| `/hrms/compliance` & `/hr/compliance` | `HRCompliance` | QA & HR Managers | Statutory labor law compliance & GMP audit checklists |
| `/hrms/copilot` | `HRAICopilot` | All HR Roles | 13-policy conversational compliance RAG assistant |
| `/hrms/settings` & `/hr/settings` | `HRSettings` | HR Admins | Working days, attendance grace window, geofence radius |
| `/hrms/login-credentials` | `HRLoginCredentials` | HR & Super Admin | Credential audit, temporary password generator, account unlock |
| `/hrms/access-audit` | `HRAccessAudit` | HR & Auditors | Historical login activity, IP logging, failed attempt monitor |
| `/hr/policies` | `PolicyCenter` | All Roles | Official BJK HR Policy Handbook reader |
| `/hr/disciplinary` | `HRDisciplinaryCenter` | HR & Directors | Disciplinary notices, inquiries, whistleblower cases |
| `/hr/posh` | `HRPoshCenter` | POSH Committee & HR | POSH internal complaints committee case tracking |
| `/hr/maternity` | `HRMaternityCenter` | HR Admins | Maternity benefit act tracking & leave administration |
| `/hr/safety` | `HRSafetyCenter` | Safety Committee & HR | Cleanroom safety incidents, emergency drills, hazard logs |
| `/hr/diversity` | `HRDiversityCenter` | HR Admins | Workforce inclusion metrics & accommodation requests |
| `/hr/privacy-security` | `HRPrivacySecurityCenter`| Data Officers & HR | Employee PII privacy requests & data breach registers |
| `/hr/calendar` | `HRWorkforceCalendar` | HR Admins | Master factory calendar, shift exception editor |
