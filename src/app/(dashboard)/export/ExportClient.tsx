"use client";

import { useState } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import type { MonthWithDetails } from "@/types";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/Panel";
import { Button } from "@/foundations/ui/button/button";
import { Checkbox } from "@/foundations/ui/checkbox/checkbox";
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
      return;
    }
    setSelected(new Set(months.map((month) => month.id)));
  }

  function toggleMonth(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  function handleExport() {
    const toExport = months.filter((month) => selected.has(month.id));
    if (toExport.length === 0) return;
    const csv = exportMonthsToCsv(toExport);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `budget-export-${date}.csv`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Export data</h2>
        <p className="mt-1 text-sm text-foreground-secondary">Download your budget data as CSV</p>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Select months</PanelTitle>
          <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
            {selected.size === months.length && months.length > 0 ? "Deselect all" : "Select all"}
          </Button>
        </PanelHeader>
        <PanelContent>
          {months.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground-secondary">No months available to export.</p>
          ) : (
            <ul className="space-y-2">
              {months.map((month) => {
                const totalIncome = month.incomes.reduce((sum, item) => sum + item.amount, 0);
                const isSelected = selected.has(month.id);
                return (
                  <li key={month.id}>
                    <label
                      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                        isSelected ? "border-accent bg-accent/5" : "border-border"
                      }`}
                    >
                      <Checkbox checked={isSelected} onChange={() => toggleMonth(month.id)} aria-label={month.label} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{month.label}</span>
                        <span className="block text-xs text-foreground-secondary">
                          {formatMonthYear(month.year, month.month)}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-success">
                        {formatCurrency(totalIncome)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelContent>
      </Panel>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{selected.size} months selected</p>
          <p className="text-sm text-foreground-secondary">CSV includes income, budget line items, and savings</p>
        </div>
        <Button onClick={handleExport} disabled={selected.size === 0}>
          <DownloadSimpleIcon className="size-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
