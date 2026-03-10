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
