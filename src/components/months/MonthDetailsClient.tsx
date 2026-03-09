"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { MonthWithDetails } from "@/types";
import { IncomeTable } from "@/components/months/IncomeTable";
import { BudgetLineItemsTable } from "@/components/months/BudgetLineItemsTable";
import { SavingsTable } from "@/components/months/SavingsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatMonthYear } from "@/utils/format";
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
}

export function MonthDetailsClient({ month }: MonthDetailsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [overrideInput, setOverrideInput] = useState(
    month.remainingBalanceOverride === null || month.remainingBalanceOverride === undefined
      ? ""
      : String(month.remainingBalanceOverride)
  );

  const totalIncome = useMemo(
    () => month.incomes.reduce((sum, item) => sum + item.amount, 0),
    [month.incomes]
  );
  const totalBudgetLineItems = useMemo(
    () => month.budgetLineItems.reduce((sum, item) => sum + item.amount, 0),
    [month.budgetLineItems]
  );
  const totalSavings = useMemo(
    () => month.savings.reduce((sum, item) => sum + item.amount, 0),
    [month.savings]
  );

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
          <form action={addIncome.bind(null, month.id)} className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <Input name="label" placeholder="Source label" required />
            <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
            <Button type="submit" variant="secondary" size="sm" className="self-end">Add Income</Button>
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
            <span className="text-sm font-semibold text-blue-600">{formatCurrency(totalSavings)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SavingsTable savings={month.savings} showActions onDelete={handleDeleteSaving} />
          <form action={addSaving.bind(null, month.id)} className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <Input name="label" placeholder="Label" required />
            <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
            <div className="flex flex-col gap-1">
              <select
                name="category"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="OTHER">OTHER</option>
                <option value="AJO">AJO</option>
              </select>
            </div>
            <Button type="submit" size="sm" className="self-end">Add Saving</Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
        <h3 className="font-semibold text-violet-900 mb-3">Balance Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Income</p>
            <p className="font-bold text-emerald-600 text-lg">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-gray-500">Budget Items</p>
            <p className="font-bold text-red-500 text-lg">{formatCurrency(totalBudgetLineItems)}</p>
          </div>
          <div>
            <p className="text-gray-500">Savings</p>
            <p className="font-bold text-blue-600 text-lg">{formatCurrency(totalSavings)}</p>
          </div>
          <div>
            <p className="text-gray-500">Remaining</p>
            <p className={`font-bold text-lg ${finalRemaining >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {formatCurrency(finalRemaining)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
