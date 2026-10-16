# BJK HEALTHCARE — LEGACY IDENTIFIER RESOLUTION MAPPING
**Document ID:** RES-LEGACY-03  
**Audit Date:** 16 October 2026  
**Status:** DETERMINISTIC RESOLVER CONFIGURED — PENDING HR APPROVAL  
**Auditor / Engineering:** Antigravity Pairing Agent  

---

## 1. Executive Summary & Data-Truth Compliance (Rule R7 & R8)

In accordance with **Rule R7 (Never alter historical attendance or employee data to make a report look right)** and **Rule R8 (Data-Truth Principle)**, zero historical punch records in MongoDB Atlas Cluster28 or PostgreSQL staging have been deleted, overwritten, or modified.

A comprehensive full-collection scan of **10,527 attendance punch records** in MongoDB Atlas was performed. The results are:
- **10,494 punches (99.7%)** resolve directly and unambiguously to active or archived employee master profiles by standard `_id`, `employeeCode`, or `employeeId`.
- **Exactly 33 punches (0.3%)** contain legacy raw identifiers originating from legacy biometric hardware logs or pre-migration import sheets.

---

## 2. Legacy Identifier Inventory & Candidate Mapping Table

| Record Count | Raw Identifier (`employeeId`) | Raw Employee Code (`employeeCode`) | Raw Name in Punch (`employeeName`) | Punch Date Range | Candidate Match | Confidence | Match Justification |
|---|---|---|---|---|---|---|---|
| **3** | `BH1011` | `BH1011` | Krunal Patel | 2026-01-01 to 2026-01-03 | `101` (Krunal Patel) | **HIGH** | Exact full name match + legacy internal code mapping `101` |
| **30** | `Renish Suvagiya` | `RENISH SUVAGIYA` | Renish Suvagiya | 2026-09-04 to 2026-09-30 | `UNRESOLVED_IDENTIFIER` | **UNRESOLVED** | Employee record not present in master directory (contract/guest worker or pending onboarding) |

---

## 3. Deterministic Fallback Resolver Rules

The runtime attendance telemetry resolver (`controllers/hrms/attendanceController.js` and `services/hrms/`) follows a strict 4-stage deterministic resolution order:

1. **Direct ID Lookup:** Match `punch.employee` against `Employee._id`.
2. **Employee Code Lookup:** Match uppercase `punch.employeeCode` or `punch.employeeId` against `Employee.employeeCode` or `Employee.employeeId`.
3. **Verified Canonical Mapping Table:** If identifier exists in `legacy_identifier_mapping.json`, resolve to the HR-approved canonical employee code.
4. **Honest Fallback (`UNRESOLVED_IDENTIFIER`):** If no deterministic match exists, project the record with status `UNRESOLVED_IDENTIFIER` and display name `Renish Suvagiya (Unlinked Punch)`. Under NO circumstances is an unresolved punch silently attributed to another employee.

---

## 4. Verification & Regression Tests

Run the attendance verification suite to confirm deterministic fallback behavior:
```powershell
$env:NODE_PATH=".\BJK HELTHCARE\server\node_modules"; node scripts/golive/validate_attendance.js
```
Evidence captured:
- 10,527 punches scanned
- 0 duplicate records
- 0 chronological inversions (all `checkOut >= checkIn`)
- 0 future-dated punches

---

## 5. Owner / HR Action Required

To formally link the 30 punches for Renish Suvagiya:
1. Confirm whether "Renish Suvagiya" is an active contractor, apprentice, or former employee.
2. If an active staff member, provision their employee master profile with official employee code (e.g., `BH1082`).
3. Add the mapping to `legacy_identifier_mapping.json`:
   ```json
   {
     "RENISH SUVAGIYA": "BH1082"
   }
   ```
4. Do not alter raw punch timestamps or biometrics.
