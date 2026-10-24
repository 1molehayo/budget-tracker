import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/Panel";
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Insights</h2>
        <p className="mt-1 text-sm text-foreground-secondary">Financial trends from {months.length} months</p>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avg income", value: formatCurrency(avgIncome) },
          { label: "Avg budget items", value: formatCurrency(avgBudgetItems) },
          { label: "Avg savings entered", value: formatCurrency(avgSavingsEntered) },
          { label: "Avg usable pool", value: formatCurrency(avgUsableGeneralPool) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-medium text-foreground-secondary">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      {months.length === 0 ? (
        <Panel>
          <PanelContent className="py-16 text-center">
            <p className="text-sm text-foreground-secondary">No months yet. Add months to see insights.</p>
          </PanelContent>
        </Panel>
      ) : (
        <>
          <Panel>
            <PanelHeader>
              <PanelTitle>Income, budget items, and savings</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <IncomeBudgetItemsChart data={chartData} />
            </PanelContent>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Income sources</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {incomeBreakdown.length === 0 ? (
                  <div className="rounded-lg bg-background-secondary p-3 text-center sm:col-span-2 lg:col-span-4">
                    <p className="text-xs text-foreground-secondary">No income source tags recorded yet</p>
                  </div>
                ) : (
                  incomeBreakdown.slice(0, 4).map((segment) => (
                    <div key={segment.name} className="rounded-lg bg-background-secondary p-3">
                      <p className="text-xs text-foreground-secondary">{segment.name}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(segment.value)}</p>
                    </div>
                  ))
                )}
              </div>
            </PanelContent>
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel>
              <PanelHeader>
                <PanelTitle>Savings entered over time</PanelTitle>
              </PanelHeader>
              <PanelContent>
                <SavingsAreaChart data={chartData} />
              </PanelContent>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Savings breakdown</PanelTitle>
              </PanelHeader>
              <PanelContent>
                <SavingsPieChart data={savingsBreakdown} />
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary p-3">
                    <p className="text-xs text-foreground-secondary">Usable general pool</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(totalUsableGeneralPool)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary p-3">
                    <p className="text-xs text-foreground-secondary">Active project funding</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(totalProjectLinkedSavings)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary p-3">
                    <p className="text-xs text-foreground-secondary">Excluded AJO contribution</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(excludedAjoContribution)}</p>
                  </div>
                  {savingsBreakdown.length === 0 ? (
                    <div className="rounded-lg bg-background-secondary p-3 text-center">
                      <p className="text-xs text-foreground-secondary">No savings breakdown yet</p>
                    </div>
                  ) : (
                    savingsBreakdown.slice(0, 4).map((segment) => (
                      <div key={segment.name} className="flex items-center justify-between gap-3 rounded-lg bg-background-secondary p-3">
                        <p className="text-xs text-foreground-secondary">{segment.name}</p>
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(segment.value)}</p>
                      </div>
                    ))
                  )}
                </div>
              </PanelContent>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
