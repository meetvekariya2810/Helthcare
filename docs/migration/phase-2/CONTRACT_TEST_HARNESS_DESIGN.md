# BJK Healthcare — Contract Test Harness Architecture & Specification
**Document:** `docs/migration/phase-2/CONTRACT_TEST_HARNESS_DESIGN.md`  
**Phase:** Phase 2 (Architecture & Parallel-Safe Planning)  
**Status:** DRAFT SPECIFICATION (Parallel-Safe, Untracked)  

---

## 1. Executive Summary & Objective

The contract test harness is an automated verification framework designed to ensure that during the migration of BJK Healthcare Digital Brain to Next.js App Router (Phase 5/6), every newly created Next.js Route Handler (`/api/*`) exhibits **100% behavioral, structural, and schema equivalence** with the legacy Express endpoint (`/api/legacy/*`).

Under **Rule 8 (Contract Preservation)**:
1. No endpoint may be retired from Express until all corresponding contract tests pass against isolated staging.
2. Every Route Handler must return identical HTTP status codes, headers, and JSON body structures.
3. All error responses must retain identical `{ success: false, message: ... }` format.

---

## 2. Architecture of the Dual-Run Comparison Harness

```
                                  +------------------------------+
                                  | Contract Test Harness Runner |
                                  |    (Vitest / Node:Test)      |
                                  +--------------+---------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
         [Legacy Express Endpoint]                               [Next.js Route Handler]
             /api/legacy/:path                                         /api/:path
                       |                                                   |
                       +-------------------------+-------------------------+
                                                 |
                                                 v
                                  +------------------------------+
                                  | Response Comparison Asserter |
                                  +------------------------------+
                                  | - HTTP Status Code Equality  |
                                  | - Content-Type Header Match  |
                                  | - JSON Schema / Deep Keys    |
                                  | - Masked PII Verification    |
                                  | - Timing / Error Shapes      |
                                  +------------------------------+
```

---

## 3. Five-Point Contract Assertion Standards

Every endpoint test case must assert five strict criteria:

### A. HTTP Status Code Equality
- Both endpoints must return identical HTTP status codes for identical request payloads:
  - `200 OK` / `201 Created` for valid requests.
  - `400 Bad Request` for invalid input schemas.
  - `401 Unauthorized` when JWT is missing or invalid.
  - `403 Forbidden` when role/permission is insufficient.
  - `404 Not Found` for non-existent entities.
  - `409 Conflict` for state collisions (e.g., duplicate employee code, unlinked user account).

### B. Header Compatibility
- `Content-Type`: Strictly `application/json; charset=utf-8` (or `application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
- HTML error pages from serverless runtimes are strictly prohibited and flagged as contract failures.
- Cache headers: `Cache-Control: no-store, max-age=0` on sensitive authenticated routes.

### C. JSON Schema & Key Equivalence
- The JSON response body structure must be identical:
  - Top-level keys (e.g. `{ success: true, data: ..., pagination: ... }`).
  - Field name casing (strict camelCase preservation).
  - Array lengths and pagination metadata (`page`, `limit`, `total`, `totalPages`).
  - Date formats: ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### D. Data Truth & Masking Preservation
- Sensitized field masking must match character-for-character:
  - Bank Account Number: `XXXXXX1234` (last 4 digits visible).
  - Aadhaar Number: `XXXX-XXXX-9012` (last 4 digits visible).
  - PAN Number: `ABCDE****F` (first 5 and last 1 visible).
  - Basic / Gross Salary: Hidden completely (`--`) for unauthorized roles (Manager/Employee), visible only to Finance/Super Admin.

### E. Error Payload Consistency
- Standard error envelope:
  ```json
  {
    "success": false,
    "message": "<Human-readable error explanation>",
    "errors": []
  }
  ```
- No server stack traces, Mongoose internal error objects, or database connection strings leaked.

---

## 4. Test Harness Implementation (Staging Scaffold)

```typescript
// src/testing/contractHarness.ts
import { expect } from 'vitest';

export interface ContractTestContext {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string; // e.g. "/employees"
  headers?: Record<string, string>;
  body?: any;
  roleToken?: string;
}

export async function assertContractEquivalence(
  baseUrlExpress: string,
  baseUrlNext: string,
  ctx: ContractTestContext
) {
  const expressUrl = `${baseUrlExpress}/api/legacy${ctx.path}`;
  const nextUrl = `${baseUrlNext}/api${ctx.path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(ctx.roleToken ? { Authorization: `Bearer ${ctx.roleToken}` } : {}),
    ...ctx.headers
  };

  const reqInit: RequestInit = {
    method: ctx.method,
    headers,
    ...(ctx.body ? { body: JSON.stringify(ctx.body) } : {})
  };

  const [resExpress, resNext] = await Promise.all([
    fetch(expressUrl, reqInit),
    fetch(nextUrl, reqInit)
  ]);

  // 1. Status Code
  expect(resNext.status, `Status mismatch on ${ctx.method} ${ctx.path}`).toBe(resExpress.status);

  // 2. Content Type
  const ctExpress = resExpress.headers.get('content-type') || '';
  const ctNext = resNext.headers.get('content-type') || '';
  expect(ctNext.split(';')[0]).toBe(ctExpress.split(';')[0]);

  // 3. Payload Comparison
  if (ctNext.includes('application/json')) {
    const jsonExpress = await resExpress.json();
    const jsonNext = await resNext.json();

    // Check top-level envelope
    expect(jsonNext.success).toBe(jsonExpress.success);

    // Deep key comparison (ignoring dynamic timestamps like generatedAt, responseTime)
    assertDeepShapeMatch(jsonExpress, jsonNext);
  }
}

function assertDeepShapeMatch(expected: any, actual: any, path = '') {
  if (typeof expected !== typeof actual) {
    throw new Error(`Type mismatch at ${path}: expected ${typeof expected}, got ${typeof actual}`);
  }
  if (Array.isArray(expected)) {
    expect(Array.isArray(actual), `Array mismatch at ${path}`).toBe(true);
    if (expected.length > 0 && actual.length > 0) {
      assertDeepShapeMatch(expected[0], actual[0], `${path}[0]`);
    }
  } else if (expected !== null && typeof expected === 'object') {
    const expKeys = Object.keys(expected).filter(k => !['timestamp', 'duration', 'traceId'].includes(k));
    const actKeys = Object.keys(actual).filter(k => !['timestamp', 'duration', 'traceId'].includes(k));
    
    expect(actKeys.sort(), `Keys mismatch at ${path}`).toEqual(expKeys.sort());
    for (const key of expKeys) {
      assertDeepShapeMatch(expected[key], actual[key], `${path}.${key}`);
    }
  }
}
```

---

## 5. Priority Wave Rollout Schedule for Contract Tests

| Wave | Priority Module Group | Endpoint Count | Target Contract Suite |
| :--- | :--- | :---: | :--- |
| **Wave 1** | Auth, Session, Public Verification | 7 | `tests/contract/wave1_auth.test.ts` |
| **Wave 3** | Canteen Kiosk, Meal Logging, Deductions | 8 | `tests/contract/wave3_canteen.test.ts` |
| **Wave 2** | Employee Portal (Profile, Leave, Tasks, Calendar)| 18 | `tests/contract/wave2_employee.test.ts` |
| **Wave 4** | Command Center & 12 Dept Telemetry | 13 | `tests/contract/wave4_dashboard.test.ts` |
| **Wave 6** | HRMS Core (Onboarding, Employees, Leave, Payroll)| 38 | `tests/contract/wave6_hrms.test.ts` |
| **Wave 5** | Pharma Ops (Production, Batches, QC/QA, Catalogue)| 16 | `tests/contract/wave5_pharma.test.ts` |

---

## 6. Acceptance Criteria for Retiring Legacy Route
A legacy Express endpoint may only be commented out / unmounted when:
1. `assertContractEquivalence` passes across 100% of test cases on staging.
2. Positive and negative test cases (authorized, unauthorized, invalid payload) pass.
3. Staging smoke tests confirm frontend UI interacts seamlessly with the Route Handler.
