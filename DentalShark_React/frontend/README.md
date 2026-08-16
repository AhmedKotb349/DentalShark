# DentalShark — React Frontend

The React/Vite frontend for the DentalShark dental equipment marketplace.
The backend lives in its own separate repository and is already live at:

**https://dental-shark.vercel.app**

Built with MongoDB for persistence and deployed on Vercel.

## Linking to the backend (already done — here's how it works)

This app reads its backend URL from one environment variable:
`VITE_API_URL` (see `src/lib/api.js`, line 1). You never need to edit code
to point it at a different backend — just set the variable.

### Local development
```bash
cp .env.example .env.local
# .env.local already defaults to localhost:5000 — change it if you're
# testing against the live backend instead of running one locally
npm install
npm run dev
```

To test locally against the **live** backend instead of a local one, set
`.env.local` to:
```
VITE_API_URL=https://dental-shark.vercel.app
```

### Deploying to Vercel

1. Push this repo to GitHub.
2. Vercel dashboard → **Add New → Project** → import this repo.
   - Root Directory: leave as the repo root (this repo *is* the frontend —
     no subfolder selection needed).
   - Framework preset: **Vite** (auto-detected)
3. Before (or after) deploying, go to **Settings → Environment Variables** and add:
   - Name: `VITE_API_URL`
   - Value: `https://dental-shark.vercel.app`
   - Environment: Production (and Preview, if you want branch previews to work too)
4. Deploy / redeploy. Environment variable changes only take effect on a
   fresh deploy — if you added the variable after the first deploy, trigger
   a redeploy from the Deployments tab.

### Verifying it's actually connected

Open the deployed site → browser dev tools → Network tab → try logging in
or browsing products. Requests should go to
`https://dental-shark.vercel.app/api/...` and return real data, not 404s
or CORS errors.

## Notes
- The backend has `cors()` enabled for all origins, so no CORS
  configuration is needed on either side.
- If the backend ever moves to a different host, this is the *only*
  place you need to update — the Vercel dashboard variable, not the code.
