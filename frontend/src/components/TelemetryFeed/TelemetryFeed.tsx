/**
 * TelemetryFeed.tsx   Live risk telemetry side panel.
 *
 * total IDP population, critical zones, average neural risk, and
 * a per-LGA risk index list with color-coded badges.
 *
 * Props:
 *   markers   Array of map markers with risk_level and idp_population.
 */
import type { MapMarker } from "@/types";
import clsx from "clsx";

const RISK_BADGE: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "bg-un-red/15", text: "text-[#FCA5A5]" },
  HIGH: { bg: "bg-un-amber/15", text: "text-[#FCD34D]" },
  MODERATE: { bg: "bg-un-blue/15", text: "text-un-light-blue" },
  LOW: { bg: "bg-un-green/15", text: "text-green-400" },
};

interface TelemetryFeedProps {
  markers: MapMarker[];
}

export default function TelemetryFeed({ markers }: TelemetryFeedProps) {
  const totalIdp = markers.reduce((sum, m) => sum + (m.idp_population ?? 0), 0);
  const criticalCount = markers.filter(
    (m) => m.risk_level === "CRITICAL",
  ).length;
  const avgRisk =
    markers.reduce((sum, m) => sum + (m.lstm_prediction ?? 0), 0) /
    Math.max(markers.length, 1);

  return (
    <div className="rounded-card-lg border border-white/[0.06] bg-dark-card/65 backdrop-blur-glass p-5 animate-fade-in-up">
      <h3 className="text-sm font-bold text-dark-text mb-4">
        Live Risk Telemetry
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[1px] text-surface-500">
            Total IDP Population
          </p>
          <p className="text-2xl font-extrabold text-dark-text">
            {totalIdp.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[1px] text-surface-500">
            Critical Zones
          </p>
          <p className="text-2xl font-extrabold text-dark-text">
            {criticalCount}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[1px] text-surface-500">
            Avg Neural Risk
          </p>
          <p className="text-2xl font-extrabold text-dark-text">
            {avgRisk.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <h4 className="text-[0.75rem] font-bold text-surface-400 mb-3">
          LGA Risk Index
        </h4>
        {markers.map((m, i) => {
          const badge = RISK_BADGE[m.risk_level] || RISK_BADGE.MODERATE;
          return (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 border-b border-white/[0.04] text-[0.78rem]"
            >
              <span className="text-surface-400">{m.name}</span>
              <span
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold",
                  badge.bg,
                  badge.text,
                )}
              >
                {m.risk_level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
