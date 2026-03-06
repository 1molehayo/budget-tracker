import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentMonths } from "@/components/dashboard/RecentMonths";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/format";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [months, projects] = await Promise.all([
    prisma.month.findMany({
      where: { userId: user!.id },
      include: { incomes: true, expenses: true, savings: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    }),
    prisma.project.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const publishedMonths = months.filter((m) => m.status === "PUBLISHED");

  const totalIncome = publishedMonths.reduce(
    (s, m) => s + m.incomes.reduce((si, i) => si + i.amount, 0), 0
  );
  const totalExpenses = publishedMonths.reduce(
    (s, m) => s + m.expenses.reduce((se, e) => se + e.amount, 0), 0
  );
  const totalSavings = publishedMonths.reduce(
    (s, m) => s + m.savings.reduce((ss, sv) => ss + sv.amount, 0), 0
  );

  const avgIncome = publishedMonths.length > 0 ? totalIncome / publishedMonths.length : 0;
  const avgExpenses = publishedMonths.length > 0 ? totalExpenses / publishedMonths.length : 0;

  const recentMonths = months.slice(0, 6).map((m) => ({
    ...m,
    totalIncome: m.incomes.reduce((s, i) => s + i.amount, 0),
    totalExpenses: m.expenses.reduce((s, e) => s + e.amount, 0),
    totalSavings: m.savings.reduce((s, sv) => s + sv.amount, 0),
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Good day! 👋
        </h2>
        <p className="text-gray-500 mt-1">Here&apos;s your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Avg Monthly Income"
          value={formatCurrency(avgIncome)}
          subtitle={`Across ${publishedMonths.length} months`}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          iconBg="bg-white/20"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          title="Avg Monthly Expenses"
          value={formatCurrency(avgExpenses)}
          subtitle={`${avgIncome > 0 ? Math.round((avgExpenses / avgIncome) * 100) : 0}% of income`}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          iconBg="bg-white/20"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <SummaryCard
          title="Total Saved"
          value={formatCurrency(totalSavings)}
          subtitle="All time savings"
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          iconBg="bg-white/20"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <SummaryCard
          title="Active Projects"
          value={String(projects.filter((p) => p.status === "PLANNED").length)}
          subtitle={`${projects.length} total projects`}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          iconBg="bg-white/20"
          icon={
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Recent Months + Projects */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Months</CardTitle>
                <Link href="/months" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <RecentMonths months={recentMonths} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Link href="/projects" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">No projects yet.</p>
                  <Link href="/projects" className="text-sm text-violet-600 hover:underline mt-2 block">
                    Create one →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => {
                    const pct = project.targetAmount > 0
                      ? Math.min(100, Math.round((project.savedAmount / project.targetAmount) * 100))
                      : 0;
                    return (
                      <div key={project.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{project.title}</span>
                          <Badge variant={project.status === "COMPLETED" ? "success" : "info"}>
                            {pct}%
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatCurrency(project.savedAmount)}</span>
                          <span>{formatCurrency(project.targetAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
