import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ensureSystemTags } from "@/lib/tags";
import { MonthDetailsClient } from "@/components/months/MonthDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MonthDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  await ensureSystemTags(user.id);

  const [month, tags, projects] = await Promise.all([
    prisma.month.findFirst({
      where: { id, userId: user.id },
      include: {
        incomes: { include: { tag: true } },
        budgetLineItems: true,
        savings: { include: { tag: true, project: { select: { id: true, title: true, status: true } } } },
      },
    }),
    prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: [{ category: "asc" }, { code: "asc" }],
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!month) {
    notFound();
  }

  return (
    <MonthDetailsClient
      month={month}
      incomeTags={tags.filter((tag) => tag.category === "INCOME")}
      savingsTags={tags.filter((tag) => tag.category === "SAVINGS")}
      projects={projects}
    />
  );
}
