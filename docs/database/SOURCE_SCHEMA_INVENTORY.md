# SOURCE SCHEMA INVENTORY — MONGODB ATLAS (`bjk_healthcare`)

**Audit Timestamp**: 2026-10-14T14:22:17.722Z
**Target Cluster**: MongoDB Atlas (Read-Only Mode)
**Total Database Collections**: 129
**Total Documents in Database**: 16242
**Active Collections (with Data)**: 53
**Empty Collections (Schema-Declared / Zero Data)**: 76

---

## 1. Executive Summary & Domain Breakdown

| Domain | Primary Collections | Total Records | Sensitivity Class |
|---|---|---|---|
| **Identity & Security** | `users`, `roles`, `loginactivities`, `usersessions`, `employeeloginhistories`, `auditlogs` | 2,326 | HIGH (Bcrypt hashes, sessions, audit trails) |
| **HRMS Core & Workforce** | `employees`, `employee_bank_details`, `departments`, `designations`, `shifts`, `workschedules`, `credentials` | 237 | CRITICAL (PII, Bank Details, PAN, CTC) |
| **Attendance Engine** | `attendances`, `attendance_import_snapshots`, `attendance_monthly_summaries`, `attendance_import_batches`, `attendanceregularizations` | 13,160 | HIGH (Daily biometric punch logs, monthly rollups) |
| **Leaves & Holidays** | `leavebalances`, `leaveledgers`, `leavepolicies`, `leavetypes`, `leaveblackoutperiods`, `workforceholidays`, `holidaycalendars` | 149 | INTERNAL (Leave entitlements, history, statutory calendar) |
| **Catalog & Operations** | `products`, `productcategories`, `batches`, `inventoryitems`, `inventorytransactions`, `facilities`, `warehouses`, `productionlines` | 131 | INTERNAL (111-product pharmaceutical catalogue, batch lots) |
| **Enterprise & Knowledge** | `companies`, `savedreporttemplates`, `hrnotifications`, `policyclarifications`, `knowledgechunks`, `knowledgeentities` | 85 | INTERNAL (Saved templates, organizational config, AI vectors) |
| **Zero-Data Framework Models** | 76 Collections (`payrolls`, `candidates`, `onboardings`, `qcresults`, etc.) | 0 | Schema structures ready for production operational expansion |

---

## 2. Active Collections Inventory (53 Populated Collections)

Below is the exhaustive, measured inventory of every collection containing data in MongoDB Atlas, including document counts, primary indexes, schema field counts, and sensitivity ratings:

| # | Collection Name | Doc Count | Indexes | Distinct Fields | Sensitivity Class | Duplicate Key Check |
|---|---|---|---|---|---|---|
| 1 | `attendances` | **10,527** | 11 | 56 | SENSITIVE (Biometric/Log) | ⚠️ Found dupes on: employeeId |
| 2 | `attendance_import_snapshots` | **2,258** | 3 | 11 | SENSITIVE (Biometric/Log) | ⚠️ Found dupes on: employeeId |
| 3 | `auditlogs` | **1,425** | 11 | 132 | AUDIT (Immutable Record) | Clean (No dupes on candidate keys) |
| 4 | `loginactivities` | **456** | 6 | 18 | HIGH (Identity/Auth) | ⚠️ Found dupes on: employeeId, email |
| 5 | `attendance_monthly_summaries` | **363** | 4 | 21 | SENSITIVE (Biometric/Log) | ⚠️ Found dupes on: employeeId |
| 6 | `usersessions` | **277** | 5 | 17 | HIGH (Identity/Auth) | ⚠️ Found dupes on: employeeId |
| 7 | `employees` | **135** | 14 | 341 | HIGH (Identity/Auth) | Clean (No dupes on candidate keys) |
| 8 | `products` | **111** | 11 | 23 | INTERNAL | Clean (No dupes on candidate keys) |
| 9 | `users` | **111** | 9 | 170 | HIGH (Identity/Auth) | Clean (No dupes on candidate keys) |
| 10 | `trainingenrollments` | **84** | 5 | 21 | INTERNAL | ⚠️ Found dupes on: employeeId |
| 11 | `leavebalances` | **58** | 4 | 25 | INTERNAL | Clean (No dupes on candidate keys) |
| 12 | `employeeloginhistories` | **57** | 4 | 16 | HIGH (Identity/Auth) | ⚠️ Found dupes on: employeeId |
| 13 | `savedreporttemplates` | **54** | 1 | 26 | INTERNAL | Clean (No dupes on candidate keys) |
| 14 | `leaveledgers` | **48** | 6 | 38 | INTERNAL | Clean (No dupes on candidate keys) |
| 15 | `employee_bank_details` | **38** | 4 | 37 | CRITICAL (Financial/PII) | ⚠️ Found dupes on: accountNumber |
| 16 | `employeetasks` | **30** | 5 | 17 | HIGH (Identity/Auth) | ⚠️ Found dupes on: employeeId |
| 17 | `hrnotifications` | **22** | 4 | 22 | INTERNAL | Clean (No dupes on candidate keys) |
| 18 | `departments` | **20** | 6 | 22 | INTERNAL | Clean (No dupes on candidate keys) |
| 19 | `workforceholidays` | **15** | 4 | 20 | INTERNAL | Clean (No dupes on candidate keys) |
| 20 | `leavetypes` | **13** | 3 | 21 | INTERNAL | Clean (No dupes on candidate keys) |
| 21 | `holidaycalendars` | **12** | 3 | 12 | INTERNAL | Clean (No dupes on candidate keys) |
| 22 | `employeesupportrequests` | **11** | 4 | 19 | HIGH (Identity/Auth) | ⚠️ Found dupes on: employeeId |
| 23 | `productcategories` | **11** | 3 | 10 | INTERNAL | Clean (No dupes on candidate keys) |
| 24 | `attendance_import_batches` | **10** | 3 | 58 | SENSITIVE (Biometric/Log) | Clean (No dupes on candidate keys) |
| 25 | `designations` | **9** | 3 | 16 | INTERNAL | Clean (No dupes on candidate keys) |
| 26 | `credentials` | **8** | 5 | 24 | INTERNAL | Clean (No dupes on candidate keys) |
| 27 | `roles` | **8** | 3 | 9 | INTERNAL | Clean (No dupes on candidate keys) |
| 28 | `policyclarifications` | **7** | 2 | 35 | INTERNAL | Clean (No dupes on candidate keys) |
| 29 | `shifts` | **7** | 3 | 28 | INTERNAL | Clean (No dupes on candidate keys) |
| 30 | `departmentstaffingthresholds` | **6** | 2 | 12 | INTERNAL | Clean (No dupes on candidate keys) |
| 31 | `employeefaceattendances` | **6** | 2 | 14 | HIGH (Identity/Auth) | Clean (No dupes on candidate keys) |
| 32 | `trainingprograms` | **6** | 2 | 17 | INTERNAL | Clean (No dupes on candidate keys) |
| 33 | `companycalendarevents` | **5** | 4 | 22 | INTERNAL | Clean (No dupes on candidate keys) |
| 34 | `attendancereporthistories` | **3** | 2 | 17 | SENSITIVE (Biometric/Log) | Clean (No dupes on candidate keys) |
| 35 | `calendarspecialdays` | **3** | 3 | 21 | INTERNAL | Clean (No dupes on candidate keys) |
| 36 | `workschedules` | **3** | 5 | 76 | INTERNAL | Clean (No dupes on candidate keys) |
| 37 | `attendanceregularizations` | **2** | 4 | 19 | SENSITIVE (Biometric/Log) | Clean (No dupes on candidate keys) |
| 38 | `batches` | **2** | 7 | 20 | INTERNAL | Clean (No dupes on candidate keys) |
| 39 | `enquiries` | **2** | 6 | 18 | INTERNAL | Clean (No dupes on candidate keys) |
| 40 | `facilities` | **2** | 4 | 16 | INTERNAL | Clean (No dupes on candidate keys) |
| 41 | `inventorytransactions` | **2** | 7 | 22 | INTERNAL | Clean (No dupes on candidate keys) |
| 42 | `invoices` | **2** | 3 | 22 | INTERNAL | Clean (No dupes on candidate keys) |
| 43 | `leavepolicies` | **2** | 3 | 57 | INTERNAL | Clean (No dupes on candidate keys) |
| 44 | `productionlines` | **2** | 3 | 12 | INTERNAL | Clean (No dupes on candidate keys) |
| 45 | `canteensettings` | **1** | 1 | 18 | INTERNAL | Clean (No dupes on candidate keys) |
| 46 | `companies` | **1** | 1 | 41 | INTERNAL | Clean (No dupes on candidate keys) |
| 47 | `inventoryitems` | **1** | 8 | 15 | INTERNAL | Clean (No dupes on candidate keys) |
| 48 | `knowledgechunks` | **1** | 3 | 12 | INTERNAL | Clean (No dupes on candidate keys) |
| 49 | `knowledgeentities` | **1** | 4 | 10 | INTERNAL | Clean (No dupes on candidate keys) |
| 50 | `leaveblackoutperiods` | **1** | 3 | 18 | INTERNAL | Clean (No dupes on candidate keys) |
| 51 | `qcsamples` | **1** | 5 | 12 | INTERNAL | Clean (No dupes on candidate keys) |
| 52 | `regulatoryrecords` | **1** | 7 | 14 | INTERNAL | Clean (No dupes on candidate keys) |
| 53 | `warehouses` | **1** | 3 | 12 | INTERNAL | Clean (No dupes on candidate keys) |

---

## 3. Deep Architectural Breakdown of Critical Collections

### `attendances` (10,527 records)

- **Record Count**: 10,527
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employee_1_dateString_1`: { employee: 1, dateString: 1 } **(UNIQUE)** 
  - `employeeId_1_dateString_1`: { employeeId: 1, dateString: 1 }  
  - `dateString_1_departmentName_1`: { dateString: 1, departmentName: 1 }  
  - `dateString_1_branchName_1`: { dateString: 1, branchName: 1 }  
  - `dateString_1_status_1`: { dateString: 1, status: 1 }  
  - `date_1`: { date: 1 }  
  - `shift_1_dateString_1`: { shift: 1, dateString: 1 }  
  - `isDemo_1`: { isDemo: 1 }  
  - `employeeCode_1_attendanceDate_1`: { employeeCode: 1, attendanceDate: 1 } **(UNIQUE)** (SPARSE)
  - `importBatchId_1`: { importBatchId: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employee` | `ObjectId` | No | No |
| `employeeId` | `ObjectId` | No | No |
| `employeeCode` | `String` | No | No |
| `attendanceDate` | `String` | No | No |
| `attendanceStatus` | `String` | No | No |
| `sourceEmployeeName` | `String` | No | No |
| `sourceDepartment` | `String` | No | No |
| `month` | `Integer` | No | No |
| `year` | `Integer` | No | No |
| `importBatchId` | `String` | No | No |
| `sourceFileName` | `String` | No | No |
| `createdBy` | `ObjectId` | No | No |
| `employeeName` | `String` | No | No |
| `branchName` | `String` | No | No |
| `departmentName` | `String` | No | No |
| `subDepartmentName` | `String` | No | No |
| `designationTitle` | `String` | No | No |
| `date` | `Date` | No | No |
| `dateString` | `String` | No | No |
| `shiftName` | `String` | No | No |
| `scheduledIn` | `String` | No | No |
| `scheduledOut` | `String` | No | No |
| `checkIn` | `Null` | Yes | No |
| `checkOut` | `Null` | Yes | No |
| `actualIn` | `String` | No | No |
| `actualOut` | `String` | No | No |
| `status` | `String` | No | No |
| `halfDayType` | `String` | No | No |
| `leaveType` | `String` | No | No |
| *... (26 additional sub-fields)* | ... | ... | ... |

### `attendance_import_snapshots` (2,258 records)

- **Record Count**: 2,258
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `importBatchId_1`: { importBatchId: 1 }  
  - `importBatchId_1_employeeCode_1_attendanceDate_1`: { importBatchId: 1, employeeCode: 1, attendanceDate: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `importBatchId` | `String` | No | No |
| `attendanceId` | `ObjectId` | No | No |
| `employeeId` | `ObjectId` | No | No |
| `employeeCode` | `String` | No | No |
| `attendanceDate` | `String` | No | No |
| `previousStatus` | `Null` | Yes | No |
| `previousSummary` | `Null` | Yes | No |
| `snapshotType` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `auditlogs` (1,425 records)

- **Record Count**: 1,425
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `timestamp_-1`: { timestamp: -1 }  
  - `createdAt_-1`: { createdAt: -1 }  
  - `user_1`: { user: 1 }  
  - `user.email_1`: { user.email: 1 }  
  - `targetUser.employeeId_1`: { targetUser.employeeId: 1 }  
  - `targetUserId_1`: { targetUserId: 1 }  
  - `module_1`: { module: 1 }  
  - `action_1`: { action: 1 }  
  - `resourceId_1`: { resourceId: 1 }  
  - `module_1_action_1_timestamp_-1`: { module: 1, action: 1, timestamp: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `user` | `Object` | No | No |
| `user.id` | `Null, ObjectId` | Yes | No |
| `user.name` | `String` | No | No |
| `user.email` | `String` | No | No |
| `user.role` | `String` | No | No |
| `action` | `String` | No | No |
| `module` | `String` | No | No |
| `resource` | `String` | No | No |
| `resourceId` | `String, Null` | Yes | No |
| `recordId` | `String, Null` | Yes | No |
| `oldData` | `Null, Object` | Yes | No |
| `newData` | `Null, Object` | Yes | No |
| `before` | `Null, Object` | Yes | No |
| `after` | `Null, Object` | Yes | No |
| `ipAddress` | `String` | No | No |
| `ip` | `String` | No | No |
| `userAgent` | `String` | No | No |
| `timestamp` | `Date` | No | No |
| `status` | `String` | No | No |
| `targetUser` | `Null, Object` | Yes | No |
| `targetUserId` | `Null, String` | Yes | No |
| `reason` | `String` | No | No |
| `details` | `String` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |
| `targetUser.name` | `String` | No | No |
| `targetUser.employeeId` | `String` | No | No |
| *... (102 additional sub-fields)* | ... | ... | ... |

### `loginactivities` (456 records)

- **Record Count**: 456
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `userId_1_loginTime_-1`: { userId: 1, loginTime: -1 }  
  - `employeeId_1_loginTime_-1`: { employeeId: 1, loginTime: -1 }  
  - `email_1_loginTime_-1`: { email: 1, loginTime: -1 }  
  - `status_1`: { status: 1 }  
  - `loginTime_-1`: { loginTime: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `userId` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `email` | `String` | No | No |
| `loginTime` | `Date` | No | No |
| `logoutTime` | `Null, Date` | Yes | No |
| `ipAddress` | `String` | No | No |
| `device` | `String` | No | No |
| `browser` | `String` | No | No |
| `operatingSystem` | `String` | No | No |
| `sessionId` | `String` | No | No |
| `locationApproximation` | `String` | No | No |
| `status` | `String` | No | No |
| `failureReason` | `String` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `attendance_monthly_summaries` (363 records)

- **Record Count**: 363
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employeeCode_1_month_1_year_1`: { employeeCode: 1, month: 1, year: 1 } **(UNIQUE)** 
  - `importBatchId_1`: { importBatchId: 1 }  
  - `employeeId_1_month_1_year_1`: { employeeId: 1, month: 1, year: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employeeId` | `ObjectId` | No | No |
| `employeeCode` | `String` | No | No |
| `month` | `Integer` | No | No |
| `year` | `Integer` | No | No |
| `present` | `Double, Integer` | No | No |
| `weeklyOff` | `Integer` | No | No |
| `publicHoliday` | `Integer` | No | No |
| `casualLeave` | `Integer, Double` | No | No |
| `sickLeave` | `Double, Integer` | No | No |
| `compensatoryOff` | `Integer, Double` | No | No |
| `leaveWithoutPay` | `Integer, Double` | No | No |
| `absentPayDays` | `Integer, Double` | No | No |
| `totalDays` | `Integer, Double` | No | No |
| `sourceFileName` | `String` | No | No |
| `importBatchId` | `String` | No | No |
| `sourceEmployeeName` | `String` | No | No |
| `sourceDepartment` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |

### `usersessions` (277 records)

- **Record Count**: 277
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `sessionId_1`: { sessionId: 1 } **(UNIQUE)** 
  - `userId_1_status_1`: { userId: 1, status: 1 }  
  - `employeeId_1`: { employeeId: 1 }  
  - `expiresAt_1`: { expiresAt: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `userId` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `sessionId` | `String` | No | No |
| `tokenHash` | `String` | No | 🔒 YES |
| `ipAddress` | `String` | No | No |
| `device` | `String` | No | No |
| `browser` | `String` | No | No |
| `operatingSystem` | `String` | No | No |
| `status` | `String` | No | No |
| `lastActivity` | `Date` | No | No |
| `expiresAt` | `Date` | No | No |
| `terminatedAt` | `Null, Date` | Yes | No |
| `terminatedBy` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `employees` (135 records)

- **Record Count**: 135
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employeeId_1`: { employeeId: 1 } **(UNIQUE)** 
  - `email_1`: { email: 1 } **(UNIQUE)** 
  - `employeeCode_1`: { employeeCode: 1 }  
  - `status_1`: { status: 1 }  
  - `employmentStatus_1`: { employmentStatus: 1 }  
  - `department_1`: { department: 1 }  
  - `departmentName_1`: { departmentName: 1 }  
  - `designationTitle_1`: { designationTitle: 1 }  
  - `branch_1`: { branch: 1 }  
  - `facility_1`: { facility: 1 }  
  - `reportingManager_1`: { reportingManager: 1 }  
  - `joiningDate_-1`: { joiningDate: -1 }  
  - `employeeCategory_1`: { employeeCategory: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employeeCode` | `String` | No | No |
| `employeeId` | `String` | No | No |
| `employeeSerialNumber` | `Null, Integer` | Yes | No |
| `srNo` | `Null, Integer` | Yes | No |
| `importBatchId` | `String` | No | No |
| `status` | `String` | No | No |
| `employmentStatus` | `String` | No | No |
| `onboardingStatus` | `String` | No | No |
| `onboardingStep` | `Integer` | No | No |
| `profileCompletion` | `Integer` | No | No |
| `photo` | `String` | No | No |
| `profilePhoto` | `String` | No | No |
| `firstName` | `String` | No | No |
| `middleName` | `String` | No | No |
| `lastName` | `String` | No | No |
| `fullName` | `String` | No | No |
| `age` | `String` | No | No |
| `uanNumber` | `String` | No | No |
| `yearsOfService` | `String` | No | No |
| `fatherName` | `String` | No | No |
| `motherName` | `String` | No | No |
| `dateOfBirth` | `Null, Date` | Yes | No |
| `gender` | `String` | No | No |
| `bloodGroup` | `String` | No | No |
| `maritalStatus` | `String` | No | No |
| `nationality` | `String` | No | No |
| `religion` | `String` | No | No |
| `personalEmail` | `String` | No | No |
| `personalMobile` | `String` | No | No |
| *... (311 additional sub-fields)* | ... | ... | ... |

### `products` (111 records)

- **Record Count**: 111
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `srNo_1`: { srNo: 1 } **(UNIQUE)** 
  - `productName_1`: { productName: 1 }  
  - `genericName_1`: { genericName: 1 }  
  - `dosageForm_1`: { dosageForm: 1 }  
  - `category_1`: { category: 1 }  
  - `verificationStatus_1`: { verificationStatus: 1 }  
  - `isActive_1`: { isActive: 1 }  
  - `productName_text_genericName_text_description_text`: { _fts: text, _ftsx: 1 }  
  - `category_1_dosageForm_1`: { category: 1, dosageForm: 1 }  
  - `verificationStatus_1_isActive_1`: { verificationStatus: 1, isActive: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `srNo` | `Integer` | No | No |
| `__v` | `Integer` | No | No |
| `availableStrengths` | `Array` | No | No |
| `category` | `String` | No | No |
| `classification` | `String` | No | No |
| `composition` | `String` | No | No |
| `countries` | `Array` | No | No |
| `createdAt` | `Date` | No | No |
| `description` | `String` | No | No |
| `documents` | `Array` | No | No |
| `dosageForm` | `String` | No | No |
| `genericName` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `manufacturingCapability` | `String` | No | No |
| `packSize` | `String` | No | No |
| `productName` | `String` | No | No |
| `regulatoryStatus` | `String` | No | No |
| `sourceDocument` | `String` | No | No |
| `sourcePage` | `Integer` | No | No |
| `strength` | `String` | No | No |
| `updatedAt` | `Date` | No | No |
| `verificationStatus` | `String` | No | No |

### `users` (111 records)

- **Record Count**: 111
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `email_1`: { email: 1 } **(UNIQUE)** 
  - `role_1`: { role: 1 }  
  - `department_1`: { department: 1 }  
  - `employeeId_1`: { employeeId: 1 }  
  - `employeeCode_1`: { employeeCode: 1 }  
  - `username_1`: { username: 1 }  
  - `status_1`: { status: 1 }  
  - `workEmail_1`: { workEmail: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `email` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `accessConfig` | `Null, Object` | Yes | No |
| `accountExpiry` | `Null` | Yes | No |
| `approvalPermissions` | `Array` | No | No |
| `avatar` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `dataScope` | `String` | No | No |
| `department` | `String` | No | No |
| `designation` | `String` | No | No |
| `employeeCode` | `String` | No | No |
| `employeeId` | `String` | No | No |
| `facility` | `ObjectId, Null` | Yes | No |
| `facilityName` | `String` | No | No |
| `failedLoginAttempts` | `Integer` | No | No |
| `firstLogin` | `Boolean` | No | No |
| `importBatchId` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `isLocked` | `Boolean` | No | No |
| `lastLogin` | `Date, Null` | Yes | No |
| `lockedReason` | `Null, String` | Yes | No |
| `lockedUntil` | `Null` | Yes | No |
| `mustChangePassword` | `Boolean` | No | 🔒 YES |
| `name` | `String` | No | No |
| `password` | `String` | No | 🔒 YES |
| `passwordChangedAt` | `Date, Null` | Yes | 🔒 YES |
| `passwordHash` | `String` | No | 🔒 YES |
| `permissions` | `Array` | No | No |
| *... (140 additional sub-fields)* | ... | ... | ... |

### `trainingenrollments` (84 records)

- **Record Count**: 84
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employee_1_program_1`: { employee: 1, program: 1 }  
  - `status_1`: { status: 1 }  
  - `expiryDate_1`: { expiryDate: 1 }  
  - `category_1`: { category: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `program` | `ObjectId` | No | No |
| `programCode` | `String` | No | No |
| `programTitle` | `String` | No | No |
| `category` | `String` | No | No |
| `employee` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `departmentName` | `String` | No | No |
| `completionDate` | `Date, Null` | Yes | No |
| `expiryDate` | `Date` | No | No |
| `status` | `String` | No | No |
| `scorePercentage` | `Integer, Null` | Yes | No |
| `certificateNumber` | `String, Null` | Yes | No |
| `certificateUrl` | `Null` | Yes | No |
| `verifiedBy` | `String` | No | No |
| `isDemo` | `Boolean` | No | No |
| `enrolledDate` | `Date` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |

### `leavebalances` (58 records)

- **Record Count**: 58
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employee_1_leaveYear_1`: { employee: 1, leaveYear: 1 } **(UNIQUE)** 
  - `employeeId_1_leaveYear_1`: { employeeId: 1, leaveYear: 1 }  
  - `department_1`: { department: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employee` | `ObjectId` | No | No |
| `user` | `ObjectId, Null` | Yes | No |
| `employeeId` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `department` | `String` | No | No |
| `leaveYear` | `Integer` | No | No |
| `balances` | `Array` | No | No |
| `balances[].leaveType` | `String` | No | No |
| `balances[].leaveTypeName` | `String` | No | No |
| `balances[].openingBalance` | `Integer, Double` | No | No |
| `balances[].allocated` | `Integer, Double` | No | No |
| `balances[].carriedForward` | `Integer` | No | No |
| `balances[].adjusted` | `Integer` | No | No |
| `balances[].used` | `Integer, Double` | No | No |
| `balances[].pending` | `Integer` | No | No |
| `balances[].available` | `Integer, Double` | No | No |
| `balances[].lastUpdated` | `Date` | No | No |
| `isDemo` | `Boolean` | No | No |
| `year` | `Integer` | No | No |
| `history` | `Array` | No | No |
| `lastUpdated` | `Date` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `employeeloginhistories` (57 records)

- **Record Count**: 57
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employeeId_1`: { employeeId: 1 }  
  - `loginTime_1`: { loginTime: 1 }  
  - `employeeId_1_loginTime_-1`: { employeeId: 1, loginTime: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `userId` | `ObjectId` | No | No |
| `logoutTime` | `Null, Date` | Yes | No |
| `ipAddress` | `String` | No | No |
| `userAgent` | `String` | No | No |
| `device` | `String` | No | No |
| `browser` | `String` | No | No |
| `location` | `String` | No | No |
| `status` | `String` | No | No |
| `loginMethod` | `String` | No | No |
| `failureReason` | `String` | No | No |
| `loginTime` | `Date` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `savedreporttemplates` (54 records)

- **Record Count**: 54
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `description` | `String` | No | No |
| `reportType` | `String` | No | No |
| `filters` | `Object` | No | No |
| `filters.dateMode` | `String` | No | No |
| `filters.startDate` | `String` | No | No |
| `filters.endDate` | `String` | No | No |
| `filters.branches` | `Array` | No | No |
| `filters.departments` | `Array` | No | No |
| `filters.shifts` | `Array` | No | No |
| `filters.statuses` | `Array` | No | No |
| `filters.punchConditions` | `Array` | No | No |
| `filters.employees` | `Array` | No | No |
| `selectedColumns` | `Array` | No | No |
| `selectedColumns[].key` | `String` | No | No |
| `selectedColumns[].label` | `String` | No | No |
| `selectedColumns[].order` | `Integer` | No | No |
| `selectedColumns[]._id` | `ObjectId` | No | No |
| `groupBy` | `String` | No | No |
| `sheetsMode` | `String` | No | No |
| `isPublic` | `Boolean` | No | No |
| `createdByName` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `leaveledgers` (48 records)

- **Record Count**: 48
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employeeCode_1`: { employeeCode: 1 }  
  - `department_1`: { department: 1 }  
  - `year_1`: { year: 1 }  
  - `employeeCode_1_year_1`: { employeeCode: 1, year: 1 } **(UNIQUE)** 
  - `employeeName_1`: { employeeName: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `srNo` | `Integer` | No | No |
| `employeeCode` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `department` | `String` | No | No |
| `doj` | `String` | No | No |
| `year` | `Integer` | No | No |
| `openingBalance` | `Object` | No | No |
| `openingBalance.cl` | `Integer, Double` | No | No |
| `openingBalance.sl` | `Integer, Double` | No | No |
| `openingBalance.total` | `Integer` | No | No |
| `monthlyBreakdown` | `Array` | No | No |
| `monthlyBreakdown[].monthName` | `String` | No | No |
| `monthlyBreakdown[].monthIndex` | `Integer` | No | No |
| `monthlyBreakdown[].monthKey` | `String` | No | No |
| `monthlyBreakdown[].cl` | `Integer, Double` | No | No |
| `monthlyBreakdown[].sl` | `Integer, Double` | No | No |
| `monthlyBreakdown[].lwp` | `Integer, Double` | No | No |
| `monthlyBreakdown[].total` | `Integer, Double` | No | No |
| `totalLeaveTaken` | `Object` | No | No |
| `totalLeaveTaken.cl` | `Integer, Double` | No | No |
| `totalLeaveTaken.sl` | `Integer, Double` | No | No |
| `totalLeaveTaken.lwp` | `Double, Integer` | No | No |
| `totalLeaveTaken.total` | `Double, Integer` | No | No |
| `closingBalance` | `Object` | No | No |
| `closingBalance.cl` | `Integer, Double` | No | No |
| `closingBalance.sl` | `Double, Integer` | No | No |
| `closingBalance.total` | `Double, Integer` | No | No |
| `extraNotes` | `String` | No | No |
| `sourceType` | `String` | No | No |
| *... (8 additional sub-fields)* | ... | ... | ... |

### `employee_bank_details` (38 records)

- **Record Count**: 38
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employeeId_1`: { employeeId: 1 } **(UNIQUE)** 
  - `employeeCode_1`: { employeeCode: 1 }  
  - `verificationStatus_1`: { verificationStatus: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employeeId` | `ObjectId` | No | No |
| `employeeCode` | `String` | No | No |
| `accountHolderName` | `String` | No | No |
| `accountNumber` | `String` | No | No |
| `accountType` | `String` | No | No |
| `accountStatus` | `String` | No | No |
| `bankName` | `String` | No | No |
| `branchName` | `String` | No | No |
| `branchAddress` | `String` | No | No |
| `city` | `String` | No | No |
| `state` | `String` | No | No |
| `ifscCode` | `String` | No | 🔒 YES |
| `micrCode` | `String` | No | No |
| `bankCode` | `String` | No | No |
| `branchCode` | `String` | No | No |
| `pan` | `String` | No | 🔒 YES |
| `uanNumber` | `String` | No | No |
| `pfNumber` | `String` | No | No |
| `esicNumber` | `String` | No | No |
| `insuranceNumber` | `String` | No | No |
| `customerId` | `String` | No | No |
| `crnNumber` | `String` | No | No |
| `bankCustomerId` | `String` | No | No |
| `verificationStatus` | `String` | No | No |
| `verificationDate` | `Date, Null` | Yes | No |
| `verifiedBy` | `ObjectId, Null` | Yes | No |
| `verifiedByName` | `String` | No | No |
| `documentType` | `String` | No | No |
| `documentNumber` | `String` | No | No |
| *... (7 additional sub-fields)* | ... | ... | ... |

### `employeetasks` (30 records)

- **Record Count**: 30
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `taskId_1`: { taskId: 1 } **(UNIQUE)** 
  - `employeeId_1`: { employeeId: 1 }  
  - `status_1`: { status: 1 }  
  - `employeeId_1_status_1`: { employeeId: 1, status: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `taskId` | `String` | No | No |
| `employeeId` | `String` | No | No |
| `employee` | `ObjectId` | No | No |
| `title` | `String` | No | No |
| `description` | `String` | No | No |
| `assignedBy` | `String` | No | No |
| `assignedByName` | `String` | No | No |
| `priority` | `String` | No | No |
| `status` | `String` | No | No |
| `dueDate` | `Date` | No | No |
| `completedAt` | `Null, Date` | Yes | No |
| `attachments` | `Array` | No | No |
| `comments` | `Array` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |

### `hrnotifications` (22 records)

- **Record Count**: 22
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `recipientUser_1_isRead_1`: { recipientUser: 1, isRead: 1 }  
  - `recipientRole_1_isRead_1`: { recipientRole: 1, isRead: 1 }  
  - `createdAt_-1`: { createdAt: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `recipientUser` | `Null` | Yes | No |
| `recipientRole` | `Null` | Yes | No |
| `recipientEmployeeId` | `String, Null` | Yes | No |
| `category` | `String` | No | No |
| `title` | `String` | No | No |
| `message` | `String` | No | No |
| `severity` | `String` | No | No |
| `linkUrl` | `String` | No | No |
| `relatedRecordId` | `String` | No | No |
| `isRead` | `Boolean` | No | No |
| `readAt` | `Date, Null` | Yes | No |
| `isArchived` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |
| `updatedAt` | `Date` | No | No |
| `photo` | `String` | No | No |
| `sendTo` | `String` | No | No |
| `senderName` | `String` | No | No |
| `senderRole` | `String` | No | No |
| `departmentName` | `String` | No | No |

### `departments` (20 records)

- **Record Count**: 20
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `name_1`: { name: 1 } **(UNIQUE)** 
  - `code_1`: { code: 1 } **(UNIQUE)** 
  - `facility_1`: { facility: 1 }  
  - `branch_1`: { branch: 1 }  
  - `order_1`: { order: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `code` | `String` | No | No |
| `facility` | `String` | No | No |
| `branch` | `String` | No | No |
| `order` | `Integer` | No | No |
| `division` | `String` | No | No |
| `headOfDepartment` | `Null` | Yes | No |
| `headOfDepartmentName` | `String` | No | No |
| `managers` | `Array` | No | No |
| `parentDepartment` | `Null` | Yes | No |
| `permissions` | `Array` | No | No |
| `description` | `String` | No | No |
| `budget` | `Integer` | No | No |
| `teams` | `Array` | No | No |
| `complianceRequirements` | `Array` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `subDepartments` | `Array` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `workforceholidays` (15 records)

- **Record Count**: 15
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `dateString_1_status_1`: { dateString: 1, status: 1 }  
  - `year_1_applicableTo_1`: { year: 1, applicableTo: 1 }  
  - `department_1`: { department: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `dateString` | `String` | No | No |
| `name` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `applicableTo` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `createdBy` | `Object` | No | No |
| `createdBy.name` | `String` | No | No |
| `createdBy.role` | `String` | No | No |
| `date` | `Date` | No | No |
| `department` | `String` | No | No |
| `description` | `String` | No | No |
| `employeeCodes` | `Array` | No | No |
| `facility` | `String` | No | No |
| `isDemo` | `Boolean` | No | No |
| `isOptional` | `Boolean` | No | No |
| `status` | `String` | No | No |
| `type` | `String` | No | No |
| `updatedAt` | `Date` | No | No |
| `year` | `Integer` | No | No |

### `leavetypes` (13 records)

- **Record Count**: 13
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `code_1`: { code: 1 } **(UNIQUE)** 
  - `isActive_1`: { isActive: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `code` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `allowHalfDay` | `Boolean` | No | No |
| `annualQuotaDays` | `Integer` | No | No |
| `applicableGender` | `String` | No | No |
| `approvalWorkflow` | `Array` | No | No |
| `carryForwardAllowed` | `Boolean` | No | No |
| `countHolidays` | `Boolean` | No | No |
| `countWeekends` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `description` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `isPaid` | `Boolean` | No | No |
| `maxCarryForwardDays` | `Integer` | No | No |
| `maxConsecutiveDays` | `Integer` | No | No |
| `minNoticeDays` | `Integer` | No | No |
| `name` | `String` | No | No |
| `requiresDocumentProof` | `Boolean` | No | No |
| `updatedAt` | `Date` | No | No |

### `holidaycalendars` (12 records)

- **Record Count**: 12
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `year_1_date_1`: { year: 1, date: 1 }  
  - `dateString_1`: { dateString: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `dateString` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `date` | `Date` | No | No |
| `description` | `String` | No | No |
| `facility` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `type` | `String` | No | No |
| `updatedAt` | `Date` | No | No |
| `year` | `Integer` | No | No |

### `employeesupportrequests` (11 records)

- **Record Count**: 11
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `ticketId_1`: { ticketId: 1 } **(UNIQUE)** 
  - `status_1`: { status: 1 }  
  - `employeeId_1_createdAt_-1`: { employeeId: 1, createdAt: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `ticketId` | `String` | No | No |
| `employee` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `department` | `String` | No | No |
| `category` | `String` | No | No |
| `subject` | `String` | No | No |
| `description` | `String` | No | No |
| `priority` | `String` | No | No |
| `status` | `String` | No | No |
| `attachmentUrl` | `String` | No | No |
| `assignedTo` | `String` | No | No |
| `resolutionNotes` | `String` | No | No |
| `resolvedAt` | `Date` | No | No |
| `comments` | `Array` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |

### `productcategories` (11 records)

- **Record Count**: 11
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `name_1`: { name: 1 } **(UNIQUE)** 
  - `code_1`: { code: 1 } **(UNIQUE)** 
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `code` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `description` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `productCount` | `Integer` | No | 🔒 YES |
| `sourcePages` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `attendance_import_batches` (10 records)

- **Record Count**: 10
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `importBatchId_1`: { importBatchId: 1 } **(UNIQUE)** 
  - `createdAt_-1`: { createdAt: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `importBatchId` | `String` | No | No |
| `fileName` | `String` | No | No |
| `month` | `Integer` | No | No |
| `year` | `Integer` | No | No |
| `status` | `String` | No | No |
| `totalRows` | `Integer` | No | No |
| `matchedRows` | `Integer` | No | No |
| `importedRows` | `Integer` | No | No |
| `unmatchedRows` | `Integer` | No | No |
| `duplicateRows` | `Integer` | No | No |
| `failedRows` | `Integer` | No | No |
| `warningCount` | `Integer` | No | No |
| `importedBy` | `ObjectId, Null` | Yes | No |
| `importedByName` | `String` | No | No |
| `importedAt` | `Date, Null` | Yes | No |
| `rolledBackAt` | `Date, Null` | Yes | No |
| `rolledBackBy` | `ObjectId, Null` | Yes | No |
| `rolledBackByName` | `String` | No | No |
| `rollbackReason` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |
| `validationReport` | `Object` | No | No |
| `validationReport.importStatus` | `String` | No | No |
| `validationReport.importBatchId` | `String` | No | No |
| `validationReport.sourceFile` | `String` | No | No |
| `validationReport.attendancePeriod` | `String` | No | No |
| `validationReport.totalSourceRows` | `Integer` | No | No |
| `validationReport.matchedEmployees` | `Integer` | No | No |
| *... (28 additional sub-fields)* | ... | ... | ... |

### `designations` (9 records)

- **Record Count**: 9
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `title_1`: { title: 1 }  
  - `department_1`: { department: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `title` | `String` | No | No |
| `code` | `String` | No | No |
| `department` | `ObjectId` | No | No |
| `departmentName` | `String` | No | No |
| `level` | `String` | No | No |
| `requiredQualifications` | `Array` | No | No |
| `requiredCertifications` | `Array` | No | No |
| `standardMinSalary` | `Integer` | No | 🔒 YES |
| `standardMaxSalary` | `Integer` | No | 🔒 YES |
| `description` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `credentials` (8 records)

- **Record Count**: 8
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employee_1`: { employee: 1 }  
  - `status_1`: { status: 1 }  
  - `expiryDate_1`: { expiryDate: 1 }  
  - `isMandatoryForRole_1_status_1`: { isMandatoryForRole: 1, status: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employee` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `departmentName` | `String` | No | No |
| `credentialName` | `String` | No | No |
| `credentialCode` | `String` | No | No |
| `category` | `String` | No | No |
| `issuingAuthority` | `String` | No | No |
| `certificateNumber` | `String` | No | No |
| `issueDate` | `Date` | No | No |
| `expiryDate` | `Date` | No | No |
| `isMandatoryForRole` | `Boolean` | No | No |
| `blocksRosterAssignmentOnExpiry` | `Boolean` | No | No |
| `status` | `String` | No | No |
| `daysUntilExpiry` | `Null` | Yes | No |
| `documentUrl` | `String` | No | No |
| `verifiedBy` | `String` | No | No |
| `verifiedAt` | `Null` | Yes | No |
| `notes` | `String` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `roles` (8 records)

- **Record Count**: 8
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `name_1`: { name: 1 } **(UNIQUE)** 
  - `isActive_1`: { isActive: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `description` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `moduleAccess` | `Array` | No | No |
| `permissions` | `Array` | No | No |
| `updatedAt` | `Date` | No | No |

### `policyclarifications` (7 records)

- **Record Count**: 7
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `itemKey_1`: { itemKey: 1 } **(UNIQUE)** 
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `itemKey` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `activeRuleValue` | `Object` | No | No |
| `activeRuleValue.maxNormalDays` | `Integer` | No | No |
| `activeRuleValue.exceptionAllowedDays` | `Integer` | No | No |
| `activeRuleValue.requiresHodApprovalFor3Days` | `Boolean` | No | No |
| `approvedDecision` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `effectiveDate` | `Date` | No | No |
| `interimRule` | `String` | No | No |
| `issueDescription` | `String` | No | No |
| `notes` | `String` | No | No |
| `responsibleReviewer` | `String` | No | No |
| `reviewStatus` | `String` | No | No |
| `sourceSection` | `String` | No | No |
| `title` | `String` | No | No |
| `updatedAt` | `Date` | No | No |
| `activeRuleValue.exact7DaysRouting` | `String` | No | No |
| `activeRuleValue.mdThresholdDays` | `Integer` | No | No |
| `activeRuleValue.standard2DaysApprover` | `String` | No | No |
| `activeRuleValue.critical2DaysApprover` | `String` | No | No |
| `activeRuleValue.roundingMethod` | `String` | No | No |
| `activeRuleValue.maxAccumulationCap` | `Integer` | No | No |
| `activeRuleValue.fullDayHoursMin` | `Integer` | No | No |
| `activeRuleValue.halfDayHoursMin` | `Integer` | No | No |
| `activeRuleValue.requirePreAuthorization` | `Boolean` | No | No |
| `activeRuleValue.totalPaidDays` | `Integer` | No | No |
| `activeRuleValue.elDays` | `Integer` | No | No |
| `activeRuleValue.clDays` | `Integer` | No | No |
| *... (5 additional sub-fields)* | ... | ... | ... |

### `shifts` (7 records)

- **Record Count**: 7
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `code_1`: { code: 1 } **(UNIQUE)** 
  - `type_1`: { type: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `code` | `String` | No | No |
| `type` | `String` | No | No |
| `startTime` | `String` | No | No |
| `endTime` | `String` | No | No |
| `totalDurationHours` | `Integer` | No | No |
| `gracePeriodMinutes` | `Integer` | No | No |
| `breakDurationMinutes` | `Integer` | No | No |
| `overtimeRule` | `Object` | No | No |
| `overtimeRule.eligible` | `Boolean` | No | No |
| `overtimeRule.minimumExtraMinutes` | `Integer` | No | No |
| `overtimeRule.multiplier` | `Double` | No | No |
| `overtimeRule.requiresApproval` | `Boolean` | No | No |
| `nightRule` | `Object` | No | No |
| `nightRule.isNightShift` | `Boolean` | No | No |
| `nightRule.nightHoursStart` | `String` | No | No |
| `nightRule.nightHoursEnd` | `String` | No | No |
| `nightRule.differentialAllowanceRate` | `Integer` | No | No |
| `minimumRestPeriodHours` | `Integer` | No | No |
| `weeklyOffDays` | `Array` | No | No |
| `applicableDepartments` | `Array` | No | No |
| `applicableFacilities` | `Array` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `departmentstaffingthresholds` (6 records)

- **Record Count**: 6
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `department_1`: { department: 1 } **(UNIQUE)** 
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `department` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `criticalRoles` | `Array` | No | No |
| `departmentName` | `String` | No | No |
| `facility` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `maxSimultaneousLeaves` | `Integer` | No | No |
| `minStaffCount` | `Integer` | No | No |
| `minStaffPercentage` | `Integer` | No | No |
| `updatedAt` | `Date` | No | No |

### `employeefaceattendances` (6 records)

- **Record Count**: 6
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employeeId_1`: { employeeId: 1 } **(UNIQUE)** 
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `deviceStatus` | `String` | No | No |
| `employee` | `ObjectId` | No | No |
| `faceDescriptorHash` | `String` | No | 🔒 YES |
| `faceRegistered` | `Boolean` | No | No |
| `lastVerificationDate` | `Date` | No | No |
| `lastVerificationStatus` | `String` | No | No |
| `photoSampleUrl` | `String` | No | No |
| `registrationDate` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `verificationConfidence` | `Double` | No | No |

### `trainingprograms` (6 records)

- **Record Count**: 6
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `code_1`: { code: 1 } **(UNIQUE)** 
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `title` | `String` | No | No |
| `code` | `String` | No | No |
| `category` | `String` | No | No |
| `description` | `String` | No | No |
| `isMandatory` | `Boolean` | No | No |
| `mandatoryForDepartments` | `Array` | No | No |
| `mandatoryForDesignations` | `Array` | No | No |
| `validityPeriodMonths` | `Integer` | No | No |
| `passingScorePercentage` | `Integer` | No | No |
| `durationHours` | `Integer` | No | No |
| `trainer` | `String` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `companycalendarevents` (5 records)

- **Record Count**: 5
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `dateString_1_status_1`: { dateString: 1, status: 1 }  
  - `category_1`: { category: 1 }  
  - `applicableTo_1`: { applicableTo: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `dateString` | `String` | No | No |
| `title` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `applicableTo` | `String` | No | No |
| `category` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `createdBy` | `Object` | No | No |
| `createdBy.name` | `String` | No | No |
| `createdBy.role` | `String` | No | No |
| `date` | `Date` | No | No |
| `department` | `String` | No | No |
| `description` | `String` | No | No |
| `employeeCodes` | `Array` | No | No |
| `endTime` | `String` | No | No |
| `isDemo` | `Boolean` | No | No |
| `location` | `String` | No | No |
| `organizer` | `String` | No | No |
| `startTime` | `String` | No | No |
| `status` | `String` | No | No |
| `type` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `attendancereporthistories` (3 records)

- **Record Count**: 3
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `createdAt_-1`: { createdAt: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `reportName` | `String` | No | No |
| `reportType` | `String` | No | No |
| `generatedByName` | `String` | No | No |
| `userRole` | `String` | No | No |
| `recordCount` | `Integer` | No | No |
| `employeeCount` | `Integer` | No | No |
| `dateRange` | `String` | No | No |
| `filtersSummary` | `String` | No | No |
| `columnsIncluded` | `Array` | No | No |
| `format` | `String` | No | No |
| `fileSizeBytes` | `Integer` | No | No |
| `status` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |
| `generatedBy` | `ObjectId` | No | No |

### `calendarspecialdays` (3 records)

- **Record Count**: 3
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `dateString_1_type_1_status_1`: { dateString: 1, type: 1, status: 1 }  
  - `department_1`: { department: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `type` | `String` | No | No |
| `dateString` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `applicableTo` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `createdBy` | `Object` | No | No |
| `createdBy.name` | `String` | No | No |
| `createdBy.role` | `String` | No | No |
| `date` | `Date` | No | No |
| `department` | `String` | No | No |
| `employeeCodes` | `Array` | No | No |
| `isDemo` | `Boolean` | No | No |
| `name` | `String` | No | No |
| `notes` | `String` | No | No |
| `reason` | `String` | No | No |
| `shift` | `Null` | Yes | No |
| `shiftName` | `String` | No | No |
| `status` | `String` | No | No |
| `updatedAt` | `Date` | No | No |
| `workingHours` | `Integer` | No | No |

### `workschedules` (3 records)

- **Record Count**: 3
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `scheduleType_1_status_1`: { scheduleType: 1, status: 1 }  
  - `employeeCode_1_status_1`: { employeeCode: 1, status: 1 }  
  - `department_1_status_1`: { department: 1, status: 1 }  
  - `effectiveFrom_1_effectiveTo_1`: { effectiveFrom: 1, effectiveTo: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `scheduleType` | `String` | No | No |
| `department` | `String` | No | No |
| `employee` | `Null` | Yes | No |
| `employeeCode` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `facility` | `String` | No | No |
| `weeklyPattern` | `Object` | No | No |
| `weeklyPattern.monday` | `Object` | No | No |
| `weeklyPattern.monday.status` | `String` | No | No |
| `weeklyPattern.monday.shift` | `Null` | Yes | No |
| `weeklyPattern.monday.shiftName` | `String` | No | No |
| `weeklyPattern.monday.startTime` | `String` | No | No |
| `weeklyPattern.monday.endTime` | `String` | No | No |
| `weeklyPattern.monday.workingHours` | `Integer` | No | No |
| `weeklyPattern.tuesday` | `Object` | No | No |
| `weeklyPattern.tuesday.status` | `String` | No | No |
| `weeklyPattern.tuesday.shift` | `Null` | Yes | No |
| `weeklyPattern.tuesday.shiftName` | `String` | No | No |
| `weeklyPattern.tuesday.startTime` | `String` | No | No |
| `weeklyPattern.tuesday.endTime` | `String` | No | No |
| `weeklyPattern.tuesday.workingHours` | `Integer` | No | No |
| `weeklyPattern.wednesday` | `Object` | No | No |
| `weeklyPattern.wednesday.status` | `String` | No | No |
| `weeklyPattern.wednesday.shift` | `Null` | Yes | No |
| `weeklyPattern.wednesday.shiftName` | `String` | No | No |
| `weeklyPattern.wednesday.startTime` | `String` | No | No |
| `weeklyPattern.wednesday.endTime` | `String` | No | No |
| `weeklyPattern.wednesday.workingHours` | `Integer` | No | No |
| *... (46 additional sub-fields)* | ... | ... | ... |

### `attendanceregularizations` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `employee_1_dateString_1`: { employee: 1, dateString: 1 }  
  - `status_1`: { status: 1 }  
  - `departmentName_1`: { departmentName: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `employee` | `ObjectId` | No | No |
| `employeeId` | `String` | No | No |
| `employeeName` | `String` | No | No |
| `departmentName` | `String` | No | No |
| `branchName` | `String` | No | No |
| `date` | `Date` | No | No |
| `dateString` | `String` | No | No |
| `requestType` | `String` | No | No |
| `proposedCheckIn` | `Date` | No | No |
| `proposedCheckOut` | `Date` | No | No |
| `proposedStatus` | `String` | No | No |
| `reason` | `String` | No | No |
| `status` | `String` | No | No |
| `reviewedByName` | `String` | No | No |
| `reviewRemarks` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `batches` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `batchNumber_1`: { batchNumber: 1 } **(UNIQUE)** 
  - `product_1`: { product: 1 }  
  - `expiryDate_1`: { expiryDate: 1 }  
  - `status_1`: { status: 1 }  
  - `product_1_expiryDate_1`: { product: 1, expiryDate: 1 }  
  - `status_1_qcStatus_1_releaseStatus_1`: { status: 1, qcStatus: 1, releaseStatus: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `batchNumber` | `String` | No | No |
| `product` | `ObjectId` | No | No |
| `productName` | `String` | No | No |
| `productionOrder` | `Null` | Yes | No |
| `facility` | `ObjectId, Null` | Yes | No |
| `manufacturingDate` | `Date` | No | No |
| `expiryDate` | `Date` | No | No |
| `quantity` | `Integer` | No | No |
| `batchSize` | `Integer` | No | No |
| `unit` | `String` | No | No |
| `status` | `String` | No | No |
| `qcStatus` | `String` | No | No |
| `qaStatus` | `String` | No | No |
| `releaseStatus` | `String` | No | No |
| `yieldPercentage` | `Double` | No | No |
| `cleanroomGrade` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `enquiries` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `company_1`: { company: 1 }  
  - `email_1`: { email: 1 }  
  - `status_1`: { status: 1 }  
  - `email_1_company_1`: { email: 1, company: 1 }  
  - `status_1_createdAt_-1`: { status: 1, createdAt: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `name` | `String` | No | No |
| `company` | `String` | No | 🔒 YES |
| `email` | `String` | No | No |
| `phone` | `String` | No | No |
| `country` | `String` | No | No |
| `enquiryType` | `String` | No | No |
| `category` | `String` | No | No |
| `message` | `String` | No | No |
| `source` | `String` | No | No |
| `status` | `String` | No | No |
| `assignedTo` | `Null` | Yes | No |
| `assignedToName` | `String` | No | No |
| `priority` | `String` | No | No |
| `aiCategory` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `facilities` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `facilityCode_1`: { facilityCode: 1 } **(UNIQUE)** 
  - `facilityName_1`: { facilityName: 1 }  
  - `status_1`: { status: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `facilityCode` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `address` | `String` | No | No |
| `certifications` | `Array` | No | No |
| `city` | `String` | No | No |
| `country` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `departments` | `Array` | No | No |
| `facilityName` | `String` | No | No |
| `facilityType` | `String` | No | No |
| `manufacturingCapabilities` | `Array` | No | No |
| `pincode` | `String` | No | 🔒 YES |
| `state` | `String` | No | No |
| `status` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `inventorytransactions` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `transactionNumber_1`: { transactionNumber: 1 }  
  - `item_1`: { item: 1 }  
  - `transactionType_1`: { transactionType: 1 }  
  - `timestamp_1`: { timestamp: 1 }  
  - `item_1_timestamp_-1`: { item: 1, timestamp: -1 }  
  - `transactionType_1_timestamp_-1`: { transactionType: 1, timestamp: -1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `item` | `ObjectId` | No | No |
| `batch` | `ObjectId, Null` | Yes | No |
| `batchNumber` | `String` | No | No |
| `transactionType` | `String` | No | No |
| `quantity` | `Integer` | No | No |
| `previousStock` | `Integer` | No | No |
| `resultingStock` | `Integer` | No | No |
| `fromWarehouse` | `Null, ObjectId` | Yes | No |
| `toWarehouse` | `Null` | Yes | No |
| `reference` | `String` | No | No |
| `referenceOrder` | `String` | No | No |
| `reason` | `String` | No | No |
| `performedBy` | `ObjectId, Null` | Yes | No |
| `recordedBy` | `Null, ObjectId` | Yes | No |
| `performedByName` | `String` | No | No |
| `notes` | `String` | No | No |
| `transactionNumber` | `String` | No | No |
| `timestamp` | `Date` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `invoices` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `invoiceNumber_1`: { invoiceNumber: 1 } **(UNIQUE)** 
  - `paymentStatus_1`: { paymentStatus: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `invoiceNumber` | `String` | No | No |
| `invoiceType` | `String` | No | No |
| `partyName` | `String` | No | No |
| `partyType` | `String` | No | No |
| `gstin` | `String` | No | No |
| `dueDate` | `Date` | No | No |
| `currency` | `String` | No | No |
| `subtotal` | `Integer` | No | No |
| `taxAmount` | `Integer` | No | No |
| `totalAmount` | `Integer` | No | No |
| `amountPaid` | `Integer` | No | No |
| `paymentStatus` | `String` | No | No |
| `paymentMethod` | `String` | No | No |
| `notes` | `String` | No | No |
| `status` | `String` | No | No |
| `createdBy` | `ObjectId` | No | No |
| `invoiceDate` | `Date` | No | No |
| `items` | `Array` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `leavepolicies` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `department_1_leaveYear_1`: { department: 1, leaveYear: 1 }  
  - `policyNumber_1`: { policyNumber: 1 } **(UNIQUE)** 
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `policyName` | `String` | No | No |
| `department` | `String` | No | No |
| `leaveYear` | `Integer` | No | No |
| `carryForwardMax` | `Integer` | No | No |
| `encashmentAllowed` | `Boolean` | No | No |
| `probationLeaveAllowed` | `Boolean` | No | No |
| `weekendExclusion` | `Boolean` | No | No |
| `holidayExclusion` | `Boolean` | No | No |
| `workflowStages` | `Array` | No | No |
| `workflowStages[].stage` | `Integer` | No | No |
| `workflowStages[].name` | `String` | No | No |
| `workflowStages[].role` | `String` | No | No |
| `workflowStages[]._id` | `ObjectId` | No | No |
| `isActive` | `Boolean` | No | No |
| `isDemo` | `Boolean` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |
| `policyNumber` | `String` | No | No |
| `approvalAuthority` | `String` | No | No |
| `effectiveDate` | `Date` | No | No |
| `owner` | `String` | No | No |
| `rules` | `Object` | No | No |
| `rules.earnedLeave` | `Object` | No | No |
| `rules.earnedLeave.annualEntitlementDays` | `Integer` | No | No |
| `rules.earnedLeave.monthlyAccrualRate` | `Double` | No | No |
| `rules.earnedLeave.minConsecutiveDays` | `Integer` | No | No |
| `rules.earnedLeave.maxNormalDurationDays` | `Integer` | No | No |
| `rules.earnedLeave.minNoticeDays3To4` | `Integer` | No | No |
| *... (27 additional sub-fields)* | ... | ... | ... |

### `productionlines` (2 records)

- **Record Count**: 2
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `code_1`: { code: 1 } **(UNIQUE)** 
  - `status_1`: { status: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `code` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `capacity` | `String` | No | No |
| `cleanroomGrade` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `dosageForm` | `String` | No | No |
| `facility` | `ObjectId` | No | No |
| `machines` | `Array` | No | No |
| `name` | `String` | No | No |
| `status` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `canteensettings` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `departmentName` | `String` | No | No |
| `cafeteriaLocation` | `String` | No | No |
| `inChargeName` | `String` | No | No |
| `contactExtension` | `String` | No | No |
| `lunchStartTime` | `String` | No | No |
| `lunchEndTime` | `String` | No | No |
| `gracePeriodMinutes` | `Integer` | No | No |
| `dailyTargetCapacity` | `Integer` | No | No |
| `bufferPercent` | `Integer` | No | No |
| `autoRefreshIntervalSeconds` | `Integer` | No | No |
| `allowDishTypeSelection` | `Boolean` | No | No |
| `defaultDishType` | `String` | No | No |
| `enableNotificationThresholds` | `Boolean` | No | No |
| `updatedBy` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `companies` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `CIN` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `capabilities` | `Array` | No | No |
| `certifications` | `Array` | No | No |
| `companyName` | `String` | No | 🔒 YES |
| `contactInformation` | `Object` | No | No |
| `contactInformation.email` | `String` | No | No |
| `contactInformation.phone` | `String` | No | No |
| `contactInformation.website` | `String` | No | No |
| `corporateOffice` | `Object` | No | No |
| `corporateOffice.address` | `String` | No | No |
| `corporateOffice.city` | `String` | No | No |
| `corporateOffice.state` | `String` | No | No |
| `corporateOffice.country` | `String` | No | No |
| `corporateOffice.pincode` | `String` | No | 🔒 YES |
| `createdAt` | `Date` | No | No |
| `legalName` | `String` | No | No |
| `manufacturingUnits` | `Array` | No | No |
| `manufacturingUnits[].title` | `String` | No | No |
| `manufacturingUnits[].address` | `String` | No | No |
| `manufacturingUnits[].city` | `String` | No | No |
| `manufacturingUnits[].state` | `String` | No | No |
| `manufacturingUnits[].country` | `String` | No | No |
| `manufacturingUnits[].pincode` | `String` | No | 🔒 YES |
| `manufacturingUnits[]._id` | `ObjectId` | No | No |
| `mission` | `String` | No | No |
| `publicStatistics` | `Object` | No | No |
| `publicStatistics.tabletsAnnualCapacity` | `String` | No | No |
| `publicStatistics.dpsBottlesCapacity` | `String` | No | No |
| *... (11 additional sub-fields)* | ... | ... | ... |

### `inventoryitems` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `product_1`: { product: 1 }  
  - `warehouse_1`: { warehouse: 1 }  
  - `batch_1`: { batch: 1 }  
  - `status_1`: { status: 1 }  
  - `expiryDate_1`: { expiryDate: 1 }  
  - `product_1_warehouse_1_batch_1`: { product: 1, warehouse: 1, batch: 1 }  
  - `status_1_expiryDate_1`: { status: 1, expiryDate: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `product` | `ObjectId` | No | No |
| `warehouse` | `ObjectId` | No | No |
| `batch` | `ObjectId` | No | No |
| `batchNumber` | `String` | No | No |
| `quantity` | `Integer` | No | No |
| `reservedQuantity` | `Integer` | No | No |
| `availableQuantity` | `Integer` | No | No |
| `unit` | `String` | No | No |
| `status` | `String` | No | No |
| `expiryDate` | `Date` | No | No |
| `reorderLevel` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `knowledgechunks` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `entity_1`: { entity: 1 }  
  - `content_text_source_text`: { _fts: text, _ftsx: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `source` | `String` | No | No |
| `sourcePage` | `Integer` | No | No |
| `__v` | `Integer` | No | No |
| `content` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `embedding` | `Array` | No | No |
| `entity` | `Null` | Yes | No |
| `metadata` | `Object` | No | No |
| `metadata.verified` | `Boolean` | No | No |
| `metadata.sourceDoc` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `knowledgeentities` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `entityType_1`: { entityType: 1 }  
  - `entityId_1`: { entityId: 1 }  
  - `entityType_1_entityId_1`: { entityType: 1, entityId: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `entityId` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `createdAt` | `Date` | No | No |
| `entityType` | `String` | No | No |
| `metadata` | `Object` | No | No |
| `metadata.cin` | `String` | No | No |
| `metadata.location` | `String` | No | No |
| `name` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `leaveblackoutperiods` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `periodId_1`: { periodId: 1 } **(UNIQUE)** 
  - `startDate_1_endDate_1_department_1`: { startDate: 1, endDate: 1, department: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `title` | `String` | No | No |
| `facility` | `String` | No | No |
| `department` | `String` | No | No |
| `startDate` | `Date` | No | No |
| `endDate` | `Date` | No | No |
| `startDateString` | `String` | No | No |
| `endDateString` | `String` | No | No |
| `notificationDate` | `Date` | No | No |
| `notificationDaysInAdvance` | `Integer` | No | No |
| `reason` | `String` | No | No |
| `declaredBy` | `String` | No | No |
| `emergencyExceptionsAllowed` | `Boolean` | No | No |
| `isActive` | `Boolean` | No | No |
| `periodId` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `qcsamples` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `sampleNumber_1`: { sampleNumber: 1 } **(UNIQUE)** 
  - `batch_1`: { batch: 1 }  
  - `product_1`: { product: 1 }  
  - `status_1`: { status: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `sampleNumber` | `String` | No | No |
| `batch` | `ObjectId` | No | No |
| `batchNumber` | `String` | No | No |
| `product` | `ObjectId` | No | No |
| `sampleType` | `String` | No | No |
| `submittedByName` | `String` | No | No |
| `status` | `String` | No | No |
| `receivedAt` | `Date` | No | No |
| `createdAt` | `Date` | No | No |
| `updatedAt` | `Date` | No | No |
| `__v` | `Integer` | No | No |

### `regulatoryrecords` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `product_1`: { product: 1 }  
  - `country_1`: { country: 1 }  
  - `expiryDate_1`: { expiryDate: 1 }  
  - `status_1`: { status: 1 }  
  - `country_1_product_1`: { country: 1, product: 1 }  
  - `expiryDate_1_status_1`: { expiryDate: 1, status: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `registrationNumber` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `authority` | `String` | No | No |
| `country` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `documents` | `Array` | No | No |
| `expiryDate` | `Date` | No | No |
| `product` | `ObjectId` | No | No |
| `productName` | `String` | No | No |
| `registrationDate` | `Date` | No | No |
| `responsiblePerson` | `String` | No | No |
| `status` | `String` | No | No |
| `updatedAt` | `Date` | No | No |

### `warehouses` (1 records)

- **Record Count**: 1
- **Index Definitions**:
  - `_id_`: { _id: 1 }  
  - `code_1`: { code: 1 } **(UNIQUE)** 
  - `warehouseType_1`: { warehouseType: 1 }  
- **Field Profile Sample (Top / Significant Fields)**:

| Field Name | Observed Types | Nullable / Optional | Sensitive? |
|---|---|---|---|
| `_id` | `ObjectId` | No | No |
| `code` | `String` | No | No |
| `__v` | `Integer` | No | No |
| `capacity` | `String` | No | No |
| `createdAt` | `Date` | No | No |
| `facility` | `ObjectId` | No | No |
| `location` | `String` | No | No |
| `status` | `String` | No | No |
| `temperatureRange` | `String` | No | No |
| `updatedAt` | `Date` | No | No |
| `warehouseName` | `String` | No | No |
| `warehouseType` | `String` | No | No |

---

## 4. Zero-Record Collections Inventory (76 Schema-Declared Collections)

These collections represent validated application domain modules whose Mongoose schemas exist in the codebase but currently hold 0 records in MongoDB Atlas. These will be converted into corresponding PostgreSQL relational tables with appropriate constraints to guarantee full forward compatibility:

| # | Collection Name | Associated Mongoose Model | Purpose / Operational Scope |
|---|---|---|---|
| 1 | `accommodationrequests` | `AccommodationRequest` | Forward operational domain table |
| 2 | `aiconversations` | `AIConversation` | Forward operational domain table |
| 3 | `aimessages` | `AIMessage` | Forward operational domain table |
| 4 | `alerts` | `Alert` | Forward operational domain table |
| 5 | `assets` | `Asset` | Forward operational domain table |
| 6 | `attendanceauditlogs` | `AttendanceAuditLog` | Forward operational domain table |
| 7 | `attendancepolicies` | `AttendancePolicy` | Forward operational domain table |
| 8 | `audits` | `Audit` | Forward operational domain table |
| 9 | `bankaccounts` | `bankaccounts` | Forward operational domain table |
| 10 | `budgetplans` | `BudgetPlan` | Forward operational domain table |
| 11 | `calendarexceptions` | `CalendarException` | Forward operational domain table |
| 12 | `candidates` | `candidates` | Forward operational domain table |
| 13 | `canteenlunchrecords` | `CanteenLunchRecord` | Forward operational domain table |
| 14 | `capas` | `CAPA` | Forward operational domain table |
| 15 | `changecontrols` | `ChangeControl` | Forward operational domain table |
| 16 | `compoffcredits` | `CompOffCredit` | Forward operational domain table |
| 17 | `compoffworkauthorizations` | `compoffworkauthorizations` | Forward operational domain table |
| 18 | `countrycompliances` | `CountryCompliance` | Forward operational domain table |
| 19 | `customers` | `Customer` | Forward operational domain table |
| 20 | `databreaches` | `databreaches` | Forward operational domain table |
| 21 | `deviations` | `Deviation` | Forward operational domain table |
| 22 | `disciplinarycases` | `DisciplinaryCase` | Forward operational domain table |
| 23 | `diversitymetrics` | `DiversityMetric` | Forward operational domain table |
| 24 | `documents` | `Document` | Forward operational domain table |
| 25 | `dossiersubmissions` | `DossierSubmission` | Forward operational domain table |
| 26 | `emergencydrills` | `EmergencyDrill` | Forward operational domain table |
| 27 | `expenses` | `Expense` | Forward operational domain table |
| 28 | `exportshipments` | `ExportShipment` | Forward operational domain table |
| 29 | `hrautomationrules` | `HRAutomationRule` | Forward operational domain table |
| 30 | `hrcompliances` | `HRCompliance` | Forward operational domain table |
| 31 | `icccommittees` | `ICCCommittee` | Forward operational domain table |
| 32 | `jobrequisitions` | `JobRequisition` | Forward operational domain table |
| 33 | `leads` | `Lead` | Forward operational domain table |
| 34 | `leaveactivities` | `LeaveActivity` | Forward operational domain table |
| 35 | `leaveencashmentrequests` | `leaveencashmentrequests` | Forward operational domain table |
| 36 | `leavegrievances` | `leavegrievances` | Forward operational domain table |
| 37 | `leaverefreshertrainings` | `leaverefreshertrainings` | Forward operational domain table |
| 38 | `leaveregularizationrequests` | `LeaveRegularizationRequest` | Forward operational domain table |
| 39 | `leaverequests` | `leaverequests` | Forward operational domain table |
| 40 | `loanliabilities` | `LoanLiability` | Forward operational domain table |
| 41 | `machines` | `Machine` | Forward operational domain table |
| 42 | `manufacturingcapabilities` | `ManufacturingCapability` | Forward operational domain table |
| 43 | `maternitycases` | `MaternityCase` | Forward operational domain table |
| 44 | `medicalfitnessrecords` | `MedicalFitnessRecord` | Forward operational domain table |
| 45 | `missedpunches` | `missedpunches` | Forward operational domain table |
| 46 | `onboardingapplications` | `OnboardingApplication` | Forward operational domain table |
| 47 | `onboardings` | `Onboarding` | Forward operational domain table |
| 48 | `operationalexpenses` | `OperationalExpense` | Forward operational domain table |
| 49 | `overtimerequests` | `OvertimeRequest` | Forward operational domain table |
| 50 | `payrollrules` | `payrollrules` | Forward operational domain table |
| 51 | `payrolls` | `Payroll` | Forward operational domain table |
| 52 | `performancecycles` | `PerformanceCycle` | Forward operational domain table |
| 53 | `performancereviews` | `performancereviews` | Forward operational domain table |
| 54 | `policies` | `Policy` | Forward operational domain table |
| 55 | `policyacknowledgments` | `PolicyAcknowledgment` | Forward operational domain table |
| 56 | `policyrules` | `PolicyRule` | Forward operational domain table |
| 57 | `poshcases` | `POSHCase` | Forward operational domain table |
| 58 | `privacyrequests` | `PrivacyRequest` | Forward operational domain table |
| 59 | `probationreviews` | `ProbationReview` | Forward operational domain table |
| 60 | `productcosts` | `productcosts` | Forward operational domain table |
| 61 | `productionorders` | `ProductionOrder` | Forward operational domain table |
| 62 | `qcresults` | `QCResult` | Forward operational domain table |
| 63 | `qctests` | `QCTest` | Forward operational domain table |
| 64 | `remoteworkrequests` | `RemoteWorkRequest` | Forward operational domain table |
| 65 | `rosters` | `Roster` | Forward operational domain table |
| 66 | `safetycommittees` | `SafetyCommittee` | Forward operational domain table |
| 67 | `safetyincidents` | `SafetyIncident` | Forward operational domain table |
| 68 | `salesorders` | `SalesOrder` | Forward operational domain table |
| 69 | `securityincidents` | `SecurityIncident` | Forward operational domain table |
| 70 | `separationcases` | `SeparationCase` | Forward operational domain table |
| 71 | `shifthandoverlogs` | `ShiftHandoverLog` | Forward operational domain table |
| 72 | `sops` | `SOP` | Forward operational domain table |
| 73 | `tasks` | `Task` | Forward operational domain table |
| 74 | `taxrecords` | `taxrecords` | Forward operational domain table |
| 75 | `whistleblowercases` | `WhistleblowerCase` | Forward operational domain table |
| 76 | `workforcerosters` | `WorkforceRoster` | Forward operational domain table |

---

## 5. Data-Truth Verification & Integrity Observations

1. **Zero Data Fabrication**: All document counts above are directly queried from the live Atlas replica set.
2. **111-Product Catalogue**: Exactly 111 products exist in collection `products`, perfectly matching business requirements.
3. **Biometric Attendance Dominance**: Biometric punch records (`attendances`: 10,527 and snapshots: 2,258) account for ~78% of all data points, requiring high-throughput batching during ETL.
4. **Sensitive Field Protection**: Password hashes exist solely in bcrypt format in `users` and `employees`. Bank details exist in `employee_bank_details` (38 records) with account number and IFSC.
