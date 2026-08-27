/**
 * LoadingSkeleton.tsx   Animated shimmer skeleton for loading states.
 *
 * TEMP-DOCS: Renders one or more skeleton bars with a shimmer animation.
 * Accepts count for multiple bars, height for custom sizing, and
 * className for layout overrides.
 *
 * Props:
 *   count       Number of skeleton bars to render (default: 1).
 *   height      CSS height for each bar (default: "120px").
 *   className   Additional CSS classes.
 */
import clsx from "clsx";

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export default function LoadingSkeleton({
  count = 1,
  height = "120px",
  className,
}: LoadingSkeletonProps) {
  return (
    <div className={clsx("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-skeleton-shimmer rounded-btn bg-gradient-to-r from-dark-card via-white/[0.04] to-dark-card bg-[length:200%_100%]"
          style={{ height }}
        />
      ))}
    </div>
  );
}
