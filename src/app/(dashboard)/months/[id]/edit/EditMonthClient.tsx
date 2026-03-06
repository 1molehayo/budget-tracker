"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MonthWithDetails } from "@/types";
import { IncomeTable } from "@/components/months/IncomeTable";
import { ExpenseTable } from "@/components/months/ExpenseTable";
import { SavingsTable } from "@/components/months/SavingsTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatMonthYear } from "@/utils/format";
import {
  updateMonth,
  addIncome, deleteIncome,
  addExpense, deleteExpense,
  addSaving, deleteSaving,
} from "@/app/actions/months";

const EXPENSE_CATEGORIES = [
  "Housing", "Food", "Transport", "Utilities", "Healthcare",
  "Entertainment", "Clothing", "Education", "Personal Care", "Miscellaneous",
];

interface EditMonthClientProps {
  month: MonthWithDetails;
}

export default function EditMonthClient({ month }: EditMonthClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalIncome = month.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = month.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = month.savings.reduce((s, sv) => s + sv.amount, 0);
  const computed = totalIncome - totalExpenses - totalSavings;

  async function handleSaveMonth(formData: FormData) {
    startTransition(async () => {
      await updateMonth(month.id, formData);
      router.push(`/months/${month.id}`);
    });
  }

  async function handleDeleteIncome(id: string) {
    startTransition(() => deleteIncome(id, month.id));
  }
  async function handleDeleteExpense(id: string) {
    startTransition(() => deleteExpense(id, month.id));
  }
  async function handleDeleteSaving(id: string) {
    startTransition(() => deleteSaving(id, month.id));
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/months/${month.id}`} className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <Badge variant={month.status === "PUBLISHED" ? "success" : "warning"}>{month.status}</Badge>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Edit: {month.label}</h2>

      {/* Month metadata */}
      <Card>
        <CardHeader><CardTitle>Month Details</CardTitle></CardHeader>
        <CardContent>
          <form action={handleSaveMonth} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="label" label="Label" defaultValue={month.label} required />
            <Input
              name="remainingBalance"
              label="Remaining Balance (override)"
              type="number"
              step="0.01"
              defaultValue={String(month.remainingBalance)}
              helperText={`Auto-computed: ${formatCurrency(computed)}`}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                defaultValue={month.status}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" loading={isPending}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Income */}
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

      {/* Expenses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expenses</CardTitle>
            <span className="text-sm font-semibold text-red-500">{formatCurrency(totalExpenses)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExpenseTable expenses={month.expenses} showActions onDelete={handleDeleteExpense} />
          <form action={addExpense.bind(null, month.id)} className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <Input name="label" placeholder="Description" required />
            <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
            <div className="flex flex-col gap-1">
              <select
                name="category"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">No category</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Button type="submit" variant="danger" size="sm" className="self-end">Add Expense</Button>
          </form>
        </CardContent>
      </Card>

      {/* Savings */}
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

      {/* Balance Summary */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
        <h3 className="font-semibold text-violet-900 mb-3">Balance Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Income</p>
            <p className="font-bold text-emerald-600 text-lg">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-gray-500">Expenses</p>
            <p className="font-bold text-red-500 text-lg">{formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-gray-500">Savings</p>
            <p className="font-bold text-blue-600 text-lg">{formatCurrency(totalSavings)}</p>
          </div>
          <div>
            <p className="text-gray-500">Remaining</p>
            <p className={`font-bold text-lg ${computed >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {formatCurrency(computed)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
