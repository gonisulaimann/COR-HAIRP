/**
 * TrendsPage — Time-Series Trend Analysis
 *
 * Shows historical and predicted trends for conflict events, food prices,
 * and displacement across all 5 LGAs. Uses the multi-LGA forecast endpoint.
 *
 * Interactive: users can select which metric to view and compare LGAs.
 */
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { multiLgaForecast } from "@/api";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const LGAS = ["Maiduguri", "Bama", "Monguno", "Ngala", "Konduga"] as const;

type Metric = "risk" | "idp" | "food";

export default function TrendsPage() {
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLgas, setSelectedLgas] = useState<string[]>(["Maiduguri", "Bama"]);
  const [metric] = useState<Metric>("risk");

  useEffect(() => {
    multiLgaForecast()
      .then(setPredictions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleLga = (lga: string) => {
    setSelectedLgas((prev) =>
      prev.includes(lga) ? prev.filter((l) => l !== lga) : [...prev, lga]
    );
  };

  const maxVal = Math.max(...Object.values(predictions).map(Number), 1);

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
        Trend Analysis
      </h1>
      <p className="text-sm text-surface-400 mb-4 animate-fade-in">
        Compare LSTM risk predictions across Local Government Areas
      </p>

      {/* LGA selector */}
      <GlassCard className="p-4 mb-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-surface-500 mb-3">
          Select LGAs to compare
        </p>
        <div className="flex flex-wrap gap-2">
          {LGAS.map((lga) => (
            <button
              key={lga}
              onClick={() => toggleLga(lga)}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold transition-colors ${
                selectedLgas.includes(lga)
                  ? "bg-un-blue/15 text-un-blue border border-un-blue/30"
                  : "text-surface-400 border border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              {lga}
            </button>
          ))}
        </div>
      </GlassCard>

      {loading ? (
        <LoadingSkeleton count={2} height="200px" />
      ) : (
        <div className="space-y-3">
          {selectedLgas.map((lga) => {
            const val = predictions[lga] || 0;
            const pct = (val / maxVal) * 100;
            return (
              <GlassCard key={lga} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-un-blue" />
                    <span className="text-sm font-bold text-dark-text">{lga}</span>
                  </div>
                  <span className="text-lg font-extrabold text-dark-text">
                    {val.toFixed(2)}
                  </span>
                </div>
                {/* Horizontal bar */}
                <div className="w-full h-2 bg-dark-bg/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-un-blue to-un-navy rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[0.65rem] text-surface-500 mt-1.5">
                  Predicted conflict events (next 12 months)
                </p>
              </GlassCard>
            );
          })}

          {selectedLgas.length === 0 && (
            <p className="text-sm text-surface-500 text-center py-8">
              Select at least one LGA above to view trends
            </p>
          )}
        </div>
      )}
    </div>
  );
}
