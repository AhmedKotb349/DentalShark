# DentalShark — Backend

Standalone Express API. All four DentalShark frontends (HTML, React, JavaFX,
Android) talk to this same backend — deploy it once, then point every
frontend at its URL.

## Two entry points, one app

- **`app.js`** — the actual Express app (middleware, routes). No `app.listen()`
  here on purpose, so it can be reused by both entry points below.
- **`server.js`** — used for local development and traditional hosts
  (Render, Railway). Calls `app.listen()`.
- **`api/index.js`** — used only by Vercel. Exports the app directly, since
  Vercel's serverless functions handle their own request/response cycle
  instead of a long-running `listen()`.

You never run `api/index.js` yourself — it only exists for Vercel to find.

## Running locally

```bash
npm install
npm start
# → http://localhost:5000
```

Visit `http://localhost:5000/api/health` — should return `{"status":"OK",...}`.
The database self-seeds automatically on first run (demo users + starter
catalog) — no separate seed command needed.

## Deploying to Vercel

1. Vercel dashboard → **Add New → Project** → import this repo
2. **Root Directory**: `backend`
3. Framework Preset: **Other** (Vercel will use `vercel.json` in this folder,
   which is already set up to route everything through `api/index.js`)
4. **Environment Variables** — add:
   - `JWT_SECRET` — any long random string. There's a fallback value in the
     code for local dev convenience, but set a real one here for anything
     beyond local testing.
5. Deploy. Copy the resulting URL (e.g. `https://dentalshark-backend.vercel.app`)
   — every frontend needs this URL, see each frontend's own README for
   exactly where to put it.

## ⚠️ Important: data persistence on Vercel

This backend stores data in `data/db.json` — a plain file on disk. That
works completely normally on a traditional host (Render, Railway, your own
machine), but **on Vercel specifically, it will not reliably persist**:
serverless functions get a fresh, mostly-read-only filesystem per
invocation, so writes (new orders, new users, admin edits) can silently
disappear, and different requests may not even see each other's writes.

For a course-project demo where you mainly need the seeded catalog and demo
accounts to work, this is often fine as-is. If you need real persistence —
actual orders sticking around, admin changes actually saving — the fix is
to point this backend at a real hosted database instead of the JSON file.
The dependency is already sitting in `package.json` unused
(`mongoose`), and `models/User.js`, `models/Product.js`, `models/Order.js`
already exist in this repo from an earlier version of the project — wiring
those back up against a free MongoDB Atlas cluster is the natural next
step and much less work than starting from scratch. Ask if you want this
done.

## Environment variables reference

| Variable | Required? | Purpose |
|---|---|---|
| `JWT_SECRET` | Recommended | Signs login tokens. Falls back to a shared default if unset — fine for local dev, not for a real deployment. |
| `PORT` | No | Only used by `server.js` (local/Render/Railway). Vercel ignores this entirely. |
| `MONGODB_URI` | Not currently used | Present in `db.js` for a future MongoDB migration (see above) — has no effect until that migration happens. |

## API surface

All routes are under `/api/...` — see `routes/` for the full list. Quick
reference: `/api/auth` (login/register), `/api/products` (catalog, plus
admin create/update/delete), `/api/orders` (checkout, history, admin
management), `/api/service-bookings` (repair requests), `/api/users`
(admin user management), `/api/social` (reactions/comments),
`/api/suppliers`, `/api/analyze` (AI scan demo), `/api/health`.
