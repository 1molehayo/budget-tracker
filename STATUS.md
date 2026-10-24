# STATUS.md

## Current Phase
Phase 3 complete: month validation, schema refactor, tag wiring, savings rules, income rules, project funding truth, and project lifecycle behavior are all implemented

## What currently works
- app boots locally
- local Postgres works
- Prisma validates
- local development works without Supabase when the Supabase environment variables are omitted
- dashboard loads
- `.env.example` exists
- `pnpm exec prisma migrate status` succeeds in the normal local environment
- `/health` exists and responds publicly with JSON
- monthly budget creation works
- monthly budgets can no longer be created for future months
- related income entry creation works
- income creation with `tagId` works
- persisted data is visible after reload
- Phase 3B migration is applied
- `pnpm exec prisma migrate status` reports the schema is up to date
- the app serves `/dashboard`, `/months`, and `/insights` successfully after Prisma client regeneration
- `/projects` loads successfully with the new project status and legacy carryover display
- savings UI/actions work with `destinationType`, `tagId`, and `projectId`
- general savings creation with a savings tag works
- project-linked savings creation works
- savings destination validation is enforced server-side
- general savings with `OTHER` increase the usable general pool
- general savings with `AJO_PAYOUT` increase the usable general pool
- general savings with `AJO_CONTRIBUTION` do not increase the usable general pool
- project-linked savings do not increase the usable general pool
- income entries require an `INCOME` tag server-side
- income entries reject missing tags server-side
- income entries reject non-`INCOME` tags server-side
- income form defaults safely to `OTHER` when available
- income form now exposes seeded income source tags for:
  - `SALARY`
  - `GIG`
  - `GIFT`
  - `AJO_PAYOUT`
  - `OTHER`
- income tables and summaries show income source tags more clearly
- insights include an income source breakdown
- project funded amount derives from linked `PROJECT` savings only
- project remaining amount derives from `targetAmount - linked PROJECT savings`
- project progress percentage derives from linked `PROJECT` savings only
- project and dashboard funding displays no longer use `legacySavedAmount` as active truth
- adding a `PROJECT` saving updates the rendered project funded amount correctly
- historical manual carryover is shown read-only only where relevant
- new unfunded projects render as `PENDING`
- funded but incomplete projects render as `IN_PROGRESS`
- fully funded projects render as `READY` until manually completed
- incomplete projects cannot be marked `COMPLETED` server-side
- fully funded projects can be marked `COMPLETED`
- `PAUSED` remains a manual lifecycle override even when funding changes
- project lifecycle badges on `/projects` and `/dashboard` reflect derived funding state
- dashboard, month details, and insights distinguish:
  - total savings entered
  - usable general pool
  - excluded AJO contributions
  - project-linked savings
- invalid savings combinations are rejected server-side and are not persisted
- dashboard, insights, export, and month details no longer rely on `Saving.category`
- project screens no longer use editable `savedAmount` as active funding truth

## What is currently broken or unverified
- `pnpm exec prisma migrate status` still fails inside the sandbox because localhost DB access is restricted there
- delete and edit flows were re-checked on 24 Oct 2026 against a throwaway local database, using fictional records only
- lint still has two unused-variable warnings
- Post-Phase-3 cleanup and testing remain:
  - `legacySavedAmount` still exists as historical carryover until a later cleanup phase removes it
  - income, budget line items, and savings are add-and-delete only; month label, remaining-balance override, and projects can be edited
  - the local verification fixtures added during Phase 3G can be cleaned up if you want a tidier demo dataset
  - the same unrelated lint warnings still exist outside the budget domain work

## Immediate Goal
Phase 3 is complete. The next sensible step is post-Phase-3 cleanup and broader regression testing rather than more domain refactoring. Sequenced V2 work is in `ROADMAP.md`.
