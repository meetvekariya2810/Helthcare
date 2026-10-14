# BJK Healthcare — AWS S3 Storage & Vercel Cron Architecture
**Document:** `docs/migration/phase-2/S3_AND_CRON_ARCHITECTURE.md`  
**Phase:** Phase 2 (Architecture & Parallel-Safe Planning)  
**Status:** DRAFT SPECIFICATION (Parallel-Safe, Untracked)  

---

## PART I: AWS S3 SECURE OBJECT STORAGE (ap-south-1)

### 1. Architectural Problem in Legacy System
In the legacy Express application:
- Files were written to local disk via `multer.diskStorage` in `server/uploads/`.
- In serverless environments (e.g. Vercel), the local filesystem is ephemeral and read-only outside `/tmp`.
- Files uploaded by users vanished on function recycling or instance scaling.
- Directly served static files lacked authorization checks (IDOR vulnerability on uploaded document paths).

### 2. Target S3 Architecture & Security Controls
All document, ID card photo, resume, and medical certificate storage is migrated to **Amazon Web Services (AWS) Simple Storage Service (S3)**:

```
+--------------------------------------------------------------------------------------------------------+
|                                  AWS S3 SECURE PRESIGNED FLOW                                          |
+--------------------------------------------------------------------------------------------------------+
| 1. Client requests upload URL -> POST /api/documents/upload-url (Auth token, file name, MIME, size)   |
| 2. Next.js Route Handler validates:                                                                   |
|    - User session and role permission                                                                 |
|    - Allowed MIME type (image/jpeg, image/png, application/pdf)                                        |
|    - Maximum file size (e.g., 5MB for photos, 15MB for PDF documents)                                  |
|    - Generates unique S3 key: documents/{department}/{employeeCode}/{uuid}.{ext}                       |
| 3. Route Handler calls @aws-sdk/s3-request-presigner -> Generates 15-minute presigned PUT URL          |
| 4. Client uploads file directly to AWS S3 using presigned PUT URL (Bypasses serverless payload limit)  |
| 5. Client confirms upload -> POST /api/documents/confirm -> Server logs AuditLog & saves S3 key in DB |
|                                                                                                        |
| DOWNLOAD / VIEW FLOW:                                                                                  |
| 1. Client requests document -> GET /api/documents/:id/view (Auth token)                                |
| 2. Next.js Route Handler checks access policy (Self or HR/Auditor)                                     |
| 3. Route Handler calls S3 GetObjectCommand -> Generates 5-minute presigned GET URL                     |
| 4. Client redirected to signed URL or streams document directly                                        |
+--------------------------------------------------------------------------------------------------------+
```

### 3. S3 Bucket Configuration Standard
- **Region:** `ap-south-1` (Mumbai, India) — Strict compliance with Indian data residency and optimal plant latency.
- **Bucket Access Policy:** Completely private (`BlockPublicAcls = true`, `IgnorePublicAcls = true`, `BlockPublicPolicy = true`, `RestrictPublicBuckets = true`). Zero public internet access.
- **Encryption:** Server-Side Encryption with Amazon S3 managed keys (`SSE-S3` or `SSE-KMS`).
- **CORS Configuration:**
  ```json
  [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "GET"],
      "AllowedOrigins": ["https://bjkhealthcare.com", "https://*.vercel.app"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```
- **Lifecycle Policy:** Non-current object versions expire after 30 days.

---

## PART II: VERCEL CRON JOBS ARCHITECTURE & IDEMPOTENCY

### 1. Scheduled Background Workload Inventory
The BJK Healthcare ERP requires periodic execution of 5 critical automated tasks:

| Job Name | Schedule (UTC) | Cron Expression | Route Handler | Business Function |
|---|---|---|---|---|
| **Credential Expiry Alerts** | 02:00 Daily | `0 2 * * *` | `/api/cron/credential-alerts` | Scans staff credentials expiring in 90, 60, 30 days; dispatches notification |
| **Automation Rule Evaluation** | Every 30 mins | `*/30 * * * *`| `/api/cron/evaluate-rules` | Evaluates dynamic HR/plant triggers (late punch thresholds, shift alerts) |
| **Daily Attendance Close** | 23:30 Daily | `30 23 * * *` | `/api/cron/attendance-close` | Closes open punches for plant day, flags missing punches for regularization |
| **Monthly Leave Accrual** | 00:00 1st of month | `0 0 1 * *` | `/api/cron/leave-accrual` | Credits monthly casual/earned leave increments according to policy |
| **Muster Roll Aggregation** | 01:00 Daily | `0 1 * * *` | `/api/cron/muster-aggregate` | Precomputes daily muster roll counters for fast dashboard rendering |

### 2. Vercel Configuration (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/credential-alerts",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/evaluate-rules",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/attendance-close",
      "schedule": "30 23 * * *"
    },
    {
      "path": "/api/cron/leave-accrual",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/muster-aggregate",
      "schedule": "0 1 * * *"
    }
  ]
}
```

### 3. Security & Idempotency Enforcement

#### A. `CRON_SECRET` Header Authentication
Vercel Cron requests automatically inject an `Authorization: Bearer <CRON_SECRET>` header. Every cron Route Handler must validate this secret:
```typescript
// src/app/api/cron/credential-alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || !authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const isValid = crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedSecret)
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Execute job with Idempotency Key
  return executeCredentialAlertsJob();
}
```

#### B. Cryptographic Idempotency Keys
To prevent duplicate job execution caused by serverless retries or overlapping invocations, every execution records an idempotency key in the `cronexecutions` collection:
- **Key Formula:** `SHA256(jobName + executionDateString)` (e.g. `SHA256("credential-alerts:2026-10-12")`).
- If an entry with status `COMPLETED` already exists for that day, the handler terminates immediately with HTTP 200 `{ message: "Already executed today" }`.
- If an entry has status `RUNNING` within the last 15 minutes, the handler halts to prevent race conditions.
