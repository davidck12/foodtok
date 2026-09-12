# Foodtok

A full-stack food review platform for restaurants and local shops — built for tourists deciding where to eat abroad and locals looking for their next favorite spot.

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
| ORM | Prisma | Type-safe queries, easy migrations, easy to swap databases |
| Database (dev) | SQLite | Zero-config local development, no server to install |
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

`backend/.env` is already created for local dev (SQLite + a dev JWT secret). `backend/.env.example` documents what's needed for other environments.

`frontend/.env` points the frontend at `http://localhost:4000` — adjust if you deploy the API elsewhere.

### Database

The SQLite database and migration already exist and are seeded. To reset it:

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

## Deploying

This was built to deploy cheaply and painlessly:

1. **Database**: create a free Postgres instance (Render, Railway, or Supabase all work). In `backend/prisma/schema.prisma`, change the datasource `provider` to `"postgresql"`, set `DATABASE_URL` to the connection string, and optionally change `Review.photos` from a JSON string to a native `String[]` (Postgres supports array columns; SQLite doesn't). Run `npx prisma migrate dev`.
2. **Backend**: deploy `backend/` to Render/Railway/Fly.io as a Node service (`npm run build && npm start`). Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (your frontend URL), and `PORT` env vars. Swap the local-disk upload storage in `src/middleware/upload.ts` for an S3-compatible bucket if you want uploads to survive redeploys.
3. **Frontend**: deploy `frontend/` to Vercel/Netlify (`npm run build`, publish `dist/`). Set `VITE_API_URL` to your deployed backend URL.

## Possible next steps

- Restaurant owner replies to reviews
- Follow other reviewers / personalized feed
- Photo galleries per restaurant (not just per review)
- Geolocation ("near me") search
- Rate limiting and email verification on auth
