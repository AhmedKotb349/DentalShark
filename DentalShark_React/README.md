# DentalShark — Full Stack (React + Node/Express + MongoDB)

Egypt's #1 dental equipment marketplace — full source, frontend and backend
together in one repo for version control, even though they deploy as **two
separate Vercel projects**.

```
dentalshark-fullstack/
├── frontend/    ← React/Vite app. This is what Vercel deploys FROM this repo.
└── backend/     ← Node/Express API. NOT deployed from this repo — see note below.
```

## ⚠️ Important: which backend is actually live

The live backend at **https://dental-shark.vercel.app** is deployed from a
**separate** GitHub repo, and has been modified to use **MongoDB** for
persistence instead of the JSON-file storage in this repo's `backend/`
folder. The `backend/` folder here reflects an earlier working version
(JSON-file based) — it's included for completeness and reference, but it is
**not** what's currently running in production.

If you want this repo's `backend/` folder to match your live MongoDB
version exactly, copy your edited backend files over this folder before
your first commit (or share them and I'll sync this copy for you).

## Deployment split

| | Deployed from | Where |
|---|---|---|
| **Frontend** | This repo, Root Directory = `frontend` | New Vercel project |
| **Backend** | A separate repo (your MongoDB version) | Already live at dental-shark.vercel.app |

## Publishing this repo to GitHub

```bash
git init
git add -A
git commit -m "Initial commit — DentalShark full stack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dentalshark-fullstack.git
git push -u origin main
```

## Deploying the frontend from this repo to Vercel

1. Vercel dashboard → **Add New → Project** → import this repo
2. **Root Directory** → click Edit → select `frontend`
3. Framework Preset: **Vite** (auto-detected)
4. **Settings → Environment Variables** → add:
   - Name: `VITE_API_URL`
   - Value: `https://dental-shark.vercel.app`
5. Deploy
6. Verify: open the live site → dev tools → Network tab → confirm requests
   go to `dental-shark.vercel.app/api/...` and return real data

Vercel only builds whatever's inside the Root Directory you set — the
`backend/` folder sitting alongside it in this same repo is simply ignored
during that build, so there's no conflict.

## Running the backend copy locally (optional, for reference/testing)

```bash
cd backend
npm install
cp .env.example .env
npm start
# → http://localhost:5000
```

Remember: this is the JSON-file-storage version, not your live MongoDB one
— fine for local testing/reference, but changes here won't affect
production.

## Design patterns (backend)

Singleton, Factory Method, Builder, Prototype, Facade, Strategy, and Chain
of Responsibility — see `backend/README.md` for the full pattern-to-file
map, and `frontend/README.md` for the frontend's Decorator, Bridge, and
Command patterns.
