import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MonthCard } from "@/components/months/MonthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createMonth } from "@/app/actions/months";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

  const now = new Date();
  const currentYear = now.getFullYear();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Monthly Budgets</h2>
        <p className="text-gray-500 mt-1">{months.length} months tracked</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Month</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMonth} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input name="label" label="Label" defaultValue={`${MONTHS[now.getMonth()]} ${now.getFullYear()}`} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="month">Month</label>
              <select
                id="month"
                name="month"
                defaultValue={String(now.getMonth() + 1)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>{name}</option>
                ))}
              </select>
            </div>
            <Input
              name="year"
              label="Year"
              type="number"
              defaultValue={String(currentYear)}
              max={currentYear}
              helperText="Only the current month or earlier can be created."
              required
            />
            <div className="self-end">
              <Button type="submit" className="w-full">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {months.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No months yet</h3>
          <p className="text-gray-500">Create your first monthly budget.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthsWithTotals.map((month) => (
            <MonthCard key={month.id} month={month} />
          ))}
        </div>
      )}
    </div>
  );
}
