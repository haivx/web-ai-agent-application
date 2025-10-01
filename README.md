# Photo Organizer SaaS (Sprint 0)

This repository bootstraps the Photo Organizer SaaS project for Sprint 0. The goal of this sprint is to support uploading photos, ingesting them into the system, and rendering placeholder album UI backed by mock services.

## Quickstart

1. Install dependencies with [`pnpm`](https://pnpm.io/):

   ```bash
   pnpm install
   ```

2. Start infrastructure services (PostgreSQL + pgvector, Redis, and the MCP FastAPI service):

   ```bash
   docker compose up -d db redis mcp
   ```

3. Run the web application in development mode:

   ```bash
   pnpm dev
   ```

   The app is available at [http://localhost:3000](http://localhost:3000).

4. Verify container health (optional helper script):

   ```bash
   ./scripts/check-health.sh
   ```

## Environment variables

Copy `.env.example` to `.env` and fill in the values that match your local environment or deployment configuration.

## Repository layout

```
├─ apps/web/                 # Next.js application (App Router) + API routes + worker entry
│  ├─ app/
│  │  ├─ (dashboard)/albums/ # Albums dashboard route
│  │  └─ api/                # API route handlers
│  ├─ components/            # UI and feature components
│  ├─ lib/                   # Shared libraries (auth, db, queue, etc.)
│  ├─ worker/                # Background workers (ingest pipeline)
│  └─ styles/                # Global stylesheets
├─ services/mcp/             # Model control plane (FastAPI skeleton)
├─ scripts/                  # Repository scripts
├─ .github/workflows/        # Continuous integration configuration
└─ docker-compose.yml        # Local infrastructure orchestration
```

## Status

All application logic is stubbed or mocked for Sprint 0. Replace the TODO comments in each module when implementing real integrations.
