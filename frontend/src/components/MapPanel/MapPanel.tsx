/**
 * MapPanel.tsx   Interactive Leaflet map centered on Borno State.
 *
 * SVG markers for each LGA, dashed corridor polylines, and IDP concentration
 * circles. Critical markers have a pulsing glow animation. Each marker has
 * a dark-themed popup with risk level and LSTM prediction.
 *
 * Props:
 *   markers        Array of map markers from GET /api/map/markers.
 *   corridors      Array of transit corridor lines from the same endpoint.
 *   selectedLga    Name of the currently selected LGA from the list panel (optional).
 *   onSelectLga    Callback when a marker is clicked, passes the LGA name (optional).
 */
import type { CorridorLine, MapMarker } from "@/types";
import L from "leaflet";
import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

// ─── Color tokens from brand palette ────────────────────────────────────────
const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#CF3A24",
  HIGH: "#F5A623",
  MODERATE: "#4BA3E3",
  LOW: "#2E8540",
};

const RISK_BG: Record<string, string> = {
  CRITICAL: "rgba(207,58,36,0.15)",
  HIGH: "rgba(245,166,35,0.15)",
  MODERATE: "rgba(75,163,227,0.15)",
  LOW: "rgba(46,133,64,0.15)",
};

// ─── Custom SVG markers ─────────────────────────────────────────────────────
function createMarkerIcon(
  color: string,
  size: number,
  isCritical: boolean,
): L.DivIcon {
  const pulseStyle = isCritical
    ? `@keyframes marker-pulse{0%{box-shadow:0 0 0 0 ${color}80}70%{box-shadow:0 0 0 12px ${color}00}100%{box-shadow:0 0 0 0 ${color}00}}
       animation:marker-pulse 2s ease-in-out infinite;`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="${pulseStyle}display:flex;align-items:center;justify-content:center;">
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="3" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const HQ_ICON = createMarkerIcon("#009EDB", 36, false);

// ─── Auto-fly to selected LGA ───────────────────────────────────────────────
function FlyToMarker({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 11, { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
}

// ─── Legend overlay ──────────────────────────────────────────────────────────
function MapLegend() {
  const items = [
    { label: "Critical", color: RISK_COLORS.CRITICAL },
    { label: "High", color: RISK_COLORS.HIGH },
    { label: "Moderate", color: RISK_COLORS.MODERATE },
    { label: "Low", color: RISK_COLORS.LOW },
  ];

  return (
    <div
      className="absolute bottom-4 right-4 z-[1000]"
      style={{
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "10px 14px",
      }}
    >
      <p className="text-[0.65rem] font-semibold text-white/70 mb-2 uppercase tracking-wider">
        Risk Level
      </p>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 mb-1.5 last:mb-0"
        >
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{
              background: item.color,
              boxShadow: `0 0 6px ${item.color}60`,
            }}
          />
          <span className="text-[0.68rem] text-white/80">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
interface MapPanelProps {
  markers: MapMarker[];
  corridors: CorridorLine[];
  selectedLga?: string | null;
  onSelectLga?: (name: string) => void;
}

export default function MapPanel({
  markers,
  corridors,
  selectedLga,
  onSelectLga,
}: MapPanelProps) {
  const selected = selectedLga
    ? markers.find((m) => m.name === selectedLga)
    : null;

  return (
    <div className="relative  h-[600px] w-full rounded-2xl overflow-hidden">
      <MapContainer
        center={[11.85, 13.15]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        {/* Free OpenStreetMap tiles (no API key required) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          maxZoom={18}
        />

        {/* Fly to selected LGA */}
        {selected && <FlyToMarker lat={selected.lat} lon={selected.lon} />}

        {/* Markers */}
        {markers.map((m, i) => {
          const isCritical = m.risk_level === "CRITICAL";
          const isHq = m.marker_type === "hq";
          const icon = isHq
            ? HQ_ICON
            : createMarkerIcon(
                RISK_COLORS[m.risk_level] || "#4BA3E3",
                isCritical ? 32 : 26,
                isCritical,
              );

          return (
            <Marker
              key={m.name || i}
              position={[m.lat, m.lon]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLga?.(m.name),
              }}
            >
              <Popup>
                <div
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    padding: "12px 14px",
                    background: "rgba(15,23,42,0.92)",
                    border: `1px solid ${RISK_COLORS[m.risk_level] || "#4BA3A3"}40`,
                    borderRadius: "10px",
                    minWidth: "200px",
                    color: "#e2e8f0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: RISK_COLORS[m.risk_level],
                        boxShadow: `0 0 6px ${RISK_COLORS[m.risk_level]}`,
                      }}
                    />
                    <strong style={{ fontSize: "13px" }}>{m.name}</strong>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      lineHeight: "1.7",
                    }}
                  >
                    <div>
                      Risk:{" "}
                      <span
                        style={{
                          color: RISK_COLORS[m.risk_level],
                          fontWeight: 600,
                        }}
                      >
                        {m.risk_level}
                      </span>
                    </div>
                    <div>
                      IDPs:{" "}
                      <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                        {(m.idp_population ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      LSTM Prediction:{" "}
                      <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                        {m.lstm_prediction} events
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "4px",
                        color: "#64748b",
                        fontSize: "10px",
                      }}
                    >
                      {m.lat.toFixed(4)}, {m.lon.toFixed(4)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* IDP concentration circles */}
        {markers
          .filter((m) => (m.idp_population ?? 0) > 0)
          .map((m, i) => (
            <Circle
              key={`c-${m.name || i}`}
              center={[m.lat, m.lon]}
              radius={Math.sqrt(m.idp_population || 1) * 1.8}
              pathOptions={{
                color: RISK_COLORS[m.risk_level] || "#009EDB",
                fillColor: RISK_COLORS[m.risk_level] || "#009EDB",
                fillOpacity: 0.1,
                weight: 1,
                dashArray: "4, 4",
              }}
            />
          ))}

        {/* Transit corridors */}
        {corridors.map((c, i) => (
          <Polyline
            key={`corridor-${i}`}
            positions={c.coordinates}
            pathOptions={{
              color: RISK_COLORS[c.risk_level] || "#4BA3E3",
              weight: 3,
              dashArray: "10, 6",
              opacity: 0.6,
              lineCap: "round",
            }}
          >
            <Popup>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  padding: "8px",
                  color: "#e2e8f0",
                  background: "rgba(15,23,42,0.92)",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ fontSize: "12px" }}>{c.name}</strong>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    marginTop: "4px",
                  }}
                >
                  {c.distance_km} km · Risk:{" "}
                  <span
                    style={{
                      color: RISK_COLORS[c.risk_level],
                      fontWeight: 600,
                    }}
                  >
                    {c.risk_level}
                  </span>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        <MapLegend />
      </MapContainer>
    </div>
  );
}
