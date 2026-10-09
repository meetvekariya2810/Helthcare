# MyCO HRMS vs BJK Healthcare Digital Brain — Comprehensive Report Map

**Statutory Framework:** The Factories Act 1948, Payment of Wages Act, Employees' Provident Fund Act, Maternity Benefit Act, and 21 CFR Part 11 Electronic Records.

---

## 1. Discovered MyCO & Enterprise HR Report Inventory

| Report Code | Report Name | Description & Statutory Context | Export Formats | BJK Digital Brain Route | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REP-01** | Employee Master Register | Complete workforce census: Personal, Job, Bank, Qualifications | Excel, CSV, PDF | `/api/hrms/reports?type=employee-master` | Built & Operational |
| **REP-02** | Form 25 Attendance Muster | Indian Factories Act Form 25 statutory muster roll with daily punches | PDF, Excel | `/api/hrms/reports?type=attendance-muster` | Built & Operational |
| **REP-03** | Daily Attendance Exception | Late arrivals, early exits, unplanned absences, missing punches | Excel, CSV | `/api/hrms/reports?type=attendance-exceptions` | Built & Operational |
| **REP-04** | Monthly Leave Summary | Leave balances, credits, encashments, and category-wise leaves | Excel, CSV | `/api/hrms/reports?type=leave-summary` | Built & Operational |
| **REP-05** | Statutory Payroll Register | Gross salary, EPF (12%), ESI, Professional Tax, TDS deductions, Net pay | Excel, Encrypted PDF | `/api/hrms/reports?type=payroll-register` | Restricted (Finance) |
| **REP-06** | Salary Slip (Individual) | Form 16 / Monthly payslip with Net Pay in words and BJK digital seal | Streaming PDF | `/api/hrms/payroll/:id/pdf` | Built & Operational |
| **REP-07** | cGMP Training Matrix | Operator qualification status, training hours, 90/60/30-day expiry | Excel, PDF | `/api/hrms/reports?type=training-matrix` | Pharma Custom |
| **REP-08** | Document Expiry Audit | Expiring medical fitness certificates, pharmacy licenses, passport/visas | Excel, PDF | `/api/hrms/reports?type=document-expiry` | Pharma Custom |
| **REP-09** | Asset Allocation Log | IT equipment, cleanroom PPE, mobile SIMs, and return acknowledgements | Excel, CSV | `/api/hrms/reports?type=asset-log` | Built & Operational |
| **REP-10** | 21 CFR Part 11 Audit Trail | Forensic immutable log: Who changed what, old value, new value, IP | Encrypted PDF, CSV | `/api/audit-logs/export` | 21 CFR Compliant |

---

## 2. Export Generation Architecture

1. **Streaming Node.js PDFKit Service (`pdfService.js`):**
   - High-throughput streaming without temporary disk file leaks.
   - Built-in table pagination, running headers, confidentiality footers, and timestamp watermarks.
2. **Tabular CSV/Excel Generation:**
   - UTF-8 BOM encoding for seamless Microsoft Excel rendering.
   - Automated numeric sanitization to prevent CSV injection vulnerabilities.
3. **Audit Trail on Export:**
   - Every report download records a secure audit entry capturing User ID, Role, Report Type, Filter Criteria, and Timestamp.
