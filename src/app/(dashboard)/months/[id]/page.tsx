import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { IncomeTable } from "@/components/months/IncomeTable";
import { ExpenseTable } from "@/components/months/ExpenseTable";
import { SavingsTable } from "@/components/months/SavingsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatMonthYear } from "@/utils/format";
import { publishMonth, deleteMonth } from "@/app/actions/months";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MonthDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const month = await prisma.month.findFirst({
    where: { id, userId: user!.id },
    include: { incomes: true, expenses: true, savings: true },
  });

  if (!month) notFound();

  const totalIncome = month.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = month.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = month.savings.reduce((s, sv) => s + sv.amount, 0);
  const remaining = month.remainingBalance;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/months" className="text-gray-400 hover:text-gray-600 text-sm">← Months</Link>
            <Badge variant={month.status === "PUBLISHED" ? "success" : "warning"}>
              {month.status}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{month.label}</h2>
          <p className="text-gray-500">{formatMonthYear(month.year, month.month)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/months/${month.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          {month.status === "DRAFT" && (
            <form action={publishMonth.bind(null, month.id)}>
              <Button type="submit" variant="secondary">
                Publish Month
              </Button>
            </form>
          )}
          <form action={deleteMonth.bind(null, month.id)}>
            <Button type="submit" variant="danger">Delete</Button>
          </form>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Income", value: totalIncome, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Expenses", value: totalExpenses, color: "text-red-500", bg: "bg-red-50" },
          { label: "Total Savings", value: totalSavings, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Remaining Balance", value: remaining, color: remaining >= 0 ? "text-emerald-700" : "text-red-600", bg: remaining >= 0 ? "bg-emerald-50" : "bg-red-50" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 ${item.bg}`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeTable incomes={month.incomes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsTable savings={month.savings} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={month.expenses} />
        </CardContent>
      </Card>
    </div>
  );
}
