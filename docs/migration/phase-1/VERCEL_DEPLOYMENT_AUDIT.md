# Vercel Deployment Audit: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Audit Mode:** Static Codebase Audit (Phase 1)  

---

## 1. Existing Deployment Architecture

### 1.1 Root `vercel.json`
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "BJK HELTHCARE/client/dist",
  "functions": {
    "api/index.js": {
      "includeFiles": "BJK HELTHCARE/server/**",
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api", "destination": "/api/index.js" },
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 1.2 `api/index.js` and `api/handler.cjs`
- `api/index.js` exports a CommonJS handler function wrapping `api/handler.cjs`.
- `api/handler.cjs` executes `require('../BJK HELTHCARE/server/server.js')` with `process.env.VERCEL = '1'`.
- The Express application is called directly per invocation: `app(req, res)`.

---

## 2. Identified Incompatibilities for Next.js (P1, P2, P18)

1. **SPA Catch-All Route Interception (P1):**
   - The rewrite `"source": "/(.*)", "destination": "/index.html"` intercepts every incoming GET request that does not match `/api/*`.
   - In Next.js App Router, this will completely break native file-system routing, prevent SSR hydration, and cause soft-404 errors.
   - *Fix (Phase 11):* Replace with native Next.js App Router configuration; delete SPA catch-all rewrite.

2. **Express Serverless Packaging & Duration Limits (P2 & P18):**
   - Express was not architected for serverless state lifecycle. Bundling the entire server with all dependencies via `includeFiles: "BJK HELTHCARE/server/**"` produces a heavy Lambda payload.
   - The 30-second duration limit in `vercel.json` poses risks for bulk Excel payroll generation (e.g. 500+ employees) or heavy PDF compilation.
   - *Fix:* In Next.js, port endpoints to individual, optimized Route Handlers (`app/api/**/route.ts`). Batch payroll and heavy reports must stream responses or be paginated.

3. **Ephemeral Local File Storage (P15):**
   - Several legacy routes write to `server/uploads/` via `multer.diskStorage`.
   - Vercel functions execute in an ephemeral, read-only file system (with `/tmp` limited to 500MB and discarded after execution). Files saved to local disk will disappear on the next request.
   - *Fix (Phase 9):* Implement persistent object storage (Cloudflare R2, S3-compatible, or Vercel Blob, subject to owner approval).

4. **Atlas Database Connectivity & Dynamic IPs (P19):**
   - Vercel serverless functions connect from dynamic AWS/GCP IP pools.
   - MongoDB Atlas network access must either be configured with appropriate IP access or use secure database user credentials with least privilege.
   - Serverless connection reuse requires caching the Mongoose connection promise globally across invocations to avoid exhausting Atlas connection pools (`P12`).

---

## 3. Recommended Next.js Deployment Target (Option B)

1. **Vercel Project Configuration:**
   - Framework Preset: `Next.js`
   - Root Directory: `./` (or the renamed clean workspace folder)
   - Node.js Version: `18.x` / `20.x` LTS
2. **Environment Variables:**
   - Separate server-only secrets (`MONGODB_URI`, `JWT_SECRET`) from public variables (`NEXT_PUBLIC_*`).
   - Validate all environment variables at build time using Zod schema.
