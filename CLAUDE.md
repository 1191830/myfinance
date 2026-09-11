# CLAUDE.md

## Project

PersonalFinanceApp / MyFinance — a single-user, locally-run personal finance manager.
Track **recurring and one-time** income and expenses, plus investments and saving goals,
and analyse cash flow by **month, quarter, and year**. No authentication (one local user).

## Architecture

- `backend/` — Java 17, Spring Boot 3.5.4 REST API, port `8080`, base path `/api`.
  Spring Data JPA + PostgreSQL, Flyway migrations. On boot `config/DatabaseInitializer`
  creates the database if it does not exist; `config/EnvConfig` + the `spring-dotenv`
  starter load `backend/.env`.
- `frontend/` — React 19 + Vite 7 + TypeScript, dev server on port `5173`. **Tailwind 4**
  for styling (design tokens as `@theme` vars in `src/index.css`; local primitives in
  `src/components/ui/`, plain-SVG charts in `src/components/charts/`), TanStack React Query
  for server state, axios (`src/config/axios.ts`, baseURL `http://localhost:8080/api`).
  No MUI, no CSS-in-JS. Light theme only. Navy app shell = `components/layout/AppShell`.
- Database — PostgreSQL. Local dev DB `personal_finance_db` from `backend/.env`; the
  production target is Supabase via `backend/.env.production`.
- Data flow: React screen (`src/page/`) → hook (`src/hook/use*.ts`) → service
  (`src/service/*Service.ts`) → axios → `@RestController` → service → `JpaRepository` → Postgres.

## Run / build

From a clean checkout: `cp backend/.env.example backend/.env`, then `docker compose up -d`
(dev Postgres — `docker-compose.yml`, credentials from `backend/.env`). The database must be
up **before** the backend; `config/DatabaseInitializer` does not create it. Reset with
`docker compose down -v`.

Backend (`cd backend`, needs a reachable Postgres per `.env`):

- `./mvnw spring-boot:run`
- `./mvnw test` — only `contextLoads` today; still needs a live Postgres
- `./mvnw -DskipTests package` → `target/backend-0.0.1-SNAPSHOT.jar`

Frontend (`cd frontend`):

- `npm install && npm run dev`
- `npm run build` (`tsc -b && vite build`)
- `npm run lint`

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
- CORS is centralised in `config/WebCorsConfig` (`WebMvcConfigurer`) — allows the Vite dev
  server on both `http://localhost:5173` and `http://127.0.0.1:5173`. No `@CrossOrigin` on
  controllers.
- **Bean Validation** on the entities doubling as request bodies (`@NotNull`/`@NotBlank`/
  `@Positive`/`@PositiveOrZero`); `exception/GlobalExceptionHandler` turns a failed `@Valid`
  into `400` + `{field: message}`. Controllers add `@Valid` to the create/update
  `@RequestBody` param.
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

- `categories(id, name, monthly_budget?)` — case-insensitive unique `name`; budget is
  optional, no limit until one is set.
- `recurring_transactions` — a template: `type`, `frequency`, `recurrence_interval`
  (`MONTHLY`/`QUARTERLY`/`YEARLY`), `category`, `amount`, `description`, `start_date` (first
  occurrence), `end_date?` (last occurrence), `active`.
- `transactions` — `type`, `frequency`, `category`, `amount`, `date`, `description`,
  `recurring_id?` → template (set null when the template is deleted).
- `investments` — `type`, `ticker?`, `amount_invested`, `current_value`, `start_date`,
  `notes?`, `last_synced?`.
- `saving_goals` — `name`, `target_amount`, `current_amount`, `start_date`, `end_date?`.
- `settings` — single-row app settings: `display_name`.

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
and Overview surfaces a warning banner for any category over budget that month.

## Roadmap

1. **Deferred** — investment price sync via `ticker`/`last_synced`; CSV/Excel export;
   Docker packaging; backend paged `GET /api/transactions`; tests.
