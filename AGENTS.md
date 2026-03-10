# AGENTS.md

## Mission
This repository is a pet project. The primary goal is to produce a working MVP quickly.
Prefer a simple working implementation over ideal architecture.

## Product goal
Build and maintain a simple budget tracking app.
Core features:
- local development setup that runs successfully
- database connection works
- users can create monthly budget records
- users can add income entries
- users can add expense entries
- dashboard shows totals for income, expenses, and remaining balance
- app includes seed data or demo data where helpful
- README contains exact run instructions

## Development priorities
1. Make the app run locally
2. Make the database work
3. Make CRUD work
4. Fix obvious UX issues
5. Only then consider refactors or polish

## Technical rules
- Keep the stack already present unless there is a clear reason to remove something
- Do not add new libraries unless necessary
- Prefer minimal, conventional solutions
- Do not introduce extra abstractions too early
- Avoid overengineering
- Use environment variables only when needed
- If Supabase is present but not actually required for the MVP, explain that and avoid blocking the project on it

## Environment setup rules
When dependencies like PostgreSQL, Prisma, or Supabase are present but incomplete:
- inspect the project and identify missing setup
- create or update `.env.example`
- document required env vars in README
- configure local development to the simplest working path
- if Docker is available, prefer Docker for local Postgres
- run migrations when needed
- generate Prisma client when needed
- verify the app starts after changes

## Execution behavior
Before making large changes:
1. Inspect package.json, prisma schema, env files, docker files, and README
2. State the plan briefly
3. Execute in small steps
4. After each step, verify what changed
5. If blocked, explain the exact blocker and propose the smallest fix

## Output expectations
Always leave the repo in a usable state.
At the end of a task, report:
- what was changed
- what commands were run
- what still needs manual input
- exact next steps

## Constraints
- Do not rewrite the whole app unless necessary
- Do not chase ideal folder structure
- Do not add auth, cloud sync, or advanced analytics unless explicitly requested
- Working MVP first

## Definition of done for MVP
The task is done when:
- the app starts locally
- database connection works
- at least one end-to-end CRUD flow works
- README explains how to run it