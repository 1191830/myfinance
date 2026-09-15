# MyFinance

Personal finance tracker for a small set of accounts: transactions, per-category budgets,
investments, savings goals, and recurring transactions with automatic backfill. Accounts
are grouped into households — everyone in one shares the same data; an account not placed
in a household is private on its own.

Live at **https://myfinance-lemon.vercel.app** (backend on Render, database on Supabase —
see Deployment below).

## Tech stack

- **Backend**: Java 17, Spring Boot 3.5.4, Spring Data JPA, Flyway, PostgreSQL 16
- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS v4, TanStack Query, axios,
  react-router-dom v7

## Prerequisites

- JDK 17
- Node.js (for Vite 7 / React 19)
- Docker Desktop — runs the dev Postgres (via `docker-compose.yml`) and is also used by
  the backend's Testcontainers-based integration tests

## Setup

```bash
cp backend/.env.example backend/.env   # adjust values if needed
docker compose up -d                    # starts Postgres 16 on :5432
```

`backend/.env` holds `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`, and `JWT_SECRET` (signs login tokens — any long random string; generate
one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`).
These are read by both the Spring Boot app (via `spring-dotenv`) and `docker-compose.yml`
(env_file), so one file configures both. The compose file starts a single `db` service
(container `myfinance-db`, named volume `myfinance_pgdata` so data survives
`docker compose down`; use `docker compose down -v` to wipe it).

## Running the backend

```bash
cd backend
./mvnw spring-boot:run
```

Serves the API on `http://localhost:8080/api`. Flyway migrations
(`src/main/resources/db/migration`) run automatically on boot — the schema is fully
Flyway-owned (`ddl-auto=none`), no manual DDL needed.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server on `http://localhost:5173`. The API base URL defaults to
`http://localhost:8080/api`; override it with a `VITE_API_URL` build-time env var (see
`frontend/.env.example`) when pointing at a deployed backend. Visiting any page while logged
out redirects to `/login`.

## Accounts and households

There's no sign-up page — accounts are a fixed set, added by hand, and grouped into
**households** (everyone in one household shares the same transactions, categories,
investments, and saving goals; display names in Definições stay personal either way).
Two accounts exist today, sharing one household
(`backend/src/main/resources/db/migration/V8__add_households.sql`):

- username `rui`, password `changeme123`
- username `rita`, password `changeme123`

Both are seeded with `must_change_password` set, so logging in with either lands on a
mandatory change-password screen before anything else — worth doing for both before
sharing the link any further, since the placeholder is checked into the repo.

To add another account, write a new Flyway migration that inserts a row into `users`
(`username`, `password_hash` set to a bcrypt hash of the chosen password — e.g. via Spring
Security's `BCryptPasswordEncoder`, or any bcrypt tool — `must_change_password = true`, same
reasoning as the seeded accounts, and a `household_id`: either the existing shared
household's id to add them to it, or a fresh `households` row of their own to keep them
private). Anyone can also change their own password any time from Definições → "Alterar
palavra-passe".

## Running tests

Backend only — the frontend has no test tooling yet.

```bash
cd backend

# Fast unit tests only (Mockito, no DB) — pass on any machine
./mvnw test -Dtest='TransactionServiceImplTest,RecurringTransactionServiceImplTest'

# Full suite: unit tests + BackendApplicationTests + the three *IT controller
# integration tests, which each spin up their own Postgres via Testcontainers
# automatically (no need to `docker compose up` first — but Docker must be running)
./mvnw test
```

If you're on Docker Engine 29+, note that `backend/src/test/resources/docker-java.properties`
pins the Testcontainers Docker API client to a version Docker 29 still serves correctly —
Docker 29 bumped its API version in a way that broke Testcontainers 1.x's daemon detection
([testcontainers-java#11212](https://github.com/testcontainers/testcontainers-java/issues/11212)).
This is already fixed in the repo; it's only worth knowing about if you ever bump the
Testcontainers version.

## Project structure

```
backend/    Spring Boot API — src/main/java/com/myfinance/backend, Flyway migrations in
            src/main/resources/db/migration
frontend/   React app — src/pages, src/components, src/context, src/lib
docker-compose.yml   Dev Postgres
CLAUDE.md   Detailed architecture notes, current status, and roadmap
```

## Features

- Username/password login (JWT); accounts are grouped into households that share all data,
  or stand alone if not grouped; a mandatory change-password screen after first login with
  a placeholder password, and a voluntary one from Definições any time after that
- Transactions (income/expense), one-time or recurring with interval (monthly/quarterly/
  yearly), day-of-month, and optional end date — recurring templates auto-backfill every
  due month up to today on creation and on a daily scheduled job
- Categories with an optional monthly budget and spend-vs-budget progress
- Investments and savings goals
- Reports: net worth, month summary, cash flow, spend by category
- Definições (settings) page: editable display name, currency/locale, shortcuts

## Deployment

Live, free tier, two services plus a Supabase database:
**https://myfinance-lemon.vercel.app** (frontend) →
**https://myfinance-gh91.onrender.com** (backend).

- **Backend → [Render](https://render.com)**: new Web Service, Docker environment, root
  directory `backend` (builds `backend/Dockerfile`), deploy branch `main`. Env vars:
  `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  (from the Supabase project — see `backend/.env.production` for the current values),
  `JWT_SECRET`, `DB_SSL_MODE=require` (Supabase requires SSL; local dev defaults to
  `disable`), `ALLOWED_ORIGINS` (the Vercel URL from the next step).
- **Frontend → [Vercel](https://vercel.com)**: import the repo, root directory `frontend`,
  framework preset Vite (auto-detected). Build env var `VITE_API_URL` = the Render service's
  URL + `/api`.
- Circle back to Render afterward and set `ALLOWED_ORIGINS` to the Vercel URL, then redeploy
  (env var changes need a manual redeploy on Render's free tier).

Both auto-deploy on every push to `main`. Render's free tier sleeps after ~15 min idle —
the first request after a gap is slow (cold start); the recurring-transaction scheduler's
existing catch-up logic (see Domain model → Recurring behaviour in `CLAUDE.md`) covers any
daily run it slept through, so nothing is lost, just possibly delayed.

## Status and roadmap

See [`CLAUDE.md`](./CLAUDE.md) for the detailed, up-to-date status and roadmap.
