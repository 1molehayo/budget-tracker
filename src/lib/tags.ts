import type { TagCategory } from "@/types";
import { prisma } from "@/lib/prisma";

const SYSTEM_TAGS: Array<{ category: TagCategory; code: string; label?: string }> = [
  { category: "INCOME", code: "SALARY", label: "Salary" },
  { category: "INCOME", code: "GIG", label: "Gig / Freelance" },
  { category: "INCOME", code: "GIFT", label: "Gift" },
  { category: "INCOME", code: "AJO_PAYOUT", label: "AJO Payout" },
  { category: "INCOME", code: "OTHER", label: "Other Income" },
  { category: "SAVINGS", code: "AJO_PAYOUT", label: "AJO Payout" },
  { category: "SAVINGS", code: "AJO_CONTRIBUTION", label: "AJO Contribution" },
  { category: "SAVINGS", code: "OTHER", label: "Other Savings" },
];

export async function ensureSystemTags(userId: string) {
  await Promise.all(
    SYSTEM_TAGS.map((tag) =>
      prisma.tag.upsert({
        where: {
          userId_code_category: {
            userId,
            code: tag.code,
            category: tag.category,
          },
        },
        update: {
          isSystemTag: true,
          label: tag.label,
        },
        create: {
          userId,
          code: tag.code,
          label: tag.label,
          category: tag.category,
          isSystemTag: true,
        },
      })
    )
  );
}
