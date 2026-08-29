# DentalShark — Dental Equipment Marketplace

A dental equipment marketplace built four ways — React, plain HTML/JS,
Android, and JavaFX desktop — all sharing one live backend. Uses classic
GoF (Gang of Four) design patterns throughout the codebase.

## Live

| | Link |
|---|---|
| Backend API (Node/Express + MongoDB) | https://dental-shark.vercel.app |
| React version | https://dental-shark-react.vercel.app |
| HTML version | https://dental-shark-html.vercel.app |
| Android | source in `DentalShark_Android/` — not deployed |
| JavaFX | source in `DentalShark_JavaFX/` — not deployed |

## Structure

```
├── backend/                    ← Node/Express + MongoDB — shared by every frontend
├── DentalShark_React/
│   ├── frontend/                 ← React/Vite app, deployed separately
│   └── backend/                   ← earlier reference copy — not what's live
├── DentalShark_html/                ← plain HTML/CSS/JS version
├── DentalShark_JavaFX/               ← desktop version
└── DentalShark_Android/               ← mobile version
```

**Only `backend/` is the live backend.** The copy inside
`DentalShark_React/backend/` is from an earlier stage of the project and
isn't used in production — kept for reference only.

## Deploying the web versions

Each web frontend is its **own separate Vercel project**, using Vercel's
"Root Directory" setting to pick out just that folder:

| Project | Root Directory |
|---|---|
| Backend | `backend` |
| React | `DentalShark_React/frontend` |
| HTML | `DentalShark_html` |

All frontends point at the backend via `https://dental-shark.vercel.app`.

## Design patterns

Implemented as real, working functionality rather than isolated demo
classes — Singleton, Factory Method, Builder, Prototype, Decorator, Bridge,
Facade, Command, Strategy, and Chain of Responsibility, spread across the
backend and React frontend. See `backend/patterns/` and
`DentalShark_React/frontend/src/patterns/` for the implementations.

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
| `MONGODB_URI` | MongoDB Atlas connection string — set in Vercel's dashboard, never commit it |
| `JWT_SECRET` | Signs login tokens |

## Android & JavaFX

These two are provided as source only — not deployed or packaged into a
release. See each folder for its own setup instructions.
