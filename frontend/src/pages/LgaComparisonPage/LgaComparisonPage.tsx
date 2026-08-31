/**
 * LgaComparisonPage — Multi-LGA Comparative Analysis
 *
 * Side-by-side comparison of key metrics across all 5 LGAs.
 * Uses multi-LGA forecast data to show relative risk, population,
 * and trend indicators in a dense comparison table.
 */
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { multiLgaForecast } from "@/api";
import { GitCompare, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const LGA_DATA: Record<string, { idp: number; ipc: number; market: string }> = {
  Maiduguri: { idp: 486200, ipc: 34.2, market: "₦72,400" },
  Bama: { idp: 312800, ipc: 41.8, market: "₦69,100" },
  Monguno: { idp: 287400, ipc: 38.5, market: "₦65,800" },
  Ngala: { idp: 198600, ipc: 44.1, market: "₦71,200" },
  Konduga: { idp: 76535, ipc: 29.7, market: "₦63,400" },
};

export default function LgaComparisonPage() {
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "risk" | "idp">("risk");

  useEffect(() => {
    multiLgaForecast()
      .then(setPredictions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lgas = Object.keys(LGA_DATA);
  const sortedLgas = [...lgas].sort((a, b) => {
    if (sortBy === "risk") return (predictions[b] || 0) - (predictions[a] || 0);
    if (sortBy === "idp") return LGA_DATA[b].idp - LGA_DATA[a].idp;
    return a.localeCompare(b);
  });

  const maxRisk = Math.max(...Object.values(predictions).map(Number), 1);
  const maxIdp = Math.max(...lgas.map((l) => LGA_DATA[l].idp), 1);

  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text flex items-center gap-2">
            <GitCompare size={20} />
            LGA Comparison
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Side-by-side analysis across 5 Local Government Areas
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["risk", "idp", "name"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
                sortBy === s ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"
              }`}
            >
              {s === "risk" ? "By Risk" : s === "idp" ? "By Population" : "A–Z"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={5} height="80px" />
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_100px_100px_120px] gap-3 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[1.5px] text-surface-500">
            <span>LGA</span>
            <span className="text-right">Risk Index</span>
            <span className="text-right">IDP Pop.</span>
            <span className="text-right">IPC 3+</span>
            <span className="text-right">Trend</span>
          </div>

          {sortedLgas.map((lga, i) => {
            const risk = predictions[lga] || 0;
            const data = LGA_DATA[lga];
            const riskPct = (risk / maxRisk) * 100;
            const idpPct = (data.idp / maxIdp) * 100;
            const isHigh = risk > 8;

            return (
              <GlassCard key={lga} className="p-4">
                <div className="grid grid-cols-[1fr_100px_100px_100px_120px] gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-surface-500">#{i + 1}</span>
                    <span className="text-sm font-bold text-dark-text">{lga}</span>
                  </div>

                  {/* Risk bar */}
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-dark-text">{risk.toFixed(1)}</p>
                    <div className="w-full h-1 bg-dark-bg/60 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${isHigh ? "bg-un-red" : "bg-un-blue"}`}
                        style={{ width: `${riskPct}%` }}
                      />
                    </div>
                  </div>

                  {/* IDP */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-dark-text">{(data.idp / 1000).toFixed(0)}K</p>
                    <div className="w-full h-1 bg-dark-bg/60 rounded-full mt-1">
                      <div className="h-full bg-un-amber rounded-full" style={{ width: `${idpPct}%` }} />
                    </div>
                  </div>

                  {/* IPC */}
                  <p className="text-right text-sm font-semibold text-surface-300">{data.ipc}%</p>

                  {/* Trend */}
                  <div className="flex items-center justify-end gap-1">
                    {isHigh ? (
                      <TrendingUp size={14} className="text-un-red" />
                    ) : (
                      <TrendingDown size={14} className="text-un-green" />
                    )}
                    <span className={`text-xs font-semibold ${isHigh ? "text-un-red" : "text-un-green"}`}>
                      {isHigh ? "Increasing" : "Stable"}
                    </span>
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
