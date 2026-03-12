import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatShortMonth } from "@/utils/format";
import { IncomeBudgetItemsChart } from "@/components/charts/IncomeBudgetItemsChart";
import { SavingsAreaChart, SavingsPieChart } from "@/components/charts/SavingsChart";
import type { ChartBreakdownItem, ChartDataPoint } from "@/types";
import {
  calculateProjectLinkedSavingsTotal,
  calculateUsableGeneralSavingsPool,
  groupIncomeBySource,
  groupSavingsByCategory,
  summarizeSavings,
} from "@/utils/calculations";

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const months = await prisma.month.findMany({
    where: { userId: user!.id },
    include: {
      incomes: { include: { tag: true } },
      budgetLineItems: true,
      savings: { include: { tag: true, project: { select: { id: true, title: true, status: true } } } },
    },
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

  const savingsBreakdownMap = months.reduce<Record<string, number>>((acc, month) => {
    const monthGroups = groupSavingsByCategory(month.savings);
    for (const [key, value] of Object.entries(monthGroups)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {});
  const savingsBreakdown: ChartBreakdownItem[] = Object.entries(savingsBreakdownMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const incomeSourceMap = months.reduce<Record<string, number>>((acc, month) => {
    const monthGroups = groupIncomeBySource(month.incomes);
    for (const [key, value] of Object.entries(monthGroups)) {
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {});
  const incomeBreakdown: ChartBreakdownItem[] = Object.entries(incomeSourceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const avgIncome = chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.income, 0) / chartData.length : 0;
  const avgBudgetItems =
    chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.budgetItems, 0) / chartData.length : 0;
  const avgSavingsEntered =
    chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.savings, 0) / chartData.length : 0;
  const avgUsableGeneralPool =
    months.length > 0
      ? months.reduce((sum, month) => sum + calculateUsableGeneralSavingsPool(month.savings), 0) / months.length
      : 0;
  const totalProjectLinkedSavings = months.reduce(
    (sum, month) => sum + calculateProjectLinkedSavingsTotal(month.savings),
    0
  );
  const totalUsableGeneralPool = months.reduce(
    (sum, month) => sum + calculateUsableGeneralSavingsPool(month.savings),
    0
  );
  const excludedAjoContribution = months.reduce(
    (sum, month) => sum + summarizeSavings(month.savings).excludedGeneralTotal,
    0
  );

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
          {
            label: "Avg Savings Entered",
            value: formatCurrency(avgSavingsEntered),
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Avg Usable Pool",
            value: formatCurrency(avgUsableGeneralPool),
            color: "text-teal-700",
            bg: "bg-teal-50",
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
            <CardHeader><CardTitle>Income vs Budget Items vs Savings Entered</CardTitle></CardHeader>
            <CardContent>
              <IncomeBudgetItemsChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Income Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {incomeBreakdown.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-3 text-center sm:col-span-2 lg:col-span-4">
                    <p className="text-xs text-gray-500">No income source tags recorded yet</p>
                  </div>
                ) : (
                  incomeBreakdown.slice(0, 4).map((segment) => (
                    <div key={segment.name} className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-emerald-700">{segment.name}</p>
                      <p className="text-lg font-bold text-emerald-900 mt-1">
                        {formatCurrency(segment.value)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Savings Entered Over Time</CardTitle></CardHeader>
              <CardContent>
                <SavingsAreaChart data={chartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Savings Breakdown</CardTitle></CardHeader>
              <CardContent>
                <SavingsPieChart data={savingsBreakdown} />
                <div className="grid grid-cols-1 gap-3 mt-3">
                  <div className="bg-teal-50 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-xs text-teal-800">Usable General Pool</p>
                    <p className="text-sm font-bold text-teal-900">
                      {formatCurrency(totalUsableGeneralPool)}
                    </p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-xs text-violet-800">Project-linked Savings</p>
                    <p className="text-sm font-bold text-violet-900">{formatCurrency(totalProjectLinkedSavings)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-xs text-amber-800">Excluded AJO Contribution</p>
                    <p className="text-sm font-bold text-amber-900">{formatCurrency(excludedAjoContribution)}</p>
                  </div>
                  {savingsBreakdown.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">No savings breakdown yet</p>
                    </div>
                  ) : (
                    savingsBreakdown.slice(0, 4).map((segment) => (
                      <div key={segment.name} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{segment.name}</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(segment.value)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
