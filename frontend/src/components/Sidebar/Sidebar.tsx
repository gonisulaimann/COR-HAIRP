/**
 * Sidebar.tsx — Enterprise-grade grouped sidebar navigation.
 *
 * Renders items in clearly labeled SECTIONS (e.g., OPERATIONS, INTELLIGENCE)
 * following Bloomberg Terminal / Palantir Foundry patterns.
 * Section headers are uppercase, small-tracked labels that visually separate
 * logical groups. Items within each section are ordered by their config position.
 *
 * Props are consumed by App.tsx which builds the items from navigationConfig.ts.
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
  section?: string;
}

interface SidebarProps {
  items: (NavItem | { tier: string; section?: string })[];
  activePath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  logoutIcon: LucideIcon;
}

function isTierSeparator(
  item: NavItem | { tier: string; section?: string },
): item is { tier: string; section?: string } {
  return "tier" in item && !("id" in item);
}

export default function Sidebar({
  items,
  activePath,
  onNavigate,
  onLogout,
  logoutIcon: LogoutIcon,
}: SidebarProps) {
  const [openSidebar, setOpenSidebar] = useState(false);

  // Group items by section (tier separators)
  const sections: { label: string; items: NavItem[] }[] = [];
  let currentSection = { label: "", items: [] as NavItem[] };

  for (const item of items) {
    if (isTierSeparator(item)) {
      if (currentSection.items.length > 0) sections.push(currentSection);
      currentSection = { label: item.tier, items: [] };
    } else {
      if (item.icon) {
        currentSection.items.push(item as NavItem);
      }
    }
  }
  if (currentSection.items.length > 0) sections.push(currentSection);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpenSidebar((open) => !open)}
        className="md:hidden active:scale-110 z-50 transition-all bg-un-navy w-max p-2 rounded-full fixed top-2 right-2"
      >
        {openSidebar ? <X /> : <SquareMenu />}
      </button>

      {/* Sidebar nav */}
      <nav
        className={clsx(
          "md:block h-screen w-[290px] bg-dark-sidebar/95 backdrop-blur-glass-lg border-r border-white/[0.06] overflow-y-auto scrollbar-thin animate__animated animate__fadeInLeft",
          openSidebar ? "block w-5/6" : "hidden",
        )}
      >
        {/* Logo */}
        <div className="p-4">
          <Logo className="w-32" />
        </div>

        {/* Sections */}
        <div className="px-3 py-2">
          {sections.map((section, si) => (
            <div key={si} className="mb-1">
              {/* Section header — uppercase, small-tracked label */}
              {section.label && (
                <p className="px-3 pt-4 pb-1.5 text-[0.6rem] font-bold uppercase tracking-[1.8px] text-surface-500/70 select-none">
                  {section.label}
                </p>
              )}

              {/* Section items */}
              {section.items.map((item) => {
                const Icon = item.icon;
                if (!Icon) return null;
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.path);
                      setOpenSidebar(false);
                    }}
                    className={clsx(
                      "flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-left text-[0.82rem] font-medium transition-all duration-200",
                      isActive
                        ? "bg-un-blue/15 text-un-blue font-semibold"
                        : "text-surface-400 hover:bg-un-blue/[0.08] hover:text-dark-text",
                    )}
                  >
                    <Icon size={17} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Logout — pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-white/[0.06] bg-dark-sidebar/95">
          <button
            onClick={() => {
              onLogout();
              setOpenSidebar(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-[0.82rem] font-medium text-surface-400 hover:bg-un-red/10 hover:text-[#FCA5A5] transition-all duration-200"
          >
            <LogoutIcon size={17} className="flex-shrink-0" />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
