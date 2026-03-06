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

export async function createProject(formData: FormData) {
  const user = await getUser();

  const title = formData.get("title") as string;
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const savedAmount = parseFloat(formData.get("savedAmount") as string) || 0;
  const notes = (formData.get("notes") as string) || null;

  if (!title || isNaN(targetAmount)) throw new Error("Invalid project data");

  await prisma.project.create({
    data: {
      userId: user.id,
      title,
      targetAmount,
      savedAmount,
      notes,
      status: "PLANNED",
    },
  });

  revalidatePath("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  await getUser();

  const title = formData.get("title") as string;
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const savedAmount = parseFloat(formData.get("savedAmount") as string) || 0;
  const notes = (formData.get("notes") as string) || null;
  const status = (formData.get("status") as string) === "COMPLETED" ? "COMPLETED" : "PLANNED";

  await prisma.project.update({
    where: { id },
    data: { title, targetAmount, savedAmount, notes, status },
  });

  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await getUser();
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
}
