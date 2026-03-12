# STATUS.md

## Current Phase
Phase 3E complete: income tagging rules and presentation are implemented on top of the Phase 3B/3C schema

## What currently works
- app boots locally
- local Postgres works
- Prisma validates
- Supabase no longer blocks local MVP
- dashboard loads
- `.env.example` exists
- `npx prisma migrate status` succeeds in the normal local environment
- `/health` exists and responds publicly with JSON
- monthly budget creation works
- monthly budgets can no longer be created for future months
- related income entry creation works
- income creation with `tagId` works
- persisted data is visible after reload
- Phase 3B migration is applied
- `npx prisma migrate status` reports the schema is up to date
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
- dashboard, month details, and insights distinguish:
  - total savings entered
  - usable general pool
  - excluded AJO contributions
  - project-linked savings
- invalid savings combinations are rejected server-side and are not persisted
- dashboard, insights, export, and month details no longer rely on `Saving.category`
- project screens no longer use editable `savedAmount` as active funding truth

## What is currently broken or unverified
- `npx prisma migrate status` still fails inside the sandbox because localhost DB access is restricted there
- delete and edit flows have not been re-verified in this phase
- lint still has a few unrelated warnings
- Phase 3F has not started yet:
  - project funding is still transitional and not yet derived from project-linked savings as the only funding truth
  - `legacySavedAmount` still exists as historical carryover only
  - project status automation is not implemented

## Immediate Goal
Begin Phase 3F and refactor project funding to rely on linked savings instead of legacy manual carryover assumptions.
