import Link from "next/link";
import type { Month } from "@/types";
import { formatMonthYear, formatCurrency } from "@/utils/format";

interface RecentMonthsProps {
  months: (Month & { totalIncome?: number })[];
}

export function RecentMonths({ months }: RecentMonthsProps) {
  if (months.length === 0) {
    return <p className="py-8 text-center text-sm text-foreground-secondary">No months yet. Create your first month.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {months.map((month) => (
        <li key={month.id}>
          <Link
            href={`/months/${month.id}`}
            className="flex min-h-14 items-center justify-between gap-3 py-3"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{month.label}</span>
              <span className="block text-xs text-foreground-secondary">
                {formatMonthYear(month.year, month.month)}
              </span>
            </span>
            {month.totalIncome !== undefined ? (
              <span className="shrink-0 text-sm font-medium tabular-nums">{formatCurrency(month.totalIncome)}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
