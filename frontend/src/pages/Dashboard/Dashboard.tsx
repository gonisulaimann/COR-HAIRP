/**
 * Dashboard.tsx   Executive Situation Report with KPIs and charts.
 *
 * TEMP-DOCS: Fetches KPI data, LSTM forecast, and sensitivity analysis
 * from the backend on mount. Shows animated KPI cards in a grid, a
 * forecast line chart, a sensitivity bar chart, and LSTM indicators.
 *
 * Props:
 *   title   Page title displayed in the header (default: "Executive Situation Report").
 */
import { forecast, getKpis, getSensitivity } from "@/api";
import ForecastChart from "@/components/ForecastChart";
import GlassCard from "@/components/GlassCard";
import KpiCard from "@/components/KpiCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SensitivityChart from "@/components/SensitivityChart";
import type { ForecastResponse, KpiResponse, SensitivityRow } from "@/types";
import { useEffect, useState } from "react";

interface DashboardProps {
  title?: string;
}

export default function Dashboard({
  title = "Executive Situation Report",
}: DashboardProps) {
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null,
  );
  const [sensitivity, setSensitivity] = useState<SensitivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [k, f, s] = await Promise.all([
          getKpis(),
          forecast("Maiduguri", 12),
          getSensitivity(),
        ]);
        setKpis(k);
        setForecastData(f);
        setSensitivity(s);
      } catch {
        setError("Failed to load dashboard data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate__animated animate__fadeInUp">
        <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
          {title}
        </h1>
        <p className="text-sm text-surface-400 mb-6 animate-fade-in">
          Loading neural intelligence pipeline...
        </p>
        <LoadingSkeleton count={6} height="120px" className="grid-cols-3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate__animated animate__fadeInUp">
        <h1 className="text-xl font-extrabold text-dark-text mb-4 animate-fade-in">
          {title}
        </h1>
        <GlassCard className="p-6 border-un-red/30 animate-fade-in">
          <p className="font-semibold text-[#FCA5A5] mb-2">Connection Error</p>
          <p className="text-sm text-surface-400">{error}</p>
          <p className="text-xs text-surface-500 mt-3">
            Run:{" "}
            <code className="bg-dark-bg/50 px-1.5 py-0.5 rounded">
              uvicorn backend.main:app --reload
            </code>
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
        {title}
      </h1>
      <p className="text-sm text-surface-400 mb-6 animate-fade-in">
        Real-time neural intelligence LSTM forecasting engine
      </p>

      {/* KPI Grid */}
      {kpis && (
        <div className="animate__animated animate__fadeInUp grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {kpis.cards.map((card, i) => (
            <KpiCard
              key={i}
              label={card.label}
              value={card.value}
              delta={card.delta}
              positive={card.delta_positive}
              delay={i * 50}
            />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {forecastData && (
          <ForecastChart
            data={forecastData.predictions}
            lga={forecastData.lga}
            baseRisk={forecastData.base_risk}
          />
        )}
        <SensitivityChart data={sensitivity} />
      </div>

      {/* LSTM Indicators */}
      {forecastData && (
        <GlassCard className="p-5 animate__animated animate__fadeInUp animate-fade-in-up">
          <h3 className="text-sm font-bold text-dark-text mb-3">
            Neural Forecast Indicators
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {forecastData.predictions.slice(0, 4).map((p) => (
              <div
                key={p.month}
                className="rounded-card border border-white/[0.06] bg-dark-card/55 p-3.5"
              >
                <p className="text-xl font-extrabold text-dark-text">
                  {p.predicted_events.toFixed(1)}
                </p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[1.2px] text-surface-500 mt-0.5">
                  Month {p.month}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
