/**
 * Sidebar.tsx — Permanent sidebar navigation with tiered module menu.
 *
 * TEMP-DOCS: Displays COR-HARP branding and tiered nav menu. Icons are
 * lucide-react components passed via props. Tier separators (objects with
 * only a `tier` key) are detected and rendered as section headers.
 */
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  path: string;
  tier?: string;
}

interface SidebarProps {
  items: (NavItem | { tier: string })[];
  activePath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  logoutIcon: LucideIcon;
}

function isTierSeparator(item: NavItem | { tier: string }): item is { tier: string } {
  return 'tier' in item && !('id' in item);
}

export default function Sidebar({ items, activePath, onNavigate, onLogout, logoutIcon: LogoutIcon }: SidebarProps) {
  const tiers: { label: string; items: NavItem[] }[] = [];
  let currentTier = { label: '', items: [] as NavItem[] };

  for (const item of items) {
    if (isTierSeparator(item)) {
      if (currentTier.items.length > 0) tiers.push(currentTier);
      currentTier = { label: item.tier, items: [] };
    } else {
      if (item.icon) {
        currentTier.items.push(item as NavItem);
      }
    }
  }
  if (currentTier.items.length > 0) tiers.push(currentTier);

  return (
    <nav className="fixed top-0 left-0 z-50 h-screen w-[280px] bg-dark-sidebar/95 backdrop-blur-glass-lg border-r border-white/[0.06] overflow-y-auto scrollbar-thin">
      <div className="px-4 pb-5 pt-6 border-b border-white/[0.06]">
        <h2 className="text-sm font-extrabold text-un-blue tracking-wide">COR-HARP</h2>
        <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[1.5px] text-surface-500">
          Borno Operations · UN OCHA Partner
        </p>
      </div>

      <div className="px-3 py-4">
        {tiers.map((tier, ti) => (
          <div key={ti}>
            <p className="mt-5 mb-2 px-2 text-[0.6rem] font-bold uppercase tracking-[1.5px] text-un-blue">
              {tier.label}
            </p>
            {tier.items.map((item) => {
              const Icon = item.icon;
              if (!Icon) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={clsx(
                    'flex w-full items-center gap-2.5 rounded-btn px-3 py-2.5 text-left text-[0.82rem] font-medium transition-all duration-200',
                    activePath === item.path
                      ? 'bg-un-blue/15 text-un-blue font-semibold'
                      : 'text-surface-400 hover:bg-un-blue/[0.08] hover:text-dark-text',
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-white/[0.06] bg-dark-sidebar/95">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2.5 text-[0.82rem] font-medium text-surface-400 hover:bg-un-red/10 hover:text-[#FCA5A5] transition-all duration-200"
        >
          <LogoutIcon size={18} className="flex-shrink-0" />
          Logout
        </button>
      </div>
    </nav>
  );
}
