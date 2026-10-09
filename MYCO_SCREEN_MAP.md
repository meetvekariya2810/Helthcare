# MyCO HRMS Reference System — Complete Screen Map & Navigation Hierarchy

**Reference System:** MyCO apAdmin (`https://abd.my-co.app/bjkhealthcare/apAdmin/welcome`)  
**Scope:** Complete functional inventory of screens, modal views, submodules, and actions.  
**Classification:** DISCOVERED (observed in live code/assets) vs. REQUIRES VERIFICATION (authenticated area).

---

## 1. Authentication & System Access Screens

```
[MyCO Login Portal: /bjkhealthcare/apAdmin/welcome]
  │
  ├── [Screen 0.1] Standard Password Login Screen (DISCOVERED)
  │     ├── Form: Country Code dropdown, Mobile/Email input, Password input (toggle eye)
  │     ├── Security: Cloudflare Turnstile CAPTCHA, CSRF Token
  │     ├── Actions: "Sign In", "Get OTP", "Forgot Password ?"
  │
  ├── [Screen 0.2] OTP Authentication Screen (DISCOVERED)
  │     ├── Form: 6-Box individual digit input (`.otp-input`) with auto-advance and clipboard paste
  │     ├── Actions: "Verify OTP", "Sign In With Password ?"
  │
  ├── [Screen 0.3] Passcode 2FA Modal / Row (DISCOVERED)
  │     ├── Form: 6-digit numeric secondary passcode (`#passcodeRow`)
  │     ├── Actions: "Submit Passcode"
  │
  └── [Screen 0.4] Password Recovery Screen (`forgot.php`) (DISCOVERED)
        ├── Form: Registered Mobile/Email, Captcha verification
        └── Actions: "Send Reset Link / OTP", "Back to Login"
```

---

## 2. Executive Dashboard & Overview Screens (`/welcome`)

```
[MyCO Executive Welcome Dashboard: .welcome-exec-header] (DISCOVERED)
  │
  ├── [Screen 1.1] Workforce Overview Widget (.welcome-metric-card)
  │     ├── Metrics: Total Staff, Active Employees, On Leave, New Joiners
  │     └── Actions: Filter by Branch/Department, Date Range Picker
  │
  ├── [Screen 1.2] Real-Time Attendance Gauge (.att-gauge-label)
  │     ├── Metrics: Present %, Late In %, Absent %, Half Day %
  │     └── Visualization: Split Donut (.att-split-donut), Punch Bell Curve (.att-bell)
  │
  ├── [Screen 1.3] Celebrations & Milestones (.welcome-celeb-item)
  │     ├── Content: Today's Birthdays, Upcoming Work Anniversaries
  │     └── Actions: "Send Greeting", "View Team Calendar"
  │
  ├── [Screen 1.4] HR Attention & Anomaly Warning List (.welcome-warn-row)
  │     ├── Items: Pending Leave Approvals, Shift Mismatches, Expiring Documents
  │     └── Actions: "Review Anomaly", "Dismiss Alert"
  │
  └── [Screen 1.5] Asset & Expense Snapshot (.welcome-asset-name, .welcome-expense-amt)
        ├── Metrics: Deployed Assets %, Monthly Expense Utilization
        └── Actions: "View Expense Queue", "View Asset Inventory"
```

---

## 3. Attendance & Rostering Screens (`.att-cmd`, `addShift.php`)

```
[Attendance & Shifts Subsystem]
  │
  ├── [Screen 2.1] Attendance Command Center (`.att-cmd`) (DISCOVERED)
  │     ├── View: Daily Muster Roll, Punch-in distribution curve, Channel breakdown
  │     ├── Filters: Date, Branch, Shift, Department, Channel (Biometric / Web / Mobile)
  │     └── Actions: Manual Attendance Entry, Attendance Regularization, Muster Export
  │
  ├── [Screen 2.2] Shift Master & Scheduler (`addShift.php`) (DISCOVERED)
  │     ├── Form: Shift Name, Start Time, End Time, Grace Period (mins), Half-day cutoff
  │     ├── Advanced: Parent Shift link, Rotational rules, Night-shift indicator
  │     └── Actions: "Save Shift", "Assign Employees", "Shift Rotation Plan"
  │
  └── [Screen 2.3] GPS Track Playback & Visit Log (`trackDetailUser.php`) (DISCOVERED)
        ├── View: Timeline map, GPS breadcrumbs, Punch-in / Halt / Punch-out geo-pins
        ├── Telemetry: Battery %, Device status, Dwell time at customer / plant
        └── Actions: Playback (1x, 2x, 4x), Export Location Log
```

---

## 4. Employee Master & Administration Screens

```
[Employee Directory & Lifecycle] (REQUIRES MYCO ACCESS / VERIFICATION)
  │
  ├── [Screen 3.1] Employee Directory (`employeeList.php`)
  │     ├── Table: Photo, Employee Code, Name, Branch, Dept, Designation, Status
  │     └── Actions: "Add Employee", "View Profile", "Edit", "Deactivate", "Export Excel"
  │
  ├── [Screen 3.2] Employee Onboarding Wizard (`addEmployee.php`)
  │     ├── Multi-Step: Basic Info → Employment → Address → Bank → KYC → Family
  │     └── Actions: "Save Draft", "Next Step", "Upload Documents", "Submit"
  │
  ├── [Screen 3.3] Employee 360 Profile (`employeeDetails.php`)
  │     ├── Tabs: Personal, Job, Salary, Attendance, Leave, Documents, Assets, Timeline
  │     └── Actions: "Update Profile", "Generate ID Card", "View Audit Trail"
  │
  └── [Screen 3.4] Document & Letter Template Builder (`letterSetting.php`) (DISCOVERED)
        ├── Editor: CKEditor 5 / Summernote with Dynamic Field Tokens
        ├── Templates: Offer Letter, Appointment Letter, Experience Certificate, Relieving Letter
        └── Actions: "Save Template", "Set Fallback Priority", "Preview PDF"
```

---

## 5. Leave, Payroll & Self-Service Screens

```
[Operations & Financial Subsystems] (REQUIRES MYCO ACCESS / VERIFICATION)
  │
  ├── [Screen 4.1] Leave Management (`leaveList.php`)
  │     ├── Views: Leave Quotas, Pending Applications, Approved / Rejected History
  │     └── Actions: "Apply Leave", "Approve", "Reject with Comment", "Leave Encashment"
  │
  ├── [Screen 4.2] Payroll Processing (`salaryGenerate.php`)
  │     ├── Steps: Attendance Locking → Variable Component Entry → Statutory Deductions → Payslip Generation
  │     └── Actions: "Compute Payroll", "Lock Month", "Publish Payslips", "Bank Transfer Export"
  │
  ├── [Screen 4.3] Expense Reimbursement (`expenseList.php`)
  │     ├── Table: Claim ID, Employee, Category, Amount, Receipt Attachment, Status
  │     └── Actions: "Submit Claim", "Manager Approve", "Finance Approve", "Disburse"
  │
  └── [Screen 4.4] Employee Self Service Portal (`myProfile.php` / Mobile App)
        ├── Views: My Attendance, My Leaves, My Payslips, My Documents, My Assets
        └── Actions: Punch In/Out, Request Leave, Download Payslip PDF, Update Contact
```

---

## 6. BJK Healthcare Digital Brain Route Mapping

Every screen discovered in MyCO has been mapped to a cleaner, more secure, and responsive route within the BJK Healthcare Digital Brain:

| MyCO Reference Screen | BJK Healthcare Digital Brain Route | Permissions Enforced |
| :--- | :--- | :--- |
| `/apAdmin/welcome` (Login) | `/login` | Public |
| `/apAdmin/welcome` (Dashboard) | `/hr` or `/hrms` | All Authenticated HR/Managers |
| `employeeList.php` | `/hr/employees` | `employee:view` |
| `employeeDetails.php` | `/hr/employees/:id` | `employee:view` (Masked PII) |
| `addEmployee.php` | `/hr/onboarding` | `onboarding:view` |
| `trackDetailUser.php` | `/hrms/attendance` (GPS Tab) | `attendance:view` |
| `addShift.php` | `/hrms/shifts` & `/hrms/rostering` | `shift:manage` |
| `leaveList.php` | `/hrms/leave` | `leave:view`, `leave:approve` |
| `salaryGenerate.php` | `/hrms/payroll` | Strictly `PAYROLL_ADMIN`, `FINANCE_MANAGER` |
| `letterSetting.php` | `/hrms/documents` & `pdfService.js` | `document:manage` |
| `myProfile.php` | `/hrms/me` (Employee Self-Service) | `EMPLOYEE` (Self-data only) |
