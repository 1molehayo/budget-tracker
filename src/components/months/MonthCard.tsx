import Link from "next/link";
import type { Month } from "@/types";
import { Button } from "@/foundations/ui/button/button";
import { formatMonthYear, formatCurrency } from "@/utils/format";

interface MonthCardProps {
  month: Month & {
    totalIncome?: number;
    totalBudgetLineItems?: number;
    totalSavings?: number;
    remainingBalance?: number;
  };
}

export function MonthCard({ month }: MonthCardProps) {
  const totalIncome = month.totalIncome ?? 0;
  const totalBudgetLineItems = month.totalBudgetLineItems ?? 0;
  const totalSavings = month.totalSavings ?? 0;
  const remainingBalance = month.remainingBalance ?? 0;

  return (
    <article className="flex flex-col rounded-xl border border-border bg-background shadow-xs">
      <div className="border-b border-border px-4 py-3">
        <p className="font-semibold">{month.label}</p>
        <p className="text-sm text-foreground-secondary">{formatMonthYear(month.year, month.month)}</p>
      </div>
      <dl className="grid grid-cols-1 gap-3 p-4 min-[420px]:grid-cols-3">
        <div>
          <dt className="text-xs text-foreground-secondary">Income</dt>
          <dd className="font-semibold tabular-nums text-success">{formatCurrency(totalIncome)}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground-secondary">Budget items</dt>
          <dd className="font-semibold tabular-nums text-error">{formatCurrency(totalBudgetLineItems)}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground-secondary">Savings</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(totalSavings)}</dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-sm">
          <span className="text-foreground-secondary">Remaining </span>
          <span className={`font-semibold tabular-nums ${remainingBalance >= 0 ? "text-success" : "text-error"}`}>
            {formatCurrency(remainingBalance)}
          </span>
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/months/${month.id}`}>Open</Link>
        </Button>
      </div>
    </article>
  );
}
