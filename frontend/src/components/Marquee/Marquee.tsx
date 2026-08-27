/**
 * Marquee.tsx   Continuous scrolling food price / data ticker.
 *
 * TEMP-DOCS: A pure-CSS marquee that duplicates its content for seamless
 * looping. Each item has a colored dot, label, and value.
 *
 * Props:
 *   items   Array of { label, value, color } objects to display.
 */
import clsx from "clsx";

interface MarqueeItem {
  label: string;
  value: string;
  color: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
  className?: string;
}

export default function Marquee({ items, className }: MarqueeProps) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className={clsx(
        "animate-fade-in overflow-hidden rounded-btn border border-white/[0.06]",
        "bg-dark-card/60 backdrop-blur-glass py-2 mb-4",
        className,
      )}
    >
      <div className="animate-marquee inline-flex  whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-6 text-[0.78rem] font-medium text-surface-400"
          >
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            {item.label}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}
