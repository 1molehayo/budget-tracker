"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/format";
import { runMockOcr } from "@/utils/mockOcr";
import { createMonthFromOcr } from "@/app/actions/months";
import type { MockOcrResult } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function NewMonthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [ocrResult, setOcrResult] = useState<MockOcrResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const [label, setLabel] = useState("");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  }

  function handleRunOcr() {
    const result = runMockOcr(fileName || undefined);
    setOcrResult(result);
    setLabel(result.label);
    setStep("review");
  }

  function handleSkip() {
    const result = runMockOcr();
    setOcrResult(result);
    setLabel(result.label);
    setStep("review");
  }

  function handlePublish() {
    if (!ocrResult) return;
    startTransition(async () => {
      const id = await createMonthFromOcr({
        label,
        year,
        month,
        incomes: ocrResult.incomes,
        expenses: ocrResult.expenses,
        savings: ocrResult.savings,
      });
      router.push(`/months/${id}/edit`);
    });
  }

  if (step === "upload") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Month</h2>
          <p className="text-gray-500 mt-1">Upload a budget photo or skip to enter data manually.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Upload Budget Photo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-violet-300 transition-colors">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 mb-3">Upload a photo of your budget document</p>
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium hover:bg-violet-200 transition-colors">
                  Choose File
                </span>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
              </label>
              {fileName && (
                <p className="mt-2 text-sm text-emerald-600 font-medium">✓ {fileName}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRunOcr}
                className="flex-1"
                disabled={!fileName}
              >
                Extract with OCR (Mock)
              </Button>
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip & Use Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ocrResult) return null;

  const totalIncome = ocrResult.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = ocrResult.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = ocrResult.savings.reduce((s, sv) => s + sv.amount, 0);
  const remaining = totalIncome - totalExpenses - totalSavings;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => setStep("upload")} className="text-gray-400 hover:text-gray-600 text-sm mb-2">← Back</button>
        <h2 className="text-2xl font-bold text-gray-900">Review Extracted Data</h2>
        <p className="text-gray-500 mt-1">Review and adjust the OCR-extracted entries before saving.</p>
      </div>

      {/* Meta */}
      <Card>
        <CardHeader><CardTitle>Month Info</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-gray-700">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-emerald-700">Income ({ocrResult.incomes.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ocrResult.incomes.map((inc, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{inc.label}</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(inc.amount)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span className="text-emerald-700">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-blue-700">Savings ({ocrResult.savings.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ocrResult.savings.map((sav, i) => (
                <div key={i} className="flex justify-between text-sm items-center">
                  <span className="text-gray-700">{sav.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={sav.category === "AJO" ? "purple" : "teal"} className="text-xs">{sav.category}</Badge>
                    <span className="font-medium text-blue-600">{formatCurrency(sav.amount)}</span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span className="text-blue-700">{formatCurrency(totalSavings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-red-600">Expenses ({ocrResult.expenses.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-50">
            {ocrResult.expenses.map((exp, i) => (
              <div key={i} className="flex justify-between py-1.5 text-sm items-center">
                <span className="text-gray-700">{exp.label}</span>
                <div className="flex items-center gap-2">
                  {exp.category && (
                    <span className="text-xs bg-orange-50 text-orange-700 rounded-full px-2 py-0.5">{exp.category}</span>
                  )}
                  <span className="font-medium text-red-500">{formatCurrency(exp.amount)}</span>
                </div>
              </div>
            ))}
            <div className="pt-2 flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Remaining Balance</p>
          <p className={`text-2xl font-bold ${remaining >= 0 ? "text-emerald-700" : "text-red-600"}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
        <Button onClick={handlePublish} loading={isPending} size="lg">
          Create Draft Month
        </Button>
      </div>
    </div>
  );
}
