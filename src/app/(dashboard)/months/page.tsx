import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CreateMonthForm } from "@/components/months/CreateMonthForm";
import { MonthCard } from "@/components/months/MonthCard";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/Panel";

export default async function MonthsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const months = await prisma.month.findMany({
    where: { userId: user!.id },
    include: { incomes: true, budgetLineItems: true, savings: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const monthsWithTotals = months.map((month) => {
    const totalIncome = month.incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalBudgetLineItems = month.budgetLineItems.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = month.savings.reduce((sum, item) => sum + item.amount, 0);
    const computedRemaining = totalIncome - totalBudgetLineItems - totalSavings;
    const remainingBalance =
      month.remainingBalanceOverride === null || month.remainingBalanceOverride === undefined
        ? computedRemaining
        : month.remainingBalanceOverride;

    return {
      ...month,
      totalIncome,
      totalBudgetLineItems,
      totalSavings,
      remainingBalance,
    };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Monthly budgets</h2>
        <p className="mt-1 text-sm text-foreground-secondary">{months.length} months tracked</p>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Create month</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <CreateMonthForm />
        </PanelContent>
      </Panel>

      {months.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-4 py-16 text-center">
          <h3 className="text-lg font-semibold">No months yet</h3>
          <p className="mt-1 text-sm text-foreground-secondary">Create your first monthly budget.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {monthsWithTotals.map((month) => (
            <MonthCard key={month.id} month={month} />
          ))}
        </div>
      )}
    </div>
  );
}
