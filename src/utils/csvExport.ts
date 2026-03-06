import type { MonthWithDetails } from "@/types";
import { formatMonthYear } from "./format";

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

  rows.push(buildRow(["Period", "Label", "Status", "Total Income", "Total Expenses", "Total Savings", "Remaining Balance"]));

  for (const m of months) {
    const totalIncome = m.incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = m.expenses.reduce((s, e) => s + e.amount, 0);
    const totalSavings = m.savings.reduce((s, sv) => s + sv.amount, 0);

    rows.push(
      buildRow([
        formatMonthYear(m.year, m.month),
        m.label,
        m.status,
        totalIncome,
        totalExpenses,
        totalSavings,
        m.remainingBalance,
      ])
    );
  }

  rows.push("");
  rows.push(buildRow(["INCOME DETAILS"]));
  rows.push(buildRow(["Period", "Label", "Amount"]));
  for (const m of months) {
    for (const inc of m.incomes) {
      rows.push(buildRow([formatMonthYear(m.year, m.month), inc.label, inc.amount]));
    }
  }

  rows.push("");
  rows.push(buildRow(["EXPENSE DETAILS"]));
  rows.push(buildRow(["Period", "Label", "Category", "Amount"]));
  for (const m of months) {
    for (const exp of m.expenses) {
      rows.push(buildRow([formatMonthYear(m.year, m.month), exp.label, exp.category ?? "", exp.amount]));
    }
  }

  rows.push("");
  rows.push(buildRow(["SAVINGS DETAILS"]));
  rows.push(buildRow(["Period", "Label", "Category", "Amount"]));
  for (const m of months) {
    for (const sav of m.savings) {
      rows.push(buildRow([formatMonthYear(m.year, m.month), sav.label, sav.category, sav.amount]));
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
