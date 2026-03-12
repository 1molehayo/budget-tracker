import Link from "next/link";
import type { Month } from "@/types";
import { formatMonthYear, formatCurrency } from "@/utils/format";
import { Button } from "@/components/ui/Button";

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
            {new Date(month.year, month.month - 1)
              .toLocaleString("en-US", { month: "short" })
              .toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{month.label}</p>
            <p className="text-xs text-gray-500">{formatMonthYear(month.year, month.month)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-50 px-0 py-0">
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Income</p>
          <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Budget Items</p>
          <p className="text-sm font-bold text-red-500">{formatCurrency(totalBudgetLineItems)}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Savings Entered</p>
          <p className="text-sm font-bold text-blue-600">{formatCurrency(totalSavings)}</p>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Remaining: </span>
          <span className={`text-sm font-bold ${remainingBalance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {formatCurrency(remainingBalance)}
          </span>
        </div>
        <Link href={`/months/${month.id}`}>
          <Button variant="outline" size="sm">Open</Button>
        </Link>
      </div>
    </div>
  );
}
