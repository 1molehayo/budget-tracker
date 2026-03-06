import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MonthCard } from "@/components/months/MonthCard";
import { Button } from "@/components/ui/Button";

export default async function MonthsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const months = await prisma.month.findMany({
    where: { userId: user!.id },
    include: { incomes: true, expenses: true, savings: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const monthsWithTotals = months.map((m) => ({
    ...m,
    totalIncome: m.incomes.reduce((s, i) => s + i.amount, 0),
    totalExpenses: m.expenses.reduce((s, e) => s + e.amount, 0),
    totalSavings: m.savings.reduce((s, sv) => s + sv.amount, 0),
  }));

  const published = monthsWithTotals.filter((m) => m.status === "PUBLISHED");
  const drafts = monthsWithTotals.filter((m) => m.status === "DRAFT");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Budgets</h2>
          <p className="text-gray-500 mt-1">{months.length} months tracked</p>
        </div>
        <Link href="/months/new">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Month
          </Button>
        </Link>
      </div>

      {months.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No months yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first budget month.</p>
          <Link href="/months/new">
            <Button>Create your first month</Button>
          </Link>
        </div>
      )}

      {drafts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Drafts ({drafts.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((month) => (
              <MonthCard key={month.id} month={month} />
            ))}
          </div>
        </div>
      )}

      {published.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Published ({published.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {published.map((month) => (
              <MonthCard key={month.id} month={month} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
