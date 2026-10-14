# API and Database Inventory: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Audit Mode:** Static Codebase Audit (Phase 1)  

---

## 1. REST API Route Groups & Controller Mapping

Total Server Route Modules: **55 files**  
Total Controllers: **66 files**  

### 1.1 Core Platform & Operations APIs
| Route Prefix | File Path | Primary Controller | Key Methods & Actions |
|---|---|---|---|
| `/api` | `routes/healthRoutes.js` | Direct inline / health handler | `GET /api/health`, `GET /api/status` |
| `/api/auth` | `routes/authRoutes.js` | `controllers/authController.js` | `POST /login`, `POST /logout`, `GET /me`, `POST /change-password`, `POST /refresh` |
| `/api/users` | `routes/userRoutes.js` | `controllers/userController.js` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/roles` | `routes/roleRoutes.js` | Direct inline / role config | `GET /`, `GET /permissions` |
| `/api/permissions`| `routes/permissionRoutes.js`| Direct inline / RBAC | `GET /` |
| `/api/company` | `routes/companyRoutes.js` | `controllers/enterpriseController.js` | `GET /`, `PUT /` (Company details, CIN, address) |
| `/api/facilities` | `routes/facilityRoutes.js` | `controllers/enterpriseController.js` | `GET /`, `POST /`, `PUT /:id` (Plant & cleanroom units) |
| `/api/products` | `routes/productRoutes.js` | `controllers/productController.js` | `GET /`, `POST /`, `GET /:id`, `PUT /:id` (111 Products) |
| `/api/production` | `routes/productionRoutes.js`| `controllers/productionController.js` | Production lines, machines, orders, OEE |
| `/api/batches` | `routes/batchRoutes.js` | `controllers/productionController.js` | Batch records, manufacturing status, release |
| `/api/inventory` | `routes/inventoryRoutes.js` | `controllers/inventoryController.js` | Stock items, warehouse locations, stock transfers |
| `/api/qc` | `routes/qcRoutes.js` | `controllers/qualityController.js` | Samples, testing parameters, COA generation |
| `/api/qa` | `routes/qaRoutes.js` | `controllers/qualityController.js` | Deviations, CAPA, change control, SOPs |
| `/api/regulatory` | `routes/regulatoryRoutes.js`| `controllers/regulatoryController.js` | Dossier submissions, country compliance records |
| `/api/crm` | `routes/crmRoutes.js` | `controllers/commercialController.js` | Enquiries, customer orders, leads |
| `/api/export` | `routes/exportRoutes.js` | `controllers/commercialController.js` | International export shipments & documentation |
| `/api/finance` | `routes/financeRoutes.js` | `controllers/financeController.js` | Invoices, cost centers, operational expenses |
| `/api/documents` | `routes/documentRoutes.js` | `controllers/documentController.js` | Vault documents, metadata, versioning |
| `/api/tasks` | `routes/taskRoutes.js` | `controllers/taskNotificationController.js`| Operational task assignments & status |
| `/api/notifications`| `routes/notificationRoutes.js`| `controllers/taskNotificationController.js`| User notifications, broadcast notices |
| `/api/ai` | `routes/aiRoutes.js` | `controllers/aiCopilotController.js` | Knowledge queries & conversational chat |
| `/api/audit` | `routes/auditRoutes.js` | Direct inline / `models/AuditLog.js` | 21 CFR Part 11 electronic signature audit logs |
| `/api/dashboard` | `routes/dashboardRoutes.js` | `controllers/departmentDashboardController.js`| Department specific metrics & KPI telemetry |

### 1.2 Enterprise HRMS & Operations APIs
| Route Prefix | File Path | Primary Controller | Key Methods & Actions |
|---|---|---|---|
| `/api/hr/employees`| `routes/employeeRoutes.js` | `controllers/employeeController.js` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, imports |
| `/api/hrms/onboarding`| `routes/hr/onboardingRoutes.js`| `controllers/hr/onboardingController.js`| Draft save/resume, 12-step validation, 3-tier approval |
| `/api/hr/bank-details`| `routes/hrBankRoutes.js` | `controllers/hrms/bankDetailsController.js` | Bank directory list (masked), verification, rejection |
| `/api/hr/credentials`| `routes/hr/loginCredentialsRoutes.js`| `controllers/loginCredentialsController.js`| Account credentials list, password generation, lock/unlock |
| `/api/hr/policies` | `routes/hr/policyRoutes.js` | `controllers/hrms/policyController.js` | 13 policies, rules, digital employee acknowledgments |
| `/api/hr/calendar` | `routes/hr/workforceCalendarRoutes.js`| `controllers/hrms/workforceCalendarController.js`| Shifts, special days, roster generation, calendar exceptions |
| `/api/attendance` | `routes/attendanceRoutes.js` | `controllers/hrms/attendanceController.js` | Daily punches, monthly summaries, regularization, muster |
| `/api/hrms/attendance/reports`| `routes/hrmsRoutes.js` | `controllers/hrms/attendanceReportController.js`| Custom report engine, ExcelJS muster rolls, CSV |
| `/api/hrms/attendance/biometric`| `routes/hrmsRoutes.js` | `controllers/hrms/attendanceController.js`| Biometric hardware webhook punch receiver |
| `/api/leave` & `/api/hr/leave`| `routes/leaveRoutes.js` | `controllers/leaveController.js` | Balance, leave applications, manager/dept/HR approvals |
| `/api/hrms/payroll`| `routes/hrmsRoutes.js` | `controllers/hrms/payrollController.js` | Statutory calculations, salary batch run, PDF payslips |
| `/api/hrms/canteen` | `routes/hrms/canteenRoutes.js`| `controllers/hrms/canteenController.js` | Meal barcode scan, daily counts, monthly salary deductions |
| `/api/hrms/recruitment`| `routes/hrmsRoutes.js` | `controllers/hrms/recruitmentController.js` | Requisitions, candidate applications, interview status |
| `/api/hrms/training` | `routes/hrmsRoutes.js` | `controllers/hrms/trainingController.js` | Training programs, cleanroom GMP enrollments |
| `/api/hrms/credentials`| `routes/hrmsRoutes.js` | `controllers/hrms/credentialController.js` | Employee licenses, certifications, expiry tracking |
| `/api/hrms/assets` | `routes/hrmsRoutes.js` | `controllers/hrms/assetExpenseController.js`| Asset registration, cleanroom apparel allocations |
| `/api/hrms/expenses` | `routes/hrmsRoutes.js` | `controllers/hrms/assetExpenseController.js`| Travel & expense claims, receipts, reimbursement |
| `/api/hrms/analytics`| `routes/hrmsRoutes.js` | `controllers/hrms/analyticsController.js` | Workforce analytics, attrition, overtime calculations |
| `/api/hrms/automation`| `routes/hrmsRoutes.js` | `controllers/hrms/automationController.js` | Automation rules list, toggle, `/run-eval` trigger |
| `/api/hrms/copilot` | `routes/hrmsRoutes.js` | `controllers/hrms/copilotController.js` | HR compliance knowledge Q&A assistant |

### 1.3 Employee Self-Service APIs (`/api/employee/*`)
*Middleware: `middleware/employeeAuth.js` (`authenticateEmployee`)*
- `POST /api/employee/login`: Dedicated employee authentication.
- `GET /api/employee/me`: Authenticated profile payload.
- `GET /api/employee/dashboard`: Self-service summary.
- `/api/employee/attendance`: Personal attendance log, web punch, regularization.
- `/api/employee/attendance-face`: Biometric face registration and punch verification.
- `/api/employee/leave`: Personal leave balance, leave request, comp-off claims.
- `/api/employee/payroll` & `/payslips`: Personal payslip history & PDFKit download.
- `/api/employee/bank-details`: Personal bank account submission & document proof.
- `/api/employee/calendar`: Personal monthly work schedule.
- `/api/employee/tasks`: Personal tasks and checklist completion.
- `/api/employee/training`: Enrolled training modules and certificates.
- `/api/employee/policies`: Mandatory policy acknowledgment submissions.
- `/api/employee/support`: Helpdesk tickets and inquiries.
- `/api/employee/canteen`: Personal canteen punch logs.

---

## 2. Mongoose Database Models & Collection Catalog

Total Models: **97 Model Declarations**  

### 2.1 Core Organization & Security (8 Models)
| Model Name | File Path | Collection Name | Key Indexes |
|---|---|---|---|
| `Company` | `models/Company.js` | `companies` | `CIN: 1` (unique) |
| `Facility` | `models/Facility.js` | `facilities` | `facilityCode: 1` (unique) |
| `Department` | `models/Department.js` | `departments` | `code: 1` |
| `User` | `models/User.js` | `users` | `email: 1` (unique), `employeeId: 1` |
| `Role` | `models/Role.js` | `roles` | `roleName: 1` (unique) |
| `AuditLog` | `models/AuditLog.js` | `audit_logs` | `timestamp: -1`, `module: 1`, `action: 1` |
| `LoginActivity` | `models/LoginActivity.js` | `login_activities` | `userId: 1`, `createdAt: -1` |
| `UserSession` | `models/UserSession.js` | `user_sessions` | `token: 1`, `expiresAt: 1` (TTL) |

### 2.2 Manufacturing & Operations (7 Models)
| Model Name | File Path | Collection Name | Key Indexes |
|---|---|---|---|
| `Product` | `models/Product.js` | `products` | `productCode: 1` (unique), `therapeuticCategory: 1` |
| `ProductCategory` | `models/ProductCategory.js` | `product_categories` | `categoryCode: 1` (unique) |
| `ManufacturingCapability` | `models/ManufacturingCapability.js` | `manufacturing_capabilities` | `code: 1` |
| `ProductionLine` | `models/ProductionLine.js` | `production_lines` | `lineCode: 1` |
| `Machine` | `models/Machine.js` | `machines` | `machineCode: 1` |
| `ProductionOrder` | `models/ProductionOrder.js` | `production_orders` | `orderNumber: 1` |
| `Batch` | `models/Batch.js` | `batches` | `batchNumber: 1` (unique), `productId: 1` |

### 2.3 Warehouse, Quality & Regulatory (12 Models)
| Model Name | File Path | Collection Name | Key Indexes |
|---|---|---|---|
| `Warehouse` | `models/Warehouse.js` | `warehouses` | `warehouseCode: 1` |
| `InventoryItem` | `models/InventoryItem.js` | `inventory_items` | `itemCode: 1` (unique), `batchId: 1` |
| `InventoryTransaction` | `models/InventoryTransaction.js` | `inventory_transactions` | `transactionId: 1`, `date: -1` |
| `QCSample` | `models/QCSample.js` | `qc_samples` | `sampleCode: 1` (unique), `batchId: 1` |
| `QCTest` | `models/QCTest.js` | `qc_tests` | `testCode: 1` |
| `QCResult` | `models/QCResult.js` | `qc_results` | `sampleId: 1`, `testId: 1` |
| `Deviation` | `models/Deviation.js` | `deviations` | `deviationNumber: 1` (unique) |
| `CAPA` | `models/CAPA.js` | `capas` | `capaNumber: 1` (unique) |
| `ChangeControl` | `models/ChangeControl.js` | `change_controls` | `changeNumber: 1` (unique) |
| `SOP` | `models/SOP.js` | `sops` | `sopNumber: 1` (unique), `version: 1` |
| `RegulatoryRecord`| `models/RegulatoryRecord.js`| `regulatory_records` | `dossierId: 1`, `country: 1` |
| `CountryCompliance`| `models/CountryCompliance.js`| `country_compliances`| `countryCode: 1` |

### 2.4 Enterprise HRMS Core Models (45 Models in `models/hrms/`)
| Model Name | File Path | Collection Name | Key Purpose |
|---|---|---|---|
| `Employee` | `models/Employee.js` | `employees` | Primary employee profile (37 KB schema, 14 tabs) |
| `EmployeeBankDetails` | `models/EmployeeBankDetails.js` | `employee_bank_details` | Bank accounts with encryption & masking |
| `Attendance` | `models/hrms/Attendance.js` | `attendances` | Daily muster, source (BIOMETRIC, WEB, MOBILE) |
| `AttendanceMonthlySummary`| `models/hrms/AttendanceMonthlySummary.js`| `attendance_monthly_summaries` | Precomputed monthly work hours, late count, LOP |
| `AttendanceImportBatch` | `models/hrms/AttendanceImportBatch.js` | `attendance_import_batches` | Batch metadata for historical attendance imports |
| `LeaveType` & `LeavePolicy` | `models/hrms/Leave.js` | `leave_types`, `leave_policies` | BJK-HR-POL-001 policy rules |
| `LeaveBalance` & `LeaveRequest`| `models/hrms/Leave.js` | `leave_balances`, `leave_requests`| Employee balances & approval tickets |
| `LeaveLedger` | `models/hrms/LeaveLedger.js` | `leave_ledgers` | 2026 employee leave ledger matrix |
| `WorkSchedule` & `WorkforceRoster`| `models/hrms/WorkSchedule.js`, `WorkforceRoster.js` | `work_schedules`, `workforce_rosters` | Plant shifts and employee roster mappings |
| `WorkforceHoliday` & `CalendarSpecialDay`| `models/hrms/WorkforceHoliday.js`, `CalendarSpecialDay.js`| `workforce_holidays`, `calendar_special_days` | Factory operational holidays |
| `CanteenLunchRecord` | `models/hrms/CanteenLunchRecord.js` | `canteen_lunch_records` | Daily meal scans (Breakfast, Lunch, Dinner) |
| `CanteenSetting` | `models/hrms/CanteenSetting.js` | `canteen_settings` | Meal rates, subsidized thresholds |
| `Payroll` & `PayrollRule` | `models/hrms/Payroll.js` | `payrolls`, `payroll_rules` | Indian statutory salary records & rules |
| `OnboardingApplication` | `models/hrms/OnboardingApplication.js` | `onboarding_applications` | 12-step guided onboarding drafts & applications |
| `PolicyMaster` | `models/hrms/PolicyMaster.js` | `policies`, `policy_rules` | 13 official policy handbooks |
| `DisciplinaryCase` | `models/hrms/DisciplinaryCase.js` | `disciplinary_cases` | Grievance, inquiry, and disciplinary records |
| `POSHCase` | `models/hrms/POSHCase.js` | `posh_cases` | Prevention of Sexual Harassment committee cases |
| `MaternityCase` | `models/hrms/MaternityCase.js` | `maternity_cases` | Maternity Benefit Act cases |
| `SafetyManagement` | `models/hrms/SafetyManagement.js`| `safety_incidents`, `emergency_drills`| Plant cleanroom safety incident logs |
| `HRAutomationRule` | `models/hrms/HRAutomationRule.js`| `hr_automation_rules` | Automation rule definitions & execution logs |
