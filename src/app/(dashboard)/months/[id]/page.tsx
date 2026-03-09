import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
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

  const month = await prisma.month.findFirst({
    where: { id, userId: user.id },
    include: { incomes: true, budgetLineItems: true, savings: true },
  });

  if (!month) {
    notFound();
  }

  return <MonthDetailsClient month={month} />;
}
