# BJK Healthcare Digital Brain — Enterprise HRMS Master Requirements

**System:** BJK Healthcare Digital Brain (Integrated HR Command Center)  
**Database:** MongoDB Atlas (`bjk_healthcare`)  
**Standards:** WHO-GMP Schedule M, US-FDA 21 CFR Part 11 & Part 211, Indian Labor Laws.  

---

## 1. System Vision & Integration Architecture

The BJK Healthcare HRMS is not an isolated or generic application; it is built natively into the **BJK Healthcare Digital Brain**. It utilizes existing organization collections (`Company`, `Facility`, `Department`, `User`, `Role`, `AuditLog`) to prevent duplicate data, fragmented sessions, or siloed user records.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             BJK HEALTHCARE DIGITAL BRAIN                    │
       │  (Single JWT Auth, Role-Based Access, 21 CFR Part 11 Logs)  │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
 ┌──────────────────┐                                    ┌──────────────────┐
 │ Operational Core │                                    │  HRMS & People   │
 │ • Factory Ops    │                                    │  • HR Dashboard  │
 │ • Production/Batch│                                   │  • 11-Step Onboard│
 │ • QA/QC Labs     │                                    │  • Employee 360  │
 │ • Inventory/ERP  │                                    │  • Attendance/GPS│
 │ • Regulatory Doc │                                    │  • Cleanroom LMS │
 │ • AI Copilot     │                                    │  • Payroll & Statutory
 └──────────────────┘                                    └──────────────────┘
          ▲                                                       ▲
          └───────────────────────────┬───────────────────────────┘
                                      │
                       ┌──────────────┴──────────────┐
                       │  MongoDB Atlas Database     │
                       │  Database: `bjk_healthcare` │
                       └─────────────────────────────┘
```

---

## 2. Functional Requirements by Module

### 2.1 HR Command Center (`/hr`, `/hr/dashboard`, `/hrms`)
* **Workforce Overview:** Real-time headcount counters (Total, Active, On Probation, Confirmed, On Leave, Resigned).
* **Recruitment Funnel:** Openings, Applications, Interview Pending, Offers, Joined.
* **Onboarding Pipeline:** Draft, Submitted, HR Verification, Document Pending, Approved.
* **Compliance Alarms:** Expiring Medical Certificates, Expiring cGMP Training, Expiring Licenses.
* **Attendance Today:** Present, Absent, Late, Early Exit, Work From Home, On Duty.
* **Data Truth Principle:** Display `--` or `Requires Internal Data` if a live telemetry data source is disconnected. Never fabricate mock numbers in production views.

### 2.2 Employee Master Directory (`/hr/employees`)
* Filterable, searchable data table with debounced global search (Employee ID, Name, Department, Designation, Status, Manager).
* Quick actions: View 360 Profile, Edit, Verify Documents, Attendance Record, Leave Balance, Issue ID Card, Deactivate.
* Distinct badge for Demo Records (`DEMO-EMP-000001` marked with `DEMO DATA`).

### 2.3 11-Step Guided Onboarding Wizard (`/hr/onboarding`)
* Step 1: Basic Information (Name, Gender, DOB, Blood Group, Mobile, Emergency Contact).
* Step 2: Employment Details (Plant/Facility, Business Unit, Department, Grade, Shift, Probation).
* Step 3: Previous Employment (Repeatable past companies, designations, relieving certs).
* Step 4: Personal & Family (Parents, Spouse, Dependents, Nominee).
* Step 5: Residential Details (Permanent & Current Address with Proof).
* Step 6: Education & Qualifications (10th/12th, B.Pharm, M.Pharm, Degree Certs).
* Step 7: Bank & Financial Details (Account No, Confirm No, IFSC, Passbook Copy, PII Masking).
* Step 8: Identity Documents (Aadhaar, PAN, Passport, Driving License, Voter ID).
* Step 9: Healthcare & Occupational Information (Medical Fitness, Cleanroom gowning clearance, Immunizations).
* Step 10: Training & Pharma Compliance (cGMP, GLP, Fire Safety, PPE Induction).
* Step 11: Company Documents & Review (Appointment Letter, NDA, Code of Conduct sign-off).
* **Engine Features:** Save Draft, Resume anytime, Real-time Validation, Document Upload, Multi-tier Approval (HR Executive → Department Head → HR Admin).

### 2.4 Employee 360 Profile (`/hr/employees/:id`)
* Comprehensive tabbed interface: Overview, Personal, Employment, Experience, Education, Family, Address, Bank (Masked), Documents, Training/cGMP, Attendance, Leaves, Payroll, Assets, Lifecycle Timeline, Audit Trail.

### 2.5 Attendance & Rostering (`/hr/attendance`, `/hr/shifts`)
* Daily and monthly muster roll view.
* Punch sources: Biometric Machine API, Web Clock-in, Mobile GPS (with dwell time & speed telemetry).
* Shift master: Day, Night, Rotational, Cleanroom shifts with grace periods and rest-period validation.
* Regularization requests with manager approval workflow.

### 2.6 Leave Management (`/hr/leave`)
* Configurable leave categories: Casual Leave (CL), Sick Leave (SL), Earned/Privilege Leave (PL), Maternity Leave (ML), Comp-Off (CO).
* Balance ledger, accrual rules, public holiday calendar, multi-tier approvals.

### 2.7 Payroll & Salary Management (`/hr/payroll`)
* Strict RBAC: Accessible only by `PAYROLL_ADMIN`, `FINANCE_MANAGER`, and `SUPER_ADMIN`.
* Formula breakdown: Basic + HRA + Special Allowance - (EPF 12% + ESI + PT + TDS + LOP).
* Streaming PDF payslip generation with net pay in words and corporate seal.

### 2.8 Document Engine & Templates (`/hr/documents`)
* Categorized document repository: Identity, Education, Experience, Medical, Appointment, Certifications.
* Dynamic PDF generation for Appointment Letters, Experience Certificates, and Relieving Letters.

### 2.9 Pharmaceutical LMS & Training Matrix (`/hr/training`)
* Mandatory compliance tracking: WHO-GMP Schedule M, US-FDA 21 CFR Part 211, SOP training.
* Retraining reminders at 90, 60, and 30 days prior to certificate expiration.
* Automatic block from Cleanroom Roster if mandatory cGMP certification is expired.

---

## 3. Non-Functional & Security Requirements

1. **21 CFR Part 11 Electronic Records:**
   - Every creation, update, approval, or deletion generates an immutable audit record with User ID, Role, IP Address, Timestamp, Action, Previous State, and New State.
2. **Confidentiality & PII Masking:**
   - Bank Account Numbers: Masked as `XXXXXX1234`.
   - Government Aadhaar: Masked as `XXXX-XXXX-9012`.
   - PAN: Masked as `ABCDE****F`.
   - Zero sensitive PII logged in browser console or returned in unprivileged API responses.
3. **Database Performance & Resilience:**
   - Compound indexes on `employeeId`, `department`, `employmentStatus`, `tenantId`.
   - Atlas connection pooling with automatic reconnection and fallback memory server for offline development.
4. **AI Copilot Security Sandbox:**
   - AI queries strictly filter and redact unauthorized salary, medical, or confidential employee data based on the caller's JWT role claims.
