import Link from "next/link";
import type { Month } from "@/types";
import { formatMonthYear, formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";

interface RecentMonthsProps {
  months: (Month & {
    _count?: { incomes: number; expenses: number };
    totalIncome?: number;
    totalExpenses?: number;
  })[];
}

export function RecentMonths({ months }: RecentMonthsProps) {
  if (months.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">No months yet. Create your first month!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {months.map((month) => (
        <Link
          key={month.id}
          href={`/months/${month.id}`}
          className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <span className="text-xs font-bold text-violet-700">
                {new Date(month.year, month.month - 1).toLocaleString("en-US", { month: "short" })}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{month.label}</p>
              <p className="text-xs text-gray-500">{formatMonthYear(month.year, month.month)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {month.totalIncome !== undefined && (
              <span className="text-sm font-medium text-gray-900 hidden sm:block">
                {formatCurrency(month.totalIncome)}
              </span>
            )}
            <Badge variant={month.status === "PUBLISHED" ? "success" : "warning"}>
              {month.status}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
