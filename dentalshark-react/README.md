# DentalShark — React Frontend

This is the React/Vite frontend only — the backend lives in `../backend` and
is deployed as its own separate project.

## Linking to the backend (the important part)

This app already reads its backend URL from one environment variable:
`VITE_API_URL` (see `src/lib/api.js`, line 1). You never need to edit code
to point it at a different backend — just set the variable.

### Local development
```bash
cp .env.example .env.local
# edit .env.local if your local backend runs on a different port
npm install
npm run dev
```

### Deploying to Vercel
1. Deploy `../backend` first as its own Vercel project (see `../backend/README.md`).
   Copy its live URL, e.g. `https://dentalshark-backend.vercel.app`.
2. Create a **new, separate** Vercel project from this same GitHub repo:
   - **Root Directory**: `dentalshark-react`
   - Framework preset: Vite (auto-detected)
3. Before (or after) deploying, go to **Settings → Environment Variables** and add:
   - Name: `VITE_API_URL`
   - Value: your backend's URL from step 1 (no trailing slash)
   - Environment: Production (and Preview, if you want branch previews to work too)
4. Deploy / redeploy. Environment variable changes only take effect on a
   fresh deploy — if you added the variable after the first deploy, trigger
   a redeploy from the Deployments tab.

### Verifying it's actually connected
Open the deployed site → browser dev tools → Network tab → try logging in
or browsing products. Requests should go to `https://<your-backend>/api/...`
and return real data, not 404s or CORS errors.

## Notes
- The backend has `cors()` enabled for all origins already, so no CORS
  configuration is needed on either side.
- If you ever move the backend to a different host, this is the *only*
  place you need to update — the Vercel dashboard variable, not the code.
