import type { Income, Expense, Saving, MonthWithDetails } from "@/types";

export function calculateTotalIncome(incomes: Income[]): number {
  return incomes.reduce((sum, i) => sum + i.amount, 0);
}

export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calculateTotalSavings(savings: Saving[]): number {
  return savings.reduce((sum, s) => sum + s.amount, 0);
}

export function calculateRemainingBalance(
  incomes: Income[],
  expenses: Expense[],
  savings: Saving[]
): number {
  const totalIncome = calculateTotalIncome(incomes);
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalSavings = calculateTotalSavings(savings);
  return totalIncome - totalExpenses - totalSavings;
}

export function calculateMonthSummary(month: MonthWithDetails) {
  const totalIncome = calculateTotalIncome(month.incomes);
  const totalExpenses = calculateTotalExpenses(month.expenses);
  const totalSavings = calculateTotalSavings(month.savings);
  const remaining = totalIncome - totalExpenses - totalSavings;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    remaining,
    savingsRate,
  };
}

export function groupExpensesByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, expense) => {
    const category = expense.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});
}

export function groupSavingsByCategory(savings: Saving[]): Record<string, number> {
  return savings.reduce<Record<string, number>>((acc, saving) => {
    acc[saving.category] = (acc[saving.category] || 0) + saving.amount;
    return acc;
  }, {});
}
