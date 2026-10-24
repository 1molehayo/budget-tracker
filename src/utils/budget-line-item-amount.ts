export function readBudgetLineItemAmount(
  rawAmount: FormDataEntryValue | null
): { amount: number } | { error: string } {
  if (typeof rawAmount !== "string" || rawAmount.trim() === "") {
    return { error: "Enter a budget item description and amount." };
  }

  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) {
    return { error: "Enter a budget item description and amount." };
  }

  if (amount < 0) {
    return { error: "Enter a budget amount of zero or more." };
  }

  return { amount };
}
