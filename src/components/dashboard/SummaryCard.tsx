import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

export function SummaryCard({ title, value, subtitle, trend, icon, gradient, iconBg }: SummaryCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-6 text-white shadow-lg", gradient)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={cn("text-xs font-medium", trend.positive ? "text-emerald-200" : "text-red-200")}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-xs text-white/60">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3 shadow-inner", iconBg)}>
          {icon}
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white/5" />
    </div>
  );
}
