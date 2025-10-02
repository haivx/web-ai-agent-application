# Photo Organizer SaaS — Monorepo (PR#1–#6)

A minimal but production‑leaning scaffold for a Photo Organizer SaaS. Users upload photos → backend stores to S3 → ingest job (simulated for now) → “All Photos” gallery with infinite scroll. Built as a pnpm + Turborepo monorepo, **Next.js App Router** with **Next API routes**, **Postgres + Prisma**, **Redis**, and **Localstack S3** for local dev.

> Scope: This README documents the state after **PR#1–#6**.

---

## ✨ Delivered features (by PR)

* **PR#1:** Init monorepo (pnpm + Turborepo) + Next.js skeleton + `/api/health`.
* **PR#2:** Database package (`@photo/db`) with Prisma models: `Image`, `Face`, `Cluster` (embedding as `Bytes` placeholder).
* **PR#3:** Dev infra via Docker Compose: **Postgres (16)**, **Redis (7)**, **Localstack S3 (2)** + S3 init script.
* **PR#4:** Upload flow — `POST /api/uploads` returns S3 presigned **PUT** and **GET** URLs; FE **drag&drop uploader** with per-file progress.
* **PR#5:** Ingest & Job status — `POST /api/ingest` creates a Redis job; `GET /api/jobs/:id/status` simulates progress → marks DB images `processed`.
* **PR#6:** Photos gallery — `GET /api/photos` (cursor pagination) + `/gallery` page with infinite scroll.

> Not yet: Auth (NextAuth), embeddings/clustering, real albums UI, SSRF guard, rate limits, production S3/CloudFront.

---

## 🧱 Tech stack

* **Frontend & API**: Next.js (App Router, TypeScript)
* **Storage (local dev)**: Localstack S3
* **Database**: Postgres (Prisma ORM)
* **Jobs**: Redis (simple key-value job state)
* **Tooling**: pnpm, Turborepo, ESLint, Prettier, TypeScript

---

## 🗂️ Repository structure

```
photo-organizer/
├─ apps/
│  └─ web/                # Next.js app + API routes
│     ├─ app/
│     │  ├─ api/          # /api/health, /api/uploads, /api/ingest, /api/jobs/[id]/status, /api/photos
│     │  ├─ upload/       # Upload page (drag & drop)
│     │  └─ gallery/      # All Photos page (infinite scroll)
│     ├─ components/      # Uploader, QueryProvider
│     └─ lib/             # env, s3, redis, logger
├─ packages/
│  ├─ db/                 # Prisma schema, client, seed
│  ├─ types/              # Shared types
│  ├─ utils/              # Zod schemas, HTTP error helpers
│  └─ ui/                 # (placeholder)
├─ infra/
│  ├─ docker-compose.dev.yml
│  ├─ init-s3.sh          # Creates S3 bucket on Localstack
│  └─ README.md
├─ .env.example           # Copy to .env for local dev
├─ pnpm-workspace.yaml, turbo.json, tsconfig.base.json, ...
└─ ...
```

---

## ⚡ Quickstart (local dev)

> Prereqs: Node 18+, **pnpm 9+**, Docker Desktop, AWS CLI (optional for S3 checks), `psql`/`redis-cli` optional.

```bash
# 1) Install deps
pnpm i

# 2) Bring up infra (Postgres, Redis, Localstack S3) and init S3 bucket
pnpm infra:up     # = compose:up + s3:init

# 3) Prepare DB (in a new terminal)
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 4) Run web app
pnpm -C apps/web dev
# open http://localhost:3000
```

Health checks:

* `GET http://localhost:3000/api/health` → `{ ok: true, ts }`
* `aws --endpoint-url http://localhost:4566 s3 ls s3://photos` (should list uploaded objects later)

---

## 🔌 Environment variables

Copy `.env.example` → `.env` at repo root and adjust if needed.

**Key variables**

* `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/photo`
* `REDIS_URL=redis://localhost:6379`
* `S3_ENDPOINT=http://localhost:4566`
* `S3_REGION=us-east-1`
* `S3_BUCKET=photos`
* `S3_ACCESS_KEY_ID=test`
* `S3_SECRET_ACCESS_KEY=test`

> In dev, the app reads env directly (no NextAuth yet). For Localstack, `forcePathStyle: true` is enabled.

---

## 🔗 Implemented API (PR#1–#6)

### `GET /api/health`

* **200** → `{ ok: true, ts: number }`

### `POST /api/uploads`

* **Body**: `{ count: number(1..200), contentTypes: string[] }` (images only)
* **200** → `[{ key, putUrl, getUrl, contentType }]` (presigned for ~10 minutes)
* Errors: `400` on invalid/mismatched types; `500` on server error.

### `POST /api/ingest`

* **Body**: `{ photos: [{ key, contentType }] }`
* Persists `Image` rows as `queued`. Creates a Redis job (simulated processing).
* **202** → `{ jobId }`

### `GET /api/jobs/:id/status`

* **200** → `{ status: 'running'|'completed', progress: 0..100 }`
* Simulated completion after ~8s → marks all `queued` images as `processed` (demo scope).

### `GET /api/photos`

* **Query**: `status=processed|queued|failed` (default `processed`), `limit=1..60` (default `24`), `cursor=UUID`
* **200** → `{ items: { id,url,createdAt,status }[], nextCursor?: string }`

> Note: For gallery, `url` is built from `S3_ENDPOINT/S3_BUCKET/key` for local dev. If images don’t render, see **Troubleshooting**.

---

## 🧪 End‑to‑End test checklist (local)

### E2E‑1: Repo boots

1. `pnpm i` (succeeds)
2. `pnpm infra:up` brings up 3 containers healthy (check `docker ps`).
3. `pnpm db:generate && pnpm db:migrate && pnpm db:seed` succeed.
4. Run app: `pnpm -C apps/web dev` → Open `/api/health` returns `{ ok: true }`.

### E2E‑2: Upload flow (presigned S3 + progress)

1. Open `/upload`. Drop 2–3 images (jpg/png/webp).
2. Network tab: `POST /api/uploads` → 200 with presigned URLs.
3. Observe **PUT** requests to Localstack S3 with `200` and progress → 100%.
4. Previews show “Preview” links using **presigned GET** (valid ~10 min).

### E2E‑3: Ingest job + polling

1. After uploads complete, FE calls `POST /api/ingest` → returns `{ jobId }`.
2. FE polls `GET /api/jobs/:id/status` every ~1s.
3. Progress reaches 100% ≈ 8s; status becomes `completed`.
4. DB: `Image.status` updated from `queued` → `processed`.

   * Verify: `PGPASSWORD=postgres psql -h localhost -U postgres -d photo -c "select id,status,createdAt from "Image" order by createdAt desc limit 5;"`

### E2E‑4: Gallery (cursor pagination)

1. Open `/gallery` → shows a grid of recent **processed** photos.
2. Scroll down → infinite loader fetches next page via `cursor`.
3. When all pages loaded, UI shows an end marker ("— hết —").

### E2E‑5: Error cases

* Non‑image file (e.g., `.txt`) on `/upload` → `POST /api/uploads` rejects with 400; UI shows error text.
* Stop Localstack → `POST /api/uploads` or PUT upload fails; UI shows error; server logs include S3 client error.
* Stop Redis → `POST /api/ingest` should fail with 500; FE should surface an error.
* Stop Postgres before `db:migrate` → Prisma errors as expected.

### E2E‑6: Observability & resilience

* Refresh `/upload` mid‑upload: already transferred files remain uploaded; untransferred may need retry (manual).
* Start a new browser session and open `/gallery` → previously processed images still visible (DB source of truth).

---

## 🧭 Troubleshooting

* **S3 bucket missing**: run `pnpm s3:init` or `aws --endpoint-url http://localhost:4566 s3 mb s3://photos`.
* **403 on S3 GET in gallery**: Localstack may require path‑style and correct URL; the gallery uses a simple computed URL (`S3_ENDPOINT/S3_BUCKET/key`). If it fails, switch gallery to request a presigned GET per image (or open Localstack data in browser via the presigned links from the upload step).
* **Wrong endpoint**: Ensure `S3_ENDPOINT=http://localhost:4566` and Localstack is running.
* **Stale types**: run `pnpm db:generate` after schema changes.
* **Port conflicts**: Postgres (5432), Redis (6379), Localstack (4566), Next (3000).

---

## 🔒 Security notes (planned in next PRs)

* **Presigned uploads**: keep TTL short (10–15 min), restrict to `image/*`, consider size limits and content‑MD5.
* **SSRF guard** for any server‑side fetching of external URLs (especially when we add MCP calls).
* **Rate limits** per user/IP for `/api/uploads`, `/api/ingest`.
* **Auth** via NextAuth (Google/Email) and row‑level data scoping by `userId`.

---

## 🧭 Roadmap (beyond PR#6)

* **PR#7–#9 (Backend features)**: NextAuth; proper Job/JobItem tables; per‑job image scoping; error handling; structured logging.
* **PR#10–#12 (MCP)**: FastAPI + InsightFace embeddings; DBSCAN clustering; `/api/albums` and album detail; rename label.
* **PR#13+ (UX polish)**: Tailwind + shadcn; skeletons/toasts; album covers; face bbox overlay; zip download.
* **Productionization**: S3 with CloudFront, presigned GET for gallery, metrics (OpenTelemetry), infra IaC.

---

## 🧑‍💻 Conventions

* TypeScript strict, early return, no `any`.
* API input via **Zod**; error shape `{ code, message, details? }` only.
* Commit style: `feat(scope): …`, `chore(infra): …`, `fix(api): …`.

---

## 📜 License

MIT (placeholder — adjust as needed).
