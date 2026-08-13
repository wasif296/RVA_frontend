# RVA Frontend

Web app for **RVA — Remote VA's Academy**.

> **Shared copy:** Types and constants under `src/shared/` are a copy of `RVA_backend/src/shared/`. The backend is the source of truth — copy changes by hand after updating the backend.

## Prerequisites

- Node.js 22+
- **RVA_backend** running on port **4000** (required for local API + cookie auth via the Vite proxy)

## Setup

```bash
cp .env.example .env
# Optional: set VITE_API_BASE only if you are not using the Vite proxy
npm install
```

## Environment variables (names only)

| Name | Purpose |
|------|---------|
| `VITE_API_BASE` | API base URL; leave empty in local dev so requests use `/api` and the Vite proxy |

## Scripts

```bash
npm run dev        # Vite on port 5173 (proxies /api → http://localhost:4000)
npm run build
npm run preview
npm run typecheck
```

## Dev workflow

1. Start `RVA_backend` on port **4000**.
2. Start this app with `npm run dev`.
3. Browse `http://localhost:5173`. The proxy keeps `/api` same-origin so cookies work without changing CORS for local development.
# RVA_frontend
