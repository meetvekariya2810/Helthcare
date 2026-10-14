# BJK HEALTHCARE DIGITAL BRAIN — DATABASE ROLLBACK RUNBOOK
## Emergency Fallback, Split-Brain Write Handling, and Recovery Protocol

---

> [!CAUTION]
> **CRITICAL RULE OF NON-REVERSIBILITY**:
> Once PostgreSQL has accepted new user writes or transaction logs in production, you **MUST NEVER blindly switch back to MongoDB Atlas**. Doing so creates a split-brain condition causing silent data loss of all records created on PostgreSQL. A reverse delta-reconciliation is mandatory.

---

### 1. Rollback Authority & Triggers

Rollback is initiated only upon joint authorization from the **Technical Lead** and **Operations/QA Director**.

**Authorized Triggers for Emergency Rollback**:
1. Post-cutover validation failure (`npm run db:validate` fails critical data integrity checks).
2. Unresolvable connection pool starvation or network timeout issues between Container Apps and PostgreSQL.
3. Critical business logic regression in HRMS or Catalogue modules that cannot be hotfixed in < 15 minutes.

---

### 2. Scenario A: Pre-Traffic Cutover Rollback (Zero New Writes to PostgreSQL)

*Applicable if cutover issues are identified during Maintenance Mode before public traffic is switched.*

```bash
# 1. Verify zero user writes in PostgreSQL
node -e "const { getPool } = require('./config/postgres'); (async () => { const pool = await getPool(); const r = await pool.query('SELECT COUNT(*) FROM audit_logs WHERE created_at > CURRENT_DATE;'); console.log('Audit events today:', r.rows[0].count); process.exit(0); })()"

# 2. Revert application connection string back to MongoDB Atlas
export DATABASE_URL=""
export MONGODB_URI="mongodb+srv://.../bjk_healthcare"

# 3. Restart API application
az containerapp restart --name "app-bjk-api" --resource-group "rg-bjk-healthcare-prod"

# 4. Lift Maintenance Banner
```
*Time to execute: < 5 minutes. Data loss: Zero.*

---

### 3. Scenario B: Post-Traffic Rollback (PostgreSQL has Accepted Production Writes)

*Applicable if critical failure occurs hours or days after cutover while PostgreSQL was actively servicing traffic.*

#### Step 1: Immediate Maintenance Freeze
Place the system in maintenance mode immediately to halt all new incoming writes:
```bash
az containerapp stop --name "app-bjk-api" --resource-group "rg-bjk-healthcare-prod"
```

#### Step 2: Reverse Delta-Reconciliation (Extract New Writes)
Identify and extract all records created or updated in PostgreSQL since the cutover timestamp:
```sql
-- Query audit log for all insert/update deltas
SELECT entity_type, entity_id, action, new_state, created_at 
FROM audit_logs 
WHERE created_at >= '2026-10-14T20:00:00Z'
ORDER BY created_at ASC;
```
- Export newly created attendance punches, leave ledger deductions, or employee task records into a JSON reconciliation dump.

#### Step 3: Replay Deltas into Atlas
- Use the reconciliation script to insert missing records back into Atlas collections matching their schema.
- Re-run count comparison to prove parity between PostgreSQL extracted writes and Atlas.

#### Step 4: Re-point Application to Atlas
- Update `MONGODB_URI` in configuration.
- Restart API services and resume production operations.
- Convene a formal post-mortem meeting to analyze root cause before planning the next migration window.
