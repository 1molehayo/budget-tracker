# AI_CONTEXT.md

## Current goal

Get this project to a working local MVP as quickly as possible.

## MVP definition

The MVP is complete when:

1. PostgreSQL runs locally
2. Prisma connects successfully
3. migrations run successfully
4. Prisma client is generated
5. the app starts locally
6. at least one monthly budget CRUD flow works
7. setup steps are accurate and reproducible

## Current stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Supabase Auth
- Recharts

## Local-first rules

- Prefer the simplest working local path
- Docker Postgres is preferred for local database setup
- Prisma + local PostgreSQL is the priority path
- Do not block local MVP work on incomplete Supabase setup
- Local development can run without Supabase when LOCAL_AUTH_BYPASS=true and the app is opened on localhost
- The local auth bypass stays off in production and for any non-loopback host
- Keep implementation simple and avoid unnecessary abstractions

## What matters most

Priority order:

1. app boots locally
2. database works
3. one real CRUD flow works
4. only then fix polish or optional features

## Known risk areas

- Prisma may be present but not fully configured
- PostgreSQL may exist in dependencies but not be wired correctly
- Supabase may be scaffolded but not required for the first working MVP
- environment variables may be incomplete or missing
- Docker may need manual validation

## Verification commands

Use the relevant commands below when needed:

```bash
mise install
pnpm install
docker compose up -d
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dev
```