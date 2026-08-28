/**
 * SensitivityChart.tsx   Feature importance bar chart from LSTM perturbation.
 *
 * by sensitivity score. Higher values mean the feature has more impact
 * on the LSTM prediction.
 *
 * Props:
 *   data   Array of { Feature, Sensitivity } from GET /api/ml/sensitivity.
 *   top    Number of top features to show (default: 10).
 */
import GlassCard from "@/components/GlassCard";
import type { SensitivityRow } from "@/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SensitivityChartProps {
  data: SensitivityRow[];
  top?: number;
}

export default function SensitivityChart({
  data,
  top = 10,
}: SensitivityChartProps) {
  const chartData = data.slice(0, top);

  return (
    <GlassCard className="p-5 animate-fade-in-up">
      <h3 className="text-sm font-bold text-dark-text mb-4">
        Feature Sensitivity Top {top}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} />
          <YAxis
            type="category"
            dataKey="Feature"
            tick={{ fontSize: 9, fill: "#64748B" }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(19,24,37,0.95)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              fontSize: "0.8rem",
            }}
          />
          <Bar dataKey="Sensitivity" fill="#009EDB" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
