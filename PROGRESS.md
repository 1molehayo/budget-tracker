# PROGRESS.md

Append-only historical log of completed requests, verification work, and remaining follow-ups.
Use `STATUS.md` for the current phase and immediate next task.

## Phase 1 — Supabase local-MVP unblock

### Request
Remove Supabase as a local MVP blocker while keeping the production-oriented Supabase path intact.

### Changes made
- Added a dev-only local fallback user path that activates in non-production when Supabase browser env vars are missing
- Wired the fallback into Supabase server/client helpers and the request proxy
- Added `.env.example`
- Updated README with the local MVP auth-bypass behavior
- Updated STATUS.md

### Files touched
- `src/lib/supabase/local.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/proxy.ts`
- `.env.example`
- `README.md`
- `STATUS.md`

### Verification
- `npm run lint`
- `npx prisma validate`
- `npm run dev`
- `curl -I http://127.0.0.1:3000/`
- `curl -I http://127.0.0.1:3000/dashboard`
- `npx prisma migrate status`

### Outcome
- App boots locally without a real Supabase project
- `/` redirects to `/dashboard`
- `/dashboard` responds successfully
- Local DB is reachable from the running app

### Remaining issues
- `npx prisma migrate status` returned a schema engine error
- One full CRUD flow had not yet been proven at this stage

## Phase 2 — CRUD verification and health route

### Request
- Investigate and fix the `npx prisma migrate status` schema engine error
- Verify the local database path end to end
- Prove one working monthly budget CRUD flow
- Add a public `/health` route

### Changes made
- Investigated the Prisma schema engine error and confirmed it was caused by sandbox restrictions on localhost DB access, not by a schema or migration defect
- Added a public Next.js route handler at `/health`
- Updated the auth proxy to allow `/health` without authentication in both local-bypass and Supabase-backed paths
- Proved the existing monthly budget and income creation flow through the running app using the current server-action forms
- Updated STATUS.md to reflect the completed phase

### Files touched
- `src/app/health/route.ts`
- `src/proxy.ts`
- `STATUS.md`
- `PROGRESS.md`

### Verification
- `docker compose -f docker-compose.yaml ps`
- `PGPASSWORD=budget_password psql -h localhost -p 55433 -U budget_user -d budget_tracker -c '\dt'`
- `npx prisma migrate status --schema prisma/schema.prisma`
- `npm run dev`
- `curl -s http://127.0.0.1:3000/health`
- `curl -s http://127.0.0.1:3000/months`
- `curl -X POST http://127.0.0.1:3000/months ...`
- `curl -X POST http://127.0.0.1:3000/months/<id> ...`
- `curl -s http://127.0.0.1:3000/months/<id>`

### Outcome
- `npx prisma migrate status` succeeds in the normal local environment and reports the database schema is up to date
- Local Postgres, Prisma, and the running app are connected end to end
- A monthly budget record was created successfully
- A related income entry was created successfully
- Persisted data was visible after reload on the month details page
- `/health` responds publicly with `{\"status\":\"ok\"}`

### Remaining issues
- The Prisma schema engine error still appears when commands run inside the sandbox because localhost DB access is blocked there
- Edit and delete flows were not re-verified in this phase
- A few unrelated lint warnings still exist

## Phase 3A — Month validation

### Request
Begin Phase 3 implementation with Phase 3A only:
- disallow creating future monthly budgets
- keep changes isolated from later Phase 3 schema and behavior work

### Changes made
- Added server-side validation to reject month creation requests for future months
- Added a small form guardrail on the months page by capping the year input to the current year
- Added helper text in the month creation form to make the rule visible in the UI
- Updated STATUS.md to move the repo to the next active phase

### Files touched
- `src/app/actions/months.ts`
- `src/app/(dashboard)/months/page.tsx`
- `STATUS.md`
- `PROGRESS.md`

### Verification
- `npx prisma validate`
- `npm run lint`
- `npm run dev -- --port 3001`
- `curl -I -s http://127.0.0.1:3001/months`

### Outcome
- Month creation now rejects future months at the server boundary
- The month creation UI now indicates that only the current month or earlier can be created
- Prisma still validates
- The app still boots locally and `/months` responds successfully

### Remaining issues
- The month selector still renders all 12 months; the server is the authoritative guardrail for future-month rejection
- `npx prisma migrate status` still requires a normal local environment outside the sandbox
- Lint still has a few unrelated warnings

## Phase 3B — Schema refactor foundation

### Request
Apply the approved Phase 3B Prisma schema foundation and verify it carefully without starting Phase 3C.

### Changes made
- Updated `prisma/schema.prisma` to add:
  - `TagCategory`
  - `SavingDestinationType`
  - updated `ProjectStatus`
  - `Tag` model
  - `Income.tagId`
  - refactored `Saving` model fields and relations
  - Prisma-level `legacySavedAmount @map("savedAmount")`
- Generated a create-only Phase 3B migration
- Patched the generated migration SQL to match the agreed safe sequence:
  - create enums and `Tag`
  - add nullable relation columns
  - seed system tags
  - backfill savings and incomes
  - remap project statuses safely
  - add the saving destination/project check constraint
  - drop the old savings category column and enum last
- Applied the approved migration to the local database
- Regenerated the Prisma client after migration so runtime queries used the new schema shape
- Updated STATUS.md

### Files touched
- `prisma/schema.prisma`
- `prisma/migrations/20260312181904_phase_3b_schema_refactor_foundation/migration.sql`
- `STATUS.md`
- `PROGRESS.md`

### Verification
- `npx prisma migrate dev`
- `npx prisma validate`
- `npx prisma migrate status --schema prisma/schema.prisma`
- `npm run lint`
- `npx prisma generate`
- `npm run dev -- --port 3001`
- `curl -I -s http://127.0.0.1:3001/dashboard`
- `curl -I -s http://127.0.0.1:3001/months`
- `curl -I -s http://127.0.0.1:3001/insights`

### Outcome
- Phase 3B migration applied successfully
- Prisma validates
- Prisma migrate status reports the database schema is up to date
- Lint still passes with only the same unrelated warnings
- The app boots and the main dashboard routes return `200` after Prisma client regeneration

### Remaining issues
- The first post-migration runtime check failed until `npx prisma generate` was run; the Prisma client needed to be regenerated after the schema change
- Project and savings actions still write old fields and need follow-up refactors
- Dashboard, insights, and table components still assume pre-Phase-3B field names and semantics in several places
- Phase 3C has not started

## Phase 3C — App compatibility for tags and savings

### Request
Make the app compatible with the new tag and savings schema without starting Phase 3D+ business rules.

### Changes made
- Updated app types for:
  - `TagCategory`
  - `SavingDestinationType`
  - new `ProjectStatus`
  - `Tag`
  - `legacySavedAmount`
- Added system-tag helpers and tag display helpers for server and client usage
- Refactored month actions so:
  - income creation writes `tagId`
  - general savings write `destinationType=GENERAL` with `tagId`
  - project-linked savings write `destinationType=PROJECT` with `projectId`
  - ownership checks validate tags and projects
- Refactored project actions and UI to stop using editable `savedAmount` as active truth
- Updated month details, savings table, income table, dashboard, insights, and export to read the new schema fields and stop using `Saving.category`
- Updated project displays to treat `legacySavedAmount` as read-only historical carryover only
- Updated charts and calculations to use tag/project-aware savings breakdowns
- Updated STATUS.md to move the repo to the next active phase

### Files touched
- `src/types/index.ts`
- `src/lib/tags.ts`
- `src/utils/tags.ts`
- `src/app/actions/months.ts`
- `src/app/actions/projects.ts`
- `src/components/months/IncomeTable.tsx`
- `src/components/months/SavingsTable.tsx`
- `src/components/months/MonthDetailsClient.tsx`
- `src/app/(dashboard)/months/[id]/page.tsx`
- `src/app/(dashboard)/projects/page.tsx`
- `src/app/(dashboard)/projects/ProjectsClient.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/insights/page.tsx`
- `src/app/(dashboard)/export/page.tsx`
- `src/components/charts/SavingsChart.tsx`
- `src/utils/calculations.ts`
- `src/utils/csvExport.ts`
- `STATUS.md`
- `PROGRESS.md`

### Verification
- `npx prisma validate`
- `npx prisma migrate status --schema prisma/schema.prisma`
- `npm run lint`
- `curl -I -s http://127.0.0.1:3001/dashboard`
- `curl -I -s http://127.0.0.1:3001/months`
- `curl -I -s http://127.0.0.1:3001/insights`
- `curl -I -s http://127.0.0.1:3001/projects`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add income ...`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add general saving ...`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add project-linked saving ...`
- `curl -s http://127.0.0.1:3001/projects`

### Outcome
- Phase 3C compatibility is complete
- The main dashboard routes load successfully against the new schema
- Income creation persists `tagId`
- General savings creation persists `destinationType=GENERAL` with a savings tag
- Project-linked savings creation persists `destinationType=PROJECT` with `projectId`
- The projects page now renders the new status set and treats `legacySavedAmount` as read-only carryover rather than active funding
- Insights and export now read persisted tag- and destination-aware savings data

### Remaining issues
- Phase 3D business rules have not started yet
- Savings destination and project-funding rules are wired but not yet behaviorally tightened
- Edit and delete paths were not re-verified in this phase
- Lint still has a couple of unrelated warnings

## Phase 3D — Savings behavior rules

### Request
Implement the savings behavior rules on top of the Phase 3B/3C schema:
- enforce destination-specific validation for savings
- implement general savings pool behavior
- implement AJO-specific pool inclusion and exclusion rules
- align the savings UI with those business rules

### Changes made
- Tightened savings server-action validation so invalid destination/tag/project combinations are rejected at the server boundary
- Added calculation helpers to distinguish:
  - total savings entered
  - usable general savings pool
  - excluded AJO contribution totals
  - project-linked savings totals
- Updated the month details page to:
  - show only the savings tag selector for `GENERAL`
  - show only the project selector for `PROJECT`
  - display usable-pool and project-linked summaries
  - explain the AJO contribution and payout behavior in the UI
- Updated the savings table to show per-row pool effect and aggregate totals for:
  - general entered
  - usable pool
  - excluded AJO contribution
  - project-linked savings
  - total entered
- Updated dashboard and insights summaries so they report usable general pool separately from project-linked savings and excluded AJO contributions
- Renamed month card savings display to `Savings Entered` for clarity
- Updated STATUS.md to move the repo to the next active phase

### Files touched
- `src/app/actions/months.ts`
- `src/components/months/MonthDetailsClient.tsx`
- `src/components/months/SavingsTable.tsx`
- `src/components/months/MonthCard.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/insights/page.tsx`
- `src/utils/calculations.ts`
- `STATUS.md`
- `PROGRESS.md`

### Verification
- `npx prisma validate`
- `npx prisma migrate status --schema prisma/schema.prisma`
- `npm run lint`
- `curl -I -s http://127.0.0.1:3001/dashboard`
- `curl -I -s http://127.0.0.1:3001/months`
- `curl -I -s http://127.0.0.1:3001/insights`
- `curl -I -s http://127.0.0.1:3001/projects`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add GENERAL OTHER saving ...`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add GENERAL AJO_PAYOUT saving ...`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add GENERAL AJO_CONTRIBUTION saving ...`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... add PROJECT saving ...`
- `curl -i -s -X POST http://127.0.0.1:3001/months/<id> ... invalid PROJECT + tag combination ...`
- `PGPASSWORD=budget_password psql -h localhost -p 55433 -U budget_user -d budget_tracker -c '<savings verification queries>'`

### Outcome
- `GENERAL` savings with `OTHER` increase the usable general pool
- `GENERAL` savings with `AJO_PAYOUT` increase the usable general pool
- `GENERAL` savings with `AJO_CONTRIBUTION` do not increase the usable general pool
- `PROJECT` savings are persisted correctly and do not increase the usable general pool
- Invalid savings combinations are rejected server-side and do not persist
- Dashboard, months, insights, and projects still load successfully after the savings-rule changes

### Remaining issues
- Phase 3E has not started
- Edit and delete flows were not re-verified in this phase
- Lint still has the same unrelated warnings
- Project funding remains transitional until later phases complete the refactor and lifecycle logic

## Phase 3E — Income tagging rules and presentation

### Request
Implement the income-specific behavior and rule tightening on top of the Phase 3B/3C schema:
- enforce income tag rules server-side
- tighten the income form behavior and presentation
- make income source tagging clearer in the UI and summaries
- keep the phase focused on income only

### Changes made
- Expanded system income tags to include:
  - `SALARY`
  - `GIG`
  - `GIFT`
  - `AJO_PAYOUT`
  - `OTHER`
- Tightened `addIncome` validation so income entries:
  - require `monthId`
  - require a tag
  - reject non-`INCOME` tags
  - reject negative amounts
- Simplified the income form action to use `FormData` with a hidden `monthId` instead of a bound server action reference
- Updated the month income form to:
  - default safely to `OTHER`
  - show an `Income Source Tag` selector
  - show tag-specific helper text
  - disable submission if no income tags exist
- Updated the income table to show the source tag more clearly with an explicit `Income Source` column and badge display
- Added income-source grouping helpers for summaries
- Updated dashboard and insights to surface income source information more clearly:
  - dashboard average income card now shows the top source tag
  - insights now include an `Income Sources` breakdown card
- Updated CSV export wording to use `Income Source Tag`
- Updated STATUS.md to move the repo to the next active phase

### Files touched
- `src/lib/tags.ts`
- `src/app/actions/months.ts`
- `src/components/months/MonthDetailsClient.tsx`
- `src/components/months/IncomeTable.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/insights/page.tsx`
- `src/utils/calculations.ts`
- `src/utils/csvExport.ts`
- `STATUS.md`
- `PROGRESS.md`

### Verification
- `npx prisma validate`
- `npx prisma migrate status --schema prisma/schema.prisma`
- `npm run lint`
- restarted the local Next.js dev server on port `3001`
- `curl -I -s http://127.0.0.1:3001/dashboard`
- `curl -I -s http://127.0.0.1:3001/months`
- `curl -I -s http://127.0.0.1:3001/insights`
- `curl -I -s http://127.0.0.1:3001/projects`
- `curl -s http://127.0.0.1:3001/months/<id>` to verify rendered income tags and simplified action payload
- `curl -s -X POST http://127.0.0.1:3001/months/<id> ... valid GIFT income ...`
- `curl -s -X POST http://127.0.0.1:3001/months/<id> ... missing tag ...`
- `curl -s -X POST http://127.0.0.1:3001/months/<id> ... SAVINGS tag supplied to income ...`
- `PGPASSWORD=budget_password psql -h localhost -p 55433 -U budget_user -d budget_tracker -c '<income verification queries>'`

### Outcome
- Income creation with a valid `INCOME` tag works
- Missing income tags are rejected server-side with `Income entries require an INCOME tag`
- Non-`INCOME` tags are rejected server-side with the same validation error
- Income source tags are now visible in the month table, month form, dashboard summary, insights breakdown, and export output
- `/dashboard`, `/months`, `/insights`, and `/projects` still load successfully after the Phase 3E changes

### Remaining issues
- Phase 3F has not started
- Edit and delete flows were not re-verified in this phase
- Lint still has the same unrelated warnings
- Project funding remains transitional until later phases refactor it around project-linked savings
