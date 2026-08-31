/**
 * AlertsPage — Alerts & Notifications Center
 *
 * Displays operational alerts with severity levels, zones, timestamps,
 * and read/unread status. Severity filtering and search are functional.
 * Alert data is currently mock — will connect to backend notifications API in Phase 2.
 */
import GlassCard from "@/components/GlassCard";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type Severity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "INFO";

interface Alert {
  id: number;
  severity: Severity;
  zone: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const MOCK_ALERTS: Alert[] = [
  { id: 1, severity: "CRITICAL", zone: "Maiduguri Metro", title: "Active Threat Alert", message: "Armed group spotted near IDP camp perimeter. Inter-agency coordination in progress. All field teams advised to shelter in place.", timestamp: "12 min ago", read: false },
  { id: 2, severity: "HIGH", zone: "Bama Sector", title: "Elevated Conflict Activity", message: "ACLED reports 34% increase in incident frequency along Bama–Banki corridor over the past 72 hours.", timestamp: "1 hour ago", read: false },
  { id: 3, severity: "MODERATE", zone: "Monguno", title: "Food Distribution Ongoing", message: "WFP distribution convoy arrived at Monguno staging area. 12,400 households queued. Distribution expected to complete within 48 hours.", timestamp: "2 hours ago", read: true },
  { id: 4, severity: "HIGH", zone: "Ngala", title: "Supply Route Disruption", message: "Mile 40 checkpoint experiencing delays. Average wait time increased from 2.5h to 7h. Alternative route via Gamboru recommended.", timestamp: "3 hours ago", read: true },
  { id: 5, severity: "LOW", zone: "Konduga", title: "Data Feed Updated", message: "IOM DTM displacement data refreshed. Konduga IDP population revised to 89,200 (+1,300 from last update).", timestamp: "5 hours ago", read: true },
  { id: 6, severity: "INFO", zone: "All Regions", title: "System Maintenance Scheduled", message: "COR-HARP model retraining scheduled for Saturday 02:00 UTC. Forecasting endpoints may be unavailable for approximately 45 minutes.", timestamp: "8 hours ago", read: true },
  { id: 7, severity: "CRITICAL", zone: "Bama Sector", title: "IDP Camp Evacuation", message: "Precautionary evacuation of Bama IDP camp Phase 3. 4,200 individuals relocated to Maiduguri临时 shelter. Needs assessment in progress.", timestamp: "1 day ago", read: true },
  { id: 8, severity: "MODERATE", zone: "Maiduguri Metro", title: "Market Price Spike", message: "Rice prices at Maiduguri market increased 18% week-over-week. WFP mVAM monitoring team alerted. Correlation with supply route disruption under analysis.", timestamp: "1 day ago", read: true },
];

const SEVERITY_CONFIG: Record<Severity, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  CRITICAL: { icon: XCircle, color: "text-un-red", bg: "bg-un-red/10", border: "border-un-red/25" },
  HIGH: { icon: AlertTriangle, color: "text-un-amber", bg: "bg-un-amber/10", border: "border-un-amber/25" },
  MODERATE: { icon: Bell, color: "text-un-blue", bg: "bg-un-blue/10", border: "border-un-blue/25" },
  LOW: { icon: Info, color: "text-surface-400", bg: "bg-white/[0.03]", border: "border-white/[0.06]" },
  INFO: { icon: Info, color: "text-surface-500", bg: "bg-white/[0.02]", border: "border-white/[0.04]" },
};

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MODERATE", "LOW", "INFO"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState<Severity | "ALL">("ALL");

  const filtered = filter === "ALL" ? alerts : alerts.filter((a) => a.severity === filter);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const markRead = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text">Alerts & Notifications</h1>
          <p className="text-sm text-surface-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All alerts read"}
          </p>
        </div>
        <button
          onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold text-surface-400 border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
        >
          <CheckCircle2 size={14} />
          Mark all read
        </button>
      </div>

      {/* Severity filter */}
      <GlassCard className="p-3 mb-5 flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-surface-500" />
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${filter === "ALL" ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"}`}
        >
          All ({alerts.length})
        </button>
        {SEVERITIES.map((s) => {
          const cfg = SEVERITY_CONFIG[s];
          const count = alerts.filter((a) => a.severity === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${filter === s ? `${cfg.bg} ${cfg.color}` : "text-surface-400 hover:bg-white/[0.04]"}`}
            >
              {s} ({count})
            </button>
          );
        })}
      </GlassCard>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity];
          const Icon = cfg.icon;
          return (
            <GlassCard
              key={alert.id}
              className={`p-4 ${!alert.read ? "border-l-2 " + cfg.border : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-btn ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[0.6rem] font-bold uppercase tracking-wider ${cfg.color}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[0.6rem] text-surface-500">•</span>
                    <span className="text-[0.65rem] text-surface-500">{alert.zone}</span>
                    <span className="text-[0.6rem] text-surface-500">•</span>
                    <span className="text-[0.65rem] text-surface-500 flex items-center gap-1">
                      <Clock size={10} /> {alert.timestamp}
                    </span>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-un-blue animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-dark-text mb-1">{alert.title}</h3>
                  <p className="text-[0.8rem] text-surface-300 leading-relaxed">{alert.message}</p>
                </div>
                {!alert.read && (
                  <button
                    onClick={() => markRead(alert.id)}
                    className="text-[0.65rem] text-surface-500 hover:text-un-blue transition-colors whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
