# 💰 BudgetTracker — Household Finance App

A modern, full-stack household budget tracker built with Next.js 16 (App Router), Tailwind CSS, Prisma ORM, and Supabase Auth. Track monthly income, expenses, and savings, visualize trends with charts, manage financial projects, and export data to CSV.

---

## ✨ Features

- **Authentication** — Supabase Auth (sign up, sign in, sign out)
- **Dashboard** — Summary KPI cards, recent months list, project progress bars
- **Monthly Budgets** — Create, edit, publish, and delete budget months
- **Add Month Flow** — Upload photo → mock OCR extraction → review/edit entries → publish
- **Income, Expenses, Savings** — Multiple entries per month; savings support AJO and OTHER categories
- **Remaining Balance** — Auto-computed (`Income − Expenses − Savings`) and manually editable
- **Projects** — Track financial goals with progress tracking (PLANNED / COMPLETED)
- **Insights** — Bar, area, and pie charts built with Recharts
- **CSV Export** — Select months and download full budget data as CSV

---

## 🛠 Tech Stack

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| Framework    | [Next.js 16](https://nextjs.org) — App Router           |
| Language     | TypeScript                                              |
| Styling      | [Tailwind CSS](https://tailwindcss.com)                 |
| Database     | PostgreSQL via [Prisma ORM v7](https://www.prisma.io)   |
| DB Adapter   | `@prisma/adapter-pg` (required for Prisma v7)           |
| Auth         | [Supabase Auth](https://supabase.com/auth) (`@supabase/ssr`) |
| Charts       | [Recharts](https://recharts.org)                        |
| Deployment   | [Vercel](https://vercel.com)                            |

---

## 📋 Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A PostgreSQL database (local or hosted)
- A [Supabase](https://supabase.com) project (for Auth)

---

## 🚀 Installation

```bash
git clone <your-repo-url>
cd budget-tracker
npm install
```

---

## ⚙️ Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"

# Supabase project URL and anon key (from Supabase dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Supabase service role key (only needed for server-side admin operations)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> **Note:** Never commit `.env` to git. The file is already listed in `.gitignore`.

---

## 🗄 Database Setup

### 1. Create the database

```bash
createdb budget_tracker
```

Or use your hosting provider's dashboard to create a PostgreSQL database.

### 2. Run migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables: `Month`, `Income`, `Expense`, `Saving`, `Project`.

### 3. (Optional) Open Prisma Studio

```bash
npx prisma studio
```

---

## 💻 Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to the login page.

### First-time setup

1. Go to `/signup` and create an account.
2. Check your email for a confirmation link (Supabase sends this by default).
3. After confirming, sign in at `/login`.

> **Tip:** In your Supabase project dashboard, you can disable email confirmation under **Authentication → Settings → Email** for easier local development.

---

## 📁 Project Structure

```
src/
  app/
    (auth)/            # Login and signup pages
    (dashboard)/       # Protected area with sidebar layout
      dashboard/       # Overview / KPI page
      months/          # Monthly budget list, detail, edit, new
      projects/        # Financial goals
      insights/        # Charts and analytics
      export/          # CSV export
    actions/           # Server Actions (months, projects)
    layout.tsx         # Root layout
    page.tsx           # Redirects to /dashboard or /login
  components/
    ui/                # Button, Card, Input, Badge, Modal
    dashboard/         # SummaryCard, RecentMonths
    months/            # MonthCard, IncomeTable, ExpenseTable, SavingsTable
    charts/            # IncomeExpenseChart, SavingsAreaChart, SavingsPieChart
    layout/            # Sidebar, Header
  lib/
    prisma.ts          # Prisma singleton with pg adapter
    supabase/
      client.ts        # Browser Supabase client
      server.ts        # Server-side Supabase client (async cookies)
  types/index.ts       # Shared TypeScript interfaces
  utils/
    format.ts          # Currency, date, percentage formatters
    calculations.ts    # Financial computation helpers
    mockOcr.ts         # Mock OCR that returns realistic budget data
    csvExport.ts       # CSV generation and download utilities
  proxy.ts             # Auth proxy (Next.js 16 route protection)
prisma/
  schema.prisma        # Database schema
prisma.config.ts       # Prisma v7 datasource configuration
```

---

## 💡 Financial Rules

| Concept             | Rule                                              |
|---------------------|---------------------------------------------------|
| Remaining Balance   | `Income − Expenses − Savings`                     |
| Override            | Can be manually set in the edit form              |
| Savings category    | Must be `AJO` or `OTHER`                          |
| Multiple incomes    | A month supports multiple income sources           |
| Month status        | `DRAFT` (editable) or `PUBLISHED` (locked/visible) |

---

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import in Vercel

Go to [vercel.com/new](https://vercel.com/new), import your GitHub repository, and set the following **environment variables** in the Vercel dashboard:

| Variable                          | Value                      |
|-----------------------------------|----------------------------|
| `DATABASE_URL`                    | Your PostgreSQL URL        |
| `NEXT_PUBLIC_SUPABASE_URL`        | Your Supabase project URL  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Your Supabase anon key     |
| `SUPABASE_SERVICE_ROLE_KEY`       | Your Supabase service key  |

### 3. Run migrations on production

After the first deploy, run:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

Or use a Vercel Build Command hook to run migrations automatically:

```bash
npx prisma migrate deploy && next build
```

### 4. Supabase Redirect URLs

In your Supabase project → **Authentication → URL Configuration**, add:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/**`

---

## 🧪 Development Notes

- **Mock OCR:** The `runMockOcr()` function in `src/utils/mockOcr.ts` simulates OCR output with randomized but realistic budget data. Replace with a real OCR integration (e.g., Google Vision, Tesseract) when ready.
- **Photo Upload:** File inputs are wired up in the New Month flow. To persist photos, integrate Supabase Storage and upload to a bucket, then save the URL to `Month.photoUrl`.
- **Prisma Studio:** Run `npx prisma studio` for a visual database browser.

---

## 📝 License

MIT — feel free to use, modify, and distribute.
