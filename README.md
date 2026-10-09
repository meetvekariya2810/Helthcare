# BJK Healthcare Digital Brain — Enterprise Platform

## Overview
BJK Healthcare Digital Brain is an Enterprise Pharmaceutical Operations & HRMS platform featuring:
- Executive Command Center & Role-Based Access Control (RBAC)
- 111-Product Official Pharmaceutical Catalogue
- 11-Step Guided Employee Onboarding & Compliance Workflows
- Cleanroom Staffing & 21 CFR Part 11 Electronic Signature Audit Logs
- MongoDB Atlas Persistent Cloud Storage

---

## Directory Architecture

```
Helthcare/ (Repository Root)
├── package.json              # Workspace root scripts
├── vercel.json               # Root Vercel SPA routing fallback configuration
├── .gitignore                # Workspace gitignore (ignores credentials, build, .env)
├── .env.example              # Master environment template
└── BJK HELTHCARE/
    ├── client/               # React + Vite Frontend
    │   ├── package.json
    │   ├── vite.config.js
    │   ├── vercel.json       # Frontend Vercel configuration
    │   └── src/
    └── server/               # Node.js + Express REST API Backend
        ├── package.json
        ├── server.js
        ├── config/db.js      # MongoDB Atlas connection manager
        ├── routes/
        ├── controllers/
        └── models/
```

---

## Deployment Instructions

### 1. Frontend Deployment (Vercel)

When deploying to Vercel:

#### Recommended Setting (Vercel Project Settings)
- **Framework Preset**: Vite
- **Root Directory**: `BJK HELTHCARE/client`
- **Build Command**: `npm run build` (or `vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Alternative Setting (If Root Directory is set to `./`)
If your Vercel project has Root Directory as `./` (the repository root):
- **Build Command**: `npm run build`
- **Output Directory**: `BJK HELTHCARE/client/dist`

#### Frontend Environment Variables (Vercel Dashboard)
- `VITE_API_URL`: Your deployed backend URL (e.g. `https://your-backend-api.onrender.com/api` or `/api` if using reverse proxy).

---

### 2. Backend Deployment (Render / Railway / Node.js Server)

- **Root Directory**: `BJK HELTHCARE/server`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Node.js Version**: `>= 18.x`

#### Backend Environment Variables (Production)
Configure the following in your hosting provider's dashboard:
- `NODE_ENV`: `production`
- `PORT`: Provided by host (e.g. `5000` or `10000`)
- `CLIENT_URL`: `https://your-bjk-frontend.vercel.app` (your frontend domain)
- `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster28.bj0ygan.mongodb.net/bjk_healthcare?retryWrites=true&w=majority`
- `DATABASE_NAME`: `bjk_healthcare`
- `JWT_SECRET`: Your 64-character production random secret key
- `JWT_EXPIRES_IN`: `1d`

---

## Local Development & Testing

```bash
# Run local development server (Single Port on http://localhost:5000)
npm run dev

# Run Production Build
npm run build

# Run Database & Master Catalog Verification
npm run verify

# Run Master HRMS Production Test Suite
npm run test:hrms
```
