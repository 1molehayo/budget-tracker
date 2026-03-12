import type { Income } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/format";
import { getTagDisplayName } from "@/utils/tags";

interface IncomeTableProps {
  incomes: Income[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function IncomeTable({ incomes, showActions, onDelete }: IncomeTableProps) {
  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  if (incomes.length === 0) {
    return <p className="text-sm text-gray-400 italic py-4 text-center">No income entries yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Entry
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Income Source
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
            {showActions && <th className="w-12" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {incomes.map((income) => (
            <tr key={income.id} className="hover:bg-gray-50/50">
              <td className="py-2.5 px-3">
                <div className="font-medium text-gray-900">{income.label}</div>
                <p className="text-xs text-gray-500">Tagged income source entry</p>
              </td>
              <td className="py-2.5 px-3 text-gray-500">
                <Badge variant="success">{getTagDisplayName(income.tag)}</Badge>
              </td>
              <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                {formatCurrency(income.amount)}
              </td>
              {showActions && onDelete && (
                <td className="py-2.5 px-3">
                  <button
                    onClick={() => onDelete(income.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-100">
            <td className="py-2.5 px-3 font-semibold text-gray-700" colSpan={2}>Total</td>
            <td className="py-2.5 px-3 text-right font-bold text-emerald-700 text-base">
              {formatCurrency(total)}
            </td>
            {showActions && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
