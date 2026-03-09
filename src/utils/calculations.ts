import type { Income, BudgetLineItem, Saving, MonthWithDetails } from "@/types";

export function calculateTotalIncome(incomes: Income[]): number {
  return incomes.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTotalBudgetLineItems(lineItems: BudgetLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTotalSavings(savings: Saving[]): number {
  return savings.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateComputedRemainingBalance(
  incomes: Income[],
  lineItems: BudgetLineItem[],
  savings: Saving[]
): number {
  const totalIncome = calculateTotalIncome(incomes);
  const totalLineItems = calculateTotalBudgetLineItems(lineItems);
  const totalSavings = calculateTotalSavings(savings);
  return totalIncome - totalLineItems - totalSavings;
}

export function getMonthRemainingBalance(month: MonthWithDetails): number {
  if (month.remainingBalanceOverride !== null && month.remainingBalanceOverride !== undefined) {
    return month.remainingBalanceOverride;
  }

  return calculateComputedRemainingBalance(month.incomes, month.budgetLineItems, month.savings);
}

export function calculateMonthSummary(month: MonthWithDetails) {
  const totalIncome = calculateTotalIncome(month.incomes);
  const totalBudgetLineItems = calculateTotalBudgetLineItems(month.budgetLineItems);
  const totalSavings = calculateTotalSavings(month.savings);
  const computedRemaining = totalIncome - totalBudgetLineItems - totalSavings;
  const remaining =
    month.remainingBalanceOverride !== null && month.remainingBalanceOverride !== undefined
      ? month.remainingBalanceOverride
      : computedRemaining;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalBudgetLineItems,
    totalSavings,
    remaining,
    computedRemaining,
    savingsRate,
  };
}

export function groupBudgetLineItemsByCategory(lineItems: BudgetLineItem[]): Record<string, number> {
  return lineItems.reduce<Record<string, number>>((acc, lineItem) => {
    const category = lineItem.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + lineItem.amount;
    return acc;
  }, {});
}

export function groupSavingsByCategory(savings: Saving[]): Record<string, number> {
  return savings.reduce<Record<string, number>>((acc, saving) => {
    acc[saving.category] = (acc[saving.category] || 0) + saving.amount;
    return acc;
  }, {});
}
