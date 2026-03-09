# BudgetTracker — Household Budget App

A full-stack household budget tracker built with Next.js App Router, Prisma, PostgreSQL, Tailwind CSS, and Supabase Auth.

## Features

- Supabase authentication (`/login`, `/signup`)
- Monthly budgets with:
  - multiple income entries
  - budget line items
  - savings (`AJO`, `OTHER`)
  - editable remaining balance override
- Project tracking with statuses:
  - `PLANNED`
  - `ONGOING`
  - `COMPLETED`
- Dashboard, insights, and CSV export

## Route Structure

- `/login`
- `/signup`
- `/dashboard`
- `/months`
- `/months/[id]`
- `/projects`
- `/insights`
- `/export`

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Supabase Auth
- Recharts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

3. Run database migration:

```bash
npx prisma migrate dev --name refine_budget_domain
```

4. Start dev server:

```bash
npm run dev
```

## Prisma Domain Model

- `Month`
  - one row per user + year + month (`@@unique([userId, year, month])`)
  - `remainingBalanceOverride` for manual balance adjustments
  - relations to `Income`, `BudgetLineItem`, `Saving`
- `Income`
- `BudgetLineItem`
- `Saving` (`AJO`, `OTHER`)
- `Project` (`PLANNED`, `ONGOING`, `COMPLETED`)

## Notes

- OCR is intentionally not included yet.
- CSV export includes monthly totals plus income, budget line item, and savings detail sections.
