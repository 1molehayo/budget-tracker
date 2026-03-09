import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatShortMonth } from "@/utils/format";
import { IncomeBudgetItemsChart } from "@/components/charts/IncomeBudgetItemsChart";
import { SavingsAreaChart, SavingsPieChart } from "@/components/charts/SavingsChart";
import type { ChartDataPoint } from "@/types";

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const months = await prisma.month.findMany({
    where: { userId: user!.id },
    include: { incomes: true, budgetLineItems: true, savings: true },
    orderBy: [{ year: "asc" }, { month: "asc" }],
    take: 12,
  });

  const chartData: ChartDataPoint[] = months.map((month) => {
    const income = month.incomes.reduce((sum, item) => sum + item.amount, 0);
    const budgetItems = month.budgetLineItems.reduce((sum, item) => sum + item.amount, 0);
    const savings = month.savings.reduce((sum, item) => sum + item.amount, 0);
    return {
      month: formatShortMonth(month.year, month.month),
      income,
      budgetItems,
      savings,
      remaining:
        month.remainingBalanceOverride === null || month.remainingBalanceOverride === undefined
          ? income - budgetItems - savings
          : month.remainingBalanceOverride,
    };
  });

  const ajoTotal = months.reduce(
    (sum, month) =>
      sum +
      month.savings
        .filter((saving) => saving.category === "AJO")
        .reduce((innerSum, saving) => innerSum + saving.amount, 0),
    0
  );

  const otherSavingsTotal = months.reduce(
    (sum, month) =>
      sum +
      month.savings
        .filter((saving) => saving.category === "OTHER")
        .reduce((innerSum, saving) => innerSum + saving.amount, 0),
    0
  );

  const avgIncome = chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.income, 0) / chartData.length : 0;
  const avgBudgetItems =
    chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.budgetItems, 0) / chartData.length : 0;
  const avgSavings = chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.savings, 0) / chartData.length : 0;

  const savingsRateAvg = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Insights</h2>
        <p className="text-gray-500 mt-1">Financial trends from {months.length} months</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Income", value: formatCurrency(avgIncome), color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Budget Items", value: formatCurrency(avgBudgetItems), color: "text-red-500", bg: "bg-red-50" },
          { label: "Avg Savings", value: formatCurrency(avgSavings), color: "text-blue-600", bg: "bg-blue-50" },
          {
            label: "Avg Savings Rate",
            value: `${(isNaN(savingsRateAvg) ? 0 : savingsRateAvg).toFixed(1)}%`,
            color: "text-violet-700",
            bg: "bg-violet-50",
          },
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
            <p className="text-gray-400 text-sm">No months yet. Add months to see insights.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Income vs Budget Items vs Savings</CardTitle></CardHeader>
            <CardContent>
              <IncomeBudgetItemsChart data={chartData} />
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
        </>
      )}
    </div>
  );
}
