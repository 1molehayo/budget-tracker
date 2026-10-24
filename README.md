# BudgetTracker — Household Budget App

A full-stack household budget tracker built with Next.js App Router, Prisma, PostgreSQL, Tailwind CSS, and Supabase Auth.

Contributors: [CONTRIBUTING.md](CONTRIBUTING.md). Planned work: [ROADMAP.md](ROADMAP.md).

## Features

Implemented:

- Supabase authentication at `/login` and `/signup`
- Local development without Supabase, only when `LOCAL_AUTH_BYPASS=true`, the server is running in development, and the app is opened on localhost
- Monthly budgets for the current month or earlier, with a remaining-balance override
- Income entries tagged `SALARY`, `GIG`, `GIFT`, `AJO_PAYOUT`, or `OTHER`
- Budget line items
- Savings sent to a general pool or to a project
- General savings tags `AJO_CONTRIBUTION`, `AJO_PAYOUT`, and `OTHER`
- AJO contributions stay out of the usable general pool; AJO payouts and other general savings count toward it
- Project funding derived from project-linked savings
- Project lifecycle statuses `PENDING`, `IN_PROGRESS`, `PAUSED`, `READY`, and `COMPLETED`
- Read-only historical project carryover
- Dashboard totals, insights, and CSV export

Income, budget line items, and savings can be added and deleted. Month labels, remaining-balance overrides, and projects can be edited.

Planned, and not implemented:

- Multi-household budgets, membership, and roles
- Server-action and database tests
- Photo upload and OCR for handwritten records
- CSV review and import

See [ROADMAP.md](ROADMAP.md). Image upload and CSV import details remain in [POST_MVP.md](POST_MVP.md).

## Route Structure

- `/login`
- `/signup`
- `/dashboard`
- `/months`
- `/months/[id]`
- `/projects`
- `/insights`
- `/export`
- `/health`

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Supabase Auth
- Recharts

Node.js 24.22.1 and pnpm 12.15.0 are pinned in `mise.toml`.

## Setup

1. Install the pinned Node.js and pnpm versions, then install dependencies:

```bash
mise install
pnpm install
```

2. Start local PostgreSQL:

```bash
docker compose up -d
```

Docker publishes PostgreSQL on `127.0.0.1:55433`. The database name is `budget_tracker`. The user and password are `POSTGRES_USER` and `POSTGRES_PASSWORD` in `docker-compose.yaml`. The database port is not exposed beyond this machine.

3. Create a local environment file:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to the Docker user, password, and database:

```env
DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:55433/budget_tracker"
```

For local development without a Supabase project, set:

```env
LOCAL_AUTH_BYPASS="true"
```

`LOCAL_AUTH_BYPASS` is ignored in production. It is also ignored when the site is opened through any host other than `localhost`, `127.0.0.1`, or `::1`. `pnpm dev` binds to `127.0.0.1` only.

Optional local user values:

```env
LOCAL_DEV_USER_ID="local-dev-user"
LOCAL_DEV_USER_EMAIL="local@example.com"
```

To use Supabase instead, set both of these and leave the bypass unset or set it to any value other than `true`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

If those two Supabase variables are present, the local bypass stays off.

4. Generate the Prisma client and apply the migrations already in `prisma/migrations`:

```bash
pnpm exec prisma generate
pnpm exec prisma migrate deploy
```

`migrate deploy` applies the existing migration history. It does not create a new migration.

5. Start the app:

```bash
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

A newly migrated database is empty. There is no seed command. Add records in the app. Do not reset the database or delete the Docker volume if it already contains records you want to keep.

## Prisma Domain Model

- `Month`
  - one row per user + year + month (`@@unique([userId, year, month])`)
  - `remainingBalanceOverride` for manual balance adjustments
  - relations to `Income`, `BudgetLineItem`, and `Saving`
- `Tag` (`INCOME` or `SAVINGS`)
- `Income`, with an income tag
- `BudgetLineItem`
- `Saving`
  - destination `GENERAL` or `PROJECT`
  - general savings use a savings tag
  - project savings link to a `Project`
- `Project` (`PENDING`, `IN_PROGRESS`, `PAUSED`, `READY`, `COMPLETED`)
  - active funding comes from linked project savings
  - `legacySavedAmount` is historical carryover and is not active funding

## Support this project

Support is optional. The public PayPal.Me link used for donations is [paypal.me/OlusegunOmilabu641](https://paypal.me/OlusegunOmilabu641).

## License

Budget Tracker is licensed under GPL-3.0-only. Copyright (C) 2026 Olusegun Omilabu. See [LICENSE](LICENSE).

The interface includes components adapted from [Significa Foundations](https://github.com/significa/foundations), which is also GPL-3.0-only. Adapted files and their original paths are listed in [NOTICE](NOTICE).

Other dependencies keep their own licenses. Direct packages include MIT, Apache-2.0, ISC, and BSD-2-Clause. Next.js can install LGPL-3.0 libvips binaries for image optimization. Those binaries remain under their own license and are not part of this repository's source.

## Notes

- `pnpm test` checks savings, project funding, lifecycle rules, and the local authentication bypass. It does not need a database.
- CSV export includes monthly totals, income, budget line items, savings, and project funding.
- Multi-household support, server-action tests, photo upload, OCR, and CSV import are planned in [ROADMAP.md](ROADMAP.md). They are not part of the current app.
- After changing the Docker port binding, recreate the database container so the new binding is applied. Keep the existing volume. Do not run `docker compose down -v`.
