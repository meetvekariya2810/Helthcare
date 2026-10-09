# MyCO HRMS vs BJK Healthcare Digital Brain — Role & RBAC Matrix

**Governance Standard:** US-FDA 21 CFR Part 11 Electronic Records, WHO-GMP Schedule M, Indian Labor Regulations.  
**Principle:** Least-Privilege Access Control with Zero Cross-Departmental Confidentiality Leakage.

---

## 1. Role Comparison Architecture

| Role Tier | Reference MyCO Role | BJK Healthcare Digital Brain Equivalent | Primary Responsibilities & Functional Scope |
| :--- | :--- | :--- | :--- |
| **Tier 0** | Super Admin / Master Admin | `SUPER_ADMIN` / `DIRECTOR` | Full executive control over all Digital Brain modules (HRMS, Factory, QA, QC, CRM). |
| **Tier 1** | apAdmin Company Head | `HR_ADMIN` | Complete HRMS operations: employee lifecycle, company policies, statutory configuration. |
| **Tier 2** | HR Executive | `HR_MANAGER` / `HR_EXECUTIVE` | Onboarding processing, document verification, leave and attendance regularization. |
| **Tier 3** | Payroll Specialist | `PAYROLL_ADMIN` / `FINANCE_MANAGER` | Salary structure, EPF/ESI/TDS calculations, payment disbursement. Isolated from clinical data. |
| **Tier 4** | Branch / Dept Head | `DEPARTMENT_MANAGER` / `QA_MANAGER` | Shift scheduling, team attendance sign-off, cleanroom compliance reviews. |
| **Tier 5** | Staff / Worker | `EMPLOYEE` | Employee Self-Service (ESS): attendance clock-in, leave application, own payslip download. |
| **Tier 6** | System Auditor | `AUDITOR` | Read-only access to tamper-evident audit logs and statutory compliance registers. |

---

## 2. Granular Module Permission Matrix

| Module / Operation | SUPER_ADMIN | HR_ADMIN | HR_MANAGER | PAYROLL_ADMIN | DEPT_MANAGER | EMPLOYEE | AUDITOR |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Executive Dashboard** | Full | Full | Scoped | Restricted | Team | Self | Read-Only |
| **Employee Directory** | Full | Full | Full | Basic | Team | Directory | Read-Only |
| **Employee Onboarding** | Full | Full | Full | Read-Only | Read-Only | None | Read-Only |
| **Bank Details (Full PII)**| Full | Masked | Masked | Unmasked | Blocked | Self Only | Blocked |
| **Salary Structure & CTC** | Full | Full | Masked | Full | Blocked | Self Only | Blocked |
| **Attendance Muster** | Full | Full | Full | Read-Only | Team | Self Only | Read-Only |
| **Shift & Rostering** | Full | Full | Full | Blocked | Team | Read-Only | Read-Only |
| **Leave Approval** | Final | Sign-off | Sign-off | Blocked | Level 1 | Self Apply | Read-Only |
| **Training & cGMP LMS** | Full | Full | Full | Blocked | Team | Self Learn | Read-Only |
| **Document Generation** | Full | Full | Full | Payslips Only | None | Self Download| Read-Only |
| **Audit Log Trail** | Full | View | View | Blocked | Blocked | Blocked | Full (Read) |
| **AI Copilot HR Queries** | Full | Full | Scoped | Financial Only | Team Only | Self Only | Audit Only |

---

## 3. Data Confidentiality & PII Masking Standards

1. **Bank Account Masking:**
   - Normal UI display: `XXXXXX1234`
   - Unmasked access strictly limited to `PAYROLL_ADMIN` and `SUPER_ADMIN` with mandatory audit logging.
2. **Identity Document Masking:**
   - Aadhaar Number: `XXXX-XXXX-9012`
   - PAN: `ABCDE****F`
3. **Salary & CTC Masking:**
   - Hidden from general HR executives, department managers, and peer colleagues.
4. **AI Copilot Authorization Interceptor:**
   - AI queries for salary, medical fitness, or identity tokens are intercepted and blocked if the requester role lacks explicit permission.
