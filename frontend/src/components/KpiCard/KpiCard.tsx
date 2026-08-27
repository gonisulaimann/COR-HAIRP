/**
 * KpiCard.tsx — Animated KPI metric card with count-up animation.
 *
 * TEMP-DOCS: Displays a single key performance indicator with an
 * animated numeric value that counts up from 0 on mount, a label,
 * a delta badge, and a pulsing indicator dot.
 *
 * Props:
 *   label    — Short description of the metric (e.g., "Total IDP Population").
 *   value    — The raw numeric or string value to display.
 *   delta    — Optional change indicator (e.g., "+2.3%", "Live").
 *   positive — Whether the delta is positive (green), negative (red), or neutral (blue).
 *   delay    — Stagger delay in ms for entrance animation (default: 0).
 */
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string | null;
  positive?: boolean | null;
  delay?: number;
}

export default function KpiCard({ label, value, delta, positive, delay = 0 }: KpiCardProps) {
  const [display, setDisplay] = useState('0');
  const started = useRef(false);

  useEffect(() => {
    const num = parseFloat(String(value).replace(/,/g, ''));
    if (isNaN(num) || num === 0) {
      setDisplay(String(value));
      return;
    }
    if (started.current) return;
    started.current = true;

    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(num * eased).toLocaleString());
      if (progress < 1) requestAnimationFrame(animate);
    };
    // Respect stagger delay
    const timer = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const deltaColor =
    positive === true
      ? 'text-green-400'
      : positive === false
        ? 'text-red-400'
        : 'text-un-blue';

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-card border border-white/[0.06]',
        'bg-dark-card/55 backdrop-blur-glass p-5',
        'transition-all duration-300',
        'hover:border-un-blue/30 hover:-translate-y-0.5 hover:shadow-glow-blue',
        'animate-fade-in-up',
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-card bg-gradient-to-b from-un-blue to-un-light-blue" />

      {/* Indicator dot */}
      <div className="flex items-center gap-2">
        <span className="h-[7px] w-[7px] rounded-full bg-un-green shadow-[0_0_8px_theme('colors.un-green')]" />
        <span className="text-[1.65rem] font-[800] leading-none tracking-tight text-dark-text font-sans">
          {display}
        </span>
      </div>

      {/* Label */}
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[1.2px] text-surface-500">
        {label}
      </p>

      {/* Delta */}
      {delta && (
        <p className={clsx('mt-1.5 text-[0.7rem] font-medium', deltaColor)}>
          {delta}
        </p>
      )}
    </div>
  );
}
