import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import EditMonthClient from "./EditMonthClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMonthPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const month = await prisma.month.findFirst({
    where: { id, userId: user!.id },
    include: { incomes: true, expenses: true, savings: true },
  });

  if (!month) notFound();

  return <EditMonthClient month={month} />;
}
