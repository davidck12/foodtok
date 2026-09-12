# Foodtok

A full-stack food review platform for restaurants and local shops — built for tourists deciding where to eat abroad and locals looking for their next favorite spot.

**Live**: https://frontend-seven-inky-82.vercel.app (frontend on Vercel) · API on Railway at `backend-production-e7ff.up.railway.app`

Demo login (password: `password123`): `alice@foodtok.dev` or `marco@foodtok.dev`

## Features

- Email/password auth with JWT sessions
- Browse and search restaurants by name, cuisine, and city
- Interactive map (OpenStreetMap/Leaflet) showing every restaurant, plus a click-to-place picker when adding a new one
- Star-rated reviews with optional photos, aggregated into a live average rating per restaurant
- One review per user per restaurant; users can delete their own reviews
- "My reviews" profile page
- Anyone signed in can add a new restaurant or shop — great for promoting local businesses

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast dev loop, industry-standard, resume-relevant |
| Styling | Tailwind CSS v4 | Rapid, consistent UI without a design system to hand-roll |
| Data fetching | TanStack Query | Caching, refetching, and loading states without boilerplate |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles | Free, no API key required, works out of the box |
| Backend | Node.js + Express + TypeScript | Simple, well-understood REST API layer |
| ORM | Prisma | Type-safe queries, easy migrations |
| Database | PostgreSQL (Railway) | Same database for local dev and production — no schema drift |
| Auth | JWT + bcrypt | Stateless, simple to reason about |
| Uploads | Multer (local disk in dev) | Swappable for S3/Cloudinary later |
| Validation | Zod | Shared-shape runtime validation on the API boundary |

## Project structure

```
foodtok/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # data model
│   │   └── seed.ts         # demo data (6 Lisbon restaurants, 2 users)
│   └── src/
│       ├── controllers/    # request handlers
│       ├── middleware/     # auth + upload
│       ├── routes/         # Express routers
│       ├── app.ts
│       └── index.ts
└── frontend/
    └── src/
        ├── api/            # axios client
        ├── components/     # NavBar, RestaurantCard, maps, etc.
        ├── context/        # AuthContext
        ├── pages/          # Home, RestaurantDetail, Login, Register, AddRestaurant, Profile
        └── App.tsx
```

## Getting started

Prerequisites: Node.js 18+.

```bash
npm install
```

This installs both workspaces (`backend` and `frontend`) from the root.

### Environment variables

`backend/.env` already points at the shared Railway Postgres instance used for both local dev and production, plus a dev JWT secret. `backend/.env.example` documents the shape for other environments.

`frontend/.env` points the frontend at `http://localhost:4000` for local dev — the deployed frontend instead has `VITE_API_URL` set on Vercel to the Railway backend URL.

### Database

Migrations and seed data already exist and have been applied. To reset:

```bash
cd backend
npx prisma migrate reset
```

Demo accounts (password: `password123`):
- `alice@foodtok.dev`
- `marco@foodtok.dev`

### Run it

From the repo root, this starts both the API (port 4000) and the frontend (port 5173):

```bash
npm run dev
```

Or run them independently:

```bash
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:5173.

## Deployment

Already deployed and wired together:

- **Database + backend**: a Railway project (`athletic-benevolence`) with a Postgres service and a `backend` service. The backend service has its **Root Directory** set to `backend` (this is a monorepo), builds with `npm run build` (`prisma generate && tsc`), and starts with `npm run start` (`prisma migrate deploy && node dist/index.js`) so schema migrations apply automatically on every deploy. Env vars: `DATABASE_URL` (a variable reference to the Postgres service), `JWT_SECRET`, `CORS_ORIGIN` (the Vercel frontend URL), `NODE_ENV=production`. Public networking is enabled on both the Postgres service (so migrations can run from a local machine) and the backend (so the frontend can reach it).
- **Frontend**: a Vercel project (`david-portfolio4/frontend`) connected to the same GitHub repo, root directory `frontend`, with `VITE_API_URL` set to the Railway backend's public URL. Pushing to `main` redeploys both automatically.

To redeploy either side after further changes, just `git push` — both Railway and Vercel are connected to this repo's `main` branch and deploy on push. Uploaded review/restaurant photos are stored on the backend's local disk, which does **not** persist across redeploys — swap `backend/src/middleware/upload.ts` for an S3-compatible bucket before relying on this for real user uploads.

To stand up a fresh copy elsewhere (e.g. Render/Supabase instead of Railway/Vercel), the steps are the same shape: provision Postgres, point `DATABASE_URL` at it, deploy `backend/` as a Node service with the build/start commands above, then deploy `frontend/` as a static build with `VITE_API_URL` pointed at that backend.

## Possible next steps

- Restaurant owner replies to reviews
- Follow other reviewers / personalized feed
- Photo galleries per restaurant (not just per review)
- Geolocation ("near me") search
- Rate limiting and email verification on auth
