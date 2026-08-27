/**
 * GlassCard.tsx — Reusable glassmorphism card container.
 *
 * TEMP-DOCS: Wraps children in a frosted-glass card matching the
 * COR-HARP dark-mode aesthetic. Accepts className for layout overrides,
 * hover for interactive lift effect, and animate for entrance class.
 *
 * Props:
 *   children  — Card content (React nodes).
 *   className — Additional CSS classes (merged with base styles).
 *   hover     — Enable hover lift + glow effect (default: false).
 *   animate   — Animate.css class name (e.g., "animate-fade-in-up").
 *   as        — HTML tag to render as (default: "div").
 */
import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: string;
  as?: React.ElementType;
}

export default function GlassCard({
  children,
  className,
  hover = false,
  animate,
  as: Tag = 'div',
}: GlassCardProps) {
  return (
    <Tag
      className={clsx(
        'bg-dark-card/65 backdrop-blur-glass border border-white/[0.06]',
        'rounded-card shadow-glass transition-all duration-300',
        hover && [
          'hover:border-un-blue/30 hover:-translate-y-0.5',
          'hover:shadow-glow-blue cursor-pointer',
        ],
        animate,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
