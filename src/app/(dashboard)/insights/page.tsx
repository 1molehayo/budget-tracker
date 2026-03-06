import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatShortMonth } from "@/utils/format";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { SavingsAreaChart, SavingsPieChart } from "@/components/charts/SavingsChart";
import type { ChartDataPoint } from "@/types";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const months = await prisma.month.findMany({
    where: { userId: user!.id, status: "PUBLISHED" },
    include: { incomes: true, expenses: true, savings: true },
    orderBy: [{ year: "asc" }, { month: "asc" }],
    take: 12,
  });

  const chartData: ChartDataPoint[] = months.map((m) => {
    const income = m.incomes.reduce((s, i) => s + i.amount, 0);
    const expenses = m.expenses.reduce((s, e) => s + e.amount, 0);
    const savings = m.savings.reduce((s, sv) => s + sv.amount, 0);
    return {
      month: formatShortMonth(m.year, m.month),
      income,
      expenses,
      savings,
      remaining: income - expenses - savings,
    };
  });

  const ajoTotal = months.reduce(
    (s, m) => s + m.savings.filter((sv) => sv.category === "AJO").reduce((ss, sv) => ss + sv.amount, 0),
    0
  );
  const otherSavingsTotal = months.reduce(
    (s, m) => s + m.savings.filter((sv) => sv.category === "OTHER").reduce((ss, sv) => ss + sv.amount, 0),
    0
  );

  const avgIncome = chartData.length > 0
    ? chartData.reduce((s, d) => s + d.income, 0) / chartData.length
    : 0;
  const avgExpenses = chartData.length > 0
    ? chartData.reduce((s, d) => s + d.expenses, 0) / chartData.length
    : 0;
  const avgSavings = chartData.length > 0
    ? chartData.reduce((s, d) => s + d.savings, 0) / chartData.length
    : 0;

  const savingsRateAvg = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Insights</h2>
        <p className="text-gray-500 mt-1">Financial trends from {months.length} published months</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Income", value: formatCurrency(avgIncome), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Expenses", value: formatCurrency(avgExpenses), color: "text-red-500", bg: "bg-red-50" },
          { label: "Avg Savings", value: formatCurrency(avgSavings), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Savings Rate", value: `${(isNaN(savingsRateAvg) ? 0 : savingsRateAvg).toFixed(1)}%`, color: "text-violet-700", bg: "bg-violet-50" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-4`}>
            <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {months.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-400 text-sm">No published months yet. Publish months to see insights.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Income vs Expenses vs Savings</CardTitle></CardHeader>
            <CardContent>
              <IncomeExpenseChart data={chartData} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Savings Over Time</CardTitle></CardHeader>
              <CardContent>
                <SavingsAreaChart data={chartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Savings by Category</CardTitle></CardHeader>
              <CardContent>
                <SavingsPieChart ajoTotal={ajoTotal} otherTotal={otherSavingsTotal} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-violet-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">AJO Total</p>
                    <p className="text-lg font-bold text-violet-700">{formatCurrency(ajoTotal)}</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Other Total</p>
                    <p className="text-lg font-bold text-teal-700">{formatCurrency(otherSavingsTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Remaining balance trend */}
          <Card>
            <CardHeader><CardTitle>Monthly Remaining Balance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chartData.map((d) => {
                  const maxVal = Math.max(...chartData.map((x) => Math.abs(x.remaining)), 1);
                  const pct = Math.min(100, (Math.abs(d.remaining) / maxVal) * 100);
                  return (
                    <div key={d.month} className="flex items-center gap-3">
                      <span className="w-14 text-xs text-gray-500 shrink-0">{d.month}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.remaining >= 0 ? "bg-emerald-400" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold w-20 text-right ${d.remaining >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                        {formatCurrency(d.remaining)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
