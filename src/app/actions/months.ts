"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createMonth(formData: FormData) {
  const user = await getUser();

  const label = formData.get("label") as string;
  const year = parseInt(formData.get("year") as string);
  const month = parseInt(formData.get("month") as string);
  const status = (formData.get("status") as string) || "DRAFT";

  if (!label || !year || !month) {
    throw new Error("Missing required fields");
  }

  const newMonth = await prisma.month.create({
    data: {
      userId: user.id,
      label,
      year,
      month,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      remainingBalance: 0,
    },
  });

  revalidatePath("/months");
  revalidatePath("/dashboard");
  redirect(`/months/${newMonth.id}/edit`);
}

export async function createMonthFromOcr(data: {
  label: string;
  year: number;
  month: number;
  incomes: Array<{ label: string; amount: number }>;
  expenses: Array<{ label: string; amount: number; category?: string }>;
  savings: Array<{ label: string; amount: number; category: "AJO" | "OTHER" }>;
}) {
  const user = await getUser();

  const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = data.savings.reduce((s, sv) => s + sv.amount, 0);
  const remaining = totalIncome - totalExpenses - totalSavings;

  const newMonth = await prisma.month.create({
    data: {
      userId: user.id,
      label: data.label,
      year: data.year,
      month: data.month,
      status: "DRAFT",
      remainingBalance: remaining,
      incomes: { create: data.incomes },
      expenses: { create: data.expenses },
      savings: { create: data.savings },
    },
  });

  revalidatePath("/months");
  revalidatePath("/dashboard");
  return newMonth.id;
}

export async function updateMonth(id: string, formData: FormData) {
  await getUser();

  const label = formData.get("label") as string;
  const remainingBalance = parseFloat(formData.get("remainingBalance") as string);
  const status = formData.get("status") as string;

  await prisma.month.update({
    where: { id },
    data: {
      label,
      remainingBalance: isNaN(remainingBalance) ? 0 : remainingBalance,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    },
  });

  revalidatePath(`/months/${id}`);
  revalidatePath("/months");
  revalidatePath("/dashboard");
}

export async function publishMonth(id: string) {
  await getUser();

  const month = await prisma.month.findUnique({
    where: { id },
    include: { incomes: true, expenses: true, savings: true },
  });

  if (!month) throw new Error("Month not found");

  const totalIncome = month.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = month.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = month.savings.reduce((s, sv) => s + sv.amount, 0);
  const remaining = totalIncome - totalExpenses - totalSavings;

  await prisma.month.update({
    where: { id },
    data: { status: "PUBLISHED", remainingBalance: remaining },
  });

  revalidatePath(`/months/${id}`);
  revalidatePath("/months");
  revalidatePath("/dashboard");
}

export async function deleteMonth(id: string) {
  await getUser();
  await prisma.month.delete({ where: { id } });
  revalidatePath("/months");
  revalidatePath("/dashboard");
  redirect("/months");
}

export async function addIncome(monthId: string, formData: FormData) {
  await getUser();

  const label = formData.get("label") as string;
  const amount = parseFloat(formData.get("amount") as string);

  if (!label || isNaN(amount)) throw new Error("Invalid income data");

  await prisma.income.create({ data: { monthId, label, amount } });
  await recalcRemaining(monthId);
  revalidatePath(`/months/${monthId}`);
  revalidatePath(`/months/${monthId}/edit`);
}

export async function deleteIncome(id: string, monthId: string) {
  await getUser();
  await prisma.income.delete({ where: { id } });
  await recalcRemaining(monthId);
  revalidatePath(`/months/${monthId}`);
  revalidatePath(`/months/${monthId}/edit`);
}

export async function addExpense(monthId: string, formData: FormData) {
  await getUser();

  const label = formData.get("label") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || null;

  if (!label || isNaN(amount)) throw new Error("Invalid expense data");

  await prisma.expense.create({ data: { monthId, label, amount, category } });
  await recalcRemaining(monthId);
  revalidatePath(`/months/${monthId}`);
  revalidatePath(`/months/${monthId}/edit`);
}

export async function deleteExpense(id: string, monthId: string) {
  await getUser();
  await prisma.expense.delete({ where: { id } });
  await recalcRemaining(monthId);
  revalidatePath(`/months/${monthId}`);
  revalidatePath(`/months/${monthId}/edit`);
}

export async function addSaving(monthId: string, formData: FormData) {
  await getUser();

  const label = formData.get("label") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) as "AJO" | "OTHER";

  if (!label || isNaN(amount)) throw new Error("Invalid saving data");

  await prisma.saving.create({
    data: { monthId, label, amount, category: category === "AJO" ? "AJO" : "OTHER" },
  });
  await recalcRemaining(monthId);
  revalidatePath(`/months/${monthId}`);
  revalidatePath(`/months/${monthId}/edit`);
}

export async function deleteSaving(id: string, monthId: string) {
  await getUser();
  await prisma.saving.delete({ where: { id } });
  await recalcRemaining(monthId);
  revalidatePath(`/months/${monthId}`);
  revalidatePath(`/months/${monthId}/edit`);
}

async function recalcRemaining(monthId: string) {
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: { incomes: true, expenses: true, savings: true },
  });
  if (!month) return;

  const totalIncome = month.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = month.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = month.savings.reduce((s, sv) => s + sv.amount, 0);
  const remaining = totalIncome - totalExpenses - totalSavings;

  await prisma.month.update({
    where: { id: monthId },
    data: { remainingBalance: remaining },
  });
}
