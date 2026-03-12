"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/types";
import { deriveProjectLifecycleStatus, isProjectFundingTargetMet } from "@/utils/calculations";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function assertProjectOwnership(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      savings: {
        where: { destinationType: "PROJECT" },
        select: { amount: true, destinationType: true },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function createProject(formData: FormData) {
  const user = await getUser();

  const title = (formData.get("title") as string)?.trim();
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Invalid project data");
  }

  await prisma.project.create({
    data: {
      userId: user.id,
      title,
      targetAmount,
      notes,
      status: "PENDING",
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function updateProject(id: string, formData: FormData) {
  const user = await getUser();
  const project = await assertProjectOwnership(id, user.id);

  const title = (formData.get("title") as string)?.trim();
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const notes = ((formData.get("notes") as string) || "").trim() || null;
  const rawStatus = ((formData.get("status") as string) || "AUTO").trim();

  if (!title || !Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Invalid project data");
  }

  const fundedAmount = project.savings.reduce((sum, saving) => sum + saving.amount, 0);
  const targetMet = isProjectFundingTargetMet(targetAmount, fundedAmount);

  let status: ProjectStatus;
  if (rawStatus === "PAUSED") {
    status = "PAUSED";
  } else if (rawStatus === "COMPLETED") {
    if (!targetMet) {
      throw new Error("Projects can only be marked COMPLETED after funding reaches the target");
    }
    status = "COMPLETED";
  } else if (rawStatus === "AUTO") {
    status = deriveProjectLifecycleStatus("PENDING", targetAmount, fundedAmount);
  } else {
    throw new Error("Invalid project status transition");
  }

  await prisma.project.update({
    where: { id },
    data: { title, targetAmount, notes, status },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/insights");
}

export async function deleteProject(id: string) {
  const user = await getUser();
  await assertProjectOwnership(id, user.id);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/insights");
}
