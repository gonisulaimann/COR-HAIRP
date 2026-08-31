/**
 * ComingSoon — Honest placeholder for pages not yet wired to backend.
 *
 * Shows a clean, professional state that makes it clear this is a
 * real feature in development, not a broken page or fake data.
 * Uses the same glass-card design language as the rest of the app.
 */
import GlassCard from "@/components/GlassCard";
import { Construction, type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  /** What the feature will do when connected */
  capabilities?: string[];
}

export default function ComingSoon({
  title,
  description,
  icon: Icon = Construction,
  capabilities = [],
}: ComingSoonProps) {
  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
        {title}
      </h1>
      <p className="text-sm text-surface-400 mb-6 animate-fade-in">
        {description}
      </p>

      <GlassCard className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-un-blue/10 flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-un-blue/60" />
        </div>
        <h3 className="text-lg font-bold text-dark-text mb-2">
          Coming Soon
        </h3>
        <p className="text-sm text-surface-400 max-w-md mx-auto mb-6">
          This feature is under active development. It will be connected to
          live backend services in a future release.
        </p>

        {capabilities.length > 0 && (
          <div className="max-w-sm mx-auto text-left">
            <p className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-surface-500 mb-3">
              Planned capabilities
            </p>
            <ul className="space-y-2">
              {capabilities.map((cap, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-surface-300"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-un-blue/40 flex-shrink-0" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
