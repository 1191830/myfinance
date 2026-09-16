# CLAUDE.md

## Project

MyFinance — a personal finance manager for a small, fixed set of accounts, grouped into
**households**: everyone in a household shares the same data, and any account not
explicitly grouped is isolated on its own. Track **recurring and one-time** income and
expenses, plus investments and saving goals, and analyse cash flow by **month, quarter, and
year**. Username/password auth via JWT; no public sign-up — accounts are admin-created (see
Domain model → `users`/`households`).

## Architecture

- `backend/` — Java 17, Spring Boot 3.5.4 REST API, port `${PORT:8080}` (`PORT` is how
  Render assigns one in production), base path `/api`. Spring Data JPA + PostgreSQL, Flyway
  migrations. On boot `config/DatabaseInitializer` creates the database if it does not
  exist and never fails startup if it can't (a managed host's role may not have
  `CREATE DATABASE` at all — that's fine, the target database already exists there);
  `config/EnvConfig` + the `spring-dotenv` starter load `backend/.env`. `backend/Dockerfile`
  is what Render's Docker environment builds.
- Auth — Spring Security, stateless JWT bearer tokens (`security/JwtService`,
  `security/JwtAuthenticationFilter`, wired in `config/SecurityConfig`). `POST
  /api/auth/login` is the only public endpoint; everything else under `/api/**` requires
  `Authorization: Bearer <token>`. `security/SecurityUtils.currentUserId()` reads the
  authenticated user's id out of `SecurityContextHolder` for use in every service.
  `PUT /api/auth/password` changes the current user's password (verifies the current one
  first); a `users.must_change_password` flag, returned by `/login` and `/me`, forces the
  frontend to the change-password page before anything else until it's cleared.
- `frontend/` — React 19 + Vite 7 + TypeScript, dev server on port `5173`. **Tailwind 4**
  for styling (design tokens as `@theme` vars in `src/index.css`; local primitives in
  `src/components/ui/`, plain-SVG charts in `src/components/charts/`), TanStack React Query
  for server state, axios (`src/config/axios.ts`, baseURL `import.meta.env.VITE_API_URL`,
  falls back to `http://localhost:8080/api` for local dev). No MUI, no CSS-in-JS. Light
  theme only. Navy app shell = `components/layout/AppShell`. `frontend/vercel.json` rewrites
  every path to `/index.html` so client-side routes survive a hard refresh on Vercel.
- Database — PostgreSQL. Local dev DB `personal_finance_db` from `backend/.env`; the
  production target is Supabase via `backend/.env.production` (real deployment target, not
  just a placeholder — see Run/build → Deploy).
- Data flow: React screen (`src/page/`) → hook (`src/hook/use*.ts`) → service
  (`src/service/*Service.ts`) → axios → `@RestController` → service → `JpaRepository` → Postgres.

## Run / build

From a clean checkout: `cp backend/.env.example backend/.env`, then `docker compose up -d`
(dev Postgres — `docker-compose.yml`, credentials from `backend/.env`). The database must be
up **before** the backend; `config/DatabaseInitializer` does not create it. Reset with
`docker compose down -v`. `backend/.env`'s `JWT_SECRET` signs login tokens — any long random
string works for local dev; generate one with
`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`.

Backend (`cd backend`, needs a reachable Postgres per `.env`):

- `./mvnw spring-boot:run`
- `./mvnw test -Dtest='TransactionServiceImplTest,RecurringTransactionServiceImplTest'` —
  the unit tests (Mockito, no DB, fast); pass on any machine.
- `./mvnw test` — also runs `BackendApplicationTests` and the `*IT` integration tests, which
  spin up their own Postgres via Testcontainers (no manual `docker compose up`/dev DB
  needed). Verified passing, 23/23 tests. Docker Desktop 4.73/Engine 29.x bumped its API
  version and broke Testcontainers 1.x's daemon detection
  ([testcontainers-java#11212](https://github.com/testcontainers/testcontainers-java/issues/11212),
  fixed upstream only in 2.0.2) — worked around by pinning `docker-java`'s own API version
  via `backend/src/test/resources/docker-java.properties` (`api.version=1.44`), read
  automatically off the test classpath. No Docker Desktop setting changes needed.
- `./mvnw -DskipTests package` → `target/backend-0.0.1-SNAPSHOT.jar`

Frontend (`cd frontend`):

- `npm install && npm run dev`
- `npm run build` (`tsc -b && vite build`)
- `npm run lint`

**Deploy** (all free tier): backend on Render (Docker environment, `backend/Dockerfile`,
root directory `backend`, deploys from `main`) with env vars `POSTGRES_HOST`/`PORT`/`DB`/
`USER`/`PASSWORD` (from the Supabase project — see `backend/.env.production` for the
current values), `JWT_SECRET`, `DB_SSL_MODE=require` (Supabase needs SSL; local dev
defaults to `disable`), `ALLOWED_ORIGINS` (the Vercel URL). Frontend on Vercel (root
directory `frontend`, Vite preset auto-detected) with build env var `VITE_API_URL` set to
the Render URL + `/api`. Render's free tier sleeps after ~15 min idle — expect a slow first
request after a gap; the recurring-transaction scheduler's existing catch-up logic covers
any daily run it slept through.

Render's own GitHub App webhook never worked for this service (no `render.com` webhook
ever appeared under GitHub's repo Settings → Webhooks, even after confirming the repo was
in the App's installation scope via github.com/settings/installations, and the dashboard
exposes no repo disconnect/reconnect control to re-establish it). Auto-deploy instead runs
through `.github/workflows/deploy-render.yml`: on every push to `main` it `curl`s the
backend service's Render **Deploy Hook** URL (Settings → Deploy Hook in the Render
dashboard), stored as the repo's `RENDER_DEPLOY_HOOK_URL` Actions secret — this bypasses
Render's webhook mechanism entirely.

## Conventions

- **Migrations are immutable.** Never edit a `V*.sql` that may already have been applied —
  add a new `V<n>__description.sql` under `backend/src/main/resources/db/migration/`.
  Keep `docs/DB/schema.sql` and `docs/DomainModel/DomainModel.puml` in sync with it.
- Backend layering, one set per resource: `model/` entity → `repository/`
  (`JpaRepository<T, UUID>`) → `service/` interface + `ServiceImpl` → `controller/`
  `@RestController` at `/api/<plural>`. One enum per file, persisted
  `@Enumerated(EnumType.STRING)`. Money is `BigDecimal` with `precision=12, scale=2`.
  Controllers turn `IllegalArgumentException` from services into `404`; create returns `201`.
- Entities are returned directly from controllers. The exception is `/api/reports/*`
  (aggregation, no backing entity): those responses are `dto/` Java records, and the
  `ReportService` aggregates in memory rather than via JPQL `GROUP BY`.
- CORS is centralised in `config/WebCorsConfig` (`WebMvcConfigurer`) — allowed origins come
  from the `ALLOWED_ORIGINS` env var (comma-separated), defaulting to the Vite dev server on
  both `http://localhost:5173` and `http://127.0.0.1:5173`. No `@CrossOrigin` on controllers.
- **Bean Validation** on the entities doubling as request bodies (`@NotNull`/`@NotBlank`/
  `@Positive`/`@PositiveOrZero`); `exception/GlobalExceptionHandler` turns a failed `@Valid`
  into `400` + `{field: message}`. Controllers add `@Valid` to the create/update
  `@RequestBody` param.
- **Every shared resource is scoped by household, not by user.** `Category`/`Investment`/
  `RecurringTransaction`/`Transaction`/`SavingGoal` each carry both a `@ManyToOne User user`
  (`@JsonIgnore`d — provenance only, who actually created the row, never used for
  authorization) and a bare `@Column UUID householdId` (also `@JsonIgnore`d — the real
  scoping key; no `Household` object navigation needed, so no relationship mapping).
  Repositories expose `householdId`-scoped finders (`findByHouseholdId...`,
  `findByIdAndHouseholdId`) instead of unscoped ones; services inject
  `security/CurrentHousehold` (resolves the authenticated user's `household_id` via
  `UserRepository`, no JWT claim) and scope every query with `currentHousehold.resolve()`,
  plus set both `.setUser(...)` (via `SecurityUtils.currentUserId()`) and
  `.setHouseholdId(...)` on create. Update/delete on a row from someone else's household
  throws the same `IllegalArgumentException` as "not found" (never a `403`) so existence
  isn't leaked. **`Settings` is the one exception** — display name stays personal, scoped by
  `SecurityUtils.currentUserId()` as before, never by household. The one unscoped path is
  `RecurringTransactionScheduler`'s daily job (no request/current-user context) — it uses
  `RecurringTransactionRepository.findByActiveTrue()` across all households and each
  generated `Transaction` inherits both its owner and household from the template, not from
  "the current user".
- A `@ManyToOne` field on an incoming request body is a bare Jackson-deserialized instance,
  never loaded in the persistence context — Hibernate treats it as transient and refuses to
  flush it as a foreign key even when its id is real. The owning service must re-resolve it
  via its repository before `save()` (see `TransactionServiceImpl.resolveCategory`).
- An enum column backed by a **Postgres native enum type** (`transaction_type`,
  `transaction_frequency`, `recurrence_interval`) needs `@JdbcTypeCode(SqlTypes.NAMED_ENUM)`
  alongside `@Enumerated(EnumType.STRING)`, or every insert/update fails with "column is of
  type X but expression is of type character varying". `RecurringTransaction.type`/
  `.frequency`/`.recurrenceInterval` all carry it now.
- Frontend, one set per resource: `model/<X>Model.ts` (API shape) + `service/<X>Service.ts`
  (axios functions) + `hook/use<X>.ts` (React Query). Display formatting goes through the
  shared `lib/format.ts`, not a per-resource view model. Shared components in `components/`
  (`ui/` primitives, `forms/` modals, `layout/` shell, `charts/`), screens in `page/`, route
  table in `router/index.tsx`.
- Add/edit UI is a **modal**, not a route: `components/forms/<X>FormModal.tsx` takes an
  optional `initial` prop (absent = create, present = edit) and owns its own field state,
  reusing `ui/Modal` + `ui/FormField` + `lib/apiError.ts` (`getFieldErrors`/`getErrorMessage`
  surface the backend's `400`/`409`).
- UI language is **Portuguese (pt-PT)**. Currency is EUR via
  `value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })`.
- Roll-ups and aggregation are done on the **backend** with `BigDecimal` — never by
  re-parsing formatted currency strings in React.
- Work on `develop`; `main` is the stable line.

## Domain model

- `households(id, name?)` — a group of users who share data. Never managed through the
  API: created (and populated) only by a Flyway migration, same as accounts. An account not
  explicitly placed in an existing household gets a fresh one of its own (see
  `AbstractIntegrationTest.newHousehold()`/`seedUserAndLogin(mockMvc)` for how tests do the
  same thing production migrations do).
- `users(id, username, password_hash, created_at, must_change_password, household_id)` —
  case-insensitive unique `username`. No self-service signup: add an account with a new
  Flyway migration inserting a row (bcrypt the password with `BCryptPasswordEncoder` first)
  — set `must_change_password = true` on it too, same as every seeded account, so a
  placeholder password can't linger unnoticed, and decide deliberately whether it gets a
  brand-new `household_id` or joins an existing one. Every other table below (except
  `settings`) has both a `user_id` FK (provenance) and a `household_id` FK (the real scoping
  key) to these tables; every unique constraint that used to be global is now per-household
  (e.g. categories' name uniqueness is `(household_id, lower(name))`).
- `categories(id, user_id, household_id, name, monthly_budget?)` — case-insensitive unique
  `name` per household; budget is optional, no limit until one is set.
- `recurring_transactions` — a template: `user_id`, `household_id`, `type`, `frequency`,
  `recurrence_interval` (`MONTHLY`/`QUARTERLY`/`YEARLY`), `category`, `amount`,
  `description`, `start_date` (first occurrence), `end_date?` (last occurrence), `active`.
- `transactions` — `user_id`, `household_id`, `type`, `frequency`, `category`, `amount`,
  `date`, `description`, `recurring_id?` → template (set null when the template is deleted).
- `investments` — `user_id`, `household_id`, `type`, `ticker?`, `amount_invested`,
  `current_value`, `start_date`, `notes?`, `last_synced?`.
- `saving_goals` — `user_id`, `household_id`, `name`, `target_amount`, `current_amount`,
  `start_date`, `end_date?`.
- `settings` — one row per **user** (`user_id` unique, deliberately *not* per household —
  display name stays personal): `display_name`. Lazily created on that user's first
  `GET /api/settings` (defaulted to their username) rather than requiring a separate
  seeding step when an account is added.

**Recurring behaviour:** templates live in `recurring_transactions`; a generator
**materializes** one concrete `transactions` row per period per active template, per its
`recurrence_interval` (monthly/quarterly/yearly) — idempotent per template per period
(existence check, no separate "last generated" state), honouring the `start_date`
day-of-month and `end_date`, and catching up on any periods missed since the last run. A
daily `@Scheduled` job (`RecurringTransactionScheduler`, 00:05) triggers it automatically;
`POST /api/transactions/generate` triggers it manually (also exposed as "Gerar agora" on
the Recorrências page). Generated rows are ordinary transactions and can be edited or
deleted individually.

## Status

CRUD + filter endpoints for every resource plus `/api/reports/*` (net worth, month summary,
cash flow, by-category), now with Bean Validation. Frontend: all five screens (Início/
Overview, Transações, Detalhe do mês, Investimentos, Objetivos) rebuilt on the navy Tailwind
system; MUI removed. Add/edit/delete work end to end for transaction, investment, saving
goal, category and recurring-transaction template (modals in `components/forms/`); Categorias
and Recorrências pages exist. Recurrence engine is done: `recurrence_interval` enum, an
interval-aware/catch-up generator, and a daily `@Scheduled` job — see Domain model above.
Definições page exists (editable display name backed by a single-row `settings` table,
read-only currency/locale, shortcuts to Categorias/Recorrências). Topbar search navigates to
Transações with that term pre-filled; the period selector is a real dropdown but only
changes Overview (Este mês / Mês passado — Overview's KPIs are inherently month-shaped, so
no year option). Categories carry an optional `monthlyBudget`; Categorias shows a progress
bar (spend vs. budget, for whichever month Overview is anchored on — see `lib/period.ts`)
and Overview surfaces a warning banner for any category over budget that month. Multi-user
auth is done: JWT login (`POST /api/auth/login`), every resource scoped/owned per user (see
Conventions and Domain model → `users`), a frontend `AuthContext` + `/login` page + route
guard (`router/ProtectedRoute`), and a logout control in the Sidebar's user footer.
Change-password is done too, in the two shapes designed on the canvas
(`docs/design/PasswordModal.dc.html`): one shared `components/forms/ChangePasswordForm.tsx`
used both by `page/ChangePasswordPage.tsx` (the mandatory, full-page framing —
`router/ProtectedRoute` redirects here whenever `must_change_password` is set, currently
true for the seeded `rui` account) and `components/forms/ChangePasswordModal.tsx` (the
voluntary framing, opened from Definições' "Alterar palavra-passe"). Household sharing is
done: `rui` and `rita` (both real, deployed accounts) share one household — every shared
resource is scoped by `household_id`, `Settings` stays personal — see Conventions and
Domain model → `households`. Backend tests: unit tests (Mockito) cover the recurrence
generator and the category-resolution fix in isolation, and Testcontainers-backed
integration tests cover the same flows end to end through the real REST API (each test logs
in through the real `/api/auth/login` flow first, and `HouseholdSharingIT` specifically
proves two accounts in one household share data while a third in a different household
sees none of it) — all 24 tests verified passing (`./mvnw test`, see Run/build above for the
Docker/Testcontainers version-pin this needed). Frontend testing foundation is done: Vitest
+ jsdom + React Testing Library (`vite.config.ts`'s `test` block, `src/test/setup.ts` —
note its explicit `afterEach(cleanup)`, needed because `globals: false` means RTL's own
ambient-`afterEach` auto-cleanup never registers, so renders would otherwise leak across
tests in the same file), covering `lib/format.ts`/`lib/period.ts`/`lib/apiError.ts`,
`context/AuthContext.tsx`, and `components/forms/ChangePasswordForm.tsx` — 36 tests, `npm
run test`. Broader page-level coverage is still future work.

## Roadmap

1. **Deferred** — investment price sync via `ticker`/`last_synced`; CSV/Excel export;
   backend paged `GET /api/transactions`; broader frontend test coverage beyond the current
   foundation (page-level/route tests); a custom domain (Render/Vercel's default subdomains
   are in use); a household-management UI (creating/renaming a household, moving an account
   between households — currently a migration-only, admin operation).
