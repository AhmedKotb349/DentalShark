# DentalShark — Egypt's #1 Dental Equipment Marketplace

A dental equipment marketplace built four ways — React, plain HTML/JS,
Android, and JavaFX desktop — all sharing one live backend. Built for
CSE3202 (Software Component Design), implementing 10 GoF design patterns as
real, working functionality rather than isolated demo classes.

## Live

| | Link |
|---|---|
| Backend API (Node/Express + MongoDB) | https://dental-shark.vercel.app |
| React version | https://dental-shark-react.vercel.app |
| HTML version | *add its Vercel URL here once deployed* |
| Android (in-browser demo) | *add your Appetize.io link here* |
| JavaFX | downloadable from [Releases](../../releases) — no live browser demo exists for desktop apps |

## Structure

```
├── backend/                    ← Node/Express + MongoDB — the one actually live, shared by every frontend
├── DentalShark_React/
│   ├── frontend/                 ← React/Vite app, deployed as its own Vercel project
│   └── backend/                   ← earlier reference copy (JSON-file storage) — NOT what's live, kept for history
├── DentalShark_html/
│   └── index.html                  ← plain HTML/CSS/JS version
├── DentalShark_JavaFX/              ← (to be added) desktop version
└── DentalShark_Android/              ← (to be added) Android version
```

**Only `backend/` is the real, live backend.** The copy inside
`DentalShark_React/backend/` is from an earlier stage of the project and
uses local JSON-file storage instead of MongoDB — it's kept for reference
but every frontend actually points at the top-level `backend/`.

## Deploying each piece

Each frontend deploys as its **own separate Vercel project** from this same
repo, using Vercel's "Root Directory" setting to pick out just that folder:

| Project | Root Directory |
|---|---|
| Backend | `backend` |
| React | `DentalShark_React/frontend` |
| HTML | `DentalShark_html` |

All frontends point at the backend via `https://dental-shark.vercel.app` —
see each frontend's own config (React: `VITE_API_URL` env var; HTML:
`js/api-config.js`) for exactly where that URL is set.

### ⚠️ If you redeploy the React frontend
It needs a `vercel.json` in `DentalShark_React/frontend/` with a SPA
rewrite rule, or reloading any page other than the homepage will 404
(client-side routes like `/shop` aren't real files, so Vercel needs to be
told to always serve `index.html` and let React Router handle it).

## The 10 design patterns

| Pattern | Where | What it does |
|---|---|---|
| Singleton | `backend/patterns/Database.js` | Single shared data-access instance |
| Factory Method | `backend/patterns/UserFactory.js` | Shapes a new account based on chosen role |
| Builder | `backend/patterns/OrderBuilder.js` | Assembles an order step by step at checkout |
| Prototype | `backend/patterns/OrderPrototype.js` | Clone-based "Reorder" |
| Facade | `backend/patterns/CheckoutFacade.js` | One call wraps validation + payment + persistence |
| Strategy | `backend/patterns/PaymentStrategy.js` | 5 interchangeable payment methods |
| Chain of Responsibility | `backend/patterns/ValidationChain.js` | Registration/login validation |
| Decorator | `DentalShark_React/frontend/src/patterns/CartItemDecorators.js` | Cart add-on pricing |
| Bridge | `DentalShark_React/frontend/src/patterns/ProductViewBridge.js` | Simple/Fancy product view toggle |
| Command | `DentalShark_React/frontend/src/patterns/CartCommand.js` | Undoable cart actions |

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
account, just with no name.

## Environment variables (backend)

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string — set this in Vercel's dashboard, never commit it to git |
| `JWT_SECRET` | Signs login tokens — set a real value in production |

## Publishing Android & JavaFX

Not deployed to Vercel (they're not web apps):

- **Android**: build a signed release APK → attach to a [GitHub Release](../../releases) → also upload to Appetize.io for a real clickable in-browser demo link
- **JavaFX**: `mvn clean package` for a runnable jar (or `jpackage` for a native installer) → attach to a GitHub Release → include a short screen-recording as the demo, since no live-browser option exists for desktop apps
