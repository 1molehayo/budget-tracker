"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { MonthWithDetails, ProjectSummary, SavingDestinationType, Tag } from "@/types";
import { IncomeTable } from "@/components/months/IncomeTable";
import { BudgetLineItemsTable } from "@/components/months/BudgetLineItemsTable";
import { SavingsTable } from "@/components/months/SavingsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatMonthYear } from "@/utils/format";
import { summarizeSavings } from "@/utils/calculations";
import { getTagDisplayName } from "@/utils/tags";
import {
  updateMonth,
  deleteMonth,
  addIncome,
  deleteIncome,
  addBudgetLineItem,
  deleteBudgetLineItem,
  addSaving,
  deleteSaving,
} from "@/app/actions/months";

const BUDGET_ITEM_CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Family",
  "Miscellaneous",
];

interface MonthDetailsClientProps {
  month: MonthWithDetails;
  incomeTags: Tag[];
  savingsTags: Tag[];
  projects: ProjectSummary[];
}

export function MonthDetailsClient({
  month,
  incomeTags,
  savingsTags,
  projects,
}: MonthDetailsClientProps) {
  const defaultIncomeTagId = incomeTags.find((tag) => tag.code === "OTHER")?.id ?? incomeTags[0]?.id ?? "";
  const defaultSavingsTagId = savingsTags.find((tag) => tag.code === "OTHER")?.id ?? savingsTags[0]?.id ?? "";
  const defaultProjectId = projects[0]?.id ?? "";
  const [isPending, startTransition] = useTransition();
  const [overrideInput, setOverrideInput] = useState(
    month.remainingBalanceOverride === null || month.remainingBalanceOverride === undefined
      ? ""
      : String(month.remainingBalanceOverride)
  );
  const [selectedIncomeTagId, setSelectedIncomeTagId] = useState(defaultIncomeTagId);
  const [savingDestination, setSavingDestination] = useState<SavingDestinationType>("GENERAL");
  const [selectedSavingsTagId, setSelectedSavingsTagId] = useState(defaultSavingsTagId);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId);

  const totalIncome = useMemo(
    () => month.incomes.reduce((sum, item) => sum + item.amount, 0),
    [month.incomes]
  );
  const totalBudgetLineItems = useMemo(
    () => month.budgetLineItems.reduce((sum, item) => sum + item.amount, 0),
    [month.budgetLineItems]
  );
  const savingsSummary = useMemo(() => summarizeSavings(month.savings), [month.savings]);
  const totalSavings = savingsSummary.totalEntered;

  const computedRemaining = totalIncome - totalBudgetLineItems - totalSavings;
  const finalRemaining =
    month.remainingBalanceOverride === null || month.remainingBalanceOverride === undefined
      ? computedRemaining
      : month.remainingBalanceOverride;

  function handleDeleteIncome(id: string) {
    startTransition(() => deleteIncome(id, month.id));
  }

  function handleDeleteBudgetItem(id: string) {
    startTransition(() => deleteBudgetLineItem(id, month.id));
  }

  function handleDeleteSaving(id: string) {
    startTransition(() => deleteSaving(id, month.id));
  }

  const selectedSavingsTag = savingsTags.find((tag) => tag.id === selectedSavingsTagId) ?? null;
  const selectedIncomeTag = incomeTags.find((tag) => tag.id === selectedIncomeTagId) ?? null;
  const canSubmitIncome = incomeTags.length > 0;
  const canSubmitSaving = savingDestination === "GENERAL" ? savingsTags.length > 0 : projects.length > 0;
  const incomeHelperText =
    incomeTags.length === 0
      ? "Income entries require an INCOME tag."
      : selectedIncomeTag?.code === "SALARY"
        ? "Use Salary for recurring pay from employment."
        : selectedIncomeTag?.code === "GIG"
          ? "Use Gig / Freelance for contract, side-job, or client work."
          : selectedIncomeTag?.code === "GIFT"
            ? "Use Gift for one-off money received from family or friends."
            : selectedIncomeTag?.code === "AJO_PAYOUT"
              ? "Use AJO Payout when the income source is an AJO payout."
              : "Use OTHER when the source does not fit a more specific income tag.";
  const savingsHelperText =
    savingDestination === "GENERAL"
      ? savingsTags.length === 0
        ? "General savings require a SAVINGS tag."
        : selectedSavingsTag?.code === "AJO_CONTRIBUTION"
          ? "AJO Contribution is recorded in monthly savings entered, but it does not increase the usable general pool."
          : selectedSavingsTag?.code === "AJO_PAYOUT"
            ? "AJO Payout increases the usable general savings pool."
            : "This entry increases the usable general savings pool."
      : projects.length === 0
        ? "Create a project before adding project-linked savings."
        : "Project-linked savings fund the selected project only and do not increase the usable general pool.";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/months" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Months
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{month.label}</h2>
          <p className="text-gray-500">{formatMonthYear(month.year, month.month)}</p>
        </div>
        <form action={deleteMonth.bind(null, month.id)}>
          <Button type="submit" variant="danger">Delete Month</Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Month Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateMonth} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="hidden" name="id" value={month.id} />
            <Input name="label" label="Label" defaultValue={month.label} required />
            <Input
              name="remainingBalanceOverride"
              label="Remaining Balance Override"
              type="number"
              step="0.01"
              value={overrideInput}
              onChange={(e) => setOverrideInput(e.target.value)}
              helperText={`Computed: ${formatCurrency(computedRemaining)}. Leave empty to use computed value.`}
            />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" loading={isPending}>Save Month</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Income</CardTitle>
            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(totalIncome)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <IncomeTable incomes={month.incomes} showActions onDelete={handleDeleteIncome} />
          <form action={addIncome} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <input type="hidden" name="monthId" value={month.id} />
            <Input name="label" placeholder="Salary, freelance, gift..." required />
            <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600" htmlFor="income-tag-id">
                Income Source Tag
              </label>
              <select
                id="income-tag-id"
                name="tagId"
                value={selectedIncomeTagId}
                onChange={(e) => setSelectedIncomeTagId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              >
                {incomeTags.length === 0 ? (
                  <option value="">No income tags available</option>
                ) : (
                  incomeTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {getTagDisplayName(tag)}
                    </option>
                    ))
                )}
              </select>
              <p className="text-xs text-gray-500">{incomeHelperText}</p>
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="self-end"
              disabled={!canSubmitIncome}
            >
              Add Income
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Line Items</CardTitle>
            <span className="text-sm font-semibold text-red-500">{formatCurrency(totalBudgetLineItems)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BudgetLineItemsTable lineItems={month.budgetLineItems} showActions onDelete={handleDeleteBudgetItem} />
          <form action={addBudgetLineItem.bind(null, month.id)} className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <Input name="label" placeholder="Description" required />
            <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
            <div className="flex flex-col gap-1">
              <select
                name="category"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">No category</option>
                {BUDGET_ITEM_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="danger" size="sm" className="self-end">Add Item</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Savings</CardTitle>
            <div className="text-right">
              <span className="text-sm font-semibold text-blue-600">{formatCurrency(totalSavings)}</span>
              <p className="text-xs text-gray-500">
                Usable pool: {formatCurrency(savingsSummary.usableGeneralPool)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SavingsTable savings={month.savings} showActions onDelete={handleDeleteSaving} />
          <form action={addSaving} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-gray-100">
            <input type="hidden" name="monthId" value={month.id} />
            <Input name="label" placeholder="Label" required />
            <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600" htmlFor="saving-destination-type">
                Destination
              </label>
              <select
                id="saving-destination-type"
                name="destinationType"
                value={savingDestination}
                onChange={(e) => setSavingDestination(e.target.value as SavingDestinationType)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="GENERAL">General Pool</option>
                <option value="PROJECT">Project Funding</option>
              </select>
            </div>
            {savingDestination === "GENERAL" ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600" htmlFor="saving-tag-id">
                  Savings Tag
                </label>
                <select
                  id="saving-tag-id"
                  name="tagId"
                  value={selectedSavingsTagId}
                  onChange={(e) => setSelectedSavingsTagId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                >
                  {savingsTags.length === 0 ? (
                    <option value="">No savings tags available</option>
                  ) : (
                    savingsTags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {getTagDisplayName(tag)}
                      </option>
                    ))
                  )}
                </select>
                <input type="hidden" name="projectId" value="" />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600" htmlFor="saving-project-id">
                  Project
                </label>
                <select
                  id="saving-project-id"
                  name="projectId"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                >
                  {projects.length === 0 ? (
                    <option value="">No projects available</option>
                  ) : (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))
                  )}
                </select>
                <input type="hidden" name="tagId" value="" />
              </div>
            )}
            <div className="flex flex-col justify-end gap-1">
              <Button type="submit" size="sm" disabled={!canSubmitSaving}>Add Saving</Button>
              <p className="text-xs text-gray-500">{savingsHelperText}</p>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
        <h3 className="font-semibold text-violet-900 mb-3">Balance Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Income</p>
            <p className="font-bold text-emerald-600 text-lg">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-gray-500">Budget Items</p>
            <p className="font-bold text-red-500 text-lg">{formatCurrency(totalBudgetLineItems)}</p>
          </div>
          <div>
            <p className="text-gray-500">Savings Entered</p>
            <p className="font-bold text-blue-600 text-lg">{formatCurrency(totalSavings)}</p>
          </div>
          <div>
            <p className="text-gray-500">Usable Pool</p>
            <p className="font-bold text-teal-700 text-lg">
              {formatCurrency(savingsSummary.usableGeneralPool)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Project-linked</p>
            <p className="font-bold text-violet-700 text-lg">
              {formatCurrency(savingsSummary.projectLinkedTotal)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Remaining</p>
            <p className={`font-bold text-lg ${finalRemaining >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {formatCurrency(finalRemaining)}
            </p>
          </div>
        </div>
        {savingsSummary.excludedGeneralTotal > 0 && (
          <p className="mt-3 text-xs text-amber-700">
            AJO Contribution excluded from usable pool: {formatCurrency(savingsSummary.excludedGeneralTotal)}
          </p>
        )}
      </div>
    </div>
  );
}
