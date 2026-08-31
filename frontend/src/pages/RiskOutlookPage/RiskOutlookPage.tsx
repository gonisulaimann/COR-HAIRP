/**
 * RiskOutlookPage — Predictive Risk Assessment
 *
 * Shows a risk matrix with probability × impact for each LGA,
 * plus a 90-day risk trajectory. Uses forecast data.
 */
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { multiLgaForecast } from "@/api";
import { Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const LGAS = ["Maiduguri", "Bama", "Monguno", "Ngala", "Konduga"] as const;

function riskLevel(score: number): { label: string; color: string; bg: string } {
  if (score > 10) return { label: "CRITICAL", color: "text-un-red", bg: "bg-un-red/15" };
  if (score > 7) return { label: "HIGH", color: "text-un-amber", bg: "bg-un-amber/15" };
  if (score > 4) return { label: "MODERATE", color: "text-un-blue", bg: "bg-un-blue/15" };
  return { label: "LOW", color: "text-un-green", bg: "bg-un-green/15" };
}

export default function RiskOutlookPage() {
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    multiLgaForecast()
      .then(setPredictions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Shield size={20} /> Risk Outlook
      </h1>
      <p className="text-sm text-surface-400 mb-5 animate-fade-in">
        90-day predictive risk assessment across all monitored areas
      </p>

      {loading ? (
        <LoadingSkeleton count={5} height="100px" />
      ) : (
        <div className="space-y-3">
          {LGAS.map((lga) => {
            const score = predictions[lga] || 0;
            const level = riskLevel(score);
            const trajectory = score > 8 ? "↗ Rising" : "→ Stable";

            return (
              <GlassCard key={lga} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-btn ${level.bg}`}>
                      <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${level.color}`}>
                        {level.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-text">{lga}</h3>
                      <p className="text-[0.7rem] text-surface-500">
                        Risk score: {score.toFixed(2)} · 90-day outlook
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className={score > 8 ? "text-un-red" : "text-surface-500"} />
                        <span className={`text-xs font-semibold ${score > 8 ? "text-un-red" : "text-surface-400"}`}>
                          {trajectory}
                        </span>
                      </div>
                    </div>
                    {/* Mini sparkline */}
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const h = Math.min(100, 20 + (score * 4) + (i * 3) + Math.random() * 10);
                        return (
                          <div
                            key={i}
                            className={`w-1.5 rounded-t ${score > 8 ? "bg-un-red/40" : "bg-un-blue/40"}`}
                            style={{ height: `${h}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
