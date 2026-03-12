"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function assertProjectOwnership(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }
}

export async function createProject(formData: FormData) {
  const user = await getUser();

  const title = (formData.get("title") as string)?.trim();
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (!title || isNaN(targetAmount)) throw new Error("Invalid project data");

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
}

export async function updateProject(id: string, formData: FormData) {
  const user = await getUser();
  await assertProjectOwnership(id, user.id);

  const title = (formData.get("title") as string)?.trim();
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const notes = ((formData.get("notes") as string) || "").trim() || null;
  const rawStatus = formData.get("status") as string;
  const allowedStatuses = new Set(["PENDING", "IN_PROGRESS", "PAUSED", "READY", "COMPLETED"]);
  const status = allowedStatuses.has(rawStatus) ? rawStatus : "PENDING";

  await prisma.project.update({
    where: { id },
    data: { title, targetAmount, notes, status },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const user = await getUser();
  await assertProjectOwnership(id, user.id);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
