"use client";

import { useState } from "react";
import type { MonthWithDetails } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatMonthYear, formatCurrency } from "@/utils/format";
import { exportMonthsToCsv, downloadCsv } from "@/utils/csvExport";

interface ExportClientProps {
  months: MonthWithDetails[];
}

export default function ExportClient({ months }: ExportClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleAll() {
    if (selected.size === months.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(months.map((m) => m.id)));
    }
  }

  function toggleMonth(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleExport() {
    const toExport = months.filter((m) => selected.has(m.id));
    if (toExport.length === 0) return;
    const csv = exportMonthsToCsv(toExport);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `budget-export-${date}.csv`);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
        <p className="text-gray-500 mt-1">Download your budget data as CSV</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Months</CardTitle>
            <button
              onClick={toggleAll}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              {selected.size === months.length ? "Deselect all" : "Select all"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {months.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No months available to export.</p>
          ) : (
            <div className="space-y-2">
              {months.map((month) => {
                const totalIncome = month.incomes.reduce((s, i) => s + i.amount, 0);
                const isSelected = selected.has(month.id);
                return (
                  <label
                    key={month.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? "border-violet-400 bg-violet-50" : "border-transparent bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMonth(month.id)}
                      className="w-4 h-4 text-violet-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{month.label}</span>
                        <Badge variant={month.status === "PUBLISHED" ? "success" : "warning"}>
                          {month.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{formatMonthYear(month.year, month.month)}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{formatCurrency(totalIncome)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div>
          <p className="font-medium text-gray-900">{selected.size} months selected</p>
          <p className="text-sm text-gray-500">CSV will include income, expense & savings details</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={selected.size === 0}
          size="lg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>
    </div>
  );
}
