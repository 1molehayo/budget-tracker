"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { ChartBreakdownItem, ChartDataPoint } from "@/types";
import { formatCurrency } from "@/utils/format";

const PIE_COLORS = ["var(--color-accent)", "var(--color-chart-pool)"];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <span className="font-semibold text-blue-700">{formatCurrency(payload[0].value)}</span>
    </div>
  );
};

export function SavingsAreaChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-savings-bar)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-chart-savings-bar)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-chart-axis)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-chart-axis)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="savings" stroke="var(--color-chart-savings)" strokeWidth={2} fill="url(#savingsGrad)" name="Savings" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SavingsPieChart({ data }: { data: ChartBreakdownItem[] }) {
  const pieData = data.filter((segment) => segment.value > 0);

  if (pieData.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-8">No savings data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(typeof v === "number" ? v : 0)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
