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
import type { ChartDataPoint } from "@/types";
import { formatCurrency } from "@/utils/format";

interface SavingsChartProps {
  data: ChartDataPoint[];
  ajoTotal: number;
  otherTotal: number;
}

const PIE_COLORS = ["#7c3aed", "#14b8a6"];

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
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} fill="url(#savingsGrad)" name="Savings" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SavingsPieChart({ ajoTotal, otherTotal }: { ajoTotal: number; otherTotal: number }) {
  const pieData = [
    { name: "AJO", value: ajoTotal },
    { name: "Other", value: otherTotal },
  ].filter((d) => d.value > 0);

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
