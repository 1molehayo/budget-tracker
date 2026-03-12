"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TagCategory } from "@/types";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ensureSystemTags } from "@/lib/tags";

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

async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }
}

async function assertTagOwnership(tagId: string, userId: string, category: TagCategory) {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId, category },
    select: { id: true },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }
}

function revalidateBudgetViews(monthId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/months");
  revalidatePath("/insights");
  revalidatePath("/export");
  revalidatePath("/projects");
  if (monthId) {
    revalidatePath(`/months/${monthId}`);
  }
}

function isFutureMonth(year: number, month: number) {
  const now = new Date();
  const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
  const selectedMonthIndex = year * 12 + (month - 1);

  return selectedMonthIndex > currentMonthIndex;
}

export async function createMonth(formData: FormData) {
  const user = await getUser();

  const label = (formData.get("label") as string)?.trim();
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  if (!label || !Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid month data");
  }

  if (isFutureMonth(year, month)) {
    throw new Error("Months can only be created for the current month or earlier");
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

export async function addIncome(formData: FormData) {
  const user = await getUser();
  const monthId = ((formData.get("monthId") as string) || "").trim();

  if (!monthId) {
    throw new Error("Income entries require a target month");
  }

  await assertMonthOwnership(monthId, user.id);
  await ensureSystemTags(user.id);

  const label = (formData.get("label") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const tagId = ((formData.get("tagId") as string) || "").trim();

  if (!label || Number.isNaN(amount) || amount < 0) {
    throw new Error("Invalid income data");
  }

  if (!tagId) {
    throw new Error("Income entries require an INCOME tag");
  }

  const incomeTag = await prisma.tag.findFirst({
    where: { id: tagId, userId: user.id },
    select: { id: true, category: true },
  });

  if (!incomeTag) {
    throw new Error("Income tag not found");
  }

  if (incomeTag.category !== "INCOME") {
    throw new Error("Income entries require an INCOME tag");
  }

  await prisma.income.create({
    data: {
      monthId,
      label,
      amount,
      tagId,
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

export async function addSaving(formData: FormData) {
  const user = await getUser();
  const monthId = ((formData.get("monthId") as string) || "").trim();

  if (!monthId) {
    throw new Error("Savings entries require a target month");
  }

  await assertMonthOwnership(monthId, user.id);
  await ensureSystemTags(user.id);

  const label = (formData.get("label") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const destinationType = formData.get("destinationType") as string;
  const tagId = ((formData.get("tagId") as string) || "").trim() || null;
  const projectId = ((formData.get("projectId") as string) || "").trim() || null;

  if (!label || Number.isNaN(amount) || amount < 0) {
    throw new Error("Invalid saving data");
  }

  if (destinationType === "GENERAL") {
    if (!tagId || projectId) {
      throw new Error("General savings require a savings tag and cannot target a project");
    }

    await assertTagOwnership(tagId, user.id, "SAVINGS");

    await prisma.saving.create({
      data: {
        monthId,
        label,
        amount,
        destinationType: "GENERAL",
        tagId,
        projectId: null,
      },
    });
  } else if (destinationType === "PROJECT") {
    if (!projectId || tagId) {
      throw new Error("Project-linked savings require a project and cannot use a tag");
    }

    await assertProjectOwnership(projectId, user.id);

    await prisma.saving.create({
      data: {
        monthId,
        label,
        amount,
        destinationType: "PROJECT",
        tagId: null,
        projectId,
      },
    });
  } else {
    throw new Error("Invalid saving destination");
  }

  revalidateBudgetViews(monthId);
}

export async function deleteSaving(id: string, monthId: string) {
  const user = await getUser();
  await assertMonthOwnership(monthId, user.id);

  await prisma.saving.delete({ where: { id } });
  revalidateBudgetViews(monthId);
}
