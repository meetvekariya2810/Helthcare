# BJK HEALTHCARE — CONTROLLER & SERVICE CONVERSION TABLE
## SQL Track (PostgreSQL 16) Application Layer Conversion Ledger

| # | File / Domain | Before (Runtime) | After (PostgreSQL Repositories) | Tests / Verification | Commit | Status |
|---|---|---|---|---|---|---|
| 1 | `controllers/productController.js` | Mongoose `Product`, `ProductCategory` | `productRepo.listProducts`, `findBySrNoOrId`, `createProduct`, `updateProduct`, `auditRepo` | `test:contracts` (`products_contract.json`) | `f299719` | `DONE` |
| 2 | `controllers/authController.js` | Mongoose `User`, `Employee`, `LoginActivity`, `UserSession` | `userRepo.findUserForAuth`, `verifyPassword`, `recordFailedLogin`, `resetFailedLogins`, `loginHistoryRepo.createSession`, `loginHistoryRepo.recordLogin`, `auditRepo` | `test:contracts` (`auth_contract.json`), direct execution test (200 SUCCESS, 401 FAILED, 403 LOCKED) | `60347bf` | `DONE` |
| 3 | `controllers/loginCredentialsController.js` | Mongoose `User`, `Employee`, `LoginActivity` | `userRepo.listCredentials`, `userRepo.query` (stats), `userRepo.toggleLock`, `userRepo.toggleActive` | `test:contracts`, direct execution test (122 users listed) | `60347bf` | `DONE` |
| 4 | `controllers/employeeController.js` | Mongoose `Employee`, `User`, `AuditLog` | `employeeRepo.listEmployees` (PII masking), `employeeRepo.findByEmployeeId` | `test:contracts` (`employees_contract.json`), direct execution test (146 employees) | `2c2d1c3` | `DONE` |
| 5 | `controllers/EmployeeProfileController.js` | Mongoose `Employee` | `employeeRepo.findByEmployeeId` | `test:contracts`, direct execution test | `2c2d1c3` | `DONE` |
| 6 | `controllers/EmployeeAttendanceController.js` | Mongoose `Attendance` | `attendanceRepo.findByEmployeeAndDate`, `attendanceRepo.listAttendances` | `test:contracts` (`attendance_contract.json`), direct execution test | `dd3dc5a` | `DONE` |
| 7 | `controllers/hrms/attendanceReportController.js` | Mongoose `Attendance.distinct`, `countDocuments` | `attendanceRepo.getAttendanceKPIs`, `attendanceRepo.listAttendances` | `test:contracts`, direct execution test (10,527 attendance rows) | `dd3dc5a` | `DONE` |
| 8 | `controllers/leaveController.js` | Mongoose `LeaveType`, `LeavePolicy`, `HolidayCalendar` | `leaveRepo.getLeaveTypes`, `leaveRepo.getHolidays`, `policyRepo.listPolicies` | `test:contracts` (`leave_contract.json`) | `90ee1c0` | `DONE` |
| 9 | `controllers/EmployeeLeaveController.js` | Mongoose `LeaveBalance`, `LeaveType` | `leaveRepo.getBalancesByEmployee`, `leaveRepo.deductLeave` (FOR UPDATE row locks) | `test:contracts`, direct execution test | `90ee1c0` | `DONE` |
| 10 | `controllers/hrms/payrollController.js` | Mongoose `Payroll`, `PayrollRule` | `payrollRepo.query` (listing & summaries) | `test:contracts` (`payroll_contract.json`), RBAC 403 test | `51a0c65` | `DONE` |
| 11 | `controllers/EmployeePayrollController.js` | Mongoose `Payroll` | `payrollRepo.getEmployeePayslip` | `test:contracts`, direct execution test | `51a0c65` | `DONE` |
| 12 | `controllers/hr/onboardingController.js` | Mongoose `OnboardingApplication` | `onboardingRepo.createDraft`, `onboardingRepo.updateStep`, `onboardingRepo.convertToEmployee` | `test:contracts` (`onboarding_contract.json`), draft auto-save test | `f28a172` | `DONE` |
| 13 | `controllers/hrms/onboardingController.js` | Mongoose `Onboarding` | `onboardingRepo.listApplications`, `onboardingRepo.transitionStatus` | `test:contracts`, list query test | `f28a172` | `DONE` |
| 14 | `routes/auditRoutes.js` | Mongoose `AuditLog` fallback | `pool.query` on `audit_logs` table (immutable trigger protected) | `test:contracts` (`audit_logs_contract.json`), immutable trigger test | Pre-existing + Validated | `DONE` |
| 15 | `repositories/shiftRepo.js` | Runtime Cleanroom Qualification | `shiftRepo.verifyCleanroomEligibility`, `shiftRepo.listShifts` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 16 | `repositories/trainingRepo.js` | Cleanroom Roster Expiry Blocking | `trainingRepo.checkCleanroomQualification`, `trainingRepo.listExpiringCredentials` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 17 | `repositories/documentRepo.js` | Documents Vault & Presigned S3 Keys | `documentRepo.createDocument`, `documentRepo.listDocuments` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 18 | `repositories/assetRepo.js` | Hardware & IT Assets | `assetRepo.listAssets`, `assetRepo.allocateAsset` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 19 | `repositories/expenseRepo.js` | Reimbursements & Financial Claims | `expenseRepo.listExpenses`, `expenseRepo.submitClaim` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 20 | `repositories/performanceRepo.js` | Appraisals & 360 Reviews | `performanceRepo.listCycles`, `performanceRepo.submitReview` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 21 | `repositories/recruitmentRepo.js` | Job Requisitions & Candidates | `recruitmentRepo.listRequisitions`, `recruitmentRepo.createRequisition` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 22 | `repositories/notificationRepo.js` | Broadcast Alerts & Push Queue | `notificationRepo.sendNotification`, `notificationRepo.getUserNotifications` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 23 | `repositories/automationRepo.js` | Workflow Automation Rules | `automationRepo.listRules`, `automationRepo.createRule` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 24 | `repositories/analyticsRepo.js` | 18 Aggregation SQL Pipelines | `analyticsRepo.getHeadcountByDepartment`, `analyticsRepo.getLeaveStatistics` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 25 | `repositories/copilotRepo.js` | Role-Redacted Enterprise Knowledge | `copilotRepo.queryKnowledge`, `copilotRepo.logMessage` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 26 | `repositories/canteenRepo.js` | Canteen Meal Logs & Tallies | `canteenRepo.logMeal`, `canteenRepo.getDailyTallies` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 27 | `repositories/loginHistoryRepo.js` | Session Tokens & Security Audits | `loginHistoryRepo.createSession`, `loginHistoryRepo.recordLogin`, `invalidateSession` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 28 | `repositories/factoryRepo.js` | Facilities, Cleanrooms & Machines | `factoryRepo.listFacilities`, `factoryRepo.listCleanrooms` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 29 | `repositories/productionRepo.js` | Manufacturing Batches & Lines | `productionRepo.listBatches`, `productionRepo.createBatch` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 30 | `repositories/qualityRepo.js` | QC Tests, CAPAs & Deviations | `qualityRepo.listSamples`, `qualityRepo.listDeviations` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 31 | `repositories/inventoryRepo.js` | Warehouse Items & Stock Logs | `inventoryRepo.listItems`, `inventoryRepo.logMovement` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 32 | `repositories/regulatoryRepo.js` | FDA/GMP Licenses & Filings | `regulatoryRepo.listLicenses`, `regulatoryRepo.listAudits` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 33 | `repositories/crmRepo.js` | Sales CRM & Client Enquiries | `crmRepo.listEnquiries`, `crmRepo.createEnquiry` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 34 | `repositories/financeRepo.js` | Invoices & Commercial Budgets | `financeRepo.listInvoices`, `financeRepo.listBudgets` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
| 35 | `repositories/policyRepo.js` | HR Policies & Clarifications | `policyRepo.listPolicies`, `policyRepo.getPolicyByCode` | `test_all_repositories.js` (PASS) | `f299719` | `DONE` |
