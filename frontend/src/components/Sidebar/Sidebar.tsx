/**
 * Sidebar.tsx   Permanent sidebar navigation with tiered module menu.
 *
 * TEMP-DOCS: Displays COR-HARP branding and tiered nav menu. Icons are
 * lucide-react components passed via props. Tier separators (objects with
 * only a `tier` key) are detected and rendered as section headers.
 */
import clsx from "clsx";
import { SquareMenu, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import Logo from "../Logo";

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

function isTierSeparator(
  item: NavItem | { tier: string },
): item is { tier: string } {
  return "tier" in item && !("id" in item);
}

export default function Sidebar({
  items,
  activePath,
  onNavigate,
  onLogout,
  logoutIcon: LogoutIcon,
}: SidebarProps) {
  const tiers: { label: string; items: NavItem[] }[] = [];
  let currentTier = { label: "", items: [] as NavItem[] };
  const [openSidebar, setOpenSidebar] = useState(false);

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
    <>
      <button
        onClick={() => setOpenSidebar((open) => !open)}
        className="md:hidden active:scale-110 z-50 transition-all bg-un-navy w-max p-2 rounded-full fixed top-2 right-2"
      >
        {openSidebar ? <X /> : <SquareMenu />}
      </button>
      <nav
        className={`${openSidebar ? "block w-5/6" : "hidden"} md:block h-screen w-[290px] bg-dark-sidebar/95 backdrop-blur-glass-lg border-r border-white/[0.06] overflow-y-auto scrollbar-thin animate__animated animate__fadeInLeft`}
      >
        <div className="p-4">
          <Logo className="w-32" />
        </div>

        <div className="px-3 py-4">
          {tiers.map((tier, ti) => (
            <div key={ti}>
              {tier.items.map((item) => {
                const Icon = item.icon;
                if (!Icon) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.path);
                      setOpenSidebar(false);
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2.5 rounded-btn px-3 py-2.5 text-left text-[0.82rem] font-medium transition-all duration-200",
                      activePath === item.path
                        ? "bg-un-blue/15 text-un-blue font-semibold"
                        : "text-surface-400 hover:bg-un-blue/[0.08] hover:text-dark-text",
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
            onClick={() => {
              onLogout();
              setOpenSidebar(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2.5 text-[0.82rem] font-medium text-surface-400 hover:bg-un-red/10 hover:text-[#FCA5A5] transition-all duration-200"
          >
            <LogoutIcon size={18} className="flex-shrink-0" />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
