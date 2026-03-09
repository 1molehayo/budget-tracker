"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function assertMonthOwnership(monthId: string, userId: string) {
  const month = await prisma.month.findFirst({
    where: { id: monthId, userId },
    select: { id: true },
  });

  if (!month) {
    throw new Error("Month not found");
  }
}

function revalidateBudgetViews(monthId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/months");
  revalidatePath("/insights");
  revalidatePath("/export");
  if (monthId) {
    revalidatePath(`/months/${monthId}`);
  }
}

export async function createMonth(formData: FormData) {
  const user = await getUser();

  const label = (formData.get("label") as string)?.trim();
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  if (!label || !Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid month data");
  }

  const newMonth = await prisma.month.create({
    data: {
      userId: user.id,
      label,
      year,
      month,
    },
  });

  revalidateBudgetViews(newMonth.id);
  redirect(`/months/${newMonth.id}`);
}

export async function updateMonth(formData: FormData) {
  const user = await getUser();

  const id = formData.get("id") as string;
  const label = (formData.get("label") as string)?.trim();
  const remainingBalanceInput = formData.get("remainingBalanceOverride") as string;

  if (!id || !label) {
    throw new Error("Invalid month update data");
  }

  await assertMonthOwnership(id, user.id);

  const remainingBalanceOverride =
    remainingBalanceInput?.trim().length > 0 ? Number(remainingBalanceInput) : null;

  await prisma.month.update({
    where: { id },
    data: {
      label,
      remainingBalanceOverride:
        remainingBalanceOverride === null || Number.isNaN(remainingBalanceOverride)
          ? null
          : remainingBalanceOverride,
    },
  });

  revalidateBudgetViews(id);
}

export async function deleteMonth(id: string) {
  const user = await getUser();
  await assertMonthOwnership(id, user.id);
  await prisma.month.delete({ where: { id } });
  revalidateBudgetViews();
  redirect("/months");
}

export async function addIncome(monthId: string, formData: FormData) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  const label = (formData.get("label") as string)?.trim();
  const amount = Number(formData.get("amount"));

  if (!label || Number.isNaN(amount)) {
    throw new Error("Invalid income data");
  }

  await prisma.income.create({
    data: {
      monthId,
      label,
      amount,
    },
  });

  revalidateBudgetViews(monthId);
}

export async function deleteIncome(id: string, monthId: string) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  await prisma.income.delete({ where: { id } });
  revalidateBudgetViews(monthId);
}

export async function addBudgetLineItem(monthId: string, formData: FormData) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  const label = (formData.get("label") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const category = ((formData.get("category") as string) || null)?.trim() || null;

  if (!label || Number.isNaN(amount)) {
    throw new Error("Invalid budget line item data");
  }

  await prisma.budgetLineItem.create({
    data: {
      monthId,
      label,
      amount,
      category,
    },
  });

  revalidateBudgetViews(monthId);
}

export async function deleteBudgetLineItem(id: string, monthId: string) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  await prisma.budgetLineItem.delete({ where: { id } });
  revalidateBudgetViews(monthId);
}

export async function addSaving(monthId: string, formData: FormData) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  const label = (formData.get("label") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const category = (formData.get("category") as string) === "AJO" ? "AJO" : "OTHER";

  if (!label || Number.isNaN(amount)) {
    throw new Error("Invalid saving data");
  }

  await prisma.saving.create({
    data: {
      monthId,
      label,
      amount,
      category,
    },
  });

  revalidateBudgetViews(monthId);
}

export async function deleteSaving(id: string, monthId: string) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  await prisma.saving.delete({ where: { id } });
  revalidateBudgetViews(monthId);
}
