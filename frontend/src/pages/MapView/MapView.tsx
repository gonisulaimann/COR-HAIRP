/**
 * MapView.tsx — Master Spatial Command Map with list+map split layout.
 *
 * TEMP-DOCS: Fetches map markers and corridors from the backend. Renders
 * a scrollable LGA list panel (left, ~35%) and an interactive Leaflet map
 * (right, ~65%). Clicking a list card flies the map to that LGA. Clicking
 * a map marker highlights the corresponding list card. Includes floating
 * badge row, live telemetry feed below the map, and a glass-card legend.
 *
 * State: selectedLga tracks which LGA is currently focused in both panels.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getMapMarkers } from '@/api';
import type { MapMarkersResponse, MapMarker } from '@/types';
import MapPanel from '@/components/MapPanel';
import TelemetryFeed from '@/components/TelemetryFeed';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import GlassCard from '@/components/GlassCard';
import { MapPin, TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';

const RISK_DOT: Record<string, string> = {
  CRITICAL: 'bg-un-red shadow-[0_0_8px_theme("colors.un-red")]',
  HIGH: 'bg-un-amber shadow-[0_0_8px_theme("colors.un-amber")]',
  MODERATE: 'bg-un-blue shadow-[0_0_8px_theme("colors.un-blue")]',
  LOW: 'bg-un-green shadow-[0_0_8px_theme("colors.un-green")]',
};

const RISK_BORDER: Record<string, string> = {
  CRITICAL: 'border-un-red/40',
  HIGH: 'border-un-amber/40',
  MODERATE: 'border-un-blue/40',
  LOW: 'border-un-green/40',
};

const RISK_TEXT: Record<string, string> = {
  CRITICAL: 'text-un-red',
  HIGH: 'text-un-amber',
  MODERATE: 'text-un-blue',
  LOW: 'text-un-green',
};

// ─── LGA List Card ──────────────────────────────────────────────────────────
interface LgaCardProps {
  marker: MapMarker;
  isSelected: boolean;
  onClick: () => void;
}

function LgaCard({ marker, isSelected, onClick }: LgaCardProps) {
  const isCritical = marker.risk_level === 'CRITICAL';
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${isSelected
          ? `bg-white/[0.07] ${RISK_BORDER[marker.risk_level]} shadow-lg`
          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${RISK_DOT[marker.risk_level] || RISK_DOT.MODERATE}`} />
          <h3 className="text-sm font-bold text-white">{marker.name}</h3>
        </div>
        {isCritical && (
          <AlertTriangle className="w-4 h-4 text-un-red animate-pulse flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-400">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{(marker.idp_population ?? 0).toLocaleString()} IDPs</span>
        </div>
        <div className={`flex items-center gap-1 font-semibold ${RISK_TEXT[marker.risk_level] || 'text-surface-400'}`}>
          <span>{marker.risk_level}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-surface-500">
        <TrendingUp className="w-3 h-3" />
        <span>LSTM: {marker.lstm_prediction} events forecast</span>
      </div>
    </button>
  );
}

// ─── Main MapView ───────────────────────────────────────────────────────────
export default function MapView() {
  const [data, setData] = useState<MapMarkersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLga, setSelectedLga] = useState<string | null>(null);

  useEffect(() => {
    getMapMarkers()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectLga = useCallback((name: string) => {
    setSelectedLga((prev) => (prev === name ? null : name));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
          Master Spatial Command Map
        </h1>
        <LoadingSkeleton count={3} height="520px" />
      </div>
    );
  }

  // Sort markers: CRITICAL first, then HIGH, MODERATE, LOW
  const riskOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
  const sortedMarkers = [...data.markers].sort(
    (a, b) => (riskOrder[a.risk_level as keyof typeof riskOrder] ?? 4) - (riskOrder[b.risk_level as keyof typeof riskOrder] ?? 4),
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-5 animate-fade-in">
        <h1 className="text-xl font-extrabold text-dark-text mb-1">Master Spatial Command Map</h1>
        <p className="text-sm text-surface-400">
          Interactive tactical view — Borno State, Northeast Nigeria
        </p>
      </div>

      {/* Badge Row */}
      <div className="flex gap-3 mb-4 flex-wrap animate-fade-in-down">
        {data.markers.map((m, i) => (
          <GlassCard key={i} className="flex items-center gap-2 px-4 py-2.5" hover>
            <span className={`h-[7px] w-[7px] rounded-full ${RISK_DOT[m.risk_level] || RISK_DOT.MODERATE}`} />
            <div>
              <p className="text-[0.78rem] font-bold text-dark-text">{m.name}</p>
              <p className="text-[0.65rem] text-surface-500">
                {m.risk_level} · {(m.idp_population ?? 0).toLocaleString()} IDPs
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── List + Map Split View ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,35%)_1fr] gap-4 animate-fade-in-up">
        {/* Left Panel — Scrollable LGA List */}
        <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-surface-300 uppercase tracking-wider">
              LGA Risk Index
            </h2>
            <span className="text-xs text-surface-500">
              {sortedMarkers.length} zones
            </span>
          </div>
          {sortedMarkers.map((m) => (
            <LgaCard
              key={m.name}
              marker={m}
              isSelected={selectedLga === m.name}
              onClick={() => handleSelectLga(m.name)}
            />
          ))}
        </div>

        {/* Right Panel — Map */}
        <div>
          <GlassCard className="p-0 overflow-hidden" as="div">
            <MapPanel
              markers={data.markers}
              corridors={data.corridors}
              selectedLga={selectedLga}
              onSelectLga={handleSelectLga}
            />
          </GlassCard>
        </div>
      </div>

      {/* Telemetry Feed */}
      <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <TelemetryFeed markers={data.markers} />
      </div>
    </div>
  );
}
