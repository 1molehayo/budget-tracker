import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentMonths } from "@/components/dashboard/RecentMonths";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/Panel";
import { Badge } from "@/foundations/ui/badge/badge";
import { Progress } from "@/foundations/ui/progress/progress";
import { formatCurrency } from "@/utils/format";
import {
  calculateUsableGeneralSavingsPool,
  groupIncomeBySource,
  summarizeProjectLifecycle,
} from "@/utils/calculations";

function getStatusVariant(status: string): "success" | "info" | "warning" | "neutral" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PAUSED":
      return "warning";
    default:
      return "neutral";
  }
}

function statusClassName(status: string) {
  return status === "READY" ? "bg-accent/10 text-accent ring-accent/20" : undefined;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [months, projects] = await Promise.all([
    prisma.month.findMany({
      where: { userId: user!.id },
      include: { incomes: { include: { tag: true } }, budgetLineItems: true, savings: { include: { tag: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    }),
    prisma.project.findMany({
      where: { userId: user!.id },
      include: { savings: { where: { destinationType: "PROJECT" } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalIncome = months.reduce(
    (sum, month) => sum + month.incomes.reduce((itemSum, item) => itemSum + item.amount, 0),
    0
  );
  const totalBudgetLineItems = months.reduce(
    (sum, month) => sum + month.budgetLineItems.reduce((itemSum, item) => itemSum + item.amount, 0),
    0
  );
  const totalSavingsEntered = months.reduce(
    (sum, month) => sum + month.savings.reduce((itemSum, item) => itemSum + item.amount, 0),
    0
  );
  const usableGeneralPool = months.reduce(
    (sum, month) => sum + calculateUsableGeneralSavingsPool(month.savings),
    0
  );
  const totalProjectLinkedSavings = months.reduce(
    (sum, month) =>
      sum + month.savings.filter((saving) => saving.destinationType === "PROJECT").reduce((s, saving) => s + saving.amount, 0),
    0
  );

  const avgIncome = months.length > 0 ? totalIncome / months.length : 0;
  const avgBudgetItems = months.length > 0 ? totalBudgetLineItems / months.length : 0;
  const incomeSourceBreakdown = Object.entries(
    months.reduce<Record<string, number>>((acc, month) => {
      const monthSources = groupIncomeBySource(month.incomes);
      for (const [key, value] of Object.entries(monthSources)) {
        acc[key] = (acc[key] || 0) + value;
      }
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const topIncomeSource = incomeSourceBreakdown[0];

  const recentMonths = months.slice(0, 6).map((month) => ({
    ...month,
    totalIncome: month.incomes.reduce((sum, item) => sum + item.amount, 0),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Good day</h2>
        <p className="mt-1 text-sm text-foreground-secondary">Here is your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          tone="income"
          title="Avg monthly income"
          value={formatCurrency(avgIncome)}
          subtitle={
            topIncomeSource
              ? `Across ${months.length} months · Top source: ${topIncomeSource[0]}`
              : `Across ${months.length} months`
          }
        />
        <SummaryCard
          tone="budget"
          title="Avg budget items"
          value={formatCurrency(avgBudgetItems)}
          subtitle={`${avgIncome > 0 ? Math.round((avgBudgetItems / avgIncome) * 100) : 0}% of income`}
        />
        <SummaryCard
          tone="pool"
          title="Usable general pool"
          value={formatCurrency(usableGeneralPool)}
          subtitle={`Entered ${formatCurrency(totalSavingsEntered)} · Project-linked ${formatCurrency(totalProjectLinkedSavings)}`}
        />
        <SummaryCard
          tone="project"
          title="Active projects"
          value={String(
            projects.filter((project) => summarizeProjectLifecycle(project).effectiveStatus !== "COMPLETED").length
          )}
          subtitle={`${projects.length} total projects`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader>
            <PanelTitle>Recent months</PanelTitle>
            <Link href="/months" className="text-sm font-medium text-accent">View all</Link>
          </PanelHeader>
          <PanelContent>
            <RecentMonths months={recentMonths} />
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Projects</PanelTitle>
            <Link href="/projects" className="text-sm font-medium text-accent">View all</Link>
          </PanelHeader>
          <PanelContent>
            {projects.length === 0 ? (
              <p className="py-6 text-center text-sm text-foreground-secondary">No projects yet.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const lifecycle = summarizeProjectLifecycle(project);
                  return (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 text-sm font-medium">{project.title}</span>
                        <Badge
                          size="sm"
                          variant={getStatusVariant(lifecycle.effectiveStatus)}
                          className={statusClassName(lifecycle.effectiveStatus)}
                        >
                          {lifecycle.effectiveStatus}
                        </Badge>
                      </div>
                      <Progress value={lifecycle.progressPercentage} size="sm" />
                      <p className="flex justify-between gap-3 text-xs tabular-nums text-foreground-secondary">
                        <span>{formatCurrency(lifecycle.fundedAmount)}</span>
                        <span>{formatCurrency(project.targetAmount)}</span>
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        Remaining {formatCurrency(lifecycle.remainingAmount)}
                      </p>
                      {project.legacySavedAmount > 0 ? (
                        <p className="text-xs text-warning">
                          Historical carryover {formatCurrency(project.legacySavedAmount)} is not active funding.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
