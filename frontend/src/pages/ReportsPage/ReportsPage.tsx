/**
 * Reports Page
 * ════════════
 *
 * Report builder for Aid Worker and NGO roles.
 * Users can pick a date range and region, then view a summary.
 * Export functionality is a UI shell (Phase 2 for actual PDF/CSV).
 */
import GlassCard from "@/components/GlassCard";
import KpiCard from "@/components/KpiCard";
import { useRole } from "@/contexts/RoleContext";
import { getKpis } from "@/api";
import type { KpiResponse } from "@/types";
import {
  Download,
  FileText,
  Filter,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

const REGIONS = [
  "All Regions",
  "Maiduguri",
  "Bama",
  "Monguno",
  "Ngala",
  "Konduga",
];

const DATE_RANGES = [
  "Last 7 Days",
  "Last 30 Days",
  "Last Quarter",
  "Year to Date",
];

export default function ReportsPage() {
  const { role } = useRole();
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("All Regions");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getKpis()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => setGenerating(false), 1500);
  };

  const isNGO = role === "ngo";

  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text">
            {isNGO ? "Impact Reports" : "Reports"}
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Generate operational summaries by region and time period
          </p>
        </div>
      </div>

      {/* Report Builder */}
      <GlassCard className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-un-blue" />
          <h3 className="text-sm font-bold text-dark-text">Report Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Region */}
          <div>
            <label className="text-[0.7rem] font-semibold text-surface-500 uppercase tracking-wider mb-1.5 block">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-dark-bg border border-white/[0.06] rounded-btn px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-un-blue/40"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[0.7rem] font-semibold text-surface-500 uppercase tracking-wider mb-1.5 block">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-dark-bg border border-white/[0.06] rounded-btn px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-un-blue/40"
            >
              {DATE_RANGES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-semibold text-white bg-un-blue hover:bg-un-blue/80 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {generating ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Report Preview */}
      <GlassCard className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-dark-text">
            Report Preview — {region}, {dateRange}
          </h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold text-surface-400 border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <Download size={14} />
            Export CSV
            <span className="text-[0.55rem] text-surface-600 ml-1">(coming soon)</span>
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-surface-500">Loading data...</p>
        ) : kpis ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
        ) : (
          <p className="text-sm text-surface-500">No data available</p>
        )}
      </GlassCard>
    </div>
  );
}
