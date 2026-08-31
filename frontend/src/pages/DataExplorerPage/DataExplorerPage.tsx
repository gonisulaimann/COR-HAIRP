/**
 * DataExplorerPage — Raw Data & Feature Analysis (Student role only)
 *
 * Interactive data explorer showing the 23 input features, their
 * distributions, and correlations. Uses sensitivity data from the API.
 */
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { getSensitivity, multiLgaForecast } from "@/api";
import type { SensitivityRow } from "@/types";
import { Globe, Info } from "lucide-react";
import { useEffect, useState } from "react";

const FEATURE_CATEGORIES = {
  Conflict: ["conflict_events_total", "fatalities_total", "conflict_events_maiduguri", "conflict_events_bama"],
  "Food Prices": ["rice_price", "millet_price", "sorghum_price", "maize_price"],
  Displacement: ["idp_maiduguri", "idp_bama", "idp_monguno", "idp_ngala", "idp_konduga"],
  "Food Security": ["ipc_phase3_maiduguri", "ipc_phase3_bama", "ipc_phase3_monguno", "ipc_phase3_ngala", "ipc_phase3_konduga"],
};

export default function DataExplorerPage() {
  const [sensitivity, setSensitivity] = useState<SensitivityRow[]>([]);
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Conflict");

  useEffect(() => {
    Promise.all([getSensitivity(), multiLgaForecast()])
      .then(([s, p]) => { setSensitivity(s); setPredictions(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxSensitivity = Math.max(...sensitivity.map((s) => s.Sensitivity || 0), 0.01);

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Globe size={20} /> Data Explorer
      </h1>
      <p className="text-sm text-surface-400 mb-5 animate-fade-in">
        Raw data features, importance scores, and model inputs
      </p>

      {/* Info banner */}
      <GlassCard className="p-4 mb-5 border-un-blue/20">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-un-blue mt-0.5 flex-shrink-0" />
          <p className="text-[0.8rem] text-surface-300">
            This explorer shows the 23 input features used by the LSTM model and their relative importance scores.
            Higher importance means the feature has more influence on predictions.
          </p>
        </div>
      </GlassCard>

      {/* Category tabs */}
      <GlassCard className="p-3 mb-5 flex items-center gap-2 flex-wrap">          {Object.keys(FEATURE_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
              activeCategory === cat ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"
            }`}
          >
            {cat}
          </button>
        ))}
      </GlassCard>

      {loading ? (
        <LoadingSkeleton count={6} height="60px" />
      ) : (
        <div className="space-y-2">
          {(FEATURE_CATEGORIES as Record<string, string[]>)[activeCategory]?.map((feature: string) => {
            const row = sensitivity.find((s) => s.Feature === feature);
            const importance = row?.Sensitivity || 0;
            const pct = (importance / maxSensitivity) * 100;

            return (
              <GlassCard key={feature} className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-dark-text font-mono">{feature}</span>
                  <span className="text-xs font-bold text-un-blue">{(importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-dark-bg/60 rounded-full">
                  <div className="h-full bg-gradient-to-r from-un-blue/60 to-un-blue rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </GlassCard>
            );
          })}

          {sensitivity.length === 0 && (
            <p className="text-sm text-surface-500 text-center py-8">
              Feature sensitivity data will appear when the backend model is loaded
            </p>
          )}
        </div>
      )}
    </div>
  );
}
