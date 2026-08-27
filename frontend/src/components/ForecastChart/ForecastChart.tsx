/**
 * ForecastChart.tsx   LSTM forecast visualization using Recharts.
 *
 * TEMP-DOCS: Renders a LineChart showing predicted conflict events
 * over a forecast horizon. Includes a CartesianGrid, tooltips, and
 * responsive container for mobile sizing.
 *
 * Props:
 *   data         Array of { month, predicted_events } from the forecast API.
 *   lga          The LGA name displayed in the chart title.
 *   baseRisk     The baseline risk index value.
 */
import GlassCard from "@/components/GlassCard";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ForecastPoint {
  month: number;
  predicted_events: number;
}

interface ForecastChartProps {
  data: ForecastPoint[];
  lga: string;
  baseRisk: number;
}

export default function ForecastChart({
  data,
  lga,
  baseRisk,
}: ForecastChartProps) {
  const chartData = data.map((p) => ({
    name: `M${p.month}`,
    events: p.predicted_events,
  }));

  return (
    <GlassCard className="p-5 animate-fade-in-up">
      <h3 className="text-sm font-bold text-dark-text mb-4">
        LSTM Conflict Forecast {lga}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
          <Tooltip
            contentStyle={{
              background: "rgba(19,24,37,0.95)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              fontSize: "0.8rem",
            }}
            labelStyle={{ color: "#E0E6ED" }}
          />
          <Line
            type="monotone"
            dataKey="events"
            stroke="#009EDB"
            strokeWidth={2}
            dot={{ fill: "#009EDB", r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[0.7rem] text-surface-500">
        Base risk: {baseRisk.toFixed(2)} · Horizon: {data.length} months
      </p>
    </GlassCard>
  );
}
