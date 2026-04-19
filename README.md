# Ancient Modern Apparel

Ancient Modern Apparel is a Next.js fashion-tech prototype that blends traditional Indian design language with modern digital customization. The app combines a storefront, account system, garment catalog, and 3D avatar workflows so users can explore fusion apparel in a more interactive way.

## What This Repo Contains

- A marketing landing page for the Ancient Modern Apparel concept
- Authentication flows built with Better Auth
- A garment catalog with product detail and cart flows
- Avatar creation and body-scan style upload flows for 3D preview experiences
- API routes for garments, avatars, designs, and supporting debug/seed utilities
- Turso + Drizzle database integration for app data and seed content

## Tech Stack

- Next.js 15 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Drizzle ORM with Turso
- Better Auth for sessions and login
- Three.js / React Three Fiber for 3D experiences
- Supabase for hosted asset integrations

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local `.env` file with the values your environment needs:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TURSO_CONNECTION_URL=
TURSO_AUTH_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Project Structure

- `src/app` contains routes, pages, and API handlers
- `src/components` contains shared UI, navigation, and 3D presentation components
- `src/db` contains schema definitions and seed data
- `src/lib` contains auth, Supabase, and shared application utilities
- `drizzle` contains generated database artifacts

## Current Prototype Focus

This repository is currently centered on proving the end-to-end concept:

- showcase Indian heritage-inspired fashion in a modern interface
- let users register and manage a personalized session
- support avatar-driven garment preview flows
- seed catalog data quickly for testing and demos

## Scripts

- `npm run dev` starts the local dev server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs linting
- `npm run typecheck` runs TypeScript checking
- `npm run db:push` pushes the current Drizzle schema to Turso
- `npm run backend:dev` starts the local Python avatar pipeline service

## Avatar Local Validation

To validate the new 4-view avatar flow locally:

1. Install frontend dependencies with `npm install`
2. Install backend dependencies with `python -m pip install -r backend/requirements.txt`
3. Push the schema with `npm run db:push`
4. Set `AVATAR_PIPELINE_URL=http://127.0.0.1:8000` in `.env`
5. Start the Python service with `npm run backend:dev`
6. Start Next.js with `npm run dev`
7. Open `/avatar` and complete the upload -> process -> preview flow

## Release

The current prototype release tag is `v1_prototype`.
