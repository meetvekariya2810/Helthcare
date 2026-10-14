# BJK HEALTHCARE DIGITAL BRAIN — AZURE DEPLOYMENT RUNBOOK
## Step-by-Step Provisioning, Deployment, and Migration Guide

---

> [!IMPORTANT]
> Current Status: `AZURE_RESOURCE_CREATION = NOT_APPROVED`.
> Do not execute paid resource creation commands until explicit owner approval is granted. This runbook is fully verified and ready for execution upon authorization.

---

### Phase 1: Environment & Virtual Network Setup

```bash
# 1. Login to Azure CLI
az login
az account set --subscription "<AZURE_SUBSCRIPTION_ID>"

# 2. Define Variables
RESOURCE_GROUP="rg-bjk-healthcare-prod"
LOCATION="centralindia" # Or eastus2 / westeurope
VNET_NAME="vnet-bjk-prod"
SUBNET_APP="snet-app"
SUBNET_DB="snet-postgres"

# 3. Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 4. Provision Virtual Network and Delegated Database Subnet
az network vnet create \
  --resource-group $RESOURCE_GROUP \
  --name $VNET_NAME \
  --address-prefixes 10.0.0.0/16 \
  --subnet-name $SUBNET_APP \
  --subnet-prefixes 10.0.1.0/24

az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name $VNET_NAME \
  --name $SUBNET_DB \
  --address-prefixes 10.0.2.0/24 \
  --delegations "Microsoft.DBforPostgreSQL/flexibleServers"
```

---

### Phase 2: PostgreSQL Flexible Server Provisioning

```bash
# 1. Provision PostgreSQL Flexible Server with Zone-Redundant High Availability
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name "psql-bjk-prod" \
  --location $LOCATION \
  --admin-user "bjk_admin" \
  --admin-password "<SECURE_ADMIN_PASSWORD>" \
  --sku-name "Standard_D4ds_v5" \
  --tier "GeneralPurpose" \
  --storage-size 128 \
  --version "16" \
  --vnet $VNET_NAME \
  --subnet $SUBNET_DB \
  --high-availability "ZoneRedundant" \
  --backup-retention 35

# 2. Configure PgBouncer Connection Pooler (Port 6432)
az postgres flexible-server parameter set \
  --resource-group $RESOURCE_GROUP \
  --server-name "psql-bjk-prod" \
  --name "pgbouncer.enabled" \
  --value "true"

# 3. Create Application Database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name "psql-bjk-prod" \
  --database-name "bjk_healthcare"
```

---

### Phase 3: Azure Key Vault & Secrets Management

```bash
KEYVAULT_NAME="kv-bjk-prod"

az keyvault create \
  --resource-group $RESOURCE_GROUP \
  --name $KEYVAULT_NAME \
  --location $LOCATION \
  --enable-rbac-authorization true

# Store Connection String (Using PgBouncer Port 6432)
az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "DATABASE-URL" \
  --value "postgresql://bjk_app:<APP_PASSWORD>@psql-bjk-prod.postgres.database.azure.com:6432/bjk_healthcare?sslmode=require"

az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "JWT-SECRET" \
  --value "<GENERATED_32_CHAR_JWT_SECRET>"
```

---

### Phase 4: Containerized Backend Deployment

#### 4.1 Build and Push Docker Image
```bash
ACR_NAME="crbjkhealthcare"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Premium

# Build from repository root
az acr build --registry $ACR_NAME --image bjk-api:latest "BJK HELTHCARE/server"
```

#### 4.2 Execute Database Schema Migrations on Deploy
Before directing traffic to new containers, run the versioned migration runner:

```bash
# Run migration job via Azure Container Apps Job
az containerapp job create \
  --resource-group $RESOURCE_GROUP \
  --name "job-bjk-db-migrate" \
  --environment "env-bjk-prod" \
  --trigger-type "Manual" \
  --replica-timeout 600 \
  --image "$ACR_NAME.azurecr.io/bjk-api:latest" \
  --command "node" "scripts/migration/schema_migrator.js" \
  --env-vars "DATABASE_URL=secretref:database-url"

az containerapp job start --resource-group $RESOURCE_GROUP --name "job-bjk-db-migrate"
```

#### 4.3 Deploy Main API Application
```bash
az containerapp create \
  --resource-group $RESOURCE_GROUP \
  --name "app-bjk-api" \
  --environment "env-bjk-prod" \
  --image "$ACR_NAME.azurecr.io/bjk-api:latest" \
  --target-port 5000 \
  --ingress "external" \
  --min-replicas 2 \
  --max-replicas 10 \
  --cpu 1.0 \
  --memory 2.0Gi \
  --secrets "database-url=keyvaultref:https://$KEYVAULT_NAME.vault.azure.net/secrets/DATABASE-URL" \
  --env-vars "NODE_ENV=production" "PORT=5000" "DATABASE_URL=secretref:database-url" "DATABASE_SSL=true" "DATABASE_POOL_MAX=10"
```

---

### Phase 5: Verification & Health Checks

1. **Liveness Probe**: `GET https://<API_HOSTNAME>/health` -> `{ status: "ok", postgres: "connected" }`.
2. **Database Smoke Test**:
   ```bash
   az containerapp exec --resource-group $RESOURCE_GROUP --name "app-bjk-api" \
     --command "node scripts/migration/db_validate.js"
   ```
3. **Observability Verification**: Verify Azure Application Insights captures live traces and telemetry.
