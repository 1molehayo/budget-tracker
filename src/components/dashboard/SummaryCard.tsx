import { cn } from "@/lib/utils/classnames";

const tones = {
  income: "bg-gradient-to-br from-chart-income to-chart-income-to",
  budget: "bg-gradient-to-br from-chart-budget to-chart-budget-to",
  pool: "bg-gradient-to-br from-chart-savings to-chart-savings-to",
  project: "bg-gradient-to-br from-chart-project to-chart-project-to",
} as const;

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  tone: keyof typeof tones;
}

export function SummaryCard({ title, value, subtitle, tone }: SummaryCardProps) {
  return (
    <section className={cn("rounded-2xl p-4 text-white shadow-md sm:p-6", tones[tone])}>
      <p className="text-sm text-white/80">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      {subtitle ? <p className="mt-2 text-sm leading-5 text-white/75">{subtitle}</p> : null}
    </section>
  );
}
