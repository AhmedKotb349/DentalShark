# DentalShark — Egypt's #1 Dental Equipment Marketplace

A dental equipment marketplace built in four separate implementations —
HTML/JS, React, Android, and JavaFX desktop — all sharing one backend. Built
for CSE3202 (Software Component Design), demonstrating 10 GoF design
patterns implemented as real, working functionality rather than isolated
demos.

## Structure

```
DentalShark/
├── backend/              ← Node/Express API — shared by all 4 frontends. Deploy this ONE.
├── dentalshark-html/      ← HTML/CSS/JS version
├── dentalshark-react/     ← React/Vite version
├── dentalshark-JavaFX/    ← JavaFX desktop version
└── dentalShark-Android/   ← Android version
```

`backend/`, `dentalshark-html/`, and `dentalshark-react/` are complete.
`dentalshark-JavaFX/` and `dentalShark-Android/` contain only the
backend-connection files (`ApiClient.java` / `ApiConfig.kt` + friends) —
merge your existing project files into those two folders; see each
folder's own README for exactly where things go.

## Status of each version

| Folder | Status |
|---|---|
| `backend/` | Complete — Express API, 10 patterns, Vercel-ready |
| `dentalshark-html/` | Complete |
| `dentalshark-react/` | Complete |
| `dentalshark-JavaFX/` | Backend-linking file only — add your JavaFX project files |
| `dentalShark-Android/` | Backend-linking file only — add your Android project files |

## Deployment order

1. **Deploy `backend/` first**, as its own Vercel project. Copy its live URL.
   See `backend/README.md`.
2. **Point every frontend at that URL:**
   - React: set `VITE_API_URL` in that Vercel project's Environment Variables (`dentalshark-react/README.md`)
   - HTML: edit `API_BASE_URL` in `dentalshark-html/js/api-config.js`
   - JavaFX: edit `API_BASE_URL` in `dentalshark-JavaFX/src/main/java/com/dentalshark/net/ApiClient.java`
   - Android: edit `BASE_URL` in `dentalShark-Android/app/src/main/java/com/dentalshark/net/ApiConfig.kt`
3. Deploy each web frontend (HTML, React) as its **own separate** Vercel
   project, each importing this same repo with a different **Root
   Directory** setting. JavaFX and Android aren't web-deployed — they're
   built and distributed as a runnable jar / APK.

## ⚠️ Read before deploying the backend to Vercel

The backend currently stores data in a JSON file on disk. That's fine on a
traditional host, but **on Vercel it won't reliably persist** — see the
"Important: data persistence on Vercel" section in `backend/README.md`
before you rely on it for anything beyond a demo. The fix (migrating to a
real hosted database) is outlined there and isn't a large amount of work
given the groundwork (`mongoose` + model files) already sitting unused in
the repo.

## The 10 design patterns

Each is implemented in **both** the backend and, where relevant, mirrored
in the frontend/JavaFX code — not just one demo class each, but wired into
real functionality you can actually exercise by using the app.

| Pattern | Where | What it does |
|---|---|---|
| Singleton | `backend/patterns/Database.js` | Single shared in-memory data-access instance |
| Factory Method | `backend/patterns/UserFactory.js` | Shapes a new account based on chosen role |
| Builder | `backend/patterns/OrderBuilder.js` | Assembles an order step by step at checkout |
| Prototype | `backend/patterns/OrderPrototype.js` | Clone-based "Reorder" |
| Facade | `backend/patterns/CheckoutFacade.js` | One call wraps validation + payment + persistence |
| Strategy | `backend/patterns/PaymentStrategy.js` | 5 interchangeable payment methods |
| Chain of Responsibility | `backend/patterns/ValidationChain.js` | Registration/login field validation |
| Decorator | `dentalshark-react/src/patterns/CartItemDecorators.js` | Cart add-on pricing |
| Bridge | `dentalshark-react/src/patterns/ProductViewBridge.js` | Simple/Fancy product view toggle |
| Command | `dentalshark-react/src/patterns/CartCommand.js` | Undoable cart actions |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin (CEO) | ahmed.kotb@dentalshark.eg | Admin@Shark2024! |
| Engineer | m.kotb@dentalshark.eg | Eng#Repair2024 |
| Vendor | m.gomaa@dentalshark.eg | Vendor@Supply24 |
| Dentist | dr.ashraf@clinic.eg | Doctor@Ash2024 |
| Staff | d.samir@dentalshark.eg | Staff@David24! |
| Student | o.essam@dentalshark.eg | Student#Omar24 |

Or use **Browse as guest** — a guest is a fully-functional signed-in
account (can order, comment, react normally), just with no name.

## Local development (any frontend, against a local backend)

```bash
cd backend
npm install
npm start
# → http://localhost:5000 — leave this running
```

Then in a second terminal, run whichever frontend you're working on — see
that frontend's own README for its specific local-dev steps.
