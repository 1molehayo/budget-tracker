"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { MonthWithDetails, ProjectSummary, SavingDestinationType, Tag } from "@/types";
import { IncomeTable } from "@/components/months/IncomeTable";
import { BudgetLineItemsTable } from "@/components/months/BudgetLineItemsTable";
import { SavingsTable } from "@/components/months/SavingsTable";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/Panel";
import { Button } from "@/foundations/ui/button/button";
import { Field } from "@/foundations/ui/field/field";
import { Input } from "@/foundations/ui/input/input";
import { Select } from "@/foundations/ui/select/select";
import { formatCurrency, formatMonthYear } from "@/utils/format";
import { readActionError } from "@/lib/read-action-error";
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

function MoneyField({ name, label }: { name: string; label: string }) {
  return (
    <Field>
      <Field.Label>{label}</Field.Label>
      <Field.Control>
        <Input name={name} type="number" inputMode="decimal" min="0" step="0.01" required />
      </Field.Control>
    </Field>
  );
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
  const [incomeError, setIncomeError] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [savingError, setSavingError] = useState("");
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

  function submitIncome(formData: FormData) {
    setIncomeError("");
    startTransition(async () => {
      const error = readActionError(await addIncome(formData));
      if (error) setIncomeError(error);
    });
  }

  function submitBudgetItem(formData: FormData) {
    setBudgetError("");
    startTransition(async () => {
      const error = readActionError(await addBudgetLineItem(month.id, formData));
      if (error) setBudgetError(error);
    });
  }

  function submitSaving(formData: FormData) {
    setSavingError("");
    startTransition(async () => {
      const error = readActionError(await addSaving(formData));
      if (error) setSavingError(error);
    });
  }

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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/months" className="text-sm text-foreground-secondary">
            Months
          </Link>
          <h2 className="mt-1 truncate text-2xl font-semibold">{month.label}</h2>
          <p className="text-sm text-foreground-secondary">{formatMonthYear(month.year, month.month)}</p>
        </div>
        <form action={deleteMonth.bind(null, month.id)}>
          <Button type="submit" variant="destructive">
            Delete month
          </Button>
        </form>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Month details</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <form action={updateMonth} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <input type="hidden" name="id" value={month.id} />
            <Field>
              <Field.Label>Label</Field.Label>
              <Field.Control>
                <Input name="label" defaultValue={month.label} required />
              </Field.Control>
            </Field>
            <Field>
              <Field.Label>Remaining balance override</Field.Label>
              <Field.Control>
                <Input
                  name="remainingBalanceOverride"
                  type="number"
                  step="0.01"
                  value={overrideInput}
                  onChange={(e) => setOverrideInput(e.target.value)}
                />
              </Field.Control>
              <Field.Description>
                Computed {formatCurrency(computedRemaining)}. Leave empty to use the computed value.
              </Field.Description>
            </Field>
            <div className="lg:col-span-2 lg:flex lg:justify-end">
              <Button type="submit" isLoading={isPending}>
                Save month
              </Button>
            </div>
          </form>
        </PanelContent>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Income</PanelTitle>
          <span className="text-sm font-semibold tabular-nums text-success">{formatCurrency(totalIncome)}</span>
        </PanelHeader>
        <PanelContent className="space-y-4">
          <IncomeTable incomes={month.incomes} showActions onDelete={handleDeleteIncome} />
          <form
            key={`income-${month.incomes.length}`}
            action={submitIncome}
            className="grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <input type="hidden" name="monthId" value={month.id} />
            <Field>
              <Field.Label>Entry</Field.Label>
              <Field.Control>
                <Input name="label" placeholder="Salary, freelance, gift" required />
              </Field.Control>
            </Field>
            <MoneyField name="amount" label="Amount" />
            <Field>
              <Field.Label>Income source</Field.Label>
              <Field.Control>
                <Select
                  name="tagId"
                  value={selectedIncomeTagId}
                  onChange={(e) => setSelectedIncomeTagId(e.target.value)}
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
                </Select>
              </Field.Control>
              <Field.Description>{incomeHelperText}</Field.Description>
              {incomeError ? <Field.Error>{incomeError}</Field.Error> : null}
            </Field>
            <div className="md:self-end">
              <Button type="submit" variant="outline" disabled={!canSubmitIncome} className="w-full">
                Add income
              </Button>
            </div>
          </form>
        </PanelContent>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Budget line items</PanelTitle>
          <span className="text-sm font-semibold tabular-nums text-error">{formatCurrency(totalBudgetLineItems)}</span>
        </PanelHeader>
        <PanelContent className="space-y-4">
          <BudgetLineItemsTable lineItems={month.budgetLineItems} showActions onDelete={handleDeleteBudgetItem} />
          <form
            key={`items-${month.budgetLineItems.length}`}
            action={submitBudgetItem}
            className="grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <Field>
              <Field.Label>Description</Field.Label>
              <Field.Control>
                <Input name="label" placeholder="Description" required />
              </Field.Control>
            </Field>
            <MoneyField name="amount" label="Amount" />
            <Field>
              <Field.Label>Category</Field.Label>
              <Field.Control>
                <Select name="category" defaultValue="">
                  <option value="">No category</option>
                  {BUDGET_ITEM_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field.Control>
            </Field>
            <div className="md:self-end">
              <Button type="submit" variant="outline" className="w-full">
                Add item
              </Button>
              {budgetError ? <p className="mt-2 text-sm text-error" role="alert">{budgetError}</p> : null}
            </div>
          </form>
        </PanelContent>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Savings</PanelTitle>
          <div className="text-right">
            <span className="text-sm font-semibold tabular-nums">{formatCurrency(totalSavings)}</span>
            <p className="text-xs text-foreground-secondary">
              Usable pool {formatCurrency(savingsSummary.usableGeneralPool)}
            </p>
          </div>
        </PanelHeader>
        <PanelContent className="space-y-4">
          <SavingsTable savings={month.savings} showActions onDelete={handleDeleteSaving} />
          <form
            key={`savings-${month.savings.length}`}
            action={submitSaving}
            className="grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <input type="hidden" name="monthId" value={month.id} />
            <Field>
              <Field.Label>Label</Field.Label>
              <Field.Control>
                <Input name="label" placeholder="Label" required />
              </Field.Control>
            </Field>
            <MoneyField name="amount" label="Amount" />
            <Field>
              <Field.Label>Destination</Field.Label>
              <Field.Control>
                <Select
                  name="destinationType"
                  value={savingDestination}
                  onChange={(e) => setSavingDestination(e.target.value as SavingDestinationType)}
                >
                  <option value="GENERAL">General pool</option>
                  <option value="PROJECT">Project funding</option>
                </Select>
              </Field.Control>
            </Field>
            {savingDestination === "GENERAL" ? (
              <Field>
                <Field.Label>Savings tag</Field.Label>
                <Field.Control>
                  <Select
                    name="tagId"
                    value={selectedSavingsTagId}
                    onChange={(e) => setSelectedSavingsTagId(e.target.value)}
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
                  </Select>
                </Field.Control>
                <input type="hidden" name="projectId" value="" />
              </Field>
            ) : (
              <Field>
                <Field.Label>Project</Field.Label>
                <Field.Control>
                  <Select
                    name="projectId"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
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
                  </Select>
                </Field.Control>
                <input type="hidden" name="tagId" value="" />
              </Field>
            )}
            <div className="flex flex-col justify-end gap-2">
              <Button type="submit" disabled={!canSubmitSaving}>
                Add saving
              </Button>
              <p className="text-xs text-foreground-secondary">{savingsHelperText}</p>
              {savingError ? <p className="text-sm text-error" role="alert">{savingError}</p> : null}
            </div>
          </form>
        </PanelContent>
      </Panel>

      <section className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 font-semibold">Balance summary</h3>
        <dl className="grid grid-cols-1 gap-4 text-sm min-[420px]:grid-cols-2 xl:grid-cols-3">
          <div>
            <dt className="text-foreground-secondary">Income</dt>
            <dd className="text-lg font-semibold tabular-nums text-success">{formatCurrency(totalIncome)}</dd>
          </div>
          <div>
            <dt className="text-foreground-secondary">Budget items</dt>
            <dd className="text-lg font-semibold tabular-nums text-error">{formatCurrency(totalBudgetLineItems)}</dd>
          </div>
          <div>
            <dt className="text-foreground-secondary">Savings entered</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatCurrency(totalSavings)}</dd>
          </div>
          <div>
            <dt className="text-foreground-secondary">Usable pool</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatCurrency(savingsSummary.usableGeneralPool)}</dd>
          </div>
          <div>
            <dt className="text-foreground-secondary">Project-linked</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatCurrency(savingsSummary.projectLinkedTotal)}</dd>
          </div>
          <div>
            <dt className="text-foreground-secondary">Remaining</dt>
            <dd className={`text-lg font-semibold tabular-nums ${finalRemaining >= 0 ? "text-success" : "text-error"}`}>
              {formatCurrency(finalRemaining)}
            </dd>
          </div>
        </dl>
        {savingsSummary.excludedGeneralTotal > 0 ? (
          <p className="mt-3 text-xs text-warning">
            AJO contribution excluded from the usable pool: {formatCurrency(savingsSummary.excludedGeneralTotal)}
          </p>
        ) : null}
      </section>
    </div>
  );
}
