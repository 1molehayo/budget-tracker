import Link from "next/link";
import type { Month } from "@/types";
import { formatMonthYear, formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface MonthCardProps {
  month: Month & {
    totalIncome?: number;
    totalExpenses?: number;
    totalSavings?: number;
  };
  onDelete?: (id: string) => void;
}

export function MonthCard({ month, onDelete }: MonthCardProps) {
  const totalIncome = month.totalIncome ?? 0;
  const totalExpenses = month.totalExpenses ?? 0;
  const totalSavings = month.totalSavings ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
            {new Date(month.year, month.month - 1).toLocaleString("en-US", { month: "short" }).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{month.label}</p>
            <p className="text-xs text-gray-500">{formatMonthYear(month.year, month.month)}</p>
          </div>
        </div>
        <Badge variant={month.status === "PUBLISHED" ? "success" : "warning"}>
          {month.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-50 px-0 py-0">
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Income</p>
          <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Expenses</p>
          <p className="text-sm font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Savings</p>
          <p className="text-sm font-bold text-blue-600">{formatCurrency(totalSavings)}</p>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Remaining: </span>
          <span className={`text-sm font-bold ${month.remainingBalance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {formatCurrency(month.remainingBalance)}
          </span>
        </div>
        <div className="flex gap-2">
          <Link href={`/months/${month.id}`}>
            <Button variant="ghost" size="sm">View</Button>
          </Link>
          <Link href={`/months/${month.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
