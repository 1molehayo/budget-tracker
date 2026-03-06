import type { Saving } from "@/types";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";

interface SavingsTableProps {
  savings: Saving[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function SavingsTable({ savings, showActions, onDelete }: SavingsTableProps) {
  const total = savings.reduce((sum, s) => sum + s.amount, 0);
  const ajoTotal = savings.filter((s) => s.category === "AJO").reduce((sum, s) => sum + s.amount, 0);
  const otherTotal = savings.filter((s) => s.category === "OTHER").reduce((sum, s) => sum + s.amount, 0);

  if (savings.length === 0) {
    return <p className="text-sm text-gray-400 italic py-4 text-center">No savings entries yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Label</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
            {showActions && <th className="w-12" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {savings.map((saving) => (
            <tr key={saving.id} className="hover:bg-gray-50/50">
              <td className="py-2.5 px-3 font-medium text-gray-900">{saving.label}</td>
              <td className="py-2.5 px-3">
                <Badge variant={saving.category === "AJO" ? "purple" : "teal"}>
                  {saving.category}
                </Badge>
              </td>
              <td className="py-2.5 px-3 text-right font-semibold text-blue-600">
                {formatCurrency(saving.amount)}
              </td>
              {showActions && onDelete && (
                <td className="py-2.5 px-3">
                  <button
                    onClick={() => onDelete(saving.id)}
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
            <td className="py-2.5 px-3 font-semibold text-gray-700" colSpan={2}>
              <span className="mr-4">Total</span>
              <span className="text-xs text-gray-400">AJO: {formatCurrency(ajoTotal)} | Other: {formatCurrency(otherTotal)}</span>
            </td>
            <td className="py-2.5 px-3 text-right font-bold text-blue-700 text-base">
              {formatCurrency(total)}
            </td>
            {showActions && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
