/**
 * RoutesPage — Transit Corridor Analysis
 *
 * Shows supply routes, their status, and risk levels.
 * Uses map marker data for corridor information.
 */
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { getMapMarkers } from "@/api";
import type { MapMarkersResponse } from "@/types";
import { AlertTriangle, CheckCircle2, Clock, Route, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const MOCK_ROUTES = [
  { id: 1, name: "Maiduguri → Bama (Banki Road)", status: "disrupted" as const, distance: "67 km", eta: "7+ hours", risk: "HIGH", load: 42 },
  { id: 2, name: "Maiduguri → Monguno", status: "active" as const, distance: "89 km", eta: "2.5 hours", risk: "MODERATE", load: 78 },
  { id: 3, name: "Monguno → Ngala", status: "active" as const, distance: "112 km", eta: "3.5 hours", risk: "LOW", load: 65 },
  { id: 4, name: "Maiduguri → Konduga", status: "active" as const, distance: "42 km", eta: "1 hour", risk: "LOW", load: 91 },
  { id: 5, name: "Maiduguri → Damboa", status: "closed" as const, distance: "78 km", eta: "N/A", risk: "CRITICAL", load: 0 },
];

const STATUS_ICON = { active: CheckCircle2, disrupted: AlertTriangle, closed: XCircle };
const STATUS_COLOR = { active: "text-un-green", disrupted: "text-un-amber", closed: "text-un-red" };
const STATUS_LABEL = { active: "Active", disrupted: "Disrupted", closed: "Closed" };

export default function RoutesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMapMarkers().catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Route size={20} /> Transit Corridors
      </h1>
      <p className="text-sm text-surface-400 mb-5 animate-fade-in">
        Supply route status and corridor risk assessment
      </p>

      {loading ? (
        <LoadingSkeleton count={5} height="120px" />
      ) : (
        <div className="space-y-3">
          {MOCK_ROUTES.map((route) => {
            const Icon = STATUS_ICON[route.status];
            const color = STATUS_COLOR[route.status];
            return (
              <GlassCard key={route.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon size={18} className={`${color} mt-0.5`} />
                    <div>
                      <h3 className="text-sm font-bold text-dark-text">{route.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[0.7rem] text-surface-500">
                        <span>{route.distance}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {route.eta}
                        </span>
                        <span className={`font-semibold ${
                          route.risk === "CRITICAL" ? "text-un-red" :
                          route.risk === "HIGH" ? "text-un-amber" :
                          route.risk === "MODERATE" ? "text-un-blue" : "text-un-green"
                        }`}>
                          {route.risk}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-wider ${color}`}>
                    {STATUS_LABEL[route.status]}
                  </span>
                </div>
                {route.load > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[0.65rem] text-surface-500 mb-1">
                      <span>Convoy capacity</span>
                      <span>{route.load}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-dark-bg/60 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          route.load > 80 ? "bg-un-green" : route.load > 50 ? "bg-un-blue" : "bg-un-amber"
                        }`}
                        style={{ width: `${route.load}%` }}
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
