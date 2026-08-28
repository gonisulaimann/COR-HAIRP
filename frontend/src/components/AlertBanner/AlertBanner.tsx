/**
 * AlertBanner.tsx   Pulsating threat alert banner for the dashboard header.
 *
 * zone name, and message text. Renders as a sleek flexbox row.
 * Rotates through alerts every 30 seconds automatically.
 *
 * Props:
 *   alerts   Array of alert objects with severity, zone, and message.
 */
import clsx from "clsx";
import { useEffect, useState } from "react";

interface Alert {
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  zone: string;
  message: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-un-red/15 text-[#FCA5A5]",
  HIGH: "bg-un-amber/15 text-[#FCD34D]",
  MODERATE: "bg-un-blue/15 text-un-light-blue",
};

interface AlertBannerProps {
  alerts: Alert[];
  rotateMs?: number;
}

export default function AlertBanner({
  alerts,
  rotateMs = 30_000,
}: AlertBannerProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % alerts.length),
      rotateMs,
    );
    return () => clearInterval(id);
  }, [alerts.length, rotateMs]);

  if (!alerts.length) return null;
  const alert = alerts[idx];

  return (
    <div className="animate-fade-in flex items-center gap-3 rounded-btn border border-un-red/20 bg-un-red/[0.08] px-4 py-2.5 mb-4">
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
          "text-[0.65rem] font-bold uppercase tracking-wider",
          SEVERITY_STYLES[alert.severity],
        )}
      >
        <span className="h-1.5 w-20 rounded-full bg-current shadow-[0_0_6px_currentColor] animate-pulse" />
        {alert.severity}
      </span>
      <span className="text-[0.82rem] text-surface-400">
        <strong className="text-surface-200">{alert.zone}</strong>{" "}
        {alert.message}
      </span>
    </div>
  );
}
