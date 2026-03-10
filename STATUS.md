# STATUS.md

## Current Phase
Phase 2 complete: local MVP proven

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
- related income entry creation works
- persisted data is visible after reload

## What is currently broken or unverified
- `npx prisma migrate status` still fails inside the sandbox because localhost DB access is restricted there
- delete and edit flows have not been re-verified in this phase
- lint still has a few unrelated warnings

## Immediate Goal
Keep the local MVP stable and decide the next smallest MVP milestone.
