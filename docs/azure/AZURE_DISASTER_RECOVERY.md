# BJK HEALTHCARE DIGITAL BRAIN — AZURE DISASTER RECOVERY PLAN
## Business Continuity, Point-in-Time Recovery (PITR), and High Availability

---

### 1. Recovery Objectives & SLAs

| Metric | Target SLA | Implementation Strategy |
|---|---|---|
| **Recovery Point Objective (RPO)** | **< 5 minutes** | Continuous PostgreSQL Write-Ahead Log (WAL) streaming to Azure geo-redundant storage. |
| **Recovery Time Objective (RTO)** | **< 60 minutes** | Automated standby failover (<60s) or scripted geo-restore to paired Azure region. |
| **Availability Target** | **99.99%** | Multi-zone Zone-Redundant High Availability (Primary AZ-1, Standby AZ-2). |
| **Backup Retention** | **35 days** | Continuous automated snapshots + point-in-time recovery window. |

---

### 2. High Availability Architecture (Local Zone Resilience)

- Azure Database for PostgreSQL Flexible Server operates with **Zone-Redundant High Availability**.
- Physical servers reside in distinct physical Availability Zones within the primary Azure region.
- All write transactions are synchronously committed to both the primary and standby nodes before success is returned to the API.
- If the primary node experiences hardware failure or network loss, automated failover promotes the standby node in under 60 seconds with **zero data loss (RPO = 0)**.

---

### 3. Point-in-Time Recovery (PITR) Procedure

If accidental data corruption or logical data loss occurs, restore the database to any exact minute within the 35-day retention window:

```bash
# 1. Determine Target Recovery Timestamp (UTC)
RESTORE_TIME="2026-10-14T18:30:00Z"
RESOURCE_GROUP="rg-bjk-healthcare-prod"
TARGET_SERVER_NAME="psql-bjk-prod-restored"

# 2. Execute Point-in-Time Restore
az postgres flexible-server restore \
  --resource-group $RESOURCE_GROUP \
  --name $TARGET_SERVER_NAME \
  --source-server "psql-bjk-prod" \
  --restore-time $RESTORE_TIME

# 3. Validate Restored Database Integrity
az postgres flexible-server execute \
  --name $TARGET_SERVER_NAME \
  --admin-user "bjk_admin" \
  --admin-password "<ADMIN_PASSWORD>" \
  --database-name "bjk_healthcare" \
  --querytext "SELECT COUNT(*) FROM audit_logs; SELECT COUNT(*) FROM products;"

# 4. Swap Connection Strings in Azure Key Vault
az keyvault secret set \
  --vault-name "kv-bjk-prod" \
  --name "DATABASE-URL" \
  --value "postgresql://bjk_app:<APP_PASSWORD>@$TARGET_SERVER_NAME.postgres.database.azure.com:6432/bjk_healthcare?sslmode=require"
```

---

### 4. Regional Disaster Recovery (Geo-Restore)

In the event of a catastrophic whole-region outage:
1. Azure Backup continuously replicates encrypted backups to the paired region (`South India` / `West Europe`).
2. Run Geo-Restore:
   ```bash
   az postgres flexible-server geo-restore \
     --resource-group "rg-bjk-healthcare-dr" \
     --location "southindia" \
     --name "psql-bjk-dr" \
     --source-server "/subscriptions/<SUB_ID>/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.DBforPostgreSQL/flexibleServers/psql-bjk-prod"
   ```
3. Deploy Container App instance in paired region pointing to restored database.
4. Update Azure Front Door routing to direct 100% of global traffic to DR region.
