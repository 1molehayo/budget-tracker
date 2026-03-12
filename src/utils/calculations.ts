import type { Income, BudgetLineItem, Saving, MonthWithDetails } from "@/types";
import { getTagDisplayName } from "@/utils/tags";

export function calculateTotalIncome(incomes: Income[]): number {
  return incomes.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTotalBudgetLineItems(lineItems: BudgetLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTotalSavings(savings: Saving[]): number {
  return savings.reduce((sum, item) => sum + item.amount, 0);
}

export function isGeneralSaving(saving: Saving): boolean {
  return saving.destinationType === "GENERAL";
}

export function isProjectLinkedSaving(saving: Saving): boolean {
  return saving.destinationType === "PROJECT";
}

export function isExcludedFromUsableGeneralPool(saving: Saving): boolean {
  return isGeneralSaving(saving) && saving.tag?.code === "AJO_CONTRIBUTION";
}

export function increasesUsableGeneralPool(saving: Saving): boolean {
  return isGeneralSaving(saving) && !isExcludedFromUsableGeneralPool(saving);
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

export function groupIncomeBySource(incomes: Income[]): Record<string, number> {
  return incomes.reduce<Record<string, number>>((acc, income) => {
    const key = getTagDisplayName(income.tag);
    acc[key] = (acc[key] || 0) + income.amount;
    return acc;
  }, {});
}

export function groupSavingsByCategory(savings: Saving[]): Record<string, number> {
  return savings.reduce<Record<string, number>>((acc, saving) => {
    const key =
      isProjectLinkedSaving(saving)
        ? saving.project?.title || "Project-linked"
        : saving.tag?.label || saving.tag?.code || "Untagged";
    acc[key] = (acc[key] || 0) + saving.amount;
    return acc;
  }, {});
}

export function calculateProjectLinkedSavingsTotal(savings: Saving[]): number {
  return savings
    .filter(isProjectLinkedSaving)
    .reduce((sum, saving) => sum + saving.amount, 0);
}

export function calculateGeneralSavingsTotal(savings: Saving[]): number {
  return savings
    .filter(isGeneralSaving)
    .reduce((sum, saving) => sum + saving.amount, 0);
}

export function calculateUsableGeneralSavingsPool(savings: Saving[]): number {
  return savings
    .filter(increasesUsableGeneralPool)
    .reduce((sum, saving) => sum + saving.amount, 0);
}

export function calculateExcludedGeneralSavingsTotal(savings: Saving[]): number {
  return savings
    .filter(isExcludedFromUsableGeneralPool)
    .reduce((sum, saving) => sum + saving.amount, 0);
}

export function summarizeSavings(savings: Saving[]) {
  const totalEntered = calculateTotalSavings(savings);
  const generalTotal = calculateGeneralSavingsTotal(savings);
  const usableGeneralPool = calculateUsableGeneralSavingsPool(savings);
  const excludedGeneralTotal = calculateExcludedGeneralSavingsTotal(savings);
  const projectLinkedTotal = calculateProjectLinkedSavingsTotal(savings);

  return {
    totalEntered,
    generalTotal,
    usableGeneralPool,
    excludedGeneralTotal,
    projectLinkedTotal,
  };
}
