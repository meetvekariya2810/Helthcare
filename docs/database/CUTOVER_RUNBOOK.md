# BJK HEALTHCARE DIGITAL BRAIN — PRODUCTION CUTOVER RUNBOOK
## MongoDB Atlas → Azure PostgreSQL Flexible Server Final Cutover Procedure

---

### 1. Pre-Cutover Authorization & Prerequisites

Before initiating the production cutover maintenance window, ensure all gates pass:

1. **Authorization Verification**:
   - Owner explicitly confirms switch `PRODUCTION_CUTOVER = APPROVED`.
   - Business stakeholder approval from QA, Production, and HR Leadership.
2. **Technical Readiness Check**:
   - Run `npm run db:cutover-check` -> Status must return `CUTOVER-READY`.
   - Target PostgreSQL schema verified with 10 versioned migrations applied.
   - Initial staging migration completed with zero unexplained discrepancies.
3. **Backup Snapshot**:
   - Take manual on-demand Atlas snapshot.
   - Take on-demand PostgreSQL backup snapshot.

---

### 2. Cutover Maintenance Window Execution (Estimated: 30–45 Mins)

#### Step 1: Write Freeze & Maintenance Mode (T-0:00)
- Place client frontend in graceful Maintenance Window mode (`503 Service Temporarily Unavailable` with maintenance banner).
- Restrict Atlas database user to `read` role only to guarantee zero new writes during final delta sync.

#### Step 2: Final Delta Synchronization (T-0:10)
- Run the ETL engine in live delta mode:
  ```bash
  cd "BJK HELTHCARE/server"
  npm run db:migrate
  ```
- The engine uses `migration_id_map` to skip identical existing records and ingest any new documents created since the staging migration.

#### Step 3: Automated Parity & Checksum Validation (T-0:20)
- Run the full verification suite:
  ```bash
  npm run db:validate
  ```
- **Hard Gate**: All 67 automated checks must return `PASS`. If any test fails, STOP and initiate rollback assessment.

#### Step 4: Traffic Cutover (T-0:30)
- Update Azure Container Apps / server environment variables:
  - Set `DATABASE_URL` to Azure PostgreSQL Flexible Server connection string.
  - Set `NODE_ENV=production`.
  - Restart backend API services.
- Disable Maintenance Mode banner on frontend.

#### Step 5: Post-Cutover Functional Smoke Tests (T-0:35)
1. Authenticate with an existing staff account using migrated bcrypt credentials.
2. Verify 111-product pharmaceutical catalogue loads with all 11 categories.
3. Punch a test biometric attendance record; verify insertion in PostgreSQL.
4. Verify audit log creation: Confirm trigger `trg_block_audit_mutation` is active.

---

### 3. Post-Cutover Observation Period (14 Days)

- Keep MongoDB Atlas cluster in **READ-ONLY** mode for 14 days.
- **Rule of Non-Reversibility**: Once PostgreSQL accepts new production writes, the application **must NEVER be switched back to Mongo without full delta reconciliation**.
- Monitor Azure Application Insights error logs, connection pool saturation, and query latency.
- After 14 days of zero incidents, archive the Atlas snapshot and decommission the cluster.
