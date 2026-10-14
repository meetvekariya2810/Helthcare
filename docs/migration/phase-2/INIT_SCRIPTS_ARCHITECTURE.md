# BJK Healthcare — Guarded Owner-Run Init Scripts Architecture
**Document:** `docs/migration/phase-2/INIT_SCRIPTS_ARCHITECTURE.md`  
**Phase:** Phase 2 (Architecture & Parallel-Safe Planning)  
**Status:** DRAFT SPECIFICATION (Parallel-Safe, Untracked)  

---

## 1. Executive Summary & Problem Statement

In the legacy architecture on `main`, `server.js` attempted to execute destructive auto-initialization routines during cold start (`auto-init`). This caused:
- Accidental password resets for administrative accounts to shared defaults.
- Deletion of attendance regularizations and report history.
- Overwriting of live leave ledgers with seed CSV balances.
- Uncontrolled database writes upon every serverless cold start.

### The New Standard: Decoupled, Explicit, Guarded CLI Init Scripts
All database seeding, catalogue population, and policy setup are completely removed from server startup and replaced with **6 explicit owner-run CLI scripts**. These scripts execute only when manually run by an authorized operator against an approved staging database.

---

## 2. Universal Safety Invariants for All Init Scripts

Every init script adheres to 6 mandatory safety invariants:

```
                        +---------------------------------------+
                        |      Owner CLI Execution Trigger      |
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |  Invariant 1: assertNonProduction()   |
                        |  (Refuses if NODE_ENV === 'production'|
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |  Invariant 2: SEED_ALLOWED_DB Check   |
                        | (Effective DB must equal SEED_ALLOWED)|
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |  Invariant 3: Mandatory --confirm     |
                        |  (Refuses live execution if omitted)  |
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |  Invariant 4: Default --dry-run Mode  |
                        | (Reads and counts without DB changes) |
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |  Invariant 5: Audit Log Before Write  |
                        |  (Operator identity & reason logged)  |
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        | Invariant 6: Idempotent Upsert Only   |
                        | (No collection wipe, upsert by code)  |
                        +---------------------------------------+
```

---

## 3. The 6 Modular Init Scripts Inventory

### 1. `scripts/init-products.js` (Pharma Product Catalogue)
- **Target Collection:** `products`
- **Scope:** 111 pharmaceutical formulations (Tablets, Capsules, Syrups, Injectables, Ointments).
- **Behavior:** Upserts by `productCode`. Preserves existing batch records, price history, and regulatory status. Never drops collection.
- **CLI Usage:**
  ```powershell
  # Dry Run
  node scripts/init-products.js --dry-run
  # Live Execution
  node scripts/init-products.js --confirm --operator "SystemOwner" --reason "Staging catalogue initial sync"
  ```

### 2. `scripts/init-leave-policies.js` (BJK-HR-POL-001 Policy & Holidays)
- **Target Collections:** `leavemasters`, `leavepolicies`, `holidays`
- **Scope:** Standard casual leave (CL), sick leave (SL), earned leave (EL), maternity leave, comp-off rules; annual pharmaceutical plant holiday calendar.
- **Behavior:** Upserts policy rules. Does NOT modify or reset existing employee leave applications or ledger balances.

### 3. `scripts/init-work-schedule.js` (Workforce Calendar & Shifts)
- **Target Collections:** `shifts`, `workcalendars`
- **Scope:** General Shift (09:00 - 18:00), Shift A (06:00 - 14:00), Shift B (14:00 - 22:00), Shift C / Night (22:00 - 06:00), grace time (15 mins), half-day thresholds.
- **Behavior:** Upserts shift configurations by `shiftCode`. Never touches historical punch logs.

### 4. `scripts/init-departments-roles.js` (Organizational Structure)
- **Target Collections:** `departments`, `facilities`, `roles`
- **Scope:** 12 department records (Production, QA, QC, RA, HR, Finance, Engineering, Warehouse, Microbiology, Sales, Facilities, IT); 30 roles.
- **Behavior:** Idempotently ensures all 12 departments and 30 role definitions exist. Never deletes custom permissions.

### 5. `scripts/init-leave-ledgers.js` (Annual Employee Leave Ledgers)
- **Target Collection:** `leaveledgers`
- **Scope:** Initializing annual leave quotas for active employees for the current calendar year.
- **Behavior:** Verifies employee exists in database first (`db.employees.countDocuments()`). Creates ledger only if no ledger exists for the given `year` + `employeeId`. Never overwrites existing accumulated balances.

### 6. `scripts/init-bank-details.js` (Employee Disbursement Profiles)
- **Target Collection:** `bankdetails`
- **Scope:** Linking verified bank IFSC, account numbers, and payment modes to employees.
- **Behavior:** Strict schema validation with regex for Indian IFSC (`^[A-Z]{4}0[A-Z0-9]{6}$`). Masks numbers in log outputs. Never overwrites verified banking data.

---

## 4. Script Template Specification

```javascript
// scripts/init-products.js (Template)
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { assertNonProduction, assertConnectedDbAllowed } = require('../config/safetyGuards');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

async function run() {
  // 1. Invariant 1: Safety guards
  assertNonProduction();

  const isDryRun = process.argv.includes('--dry-run');
  const isConfirmed = process.argv.includes('--confirm');
  const operator = process.argv.find((_, i, a) => a[i - 1] === '--operator');
  const reason = process.argv.find((_, i, a) => a[i - 1] === '--reason');

  if (!isDryRun && (!isConfirmed || !operator || !reason)) {
    console.error('FATAL: Live run requires --confirm, --operator "<name>", and --reason "<text>".');
    process.exit(1);
  }

  // 2. Invariant 2: Connect and verify connected database
  const conn = await connectDB(0, 1, false);
  assertConnectedDbAllowed(conn);

  console.log(`[InitProducts] Connected to target database: ${conn.name}`);
  console.log(`[InitProducts] Mode: ${isDryRun ? 'DRY-RUN (Read-Only)' : 'LIVE EXECUTION'}`);

  // 3. Load product seed dataset
  const catalogue = require('../seed/products.json');
  console.log(`[InitProducts] Processing ${catalogue.length} product records...`);

  if (isDryRun) {
    console.log(`[DRY-RUN] Would upsert ${catalogue.length} products. Zero database writes.`);
    await mongoose.connection.close();
    return;
  }

  // 4. Invariant 5: Audit Log Before Write
  await AuditLog.create({
    action: 'INIT_PRODUCTS_CATALOGUE',
    performedBy: { name: operator, role: 'SYSTEM_OWNER' },
    details: { count: catalogue.length, reason },
    timestamp: new Date()
  });

  // 5. Invariant 6: Idempotent Upsert
  for (const item of catalogue) {
    await Product.updateOne(
      { productCode: item.productCode },
      { $set: item },
      { upsert: true }
    );
  }

  console.log(`[SUCCESS] Upserted ${catalogue.length} products successfully.`);
  await mongoose.connection.close();
}

run().catch(err => {
  console.error('[FATAL ERROR]', err.message);
  process.exit(1);
});
```
