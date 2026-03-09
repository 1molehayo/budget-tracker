import type { MonthWithDetails } from "@/types";
import { formatMonthYear } from "./format";
import { calculateComputedRemainingBalance } from "./calculations";

function escapeCsv(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildRow(cells: (string | number | undefined | null)[]): string {
  return cells.map(escapeCsv).join(",");
}

export function exportMonthsToCsv(months: MonthWithDetails[]): string {
  const rows: string[] = [];

  rows.push(
    buildRow([
      "Period",
      "Label",
      "Total Income",
      "Total Budget Line Items",
      "Total Savings",
      "Computed Remaining",
      "Remaining Override",
      "Final Remaining",
    ])
  );

  for (const month of months) {
    const totalIncome = month.incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalLineItems = month.budgetLineItems.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = month.savings.reduce((sum, item) => sum + item.amount, 0);
    const computedRemaining = calculateComputedRemainingBalance(
      month.incomes,
      month.budgetLineItems,
      month.savings
    );
    const finalRemaining =
      month.remainingBalanceOverride === null || month.remainingBalanceOverride === undefined
        ? computedRemaining
        : month.remainingBalanceOverride;

    rows.push(
      buildRow([
        formatMonthYear(month.year, month.month),
        month.label,
        totalIncome,
        totalLineItems,
        totalSavings,
        computedRemaining,
        month.remainingBalanceOverride ?? "",
        finalRemaining,
      ])
    );
  }

  rows.push("");
  rows.push(buildRow(["INCOME DETAILS"]));
  rows.push(buildRow(["Period", "Label", "Amount"]));
  for (const month of months) {
    for (const income of month.incomes) {
      rows.push(buildRow([formatMonthYear(month.year, month.month), income.label, income.amount]));
    }
  }

  rows.push("");
  rows.push(buildRow(["BUDGET LINE ITEM DETAILS"]));
  rows.push(buildRow(["Period", "Label", "Category", "Amount"]));
  for (const month of months) {
    for (const lineItem of month.budgetLineItems) {
      rows.push(
        buildRow([
          formatMonthYear(month.year, month.month),
          lineItem.label,
          lineItem.category ?? "",
          lineItem.amount,
        ])
      );
    }
  }

  rows.push("");
  rows.push(buildRow(["SAVINGS DETAILS"]));
  rows.push(buildRow(["Period", "Label", "Category", "Amount"]));
  for (const month of months) {
    for (const saving of month.savings) {
      rows.push(
        buildRow([
          formatMonthYear(month.year, month.month),
          saving.label,
          saving.category,
          saving.amount,
        ])
      );
    }
  }

  return rows.join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
