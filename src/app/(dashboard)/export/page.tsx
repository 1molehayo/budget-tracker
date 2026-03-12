import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ExportClient from "./ExportClient";

export default async function ExportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const months = await prisma.month.findMany({
    where: { userId: user!.id },
    include: {
      incomes: { include: { tag: true } },
      budgetLineItems: true,
      savings: { include: { tag: true, project: { select: { id: true, title: true, status: true } } } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return <ExportClient months={months} />;
}
