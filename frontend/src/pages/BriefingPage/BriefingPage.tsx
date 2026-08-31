/**
 * BriefingPage — Today's Briefing (Auto-Generated Daily Summary)
 *
 * Aggregates KPIs, recent alerts, and key metrics into a single
 * scannable briefing card — the kind of view an operations lead
 * reads first thing in the morning.
 *
 * Data is currently from existing API endpoints (getKpis) + mock alerts.
 * Will connect to a dedicated briefing endpoint in Phase 2.
 */
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { getKpis } from "@/api";
import type { KpiResponse } from "@/types";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const BRIEFING_ALERTS = [
  { severity: "CRITICAL" as const, text: "Active threat in Maiduguri Metro — coordination in progress" },
  { severity: "HIGH" as const, text: "Bama–Banki corridor: 34% conflict increase (72h)" },
  { severity: "MODERATE" as const, text: "WFP distribution underway in Monguno — 12,400 HH queued" },
];

const KEY_ACTIONS = [
  { text: "Review threat assessment for Maiduguri Metro", status: "pending" as const },
  { text: "Approve alternative supply route via Gamboru", status: "pending" as const },
  { text: "Sign off on Bama evacuation needs assessment", status: "done" as const },
  { text: "Brief team leads on weekend model maintenance", status: "pending" as const },
];

export default function BriefingPage() {
  const [kpis, setKpis] = useState<KpiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKpis()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text">Today's Briefing</h1>
          <p className="text-sm text-surface-400 mt-1 flex items-center gap-1.5">
            <Calendar size={14} /> {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Clock size={12} />
          Last updated: {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Priority Alerts */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-un-amber" />
          <h2 className="text-sm font-bold text-dark-text">Priority Alerts</h2>
        </div>
        <div className="space-y-2">
          {BRIEFING_ALERTS.map((alert, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                alert.severity === "CRITICAL" ? "bg-un-red" :
                alert.severity === "HIGH" ? "bg-un-amber" : "bg-un-blue"
              }`} />
              <span className="text-surface-300">{alert.text}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* KPI Summary */}
      {loading ? (
        <LoadingSkeleton count={3} height="100px" />
      ) : kpis ? (
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-un-blue" />
            <h2 className="text-sm font-bold text-dark-text">Key Indicators</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {kpis.cards.map((card, i) => (
              <div key={i} className="bg-dark-bg/50 border border-white/[0.04] rounded-card p-3">
                <p className="text-xl font-extrabold text-dark-text">{card.value}</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-surface-500 mt-0.5">{card.label}</p>
                <p className={`text-[0.7rem] font-medium mt-1 ${card.delta_positive === false ? "text-un-red" : card.delta_positive === true ? "text-un-green" : "text-surface-500"}`}>
                  {card.delta_positive === true && <TrendingUp size={10} className="inline mr-0.5" />}
                  {card.delta_positive === false && <TrendingDown size={10} className="inline mr-0.5" />}
                  {card.delta}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {/* Key Actions */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-un-green" />
          <h2 className="text-sm font-bold text-dark-text">Key Actions</h2>
        </div>
        <div className="space-y-2">
          {KEY_ACTIONS.map((action, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {action.status === "done" ? (
                <CheckCircle2 size={16} className="text-un-green flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-surface-500 flex-shrink-0" />
              )}
              <span className={action.status === "done" ? "text-surface-500 line-through" : "text-surface-300"}>
                {action.text}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
