# RVA Frontend — Vercel deployment

Do not deploy until the backend is live and you have its origin URL.

## Prerequisites

- Node.js 22+
- Deployed RVA backend origin (Vercel)

## Vercel project settings

| Setting | Value |
|---------|--------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm ci` |
| Node.js version | 22.x |

`vercel.json` rewrites all routes to `index.html` so deep links such as `/learn/:courseId/:lessonId` do not 404 on refresh.

## Environment variables (names only)

| Name | Description |
|------|-------------|
| `VITE_API_BASE_URL` | Backend origin, no trailing slash (e.g. `https://rva-backend.vercel.app`). Public — baked into the client bundle. Leave empty only for local Vite proxy. |

There are no other client env vars. Anything prefixed `VITE_` is public. Do not put JWT secrets, Mongo URIs, Cloudinary secrets, or Upstash tokens here.

Every API call (including refresh and thumbnail upload) uses `credentials: 'include'` so the cross-origin refresh cookie is sent.

## Deploy order

1. Deploy **backend** first and copy its origin.
2. Deploy **frontend** with `VITE_API_BASE_URL` set to that origin.
3. Update backend `CORS_ORIGIN` to this frontend origin, then redeploy/restart the backend env.

## Local development

```bash
cp .env.example .env
# leave VITE_API_BASE_URL empty
npm install
npm run dev
```

The Vite proxy still forwards `/api` to `http://localhost:4000`.
