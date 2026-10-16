# Phase A6 — Operational Modules and Public Website Audit
**Date:** 16 October 2026  
**Auditor:** Pharma Enterprise Systems Auditor  
**Database:** MongoDB Atlas Cluster28 (`bjk_healthcare`)

---

## 1. Product Catalogue Audit (Truth vs 111 Target)

| Attribute | Measured Evidence | Verification Target | Status |
|---|---|---|:---:|
| **Official Product Count** | **111 Products** | **111 Products** | `PASS` |
| **Product Categories** | **11 Distinct Categories** | 11 Categories | `PASS` |
| **Search & Filtering** | Multi-attribute search by brand, molecule, category, dosage | Functional on API & Client | `PASS` |
| **Product Detail Views** | Specifications, packaging size, storage conditions | Preserved in DB & Model | `PASS` |

### Official Categories Verified in Atlas:
1. Analgesic / Anti-Pyretic / Anti-Inflammatory / NSAIDs
2. Anti-Bacterial / Anti-Viral / General Antibiotics
3. Anti-Cold / Anti-Allergic / Anti-Asthmatic
4. Anti-Diabetic
5. Anti-Psychotic / Anti-Convulsant / Anti-Depressant
6. Cardiovascular
7. DPIs (Dry Powder Inhalers)
8. Dry Powder Syrup
9. Erectile Dysfunction
10. GIT Product (Gastrointestinal)
11. Sachets

---

## 2. Pharmaceutical Operations Matrix

| Module | Route / Workflow | Actual DB Count | Operational Status | Status |
|---|---|---|---|:---:|
| **Executive Command Center** | `/dashboard`, `/dashboard/executive` | Multi-department aggregated | 9-tile company telemetry active | `PASS` |
| **Factory & Manufacturing** | `/factory`, `/production` | 2 Production Lines | Real equipment & line tracking | `PASS` |
| **Inventory & Warehouses** | `/inventory`, `/warehouse` | 1 Warehouse, 1 Inventory Item, 5 Transactions | Batch tracking enabled | `PASS` |
| **QC / QA / Deviations / CAPA** | `/quality`, `/qc`, `/qa` | 5 Batches, 4 QC Samples, 0 open CAPA | GMP deviation workflows mapped | `PASS` |
| **Regulatory Affairs** | `/regulatory` | 1 Regulatory Record | Dossier submissions mapped | `PASS` |
| **CRM & Commercial Enquiries** | `/crm` | 6 Enquiries, 2 Invoices | Contact form persistence verified | `PASS` |
| **Finance & Invoicing** | `/finance` | 2 Invoices | Role restricted to Finance | `PASS` |
| **Knowledge Base** | `/knowledge` | 1 Knowledge Chunk, 1 Entity | SOP & regulatory chunk store | `PASS` |
| **Audit Logs** | `/audit-logs`, `/api/audit` | **1,545 Audit Logs** | Immutable 21 CFR Part 11 trail | `PASS` |

---

## 3. Data-Truth Principle & Dashboard Metrics
- **Disconnected Telemetry:** In compliance with rule R5, where physical IoT sensors, live machines, or biometric devices are offline, the dashboard displays `--` or `Not Connected` instead of fabricated numbers.
- **Demo Flags:** Seed/demo records remain flagged with `isDemo: true` to prevent confusing real production telemetry with test data.
