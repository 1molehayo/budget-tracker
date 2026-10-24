# Contributing

Budget Tracker is a small household budget app licensed under GPL-3.0-only. Contributions are accepted under that license. Keep changes small, typed, and easy to review. The product plan is in [ROADMAP.md](ROADMAP.md). Do not start a roadmap milestone unless the issue or pull request asks for it.

## Local setup

Install [mise](https://mise.jdx.dev/), then follow the setup in [README.md](README.md):

```bash
mise install
pnpm install
docker compose up -d
cp .env.example .env
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dev
```

`mise.toml` pins Node.js 24.22.1 and pnpm 12.15.0. Use pnpm. Do not add `package-lock.json` or run npm.

Fill `DATABASE_URL` from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `docker-compose.yaml`. The database is published only on `127.0.0.1:55433`.

For local development without Supabase, set `LOCAL_AUTH_BYPASS=true` and open [http://127.0.0.1:3000](http://127.0.0.1:3000). That bypass stays off in production and for any non-loopback host. Leave the Supabase variables unset when you use it. If both Supabase variables are set, Supabase is used instead.

`pnpm exec prisma migrate deploy` applies the migrations already in `prisma/migrations`. It does not create a new migration and it does not wipe existing rows. Do not run `prisma migrate reset` or `docker compose down -v` against a database whose records you need to keep.

A fresh database has tables and no budget rows. There is no seed script. Add fictional records through the app when you need sample data.

## Project layout

- `src/app` — routes, layouts, and server actions
- `src/components` — reusable interface pieces
- `src/utils/calculations.ts` — income, savings, balance, and project funding math
- `src/lib` — Prisma, tags, and authentication helpers
- `prisma/schema.prisma` — the database model

Put a new money rule in the shared calculation helpers and call it from the server action and the page. Do not copy the formula into a component.

## Coding conventions

- Prefer the simplest change that solves the task.
- Keep one rule in one place. Reuse the existing helpers and UI components before adding new ones.
- TypeScript should describe the data. Avoid `any`. Give functions and variables names that say what they do in the budget domain.
- Keep components small. A table, form, or card can be its own component. Pages load data and compose those pieces.
- Validate on the server even when the form also checks the input. Ownership checks stay in the server actions.
- Match the current Tailwind and component style.
- Do not add a dependency unless the current stack cannot do the job.
- Do not log secrets, access tokens, or real financial records.

## Tests

`pnpm test` runs the Node.js test runner. The current tests cover savings totals, project funding, project lifecycle, and the local authentication bypass. They do not use a database.

Server actions, pages, and database rules do not have automated tests yet. Exercise those in the browser when you change them. [ROADMAP.md](ROADMAP.md) still calls for that broader coverage.

## Branches and pull requests

1. Branch from the latest default branch.
2. Use a short branch name such as `feat/household-model` or `fix/month-validation`.
3. Keep the pull request limited to one change.
4. Open the pull request against the default branch.

In the pull request, include:

- What changed and why
- Which screens or server actions you exercised
- The commands you ran
- Any migration or environment change

Do not commit `.env` files, database dumps, or real household records.

## Verification

These commands do not modify a database:

```bash
pnpm exec prisma generate
pnpm exec prisma validate
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

`pnpm lint` currently reports two existing unused-variable warnings, in `src/app/(auth)/signup/page.tsx` and `src/components/ui/Modal.tsx`.

When the change touches persisted data, also apply the existing migrations and use the local app:

```bash
pnpm exec prisma migrate deploy
pnpm dev
```

Check the empty state and the path you changed. Dashboard, month details, projects, insights, and export should still agree on the same household totals.
